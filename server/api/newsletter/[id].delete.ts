import { chamarApi } from '../../utils/api'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!

  await chamarApi(event, `/newsletter/${id}`, { method: 'DELETE', requerSessao: true })
  return { ok: true, id }
})
