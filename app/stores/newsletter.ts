import { defineStore } from 'pinia'
import type { InscricaoNewsletter } from '#shared/types/content'

/** Assinaturas da newsletter — formulário público + listagem no dashboard. */
export const useNewsletterStore = defineStore('newsletter', () => {
  const inscricoes = ref<InscricaoNewsletter[]>([])
  const enviando = ref(false)
  const mensagem = ref<string | null>(null)
  const erro = ref<string | null>(null)

  async function inscrever(nome: string, email: string) {
    enviando.value = true
    erro.value = null
    mensagem.value = null
    try {
      await $fetch('/api/newsletter', { method: 'POST', body: { nome, email } })
      mensagem.value = 'Pronto! Você vai receber os destaques do portal no seu e-mail.'
      return true
    }
    catch (e: any) {
      erro.value = e?.data?.statusMessage || 'Não foi possível concluir a inscrição.'
      return false
    }
    finally {
      enviando.value = false
    }
  }

  async function carregar() {
    try {
      const { itens } = await $fetch<{ itens: InscricaoNewsletter[] }>('/api/newsletter', {
        headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
      })
      inscricoes.value = itens
    }
    catch {
      inscricoes.value = []
    }
  }

  async function remover(id: string) {
    await $fetch(`/api/newsletter/${id}`, { method: 'DELETE' })
    inscricoes.value = inscricoes.value.filter(i => i.id !== id)
  }

  return { inscricoes, enviando, mensagem, erro, inscrever, carregar, remover }
})
