import { defineStore } from 'pinia'
import type { Aviso, TipoAviso } from '#shared/types/content'

/** Rótulo, ícone e cor de cada tipo — o painel e a faixa leem daqui. */
export const TIPOS_AVISO: { valor: TipoAviso, rotulo: string, icone: string, descricao: string }[] = [
  {
    valor: 'urgente',
    rotulo: 'Urgente',
    icone: 'fas fa-bolt',
    descricao: 'Algo que o leitor precisa saber agora.',
  },
  {
    valor: 'acontecendo',
    rotulo: 'Acontecendo hoje',
    icone: 'fas fa-satellite-dish',
    descricao: 'Cobertura ao vivo ou evento em andamento.',
  },
  {
    valor: 'informacao',
    rotulo: 'Informação',
    icone: 'fas fa-circle-info',
    descricao: 'Recado ou serviço, sem caráter de urgência.',
  },
]

export function tipoDeAviso(tipo: TipoAviso) {
  return TIPOS_AVISO.find(t => t.valor === tipo) ?? TIPOS_AVISO[2]!
}

/**
 * Avisos da faixa do topo do portal.
 *
 * `noAr` traz só o que vale para hoje — o corte de data é feito na API, no
 * fuso de São Paulo, e não no relógio do navegador de quem está lendo.
 */
export const useAvisosStore = defineStore('avisos', () => {
  const doDia = ref<Aviso[]>([])
  const historico = ref<Aviso[]>([])
  const carregando = ref(false)
  const salvando = ref(false)

  function mensagemDeErro(e: any, padrao: string): string {
    return e?.data?.data?.error?.message || e?.data?.statusMessage || e?.statusMessage || padrao
  }

  async function carregarDoDia(forcar = false) {
    if (doDia.value.length && !forcar) return
    try {
      doDia.value = await $fetch<Aviso[]>('/api/avisos', {
        headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
      })
    }
    catch {
      doDia.value = []
    }
  }

  async function carregarHistorico(forcar = false) {
    if (historico.value.length && !forcar) return
    carregando.value = true
    try {
      historico.value = await $fetch<Aviso[]>('/api/avisos', {
        params: { historico: 1 },
        headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
      })
    }
    finally {
      carregando.value = false
    }
  }

  async function criar(dados: { mensagem: string, tipo: TipoAviso, exibirEm?: string }) {
    salvando.value = true
    try {
      const criado = await $fetch<Aviso>('/api/avisos', { method: 'POST', body: dados })
      historico.value = [criado, ...historico.value]
      if (criado.noAr) doDia.value = [...doDia.value, criado]
      return criado
    }
    catch (e: any) {
      throw new Error(mensagemDeErro(e, 'Não foi possível publicar o aviso.'))
    }
    finally {
      salvando.value = false
    }
  }

  async function remover(id: string) {
    try {
      await $fetch(`/api/avisos/${id}`, { method: 'DELETE' })
      historico.value = historico.value.filter(a => a.id !== id)
      doDia.value = doDia.value.filter(a => a.id !== id)
    }
    catch (e: any) {
      throw new Error(mensagemDeErro(e, 'Não foi possível remover o aviso.'))
    }
  }

  const noArAgora = computed(() => historico.value.filter(a => a.noAr))

  return {
    doDia, historico, noArAgora, carregando, salvando,
    carregarDoDia, carregarHistorico, criar, remover,
  }
})
