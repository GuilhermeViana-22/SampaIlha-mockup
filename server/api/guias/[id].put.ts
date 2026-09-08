import type { Guia } from '../../../shared/types/content'
import type { ApiPost } from '../../utils/adaptadores'
import { paraGuia, paraPayloadGuia } from '../../utils/guias'
import { chamarApi } from '../../utils/api'

export default defineEventHandler(async (event): Promise<Guia> => {
  const id = getRouterParam(event, 'id')!
  const corpo = await readBody<Record<string, unknown>>(event)

  const atualizado = await chamarApi<ApiPost>(event, `/posts/${id}`, {
    method: 'PUT',
    body: paraPayloadGuia(corpo ?? {}),
    requerSessao: true,
  })

  return paraGuia(atualizado)
})
