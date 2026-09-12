import { defineStore } from 'pinia'
import type { Apoio } from '#shared/types/apoio'
import { APOIO_PADRAO } from '#shared/types/apoio'

/**
 * Bloco de apoio do leitor.
 *
 * Fonte única para o widget do portal (leitura) e para a aba de Configurações
 * do painel (edição). Com a API fora do ar, fica no padrão desligado — o site
 * simplesmente não desenha o bloco, em vez de mostrar um card quebrado.
 */
export const useApoioStore = defineStore('apoio', () => {
  const dados = ref<Apoio>({ ...APOIO_PADRAO })
  const carregado = ref(false)
  const salvando = ref(false)

  /** O bloco só aparece ligado e com destino — link ou chave Pix. */
  const visivel = computed(() => dados.value.ativo && !!(dados.value.url || dados.value.chavePix))

  async function carregar(forcar = false) {
    if (carregado.value && !forcar) return
    try {
      dados.value = await $fetch<Apoio>('/api/apoio', {
        headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
      })
    }
    catch {
      dados.value = { ...APOIO_PADRAO }
    }
    finally {
      carregado.value = true
    }
  }

  /**
   * Salva e adota a resposta do servidor, não o que foi enviado.
   *
   * A API desliga o bloco sozinha quando ele é ligado sem link e sem chave
   * Pix: o painel precisa mostrar o que ficou gravado, e não o que o
   * formulário achava que ia gravar.
   */
  async function salvar(novo: Apoio): Promise<Apoio> {
    salvando.value = true
    try {
      dados.value = await $fetch<Apoio>('/api/apoio', { method: 'PUT', body: novo })
      return dados.value
    }
    catch (e: any) {
      throw new Error(e?.data?.statusMessage || e?.statusMessage || 'Não foi possível salvar a área de apoio.')
    }
    finally {
      salvando.value = false
    }
  }

  return { dados, carregado, salvando, visivel, carregar, salvar }
})
