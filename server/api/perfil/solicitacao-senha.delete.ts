import { chamarApi } from '../../utils/api'

/** Desiste do pedido de senha. */
export default defineEventHandler(async (event) => {
  await chamarApi(event, '/users/me/senha/solicitacao', { method: 'DELETE', requerSessao: true })

  setResponseStatus(event, 204)
  return null
})
