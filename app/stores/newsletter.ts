import { defineStore } from 'pinia'
import type { InscricaoNewsletter } from '#shared/types/content'

/**
 * Marca de leitura da base, no navegador de quem edita.
 *
 * Guarda a data da inscrição mais nova já vista — e não a hora do clique. As
 * duas pontas da comparação saem então do mesmo relógio, o da API: se a máquina
 * de quem edita estiver adiantada, ou em outro fuso, nenhum cadastro nasce "já
 * visto" por causa disso.
 */
const CHAVE_VISTO = 'sampa-newsletter-visto-em'

function emMs(iso: string | null | undefined): number {
  if (!iso) return 0
  const t = new Date(iso).getTime()
  return Number.isNaN(t) ? 0 : t
}

/** Assinaturas da newsletter — formulário público + listagem no dashboard. */
export const useNewsletterStore = defineStore('newsletter', () => {
  const inscricoes = ref<InscricaoNewsletter[]>([])
  const enviando = ref(false)
  const mensagem = ref<string | null>(null)
  const erro = ref<string | null>(null)

  /** Carimbo da última inscrição vista, em milissegundos. */
  const vistoEm = ref(0)
  /**
   * Só depois de ler o `localStorage` o contador vale alguma coisa.
   *
   * Antes disso `novos` é vazio de propósito: no servidor a marca não existe, e
   * um badge renderizado no SSR com a base inteira piscaria "37 novos" em toda
   * navegação até a hidratação corrigir.
   */
  const marcaLida = ref(false)

  async function inscrever(nome: string, email: string) {
    enviando.value = true
    erro.value = null
    mensagem.value = null
    try {
      // A mensagem vem da API: quem já estava na lista recebe "você já está
      // na nossa lista", e não um "pronto!" que faria a pessoa achar que se
      // inscreveu duas vezes. O texto local é só a rede de segurança.
      const resposta = await $fetch<{ mensagem?: string }>('/api/newsletter', {
        method: 'POST',
        body: { nome, email },
      })
      mensagem.value = resposta?.mensagem || 'Pronto! Você vai receber os destaques do portal no seu e-mail.'
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

  /** Zera o resultado da inscrição anterior. O modal chama ao abrir. */
  function limpar() {
    mensagem.value = null
    erro.value = null
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

  /** Lê a marca gravada. Só faz sentido no cliente, e depois da hidratação. */
  function lerMarca() {
    if (!import.meta.client) return
    vistoEm.value = emMs(localStorage.getItem(CHAVE_VISTO))
    marcaLida.value = true
  }

  function ehNovo(inscricao: InscricaoNewsletter): boolean {
    return marcaLida.value && emMs(inscricao.criadoEm) > vistoEm.value
  }

  /** Quem entrou na lista depois da última passada pela tela de newsletter. */
  const novos = computed(() => marcaLida.value
    ? inscricoes.value.filter(i => emMs(i.criadoEm) > vistoEm.value)
    : [])

  const totalNovos = computed(() => novos.value.length)

  /**
   * Dá a base inteira por vista — é o que zera o badge do menu.
   *
   * A marca sobe para a inscrição mais nova que já está carregada, e não para
   * o instante do clique: assim quem chegar entre uma coisa e outra continua
   * contando como novidade em vez de ser engolido pelo clique.
   */
  function marcarVistos() {
    const maisNova = inscricoes.value.reduce(
      (maior, i) => (emMs(i.criadoEm) > emMs(maior) ? i.criadoEm : maior),
      '',
    )
    if (!maisNova) return

    vistoEm.value = emMs(maisNova)
    marcaLida.value = true
    if (import.meta.client) localStorage.setItem(CHAVE_VISTO, maisNova)
  }

  return {
    inscricoes,
    enviando,
    mensagem,
    erro,
    novos,
    totalNovos,
    inscrever,
    limpar,
    carregar,
    remover,
    lerMarca,
    ehNovo,
    marcarVistos,
  }
})
