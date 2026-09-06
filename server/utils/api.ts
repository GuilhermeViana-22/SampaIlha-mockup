import { $fetch } from 'ofetch'
import type { H3Event } from 'h3'

/**
 * Cliente da API Python (api_python_sampa).
 *
 * O token de acesso nunca chega ao navegador: fica em cookie httpOnly e é
 * anexado aqui, no servidor. Quando o access token expira, o refresh é feito
 * de forma transparente e a chamada é repetida uma vez.
 */

export const COOKIE_ACESSO = 'sampa_acesso'
export const COOKIE_REFRESH = 'sampa_refresh'

interface OpcoesApi {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  params?: Record<string, unknown>
  /** Anexa o token da sessão; se não houver, segue como leitor anônimo. */
  auth?: boolean
  /** Falha com 401 quando não há sessão (rotas do painel). */
  requerSessao?: boolean
  /**
   * Token explícito. Necessário logo após o login: o cookie acabou de ser
   * escrito na resposta e ainda não existe nos cabeçalhos da requisição.
   */
  token?: string
  headers?: Record<string, string>
}

function baseUrl(): string {
  return useRuntimeConfig().apiBase
}

/** Traduz o envelope de erro da API para o formato que o front já entende. */
function repassarErro(erro: any): never {
  const status = erro?.response?.status ?? erro?.statusCode ?? 500
  const detalhe = erro?.data?.error
  throw createError({
    statusCode: status,
    statusMessage: detalhe?.message || erro?.statusMessage || 'Falha ao falar com a API do portal.',
    data: detalhe ? { error: detalhe } : undefined,
  })
}

async function renovarAcesso(event: H3Event): Promise<string | null> {
  const refresh = getCookie(event, COOKIE_REFRESH)
  if (!refresh) return null

  try {
    const resposta = await $fetch<{ access_token: string, expires_in: number }>(`${baseUrl()}/auth/refresh`, {
      method: 'POST',
      body: { refresh_token: refresh },
    })
    gravarAcesso(event, resposta.access_token, resposta.expires_in)
    return resposta.access_token
  }
  catch {
    limparSessao(event)
    return null
  }
}

export async function chamarApi<T>(event: H3Event, caminho: string, opcoes: OpcoesApi = {}): Promise<T> {
  const { auth = false, requerSessao = false, token: tokenExplicito, ...resto } = opcoes

  let token = tokenExplicito ?? (auth || requerSessao ? getCookie(event, COOKIE_ACESSO) : undefined)

  if (requerSessao && !token) {
    token = (await renovarAcesso(event)) ?? undefined
    if (!token) {
      throw createError({ statusCode: 401, statusMessage: 'Sessão expirada. Faça login novamente.' })
    }
  }

  const executar = (comToken?: string) =>
    $fetch<T>(`${baseUrl()}${caminho}`, {
      method: resto.method ?? 'GET',
      body: resto.body as never,
      params: resto.params,
      headers: {
        ...(resto.headers ?? {}),
        ...(comToken ? { Authorization: `Bearer ${comToken}` } : {}),
      },
    })

  try {
    return await executar(token)
  }
  catch (erro: any) {
    const expirou = erro?.response?.status === 401 && (auth || requerSessao)
    if (!expirou) repassarErro(erro)

    const novoToken = await renovarAcesso(event)
    if (!novoToken) {
      throw createError({ statusCode: 401, statusMessage: 'Sessão expirada. Faça login novamente.' })
    }

    try {
      return await executar(novoToken)
    }
    catch (erroFinal: any) {
      repassarErro(erroFinal)
    }
  }
}

/**
 * Token de acesso válido para as chamadas que não passam pelo `chamarApi`.
 *
 * Os uploads montam o `FormData` na mão e vão direto no `$fetch` — o boundary
 * do multipart tem de ser montado pelo próprio fetch —, então não herdam daqui
 * o refresh automático. O jeito antigo de resolver isso era:
 *
 *     if (!getCookie(event, COOKIE_ACESSO))
 *       await chamarApi(event, '/auth/me', { requerSessao: true })
 *     ...
 *     headers: { Authorization: `Bearer ${getCookie(event, COOKIE_ACESSO)}` }
 *
 * e o segundo `getCookie` voltava vazio mesmo depois de a sessão ter sido
 * renovada com sucesso: `setCookie` escreve na *resposta*, enquanto `getCookie`
 * lê a *requisição*, que continua sendo a mesma de antes — sem o cookie novo.
 * O cabeçalho saía literalmente `Bearer undefined` e a API recusava com 401.
 *
 * Devolver o token em vez de confiar no cookie fecha essa janela: quem envia a
 * foto logo depois de o access token expirar não é mais deslogado no meio.
 */
export async function tokenDaSessao(event: H3Event): Promise<string> {
  const token = getCookie(event, COOKIE_ACESSO) ?? (await renovarAcesso(event))

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Sessão expirada. Faça login novamente.' })
  }

  return token
}

export function gravarAcesso(event: H3Event, token: string, expiraEmSegundos: number): void {
  setCookie(event, COOKIE_ACESSO, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: expiraEmSegundos,
    secure: !import.meta.dev,
  })
}

export function gravarRefresh(event: H3Event, token: string, dias = 7): void {
  setCookie(event, COOKIE_REFRESH, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: dias * 24 * 3600,
    secure: !import.meta.dev,
  })
}

export function limparSessao(event: H3Event): void {
  deleteCookie(event, COOKIE_ACESSO, { path: '/' })
  deleteCookie(event, COOKIE_REFRESH, { path: '/' })
}

export function temSessao(event: H3Event): boolean {
  return !!getCookie(event, COOKIE_ACESSO) || !!getCookie(event, COOKIE_REFRESH)
}
