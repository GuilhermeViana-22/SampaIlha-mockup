import { defineStore } from 'pinia'
import type { Episodio, EpisodioInput, PlataformaEpisodio, StatusEpisodio } from '#shared/types/podcast'
import type { RespostaLista } from '#shared/types/content'

export interface FiltrosEpisodio {
  busca: string
  status: StatusEpisodio | 'todos'
  plataforma: PlataformaEpisodio | 'todas'
}

export const filtrosPadraoEpisodio = (): FiltrosEpisodio => ({
  busca: '',
  status: 'todos',
  plataforma: 'todas',
})

/**
 * Episódios do podcast.
 *
 * Fonte única para o feed público (leitura) e para o painel (CRUD completo).
 * Como o volume é pequeno — um punhado de episódios por temporada, não
 * centenas de matérias —, a API devolve tudo de uma vez e a filtragem
 * acontece aqui, no cliente: o filtro responde na hora, sem ida e volta a cada
 * tecla. Mesma decisão das oficinas.
 */
export const usePodcastStore = defineStore('podcast', () => {
  const itens = ref<Episodio[]>([])
  const total = ref(0)
  const carregando = ref(false)
  const salvando = ref(false)
  const erro = ref<string | null>(null)
  const filtros = ref<FiltrosEpisodio>(filtrosPadraoEpisodio())

  const listaFiltrada = computed(() => {
    const f = filtros.value
    const termo = f.busca.trim().toLowerCase()

    return itens.value.filter((episodio) => {
      if (f.status !== 'todos' && episodio.status !== f.status) return false
      if (f.plataforma !== 'todas' && episodio.plataforma !== f.plataforma) return false
      if (termo && !`${episodio.titulo} ${episodio.descricao}`.toLowerCase().includes(termo)) return false
      return true
    })
  })

  const contagem = computed(() => ({
    total: itens.value.length,
    publicados: itens.value.filter(e => e.status === 'publicado').length,
    rascunhos: itens.value.filter(e => e.status === 'rascunho').length,
    // Episódio cujo link a API não soube traduzir em player: o card funciona,
    // mas como link. Vale destacar no painel — quase sempre é link errado
    // colado (a página do programa no lugar da do episódio).
    semPlayer: itens.value.filter(e => e.embedUrl === null).length,
  }))

  const porId = computed(() => (id: string) => itens.value.find(e => e.id === id))

  /** O que o feed público mostra, já na ordem em que sai na tela. */
  const publicados = computed(() => itens.value.filter(e => e.status === 'publicado'))

  async function carregar(forcar = false) {
    if (itens.value.length && !forcar) return
    carregando.value = true
    erro.value = null
    try {
      const resposta = await $fetch<RespostaLista<Episodio>>('/api/podcast', {
        params: { limite: 100 },
        headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
      })
      itens.value = resposta.itens
      total.value = resposta.total
    }
    catch (e: unknown) {
      erro.value = mensagemDoErro(e, 'Falha ao carregar os episódios.')
      itens.value = []
    }
    finally {
      carregando.value = false
    }
  }

  async function criar(dados: Partial<EpisodioInput>): Promise<Episodio | null> {
    salvando.value = true
    erro.value = null
    try {
      const criado = await $fetch<Episodio>('/api/podcast', { method: 'POST', body: dados })
      itens.value = [criado, ...itens.value]
      return criado
    }
    catch (e: unknown) {
      erro.value = mensagemDoErro(e, 'Não foi possível criar o episódio.')
      return null
    }
    finally {
      salvando.value = false
    }
  }

  async function atualizar(id: string, dados: Partial<EpisodioInput>): Promise<Episodio | null> {
    salvando.value = true
    erro.value = null
    try {
      const salvo = await $fetch<Episodio>(`/api/podcast/${id}`, { method: 'PUT', body: dados })
      itens.value = itens.value.map(e => (e.id === id ? salvo : e))
      return salvo
    }
    catch (e: unknown) {
      erro.value = mensagemDoErro(e, 'Não foi possível salvar as alterações.')
      return null
    }
    finally {
      salvando.value = false
    }
  }

  async function remover(id: string): Promise<boolean> {
    erro.value = null
    try {
      await $fetch(`/api/podcast/${id}`, { method: 'DELETE' })
      itens.value = itens.value.filter(e => e.id !== id)
      return true
    }
    catch (e: unknown) {
      erro.value = mensagemDoErro(e, 'Não foi possível excluir o episódio.')
      return false
    }
  }

  /** Publica/recolhe com um clique — o que o botão da listagem faz. */
  async function alternarStatus(episodio: Episodio): Promise<Episodio | null> {
    const novo: StatusEpisodio = episodio.status === 'publicado' ? 'rascunho' : 'publicado'
    erro.value = null
    try {
      const salvo = await $fetch<Episodio>(`/api/podcast/${episodio.id}/status`, {
        method: 'PATCH',
        params: { status: novo },
      })
      itens.value = itens.value.map(e => (e.id === episodio.id ? salvo : e))
      return salvo
    }
    catch (e: unknown) {
      erro.value = mensagemDoErro(e, 'Não foi possível alterar o status.')
      return null
    }
  }

  /** Envia a capa. A API troca o arquivo e devolve o episódio já atualizado. */
  async function enviarCapa(id: string, arquivo: File): Promise<Episodio | null> {
    erro.value = null
    try {
      const corpo = new FormData()
      corpo.append('file', arquivo)

      const salvo = await $fetch<Episodio>(`/api/podcast/${id}/capa`, { method: 'PUT', body: corpo })
      itens.value = itens.value.map(e => (e.id === id ? salvo : e))
      return salvo
    }
    catch (e: unknown) {
      erro.value = mensagemDoErro(e, 'Não foi possível enviar a capa.')
      return null
    }
  }

  async function removerCapa(id: string): Promise<Episodio | null> {
    erro.value = null
    try {
      const salvo = await $fetch<Episodio>(`/api/podcast/${id}/capa`, { method: 'DELETE' })
      itens.value = itens.value.map(e => (e.id === id ? salvo : e))
      return salvo
    }
    catch (e: unknown) {
      erro.value = mensagemDoErro(e, 'Não foi possível remover a capa.')
      return null
    }
  }

  function limparFiltros() {
    filtros.value = filtrosPadraoEpisodio()
  }

  return {
    itens, total, carregando, salvando, erro, filtros,
    listaFiltrada, contagem, porId, publicados,
    carregar, criar, atualizar, remover, alternarStatus,
    enviarCapa, removerCapa, limparFiltros,
  }
})
