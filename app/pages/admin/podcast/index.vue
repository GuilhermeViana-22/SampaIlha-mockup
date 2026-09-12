<script setup lang="ts">
import { LoaderCircleIcon, MicOffIcon, PlusCircleIcon } from '@lucide/vue'
import type { Episodio } from '#shared/types/podcast'

/**
 * Podcast — os episódios do feed de /podcast.
 *
 * O trabalho desta tela é curto de propósito: colar o link do episódio e
 * escrever a chamada. O áudio continua na plataforma, e quem transforma o link
 * em player é a API — aqui só se confere se ela conseguiu.
 */
definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  titulo: 'Podcast',
  descricao: 'Os episódios que aparecem no feed de /podcast.',
  acao: null,
})
useSeoMeta({ title: 'Podcast — Painel Sampa na Ilha', robots: 'noindex, nofollow' })

const podcast = usePodcastStore()

const emEdicao = ref<Episodio | null>(null)
const formularioAberto = ref(false)
const paraExcluir = ref<Episodio | null>(null)
const excluindo = ref(false)

function abrirNovo() {
  emEdicao.value = null
  formularioAberto.value = true
}

function abrirEdicao(episodio: Episodio) {
  emEdicao.value = episodio
  formularioAberto.value = true
}

async function alternarStatus(episodio: Episodio) {
  const salvo = await podcast.alternarStatus(episodio)

  if (!salvo) {
    avisar.erro(podcast.erro, 'Não foi possível alterar o status.')
    return
  }

  if (salvo.status === 'publicado') {
    avisar.sucesso('Episódio publicado.', `“${salvo.titulo}” já aparece no feed de /podcast.`)
  }
  else {
    avisar.sucesso('Episódio recolhido.', 'Saiu do feed, mas continua cadastrado aqui.')
  }
}

/**
 * Exclusão definitiva.
 *
 * Guarda o alvo antes de fechar o diálogo: `paraExcluir` é o que controla o
 * `:open`, então zerá-lo já apaga a referência. `excluindo` barra o clique
 * repetido, que bateria em um id já removido e acusaria erro numa exclusão que
 * deu certo.
 */
async function confirmarExclusao() {
  const alvo = paraExcluir.value
  if (!alvo || excluindo.value) return

  excluindo.value = true
  paraExcluir.value = null

  const removido = await podcast.remover(alvo.id)

  excluindo.value = false

  if (removido) {
    avisar.sucesso(
      `“${alvo.titulo}” foi excluído.`,
      'O áudio continua na plataforma — o que saiu foi a chamada no portal.',
    )
  }
  else {
    avisar.erro(podcast.erro, 'Não foi possível excluir o episódio.', 'Ele continua cadastrado.')
  }
}

onMounted(() => podcast.carregar(true))
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <p class="text-sm text-muted-foreground">
        <template v-if="podcast.carregando">Carregando…</template>
        <template v-else-if="podcast.contagem.total">
          <strong class="text-foreground">{{ podcast.contagem.publicados }}</strong>
          {{ podcast.contagem.publicados === 1 ? 'episódio no feed' : 'episódios no feed' }}
          de {{ podcast.contagem.total }} cadastrados.
          <template v-if="podcast.contagem.semPlayer">
            <span class="text-amber-600">
              {{ podcast.contagem.semPlayer }}
              {{ podcast.contagem.semPlayer === 1 ? 'sem player embutido' : 'sem player embutido' }}.
            </span>
          </template>
        </template>
      </p>

      <Button size="sm" @click="abrirNovo()">
        <PlusCircleIcon class="size-4" /> Novo episódio
      </Button>
    </div>

    <div v-if="podcast.carregando" class="flex items-center justify-center py-16">
      <LoaderCircleIcon class="size-7 animate-spin text-muted-foreground" />
    </div>

    <div
      v-else-if="!podcast.itens.length"
      class="flex flex-col items-center rounded-xl border border-dashed p-14 text-center"
    >
      <MicOffIcon class="size-8 text-muted-foreground/50" />
      <p class="mt-3 font-medium">Nenhum episódio cadastrado</p>
      <p class="mt-1 max-w-md text-sm text-muted-foreground">
        Copie o link do episódio no Spotify, no YouTube ou no Deezer e cole aqui — o player entra
        embutido no feed, e o ouvinte escuta sem sair do portal.
      </p>
      <Button class="mt-5" size="sm" @click="abrirNovo()">
        <PlusCircleIcon class="size-4" /> Novo episódio
      </Button>
    </div>

    <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <AdminPodcastEpisodio
        v-for="episodio in podcast.itens"
        :key="episodio.id"
        :episodio="episodio"
        @editar="abrirEdicao"
        @alternar="alternarStatus"
        @excluir="paraExcluir = $event"
      />
    </div>
  </div>

  <AdminPodcastFormulario v-model="formularioAberto" :episodio="emEdicao" />

  <AlertDialog :open="!!paraExcluir" @update:open="valor => { if (!valor) paraExcluir = null }">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Excluir “{{ paraExcluir?.titulo }}” para sempre?</AlertDialogTitle>
        <AlertDialogDescription>
          A exclusão é <strong class="text-foreground">permanente</strong>: o cadastro e a capa
          saem do servidor, e não há lixeira. O áudio continua na plataforma.
          <span class="mt-2 block">
            Se é só para tirar do feed, prefira <strong class="text-foreground">Recolher</strong> —
            o episódio sai do site e o cadastro fica de pé.
          </span>
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel @click="paraExcluir = null">Cancelar</AlertDialogCancel>
        <!-- Botão comum: `AlertDialogAction` fecha o diálogo antes do handler rodar. -->
        <Button variant="destructive" :disabled="excluindo" @click="confirmarExclusao()">
          Excluir para sempre
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
