import { defineStore } from 'pinia'
import type { Usuario } from '#shared/types/content'

/** Sessão do dashboard administrativo (/admin). */
export const useAuthStore = defineStore('auth', () => {
  const usuario = ref<Usuario | null>(null)
  const carregando = ref(false)
  const erro = ref<string | null>(null)
  const sessaoVerificada = ref(false)

  const autenticado = computed(() => usuario.value !== null)
  /** Editor-chefe: publica, cuida da equipe e das editorias. */
  const ehChefe = computed(() => usuario.value?.papel === 'editor-chefe')
  const iniciais = computed(() =>
    (usuario.value?.nome ?? '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(parte => parte[0]?.toUpperCase() ?? '')
      .join(''),
  )

  async function entrar(email: string, senha: string, lembrar = false) {
    carregando.value = true
    erro.value = null
    try {
      const { usuario: logado } = await $fetch<{ usuario: Usuario }>('/api/auth/login', {
        method: 'POST',
        body: { email, senha, lembrar },
      })
      usuario.value = logado
      sessaoVerificada.value = true
      return true
    }
    catch (e: any) {
      erro.value = e?.data?.statusMessage || e?.statusMessage || 'Não foi possível entrar. Tente novamente.'
      usuario.value = null
      return false
    }
    finally {
      carregando.value = false
    }
  }

  async function sair() {
    await $fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    usuario.value = null
    await navigateTo('/admin')
  }

  /** Recupera a sessão a partir do cookie (SSR e navegação no cliente). */
  async function verificarSessao(forcar = false) {
    if (sessaoVerificada.value && !forcar) return usuario.value
    try {
      const { usuario: atual } = await $fetch<{ usuario: Usuario | null }>('/api/auth/me', {
        headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
      })
      usuario.value = atual
    }
    catch {
      usuario.value = null
    }
    finally {
      sessaoVerificada.value = true
    }
    return usuario.value
  }

  return {
    usuario, carregando, erro, autenticado, ehChefe, iniciais, sessaoVerificada,
    entrar, sair, verificarSessao,
  }
})
