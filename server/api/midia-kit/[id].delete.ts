import { chamarApi } from '../../utils/api'

/** Exclusão definitiva: apaga a linha e o arquivo no disco. */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!

  await chamarApi(event, `/media-kit/${id}`, { method: 'DELETE', requerSessao: true })

  return { ok: true, id }
})
