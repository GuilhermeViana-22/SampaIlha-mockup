import { chamarApi } from '../utils/api'

/** Devolve o banco da API ao conteúdo original de demonstração. */
export default defineEventHandler(async (event) => {
  await chamarApi(event, '/stats/reset-content', { method: 'POST', requerSessao: true })
  return { ok: true }
})
