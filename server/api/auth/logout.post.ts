import { COOKIE_REFRESH, chamarApi, limparSessao } from '../../utils/api'

export default defineEventHandler(async (event) => {
  const refresh = getCookie(event, COOKIE_REFRESH)

  if (refresh) {
    // Revoga do lado da API; se já estiver expirado, seguimos limpando local.
    await chamarApi(event, '/auth/logout', {
      method: 'POST',
      body: { refresh_token: refresh },
      auth: true,
    }).catch(() => {})
  }

  limparSessao(event)
  return { ok: true }
})
