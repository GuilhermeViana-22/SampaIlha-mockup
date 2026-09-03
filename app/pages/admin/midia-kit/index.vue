<script setup lang="ts">
import { LoaderCircleIcon, PackageOpenIcon } from '@lucide/vue'
import type { MidiaKit } from '#shared/types/content'

/**
 * Mídia kit — o acervo que o comercial manda para patrocinador.
 *
 * Vive só no painel: não há rota pública que liste estas peças, e a API recusa
 * a listagem sem sessão. O que o site mostra continua sendo o portal; isto aqui
 * é a pasta compartilhada que antes ficava no computador de alguém.
 */
definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  titulo: 'Mídia Kit',
  descricao: 'Logos, apresentações e documentos para quem vai patrocinar.',
  acao: null,
})
useSeoMeta({ title: 'Mídia Kit — Painel Sampa na Ilha', robots: 'noindex, nofollow' })

const pecas = ref<MidiaKit[]>([])
const carregando = ref(true)
const emEdicao = ref<MidiaKit | null>(null)
const editorAberto = ref(false)
const paraExcluir = ref<MidiaKit | null>(null)
const excluindo = ref(false)

async function carregar() {
  carregando.value = true

  try {
    pecas.value = await $fetch<MidiaKit[]>('/api/midia-kit')
  }
  catch (erro: unknown) {
    avisar.erro(erro, 'Não foi possível carregar o mídia kit.')
  }
  finally {
    carregando.value = false
  }
}

/** A peça recém-enviada entra no topo, que é onde a API também a devolveria. */
function aoEnviar(peca: MidiaKit) {
  pecas.value = [peca, ...pecas.value]
}

function abrirEditor(peca: MidiaKit) {
  emEdicao.value = peca
  editorAberto.value = true
}

function aoSalvar(atualizada: MidiaKit) {
  pecas.value = pecas.value.map(peca => (peca.id === atualizada.id ? atualizada : peca))
}

/**
 * Exclusão definitiva da peça.
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
    await $fetch(`/api/midia-kit/${alvo.id}`, { method: 'DELETE' })
    pecas.value = pecas.value.filter(peca => peca.id !== alvo.id)

    avisar.sucesso(
      `“${alvo.titulo}” saiu do mídia kit.`,
      'O arquivo foi apagado do servidor — quem tiver o link antigo não abre mais.',
    )
  }
  catch (erro: unknown) {
    avisar.erro(erro, 'Não foi possível excluir a peça.', 'Ela continua no acervo.')
  }
  finally {
    excluindo.value = false
  }
}

onMounted(carregar)
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
    <div class="flex flex-col gap-4">
      <div v-if="carregando" class="flex items-center justify-center py-16">
        <LoaderCircleIcon class="size-7 animate-spin text-muted-foreground" />
      </div>

      <div
        v-else-if="!pecas.length"
        class="flex flex-col items-center rounded-xl border border-dashed p-14 text-center"
      >
        <PackageOpenIcon class="size-8 text-muted-foreground/50" />
        <p class="mt-3 font-medium">O mídia kit ainda está vazio</p>
        <p class="mt-1 max-w-sm text-sm text-muted-foreground">
          Suba a primeira peça ao lado — o logo em alta e a apresentação comercial costumam ser as
          primeiras que um patrocinador pede.
        </p>
      </div>

      <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <AdminMidiaKitPeca
          v-for="peca in pecas"
          :key="peca.id"
          :peca="peca"
          @editar="abrirEditor"
          @excluir="paraExcluir = $event"
        />
      </div>
    </div>

    <AdminMidiaKitUpload @enviada="aoEnviar" />
  </div>

  <AdminMidiaKitEditor v-model="editorAberto" :peca="emEdicao" @salva="aoSalvar" />

  <AlertDialog :open="!!paraExcluir" @update:open="valor => { if (!valor) paraExcluir = null }">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Excluir “{{ paraExcluir?.titulo }}” para sempre?</AlertDialogTitle>
        <AlertDialogDescription>
          A exclusão é <strong class="text-foreground">permanente</strong>: o arquivo sai do
          servidor e não há como recuperar — não existe lixeira.
          <span class="mt-2 block">
            Se o link desta peça já foi enviado a alguém, ele deixa de abrir na hora.
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
