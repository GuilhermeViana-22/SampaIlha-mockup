import { chamarApi } from '../../utils/api'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  await chamarApi(event, `/notices/${id}`, { method: 'DELETE', requerSessao: true })
  setResponseStatus(event, 204)
  return null
})
