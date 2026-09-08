import type { Guia } from '../../../shared/types/content'
import type { ApiPost } from '../../utils/adaptadores'
import { paraGuia, paraPayloadGuia } from '../../utils/guias'
import { chamarApi } from '../../utils/api'

export default defineEventHandler(async (event): Promise<Guia> => {
  const corpo = await readBody<Record<string, unknown>>(event)

  const criado = await chamarApi<ApiPost>(event, '/posts', {
    method: 'POST',
    body: paraPayloadGuia(corpo ?? {}),
    requerSessao: true,
  })

  setResponseStatus(event, 201)
  return paraGuia(criado)
})
