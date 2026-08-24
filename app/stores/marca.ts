import { defineStore } from 'pinia'
import logoPadrao from '~/assets/logos/logo.png'

/**
 * Logo do portal.
 *
 * O arquivo do build continua sendo o fallback: enquanto ninguém enviar um
 * logo pelo painel — ou se a API estiver fora do ar — é ele que aparece, então
 * o cabeçalho nunca fica vazio.
 */
export const useMarcaStore = defineStore('marca', () => {
  const enviado = ref<string | null>(null)
  const carregada = ref(false)
  const salvando = ref(false)

  /** O que o site deve mostrar agora. */
  const logo = computed(() => enviado.value ?? logoPadrao)
  const usandoPadrao = computed(() => enviado.value === null)

  async function carregar(forcar = false) {
    if (carregada.value && !forcar) return
    try {
      const { logoUrl } = await $fetch<{ logoUrl: string | null }>('/api/marca', {
        headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
      })
      enviado.value = logoUrl
    }
    catch {
      enviado.value = null
    }
    finally {
      carregada.value = true
    }
  }

  async function enviar(arquivo: File) {
    salvando.value = true
    try {
      const corpo = new FormData()
      corpo.append('file', arquivo)
      const { logoUrl } = await $fetch<{ logoUrl: string | null }>('/api/marca/logo', {
        method: 'PUT',
        body: corpo,
      })
      enviado.value = logoUrl
      return logoUrl
    }
    catch (e: any) {
      throw new Error(e?.data?.statusMessage || e?.statusMessage || 'Não foi possível enviar o logo.')
    }
    finally {
      salvando.value = false
    }
  }

  async function restaurarPadrao() {
    salvando.value = true
    try {
      await $fetch('/api/marca/logo', { method: 'DELETE' })
      enviado.value = null
    }
    catch (e: any) {
      throw new Error(e?.data?.statusMessage || e?.statusMessage || 'Não foi possível restaurar o logo.')
    }
    finally {
      salvando.value = false
    }
  }

  return { enviado, logo, usandoPadrao, carregada, salvando, carregar, enviar, restaurarPadrao }
})
