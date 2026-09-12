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

const {
  itens, total, temMais, carregando, carregandoMais, erroMais, carregarMais,
} = await useListaPaginada('lista-noticias', () => ({
  tipo: 'noticia',
  categoria: categoriaAtiva.value || undefined,
}), 24)

const titulo = computed(() => {
  const quantidade = `${total.value} ${total.value === 1 ? 'matéria publicada' : 'matérias publicadas'}`
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
      etiqueta="Categorias"
      etiqueta-icone="fas fa-newspaper"
    />

    <div class="container">
      <div class="layout">
        <main>
          <ComumFiltroEditorias
            v-model="categoriaAtiva"
            :opcoes="portal.categorias"
            legenda="Filtrar notícias por categoria"
          />

          <ComumCabecalhoSecao :titulo="titulo" />

          <!-- A lista anterior continua visível enquanto a nova chega: trocar de
               categoria não pisca a tela em branco. -->
          <div class="lista-filtrada" :class="{ 'lista-filtrada--carregando': carregando }" :aria-busy="carregando">
            <NoticiasGrade v-if="itens.length" :posts="itens.slice(0, 6)" />
            <NoticiasLista v-if="itens.length > 6" :posts="itens.slice(6)" />
          </div>

          <ComumVerMais
            :mostrando="itens.length"
            :total="total"
            :tem-mais="temMais"
            :carregando="carregandoMais"
            :erro="erroMais"
            substantivo="matérias"
            @carregar="carregarMais"
          />

          <ComumEstadoVazio
            v-if="!itens.length && !carregando"
            titulo="Nenhuma matéria nesta categoria ainda"
            descricao="Assim que uma matéria for publicada nesta categoria, ela aparece aqui."
            icone="fas fa-newspaper"
          >
            <div v-if="categoriaAtiva" class="estado-vazio__acao">
              <button class="btn-subscribe" type="button" @click="categoriaAtiva = ''">
                <i class="fas fa-th-large" /> Ver todas as categorias
              </button>
            </div>
          </ComumEstadoVazio>
        </main>

        <SidebarPrincipal />
      </div>
    </div>
  </div>
</template>
