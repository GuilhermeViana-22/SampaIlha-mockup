import { defineStore } from 'pinia'
import type { Guia, GuiaInput, GuiaStatus, RespostaLista } from '#shared/types/content'

export interface FiltrosPainelGuias {
  busca: string
  categoria: string | 'todas'
  status: GuiaStatus | 'todos'
  ordenar: 'recentes' | 'antigos' | 'lidos' | 'titulo'
}

export const filtrosPadraoGuias = (): FiltrosPainelGuias => ({
  busca: '',
  categoria: 'todas',
  status: 'todos',
  ordenar: 'recentes',
})

/**
 * Fonte única dos guias do portal.
 * Usada pelo site público (leitura) e pelo dashboard (CRUD completo).
 */
export const useGuiasStore = defineStore('guias', () => {
  const itens = ref<Guia[]>([])
  const total = ref(0)
  const carregando = ref(false)
  const salvando = ref(false)
  const erro = ref<string | null>(null)
  const filtros = ref<FiltrosPainelGuias>(filtrosPadraoGuias())

  /** Lista filtrada no cliente — reflete os filtros do painel instantaneamente. */
  const listaFiltrada = computed(() => {
    const f = filtros.value
    const termo = f.busca.trim().toLowerCase()
    return itens.value.filter((guia) => {
      if (f.status !== 'todos' && guia.status !== f.status) return false
      if (f.categoria !== 'todas' && guia.categoria !== f.categoria) return false
      if (termo && !`${guia.titulo} ${guia.resumo} ${guia.autor} ${guia.tags.join(' ')}`.toLowerCase().includes(termo)) return false
      return true
    }).sort((a, b) => {
      switch (f.ordenar) {
        case 'antigos': return a.publicadoEm.localeCompare(b.publicadoEm)
        case 'lidos': return b.leituras - a.leituras
        case 'titulo': return a.titulo.localeCompare(b.titulo, 'pt-BR')
        default: return b.publicadoEm.localeCompare(a.publicadoEm)
      }
    })
  })

  const porId = computed(() => (id: string) => itens.value.find(g => g.id === id))

  const contagem = computed(() => ({
    total: total.value,
    baixados: itens.value.length,
    publicados: itens.value.filter(g => g.status === 'publicado').length,
    rascunhos: itens.value.filter(g => g.status === 'rascunho').length,
    leituras: itens.value.reduce((soma, g) => soma + g.leituras, 0),
  }))

  const autores = computed(() => [...new Set(itens.value.map(g => g.autor))].sort())

  const paginaAtual = ref(1)
  const porPagina = 60

  /** Ainda há conteúdo no servidor além do que já foi baixado. */
  const temMais = computed(() => itens.value.length < total.value)

  async function carregar(params: Record<string, string | number | boolean | undefined> = {}) {
    carregando.value = true
    erro.value = null
    try {
      const resposta = await $fetch<RespostaLista<Guia>>('/api/guias', {
        params: { status: 'todos', limite: porPagina, pagina: 1, ...params },
        headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
      })
      itens.value = resposta.itens
      total.value = resposta.total
      paginaAtual.value = 1
    }
    catch (e: any) {
      erro.value = e?.data?.statusMessage || 'Falha ao carregar os guias.'
    }
    finally {
      carregando.value = false
    }
  }

  /** Acrescenta a próxima página à lista já carregada. */
  async function carregarMais() {
    if (!temMais.value || carregando.value) return
    carregando.value = true
    try {
      const resposta = await $fetch<RespostaLista<Guia>>('/api/guias', {
        params: { status: 'todos', limite: porPagina, pagina: paginaAtual.value + 1 },
      })
      const novos = resposta.itens.filter(guia => !itens.value.some(atual => atual.id === guia.id))
      itens.value = [...itens.value, ...novos]
      total.value = resposta.total
      paginaAtual.value += 1
    }
    catch (e: any) {
      erro.value = e?.data?.statusMessage || 'Falha ao carregar mais guias.'
    }
    finally {
      carregando.value = false
    }
  }

  async function criar(dados: Partial<GuiaInput>): Promise<Guia | null> {
    salvando.value = true
    erro.value = null
    try {
      const guia = await $fetch<Guia>('/api/guias', { method: 'POST', body: dados })
      itens.value = [guia, ...itens.value]
      return guia
    }
    catch (e: any) {
      erro.value = e?.data?.statusMessage || 'Não foi possível criar o guia.'
      return null
    }
    finally {
      salvando.value = false
    }
  }

  async function atualizar(id: string, dados: Partial<GuiaInput>): Promise<Guia | null> {
    salvando.value = true
    erro.value = null
    try {
      const guia = await $fetch<Guia>(`/api/guias/${id}`, { method: 'PUT', body: dados })
      itens.value = itens.value.map(g => (g.id === id ? guia : g))
      return guia
    }
    catch (e: any) {
      erro.value = e?.data?.statusMessage || 'Não foi possível salvar as alterações.'
      return null
    }
    finally {
      salvando.value = false
    }
  }

  async function remover(id: string): Promise<boolean> {
    try {
      await $fetch(`/api/guias/${id}`, { method: 'DELETE' })
      itens.value = itens.value.filter(g => g.id !== id)
      return true
    }
    catch (e: any) {
      erro.value = e?.data?.statusMessage || 'Não foi possível excluir o guia.'
      return false
    }
  }

  async function mudarStatus(guia: Guia, novo: GuiaStatus): Promise<Guia | null> {
    try {
      const atualizado = await $fetch<Guia>(`/api/guias/${guia.id}`, {
        method: 'PUT',
        body: { ...guia, status: novo },
      })
      itens.value = itens.value.map(g => (g.id === guia.id ? atualizado : g))
      return atualizado
    }
    catch (e: any) {
      erro.value = e?.data?.statusMessage || 'Não foi possível alterar o status.'
      return null
    }
  }

  /** Publica/despublica com um clique — o que o botão da tabela faz. */
  function alternarStatus(guia: Guia): Promise<Guia | null> {
    return mudarStatus(guia, guia.status === 'publicado' ? 'rascunho' : 'publicado')
  }

  async function alternarDestaque(guia: Guia): Promise<Guia | null> {
    try {
      const atualizado = await $fetch<Guia>(`/api/guias/${guia.id}`, {
        method: 'PUT',
        body: { ...guia, destaque: !guia.destaque },
      })
      itens.value = itens.value.map(g => (g.id === guia.id ? atualizado : g))
      return atualizado
    }
    catch (e: any) {
      erro.value = e?.data?.statusMessage || 'Não foi possível alterar o destaque.'
      return null
    }
  }

  /**
   * Busca o guia completo para edição.
   */
  async function buscarPorId(id: string): Promise<Guia | null> {
    try {
      const completo = await $fetch<Guia>(`/api/guias/${id}`, {
        headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
      })
      itens.value = itens.value.map(g => (g.id === id ? completo : g))
      return completo
    }
    catch {
      return itens.value.find(g => g.id === id) ?? null
    }
  }

  function limparFiltros() {
    filtros.value = filtrosPadraoGuias()
  }

  return {
    itens, total, carregando, salvando, erro, filtros, temMais,
    listaFiltrada, porId, contagem, autores,
    carregar, carregarMais, criar, atualizar, remover,
    mudarStatus, alternarStatus, alternarDestaque,
    buscarPorId, limparFiltros,
  }
})
