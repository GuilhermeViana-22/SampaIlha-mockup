import { computed, isRef, reactive, ref, unref, watch } from 'vue'
import { vi } from 'vitest'
import type { H3Event } from 'h3'

/**
 * Ambiente mínimo para testar o código que roda dentro do Nuxt.
 *
 * As rotas de `server/api/` e as stores de `app/` usam auto-imports — do Nuxt
 * (`useRuntimeConfig`, `$fetch`), do h3 (`defineEventHandler`, `getQuery`…) e
 * do Vue (`ref`, `computed`). Fora do Nuxt esses nomes não existem, e é por
 * isso que os testes antigos não testavam nada: em vez de exercitar as rotas,
 * copiavam a lógica delas para dentro do `it()`.
 *
 * Aqui os auto-imports viram globais de verdade, então os testes importam o
 * módulo real. O h3 é substituído por um equivalente enxuto: `defineEventHandler`
 * devolve a própria função, e o "evento" é um objeto simples com `query`,
 * `body` e `params` — o que basta para chamar um handler e conferir o que ele
 * fez.
 */

export interface EventoFalso {
  query: Record<string, any>
  body: any
  params: Record<string, string>
  status?: number
}

/**
 * Evento de mentira aceito pelos handlers.
 *
 * O tipo dobrado com `H3Event` é o que permite passá-lo direto para a rota sem
 * um `as any` em cada chamada — os ajudantes do h3 aqui só leem `query`, `body`
 * e `params`, então o resto da interface nunca é tocado.
 */
export function criarEvento(parcial: Partial<EventoFalso> = {}): EventoFalso & H3Event {
  return { query: {}, body: undefined, params: {}, ...parcial } as unknown as EventoFalso & H3Event
}

/**
 * O `useFetch` que os composables de página enxergam. Cada teste devolve por
 * aqui o par `{ data, status }` que quiser — o que se quer exercitar é a
 * lógica em volta da busca (acumular páginas, deduplicar, reiniciar no troca
 * de filtro), não o `useFetch` do Nuxt.
 */
export const useFetchFalso = vi.fn()

/**
 * O `$fetch` que as stores enxergam. Os testes configuram a resposta por aqui
 * (`fetchFalso.mockResolvedValue(...)`) — usar `globalThis.$fetch` traria o
 * tipo real do Nuxt, que não conhece os métodos de mock.
 */
export const fetchFalso = vi.fn()

/** Erro no formato que o h3 cria — o front lê `statusCode` e `statusMessage`. */
export class ErroH3 extends Error {
  statusCode: number
  statusMessage: string
  data?: unknown

  constructor(opcoes: { statusCode?: number, statusMessage?: string, data?: unknown }) {
    super(opcoes.statusMessage ?? 'Erro')
    this.statusCode = opcoes.statusCode ?? 500
    this.statusMessage = opcoes.statusMessage ?? 'Erro'
    this.data = opcoes.data
  }
}

const globais = {
  // Vue
  ref,
  computed,
  reactive,
  watch,

  // Nuxt
  useRuntimeConfig: () => ({
    apiBase: 'http://api.teste/api/v1',
    public: { apiOrigin: 'http://api.teste', siteUrl: 'http://portal.teste' },
  }),
  useRequestHeaders: () => ({}),
  $fetch: fetchFalso,
  useFetch: (...args: any[]) => useFetchFalso(...args),
  toValue: (v: any) => (typeof v === 'function' ? v() : v?.value !== undefined || isRef(v) ? unref(v) : v),

  // h3
  defineEventHandler: (handler: any) => handler,
  getQuery: (evento: EventoFalso) => evento.query,
  readBody: async (evento: EventoFalso) => evento.body,
  getRouterParam: (evento: EventoFalso, nome: string) => evento.params[nome],
  setResponseStatus: (evento: EventoFalso, status: number) => { evento.status = status },
  createError: (opcoes: any) => new ErroH3(opcoes),
}

Object.assign(globalThis, globais)
