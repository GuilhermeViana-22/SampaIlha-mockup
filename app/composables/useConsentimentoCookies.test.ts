import { beforeEach, describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { useConsentimentoCookies } from './useConsentimentoCookies'

/**
 * O composable vive de dois auto-imports que o `test/setup.ts` não precisa
 * expor para o resto da suíte: `useState`, que aqui é um mapa de refs por
 * chave, e `onMounted`, que roda na hora — é justamente a leitura do
 * `localStorage` no mount que se quer exercitar.
 */
const estados = new Map<string, ReturnType<typeof ref>>()

Object.assign(globalThis, {
  useState: (chave: string, inicial: () => unknown) => {
    if (!estados.has(chave)) estados.set(chave, ref(inicial()))
    return estados.get(chave)
  },
  onMounted: (fn: () => void) => fn(),
})

const CHAVE = 'sampa:consentimento-cookies'

/** Cada teste começa como um navegador que nunca visitou o portal. */
beforeEach(() => {
  estados.clear()
  localStorage.clear()
})

describe('useConsentimentoCookies', () => {
  it('pergunta a quem ainda não decidiu', () => {
    const { avisoVisivel, decidido } = useConsentimentoCookies()

    expect(decidido.value).toBe(false)
    expect(avisoVisivel.value).toBe(true)
  })

  it('guarda o "sim" completo e tira o aviso da frente', () => {
    const { aceitarTodos, avisoVisivel, permite } = useConsentimentoCookies()

    aceitarTodos()

    expect(avisoVisivel.value).toBe(false)
    expect(permite('analise')).toBe(true)
    expect(permite('marketing')).toBe(true)
    expect(JSON.parse(localStorage.getItem(CHAVE)!)).toMatchObject({ versao: 1, analise: true, marketing: true })
  })

  it('registra a recusa em vez de só fechar a barra — senão voltaria a toda visita', () => {
    const { rejeitarOpcionais, avisoVisivel, permite } = useConsentimentoCookies()

    rejeitarOpcionais()

    expect(avisoVisivel.value).toBe(false)
    expect(permite('analise')).toBe(false)
    expect(JSON.parse(localStorage.getItem(CHAVE)!)).toMatchObject({ analise: false, marketing: false })
  })

  it('aceita cada categoria de forma independente', () => {
    const { decidir, permite } = useConsentimentoCookies()

    decidir({ analise: true, marketing: false })

    expect(permite('analise')).toBe(true)
    expect(permite('marketing')).toBe(false)
  })

  it('não herda o "sim" dado a uma versão anterior das categorias', () => {
    localStorage.setItem(CHAVE, JSON.stringify({ versao: 0, em: '2020-01-01T00:00:00.000Z', analise: true, marketing: true }))

    const { avisoVisivel, permite } = useConsentimentoCookies()

    expect(avisoVisivel.value).toBe(true)
    expect(permite('analise')).toBe(false)
  })

  it('volta a perguntar quando o registro está corrompido', () => {
    localStorage.setItem(CHAVE, 'não é json')

    expect(useConsentimentoCookies().avisoVisivel.value).toBe(true)
  })

  it('reconhece quem já decidiu numa visita anterior', () => {
    localStorage.setItem(CHAVE, JSON.stringify({ versao: 1, em: '2026-01-01T00:00:00.000Z', analise: true, marketing: false }))

    const { avisoVisivel, rascunho } = useConsentimentoCookies()

    expect(avisoVisivel.value).toBe(false)
    // O painel reabre marcado como a pessoa deixou, não no padrão de fábrica.
    expect(rascunho.value).toEqual({ analise: true, marketing: false })
  })

  it('reabrir apaga o registro e devolve a escolha anterior aos interruptores', () => {
    const { decidir, reabrir, avisoVisivel, painelAberto, rascunho } = useConsentimentoCookies()
    decidir({ analise: true, marketing: false })

    reabrir()

    expect(avisoVisivel.value).toBe(true)
    expect(painelAberto.value).toBe(true)
    expect(localStorage.getItem(CHAVE)).toBeNull()
    expect(rascunho.value).toEqual({ analise: true, marketing: false })
  })

  it('não deixa nada ligado por padrão para quem chega pela primeira vez', () => {
    expect(useConsentimentoCookies().rascunho.value).toEqual({ analise: false, marketing: false })
  })
})
