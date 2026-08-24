import { defineStore } from 'pinia'
import type { PeriodoWorkshop, StatusWorkshop, Workshop, WorkshopInput } from '#shared/types/workshop'

export interface FiltrosWorkshop {
  busca: string
  status: StatusWorkshop | 'todos'
  periodo: PeriodoWorkshop
}

export const filtrosPadraoWorkshop = (): FiltrosWorkshop => ({
  busca: '',
  status: 'todos',
  periodo: 'todos',
})

/**
 * Oficinas de /cultura/workshops.
 *
 * Fonte única para o site público (leitura) e para o painel (CRUD completo).
 * Como o volume é pequeno — algumas oficinas por temporada, não centenas de
 * matérias — a API devolve tudo de uma vez e a filtragem acontece aqui, no
 * cliente: o filtro responde na hora, sem ida e volta a cada tecla.
 */
export const useWorkshopsStore = defineStore('workshops', () => {
  const itens = ref<Workshop[]>([])
  const carregando = ref(false)
  const salvando = ref(false)
  const erro = ref<string | null>(null)
  const filtros = ref<FiltrosWorkshop>(filtrosPadraoWorkshop())

  /** Hoje em AAAA-MM-DD, para comparar com `acontecemEm` sem cair no fuso. */
  function hojeIso(): string {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
  }

  /** Oficina que ainda vai acontecer — sem data marcada também conta. */
  function ehProxima(oficina: Workshop): boolean {
    return !oficina.acontecemEm || oficina.acontecemEm >= hojeIso()
  }

  const listaFiltrada = computed(() => {
    const f = filtros.value
    const termo = f.busca.trim().toLowerCase()

    return itens.value.filter((oficina) => {
      if (f.status !== 'todos' && oficina.status !== f.status) return false
      if (f.periodo === 'proximas' && !ehProxima(oficina)) return false
      if (f.periodo === 'realizadas' && ehProxima(oficina)) return false
      if (termo && !`${oficina.titulo} ${oficina.resumo} ${oficina.local ?? ''}`.toLowerCase().includes(termo)) return false
      return true
    })
  })

  const contagem = computed(() => ({
    total: itens.value.length,
    publicadas: itens.value.filter(o => o.status === 'publicado').length,
    rascunhos: itens.value.filter(o => o.status === 'rascunho').length,
    proximas: itens.value.filter(o => o.status === 'publicado' && ehProxima(o)).length,
  }))

  const porId = computed(() => (id: string) => itens.value.find(o => o.id === id))

  /** O que a página pública mostra: publicadas e ainda por acontecer. */
  const noAr = computed(() =>
    itens.value.filter(o => o.status === 'publicado' && ehProxima(o)))

  const realizadas = computed(() =>
    itens.value.filter(o => o.status === 'publicado' && !ehProxima(o)))

  async function carregar(forcar = false) {
    if (itens.value.length && !forcar) return
    carregando.value = true
    erro.value = null
    try {
      itens.value = await $fetch<Workshop[]>('/api/workshops', {
        headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
      })
    }
    catch (e: unknown) {
      erro.value = mensagemDoErro(e, 'Falha ao carregar as oficinas.')
      itens.value = []
    }
    finally {
      carregando.value = false
    }
  }

  async function criar(dados: Partial<WorkshopInput>): Promise<Workshop | null> {
    salvando.value = true
    erro.value = null
    try {
      const criada = await $fetch<Workshop>('/api/workshops', { method: 'POST', body: dados })
      itens.value = [criada, ...itens.value]
      return criada
    }
    catch (e: unknown) {
      erro.value = mensagemDoErro(e, 'Não foi possível criar a oficina.')
      return null
    }
    finally {
      salvando.value = false
    }
  }

  async function atualizar(id: string, dados: Partial<WorkshopInput>): Promise<Workshop | null> {
    salvando.value = true
    erro.value = null
    try {
      const salva = await $fetch<Workshop>(`/api/workshops/${id}`, { method: 'PUT', body: dados })
      itens.value = itens.value.map(o => (o.id === id ? salva : o))
      return salva
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
      await $fetch(`/api/workshops/${id}`, { method: 'DELETE' })
      itens.value = itens.value.filter(o => o.id !== id)
      return true
    }
    catch (e: unknown) {
      erro.value = mensagemDoErro(e, 'Não foi possível excluir a oficina.')
      return false
    }
  }

  /** Publica/recolhe com um clique — o que o botão da tabela faz. */
  async function alternarStatus(oficina: Workshop): Promise<Workshop | null> {
    const novo: StatusWorkshop = oficina.status === 'publicado' ? 'rascunho' : 'publicado'
    erro.value = null
    try {
      const salva = await $fetch<Workshop>(`/api/workshops/${oficina.id}/status`, {
        method: 'PATCH',
        params: { status: novo },
      })
      itens.value = itens.value.map(o => (o.id === oficina.id ? salva : o))
      return salva
    }
    catch (e: unknown) {
      erro.value = mensagemDoErro(e, 'Não foi possível alterar o status.')
      return null
    }
  }

  /** Envia o cartaz. A API troca o arquivo e devolve a oficina já atualizada. */
  async function enviarCartaz(id: string, arquivo: File): Promise<Workshop | null> {
    erro.value = null
    try {
      const corpo = new FormData()
      corpo.append('file', arquivo)

      const salva = await $fetch<Workshop>(`/api/workshops/${id}/cartaz`, { method: 'PUT', body: corpo })
      itens.value = itens.value.map(o => (o.id === id ? salva : o))
      return salva
    }
    catch (e: unknown) {
      erro.value = mensagemDoErro(e, 'Não foi possível enviar o cartaz.')
      return null
    }
  }

  async function removerCartaz(id: string): Promise<Workshop | null> {
    erro.value = null
    try {
      const salva = await $fetch<Workshop>(`/api/workshops/${id}/cartaz`, { method: 'DELETE' })
      itens.value = itens.value.map(o => (o.id === id ? salva : o))
      return salva
    }
    catch (e: unknown) {
      erro.value = mensagemDoErro(e, 'Não foi possível remover o cartaz.')
      return null
    }
  }

  /**
   * Busca uma oficina pelo id, indo à API.
   *
   * A listagem já traz o corpo do texto, mas ir ao servidor garante que o
   * formulário abra com o que está gravado agora — e não com o que estava na
   * memória desde o último carregamento.
   */
  async function buscarPorId(id: string): Promise<Workshop | null> {
    try {
      const completa = await $fetch<Workshop>(`/api/workshops/${id}`, {
        headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
      })
      itens.value = itens.value.map(o => (o.id === id ? completa : o))
      return completa
    }
    catch {
      return itens.value.find(o => o.id === id) ?? null
    }
  }

  function limparFiltros() {
    filtros.value = filtrosPadraoWorkshop()
  }

  return {
    itens, carregando, salvando, erro, filtros,
    listaFiltrada, contagem, porId, noAr, realizadas,
    carregar, criar, atualizar, remover, alternarStatus,
    enviarCartaz, removerCartaz, buscarPorId, limparFiltros,
  }
})
