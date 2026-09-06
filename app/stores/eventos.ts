import { defineStore } from 'pinia'
import type { Evento, EventoInput, PeriodoEvento, StatusEvento, TipoEvento } from '#shared/types/evento'

export interface FiltrosEvento {
  busca: string
  status: StatusEvento | 'todos'
  tipo: TipoEvento | 'todos'
  periodo: PeriodoEvento
}

export const filtrosPadraoEvento = (): FiltrosEvento => ({
  busca: '',
  status: 'todos',
  tipo: 'todos',
  periodo: 'todos',
})

/**
 * Eventos de /cultura/eventos.
 *
 * Fonte única para o site público (leitura) e para o painel (CRUD completo).
 * Como o volume é pequeno — algumas dezenas de eventos por temporada, não
 * centenas de matérias — a API devolve tudo de uma vez e a filtragem acontece
 * aqui, no cliente: o filtro responde na hora, sem ida e volta a cada tecla.
 */
export const useEventosStore = defineStore('eventos', () => {
  const itens = ref<Evento[]>([])
  const carregando = ref(false)
  const salvando = ref(false)
  const erro = ref<string | null>(null)
  const filtros = ref<FiltrosEvento>(filtrosPadraoEvento())

  /**
   * O teto de uma carga só.
   *
   * A API pagina em 20 por padrão e aceita até 100; a listagem do painel
   * precisa do conjunto inteiro para contar rascunhos e filtrar sem voltar ao
   * servidor, então pede o máximo de uma vez.
   */
  const LIMITE = 100

  /** Evento que ainda vai acontecer — a comparação é contra o instante atual. */
  function ehProximo(evento: Evento): boolean {
    return new Date(evento.comecaEm).getTime() >= Date.now()
  }

  const listaFiltrada = computed(() => {
    const f = filtros.value
    const termo = f.busca.trim().toLowerCase()

    return itens.value.filter((evento) => {
      if (f.status !== 'todos' && evento.status !== f.status) return false
      if (f.tipo !== 'todos' && evento.tipo !== f.tipo) return false
      if (f.periodo === 'proximos' && !ehProximo(evento)) return false
      if (f.periodo === 'realizados' && ehProximo(evento)) return false
      if (termo && !`${evento.titulo} ${evento.resumo} ${evento.local ?? ''}`.toLowerCase().includes(termo)) return false
      return true
    })
  })

  const contagem = computed(() => ({
    total: itens.value.length,
    publicados: itens.value.filter(e => e.status === 'publicado').length,
    rascunhos: itens.value.filter(e => e.status === 'rascunho').length,
    proximos: itens.value.filter(e => e.status === 'publicado' && ehProximo(e)).length,
  }))

  const porId = computed(() => (id: string) => itens.value.find(e => e.id === id))

  /** O que a página pública mostra: publicados e ainda por acontecer. */
  const noAr = computed(() => itens.value.filter(e => e.status === 'publicado' && ehProximo(e)))

  const realizados = computed(() => itens.value.filter(e => e.status === 'publicado' && !ehProximo(e)))

  async function carregar(forcar = false) {
    if (itens.value.length && !forcar) return
    carregando.value = true
    erro.value = null
    try {
      const resposta = await $fetch<{ itens: Evento[], total: number }>('/api/eventos', {
        params: { limite: LIMITE },
        headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
      })
      itens.value = resposta.itens
    }
    catch (e: unknown) {
      erro.value = mensagemDoErro(e, 'Falha ao carregar os eventos.')
      itens.value = []
    }
    finally {
      carregando.value = false
    }
  }

  async function criar(dados: Partial<EventoInput>): Promise<Evento | null> {
    salvando.value = true
    erro.value = null
    try {
      const criado = await $fetch<Evento>('/api/eventos', { method: 'POST', body: dados })
      itens.value = [criado, ...itens.value]
      return criado
    }
    catch (e: unknown) {
      erro.value = mensagemDoErro(e, 'Não foi possível criar o evento.')
      return null
    }
    finally {
      salvando.value = false
    }
  }

  async function atualizar(id: string, dados: Partial<EventoInput>): Promise<Evento | null> {
    salvando.value = true
    erro.value = null
    try {
      const salvo = await $fetch<Evento>(`/api/eventos/${id}`, { method: 'PUT', body: dados })
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
      await $fetch(`/api/eventos/${id}`, { method: 'DELETE' })
      itens.value = itens.value.filter(e => e.id !== id)
      return true
    }
    catch (e: unknown) {
      erro.value = mensagemDoErro(e, 'Não foi possível excluir o evento.')
      return false
    }
  }

  /** Publica/recolhe com um clique — o que o botão da tabela faz. */
  async function alternarStatus(evento: Evento): Promise<Evento | null> {
    const novo: StatusEvento = evento.status === 'publicado' ? 'rascunho' : 'publicado'
    erro.value = null
    try {
      const salvo = await $fetch<Evento>(`/api/eventos/${evento.id}/status`, {
        method: 'PATCH',
        params: { status: novo },
      })
      itens.value = itens.value.map(e => (e.id === evento.id ? salvo : e))
      return salvo
    }
    catch (e: unknown) {
      erro.value = mensagemDoErro(e, 'Não foi possível alterar o status.')
      return null
    }
  }

  /** Envia o cartaz. A API troca o arquivo e devolve o evento já atualizado. */
  async function enviarCartaz(id: string, arquivo: File): Promise<Evento | null> {
    erro.value = null
    try {
      const corpo = new FormData()
      corpo.append('file', arquivo)

      const salvo = await $fetch<Evento>(`/api/eventos/${id}/cartaz`, { method: 'PUT', body: corpo })
      itens.value = itens.value.map(e => (e.id === id ? salvo : e))
      return salvo
    }
    catch (e: unknown) {
      erro.value = mensagemDoErro(e, 'Não foi possível enviar o cartaz.')
      return null
    }
  }

  async function removerCartaz(id: string): Promise<Evento | null> {
    erro.value = null
    try {
      const salvo = await $fetch<Evento>(`/api/eventos/${id}/cartaz`, { method: 'DELETE' })
      itens.value = itens.value.map(e => (e.id === id ? salvo : e))
      return salvo
    }
    catch (e: unknown) {
      erro.value = mensagemDoErro(e, 'Não foi possível remover o cartaz.')
      return null
    }
  }

  /**
   * Busca um evento pelo id, indo à API.
   *
   * A listagem já traz o corpo do texto, mas ir ao servidor garante que o
   * formulário abra com o que está gravado agora — e não com o que estava na
   * memória desde o último carregamento.
   */
  async function buscarPorId(id: string): Promise<Evento | null> {
    try {
      const completo = await $fetch<Evento>(`/api/eventos/${id}`, {
        headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
      })
      itens.value = itens.value.map(e => (e.id === id ? completo : e))
      return completo
    }
    catch {
      return itens.value.find(e => e.id === id) ?? null
    }
  }

  function limparFiltros() {
    filtros.value = filtrosPadraoEvento()
  }

  return {
    itens, carregando, salvando, erro, filtros,
    listaFiltrada, contagem, porId, noAr, realizados,
    carregar, criar, atualizar, remover, alternarStatus,
    enviarCartaz, removerCartaz, buscarPorId, limparFiltros,
  }
})
