<script setup lang="ts">
import { ImageOffIcon, LoaderCircleIcon, PlusCircleIcon } from '@lucide/vue'
import type { Publicidade } from '#shared/types/content'

/**
 * Publicidade — os banners da coluna lateral do portal.
 *
 * A regra que a tela toda serve: **espaço publicitário vazio não aparece**.
 * Sem nenhum anúncio no ar, o portal não desenha card de publicidade nenhum —
 * e é por isso que o estado vazio daqui explica isso em vez de convidar a
 * cadastrar qualquer coisa para preencher.
 */
definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  titulo: 'Publicidade',
  descricao: 'Os banners que aparecem na coluna lateral do portal.',
  acao: null,
})
useSeoMeta({ title: 'Publicidade — Painel Sampa na Ilha', robots: 'noindex, nofollow' })

const anuncios = ref<Publicidade[]>([])
const carregando = ref(true)
const emEdicao = ref<Publicidade | null>(null)
const formularioAberto = ref(false)
const paraExcluir = ref<Publicidade | null>(null)
const excluindo = ref(false)

const noAr = computed(() => anuncios.value.filter(anuncio => anuncio.visibilidade === 'no_ar').length)

async function carregar() {
  carregando.value = true

  try {
    // `painel=true` é o que manda a sessão junto e traz o cadastro inteiro —
    // rascunhos, agendados e encerrados. Sem o parâmetro vem só o que o leitor vê.
    anuncios.value = await $fetch<Publicidade[]>('/api/publicidade', { params: { painel: true } })
  }
  catch (erro: unknown) {
    avisar.erro(erro, 'Não foi possível carregar os anúncios.')
  }
  finally {
    carregando.value = false
  }
}

function abrirNovo() {
  emEdicao.value = null
  formularioAberto.value = true
}

function abrirEdicao(anuncio: Publicidade) {
  emEdicao.value = anuncio
  formularioAberto.value = true
}

/**
 * Recarrega em vez de encaixar o item na lista: a ordem da coluna sai de
 * `ordem` e da data, e é a API que a calcula — reproduzi-la aqui só criaria
 * uma segunda versão da mesma regra, pronta para divergir.
 */
async function aoSalvar() {
  await carregar()
}

async function alternarStatus(anuncio: Publicidade) {
  const status = anuncio.status === 'publicado' ? 'rascunho' : 'publicado'

  try {
    const salvo = await $fetch<Publicidade>(`/api/publicidade/${anuncio.id}/status`, {
      method: 'PATCH',
      params: { status },
    })

    anuncios.value = anuncios.value.map(item => (item.id === salvo.id ? salvo : item))

    if (salvo.visibilidade === 'no_ar') {
      avisar.sucesso('Anúncio no ar.', `“${salvo.titulo}” já aparece na coluna do portal.`)
    }
    else if (salvo.status === 'publicado') {
      avisar.sucesso('Anúncio publicado.', 'Entra na coluna quando a data de início chegar.')
    }
    else {
      avisar.sucesso('Anúncio recolhido.', 'Saiu da coluna, mas continua cadastrado aqui.')
    }
  }
  catch (erro: unknown) {
    avisar.erro(erro, 'Não foi possível alterar o status.')
  }
}

/**
 * Exclusão definitiva do anúncio.
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

  try {
    await $fetch(`/api/publicidade/${alvo.id}`, { method: 'DELETE' })
    anuncios.value = anuncios.value.filter(anuncio => anuncio.id !== alvo.id)

    avisar.sucesso(
      `“${alvo.titulo}” foi excluído.`,
      'A arte saiu do servidor — não há como recuperar.',
    )
  }
  catch (erro: unknown) {
    avisar.erro(erro, 'Não foi possível excluir o anúncio.', 'Ele continua cadastrado.')
  }
  finally {
    excluindo.value = false
  }
}

onMounted(carregar)
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <p class="text-sm text-muted-foreground">
        <template v-if="carregando">Carregando…</template>
        <template v-else-if="noAr">
          <strong class="text-foreground">{{ noAr }}</strong>
          {{ noAr === 1 ? 'anúncio no ar' : 'anúncios no ar' }} de {{ anuncios.length }} cadastrados.
        </template>
        <template v-else-if="anuncios.length">
          Nenhum anúncio no ar — a coluna do portal está sem o card de publicidade.
        </template>
      </p>

      <Button size="sm" @click="abrirNovo()">
        <PlusCircleIcon class="size-4" /> Novo anúncio
      </Button>
    </div>

    <div v-if="carregando" class="flex items-center justify-center py-16">
      <LoaderCircleIcon class="size-7 animate-spin text-muted-foreground" />
    </div>

    <div
      v-else-if="!anuncios.length"
      class="flex flex-col items-center rounded-xl border border-dashed p-14 text-center"
    >
      <ImageOffIcon class="size-8 text-muted-foreground/50" />
      <p class="mt-3 font-medium">Nenhum anúncio cadastrado</p>
      <p class="mt-1 max-w-md text-sm text-muted-foreground">
        Enquanto não houver anúncio no ar, o portal não mostra card de publicidade nenhum — nem
        moldura vazia, nem convite para anunciar. Cadastre o primeiro quando houver contrato.
      </p>
      <Button class="mt-5" size="sm" @click="abrirNovo()">
        <PlusCircleIcon class="size-4" /> Novo anúncio
      </Button>
    </div>

    <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <AdminPublicidadeAnuncio
        v-for="anuncio in anuncios"
        :key="anuncio.id"
        :anuncio="anuncio"
        @editar="abrirEdicao"
        @alternar="alternarStatus"
        @excluir="paraExcluir = $event"
      />
    </div>
  </div>

  <AdminPublicidadeFormulario v-model="formularioAberto" :anuncio="emEdicao" @salvo="aoSalvar" />

  <AlertDialog :open="!!paraExcluir" @update:open="valor => { if (!valor) paraExcluir = null }">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Excluir “{{ paraExcluir?.titulo }}” para sempre?</AlertDialogTitle>
        <AlertDialogDescription>
          A exclusão é <strong class="text-foreground">permanente</strong>: o cadastro e a arte
          saem do servidor, e não há lixeira.
          <span class="mt-2 block">
            Se a campanha só acabou, prefira <strong class="text-foreground">Recolher</strong> — o
            banner sai da coluna e o cadastro fica de pé para a próxima.
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
