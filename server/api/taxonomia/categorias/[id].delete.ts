import { chamarApi } from '../../../utils/api'

/**
 * Remove uma editoria. A API recusa quando ainda há conteúdo publicado nela —
 * a mensagem de erro sobe para a tela sem tradução.
 */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  await chamarApi(event, `/categories/${id}`, { method: 'DELETE', requerSessao: true })
  setResponseStatus(event, 204)
  return null
})
