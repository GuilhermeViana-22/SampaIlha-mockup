import { defineStore } from 'pinia'
import type { Categoria, Regiao } from '#shared/types/content'

/**
 * Taxonomia do portal (vinda da API) e estado de interface do site público.
 * É a fonte única de editorias e regiões para menu, filtros e formulários.
 */
export const usePortalStore = defineStore('portal', () => {
  const categorias = ref<Categoria[]>([])
  const regioes = ref<Regiao[]>([])
  const carregada = ref(false)

  const menuAberto = ref(false)
  const buscaAberta = ref(false)
  const termoBusca = ref('')

  const categoriasDoMenu = computed(() => categorias.value.filter(c => c.destaqueNoMenu))

  /**
   * Busca a taxonomia na API. Roda no SSR (plugin) e o estado viaja no payload
   * do Nuxt, então o cliente hidrata sem uma segunda chamada.
   */
  async function carregarTaxonomia(forcar = false) {
    if (carregada.value && !forcar) return

    try {
      const dados = await $fetch<{ categorias: Categoria[], regioes: Regiao[] }>('/api/taxonomia', {
        headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
      })
      categorias.value = dados.categorias
      regioes.value = dados.regioes
      carregada.value = categorias.value.length > 0
    }
    catch {
      carregada.value = false
    }
  }

  function categoria(slug: string): Categoria | undefined {
    return categorias.value.find(c => c.slug === slug)
  }

  function regiao(slug: string): Regiao | undefined {
    return regioes.value.find(r => r.slug === slug)
  }

  function nomeDaCategoria(slug: string): string {
    return categoria(slug)?.nome ?? slug
  }

  function alternarMenu() {
    menuAberto.value = !menuAberto.value
    if (menuAberto.value) buscaAberta.value = false
  }

  function fecharMenu() {
    menuAberto.value = false
  }

  function alternarBusca() {
    buscaAberta.value = !buscaAberta.value
    if (buscaAberta.value) menuAberto.value = false
  }

  async function buscar() {
    const termo = termoBusca.value.trim()
    if (!termo) return
    buscaAberta.value = false
    await navigateTo({ path: '/busca', query: { q: termo } })
  }

  return {
    categorias, regioes, carregada, categoriasDoMenu,
    menuAberto, buscaAberta, termoBusca,
    carregarTaxonomia, categoria, regiao, nomeDaCategoria,
    alternarMenu, fecharMenu, alternarBusca, buscar,
  }
})
