import { defineStore } from 'pinia'
import type { StatusVaga, Vaga, VagaInput } from '#shared/types/vaga'

export interface FiltrosVaga {
  busca: string
  status: StatusVaga | 'todos'
}

export const filtrosPadraoVaga = (): FiltrosVaga => ({
  busca: '',
  status: 'todos',
})

/**
 * Vagas de emprego de /vagas.
 *
 * Fonte única para o site público (leitura) e para o painel (CRUD completo).
 * Como o volume é pequeno — algumas dezenas de oportunidades, não centenas de
 * matérias — a API devolve tudo de uma vez e a filtragem acontece aqui, no
 * cliente: o filtro responde na hora, sem ida e volta a cada tecla.
 */
export const useVagasStore = defineStore('vagas', () => {
  const itens = ref<Vaga[]>([])
  const carregando = ref(false)
  const salvando = ref(false)
  const erro = ref<string | null>(null)
  const filtros = ref<FiltrosVaga>(filtrosPadraoVaga())

  const listaFiltrada = computed(() => {
    const f = filtros.value
    const termo = f.busca.trim().toLowerCase()

    return itens.value.filter((vaga) => {
      if (f.status !== 'todos' && vaga.status !== f.status) return false
      if (termo && !`${vaga.titulo} ${vaga.empresa} ${vaga.local}`.toLowerCase().includes(termo)) return false
      return true
    })
  })

  const contagem = computed(() => ({
    total: itens.value.length,
    abertas: itens.value.filter(v => v.status === 'aberta').length,
    encerradas: itens.value.filter(v => v.status === 'encerrada').length,
    rascunhos: itens.value.filter(v => v.status === 'rascunho').length,
  }))

  const porId = computed(() => (id: string) => itens.value.find(v => v.id === id))

  /** O que a página pública mostra: só o que está aberto. */
  const noAr = computed(() => itens.value.filter(v => v.status === 'aberta'))

  async function carregar(forcar = false) {
    if (itens.value.length && !forcar) return
    carregando.value = true
    erro.value = null
    try {
      itens.value = await $fetch<Vaga[]>('/api/vagas', {
        headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
      })
    }
    catch (e: unknown) {
      erro.value = mensagemDoErro(e, 'Falha ao carregar as vagas.')
      itens.value = []
    }
    finally {
      carregando.value = false
    }
  }

  async function criar(dados: Partial<VagaInput>): Promise<Vaga | null> {
    salvando.value = true
    erro.value = null
    try {
      const criada = await $fetch<Vaga>('/api/vagas', { method: 'POST', body: dados })
      itens.value = [criada, ...itens.value]
      return criada
    }
    catch (e: unknown) {
      erro.value = mensagemDoErro(e, 'Não foi possível criar a vaga.')
      return null
    }
    finally {
      salvando.value = false
    }
  }

  async function atualizar(id: string, dados: Partial<VagaInput>): Promise<Vaga | null> {
    salvando.value = true
    erro.value = null
    try {
      const salva = await $fetch<Vaga>(`/api/vagas/${id}`, { method: 'PUT', body: dados })
      itens.value = itens.value.map(v => (v.id === id ? salva : v))
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
      await $fetch(`/api/vagas/${id}`, { method: 'DELETE' })
      itens.value = itens.value.filter(v => v.id !== id)
      return true
    }
    catch (e: unknown) {
      erro.value = mensagemDoErro(e, 'Não foi possível excluir a vaga.')
      return false
    }
  }

  /**
   * Abre/encerra com um clique — o que o botão da tabela faz.
   *
   * O rascunho fica de fora deste atalho de propósito: ele é estado de
   * escrita, não de circulação. Quem quer voltar uma vaga para rascunho faz
   * isso no formulário, onde a mudança é deliberada.
   */
  async function alternarStatus(vaga: Vaga): Promise<Vaga | null> {
    const novo: StatusVaga = vaga.status === 'aberta' ? 'encerrada' : 'aberta'
    erro.value = null
    try {
      const salva = await $fetch<Vaga>(`/api/vagas/${vaga.id}/status`, {
        method: 'PATCH',
        params: { status: novo },
      })
      itens.value = itens.value.map(v => (v.id === vaga.id ? salva : v))
      return salva
    }
    catch (e: unknown) {
      erro.value = mensagemDoErro(e, 'Não foi possível alterar o status.')
      return null
    }
  }

  /** Envia a foto. A API troca o arquivo e devolve a vaga já atualizada. */
  async function enviarFoto(id: string, arquivo: File): Promise<Vaga | null> {
    erro.value = null
    try {
      const corpo = new FormData()
      corpo.append('file', arquivo)

      const salva = await $fetch<Vaga>(`/api/vagas/${id}/foto`, { method: 'PUT', body: corpo })
      itens.value = itens.value.map(v => (v.id === id ? salva : v))
      return salva
    }
    catch (e: unknown) {
      erro.value = mensagemDoErro(e, 'Não foi possível enviar a foto.')
      return null
    }
  }

  async function removerFoto(id: string): Promise<Vaga | null> {
    erro.value = null
    try {
      const salva = await $fetch<Vaga>(`/api/vagas/${id}/foto`, { method: 'DELETE' })
      itens.value = itens.value.map(v => (v.id === id ? salva : v))
      return salva
    }
    catch (e: unknown) {
      erro.value = mensagemDoErro(e, 'Não foi possível remover a foto.')
      return null
    }
  }

  /**
   * Busca uma vaga pelo id, indo à API.
   *
   * A listagem já traz tudo, mas ir ao servidor garante que o formulário abra
   * com o que está gravado agora — e não com o que estava na memória desde o
   * último carregamento.
   */
  async function buscarPorId(id: string): Promise<Vaga | null> {
    try {
      const completa = await $fetch<Vaga>(`/api/vagas/${id}`, {
        headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
      })
      itens.value = itens.value.map(v => (v.id === id ? completa : v))
      return completa
    }
    catch {
      return itens.value.find(v => v.id === id) ?? null
    }
  }

  function limparFiltros() {
    filtros.value = filtrosPadraoVaga()
  }

  return {
    itens, carregando, salvando, erro, filtros,
    listaFiltrada, contagem, porId, noAr,
    carregar, criar, atualizar, remover, alternarStatus,
    enviarFoto, removerFoto, buscarPorId, limparFiltros,
  }
})
