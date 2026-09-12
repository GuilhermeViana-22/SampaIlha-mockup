import { chamarApi } from '../../utils/api'

/**
 * Exclusão definitiva: apaga a linha e a capa no disco.
 *
 * O áudio continua na plataforma — o que sai daqui é a chamada no portal.
 */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!

  await chamarApi(event, `/podcast/${id}`, { method: 'DELETE', requerSessao: true })

  return { ok: true, id }
})
