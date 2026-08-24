<script setup lang="ts">
useSeoMeta({
  title: 'Notícias — Portal Sampa na Ilha',
  description: 'Todas as notícias do Portal Sampa na Ilha: São Paulo, Amazônia e as cinco regiões do Brasil.',
})

const portal = usePortalStore()
const rota = useRoute()
const router = useRouter()

/**
 * A editoria escolhida vive na URL (`?editoria=cultura`), não num ref solto:
 * recarregar a página mantém a seleção e o link compartilhado abre na mesma
 * lista que o leitor estava vendo. É `replace` de propósito — trocar de
 * pastilha cinco vezes não deve exigir cinco toques em "voltar" para sair.
 */
const categoriaAtiva = computed({
  get: () => (rota.query.editoria as string | undefined) ?? '',
  set: (slug: string) => {
    router.replace({ query: slug ? { editoria: slug } : {} })
  },
})

const { data, status } = await useListaConteudo('lista-noticias', () => ({
  tipo: 'noticia',
  categoria: categoriaAtiva.value || undefined,
  limite: 24,
}))

const carregando = computed(() => status.value === 'pending')

const titulo = computed(() => {
  const quantidade = `${data.value.total} ${data.value.total === 1 ? 'matéria publicada' : 'matérias publicadas'}`
  return categoriaAtiva.value
    ? `${quantidade} em ${portal.nomeDaCategoria(categoriaAtiva.value)}`
    : quantidade
})
</script>

<template>
  <div>
    <ComumHeroPagina
      titulo="Notícias"
      descricao="A cobertura completa do portal de São Paulo às cinco regiões do Brasil."
      etiqueta="Editorias"
      etiqueta-icone="fas fa-newspaper"
    />

    <div class="container">
      <div class="layout">
        <main>
          <ComumFiltroEditorias
            v-model="categoriaAtiva"
            :opcoes="portal.categorias"
            legenda="Filtrar notícias por editoria"
          />

          <ComumCabecalhoSecao :titulo="titulo" />

          <!-- A lista anterior continua visível enquanto a nova chega: trocar de
               editoria não pisca a tela em branco. -->
          <div class="lista-filtrada" :class="{ 'lista-filtrada--carregando': carregando }" :aria-busy="carregando">
            <NoticiasGrade v-if="data.itens.length" :posts="data.itens.slice(0, 6)" />
            <NoticiasLista v-if="data.itens.length > 6" :posts="data.itens.slice(6)" />
          </div>

          <ComumEstadoVazio
            v-if="!data.itens.length && !carregando"
            titulo="Nenhuma matéria nesta editoria ainda"
            descricao="Assim que uma matéria for publicada nesta editoria, ela aparece aqui."
            icone="fas fa-newspaper"
          >
            <div v-if="categoriaAtiva" class="estado-vazio__acao">
              <button class="btn-subscribe" type="button" @click="categoriaAtiva = ''">
                <i class="fas fa-th-large" /> Ver todas as editorias
              </button>
            </div>
          </ComumEstadoVazio>
        </main>

        <SidebarPrincipal />
      </div>
    </div>
  </div>
</template>
