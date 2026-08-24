import { chamarApi } from '../../utils/api'

/** Tira o acesso. O que a pessoa publicou continua no ar, assinado por ela. */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  await chamarApi(event, `/users/${id}`, { method: 'DELETE', requerSessao: true })
  setResponseStatus(event, 204)
  return null
})
