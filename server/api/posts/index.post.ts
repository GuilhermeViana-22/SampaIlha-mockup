import type { Post } from '../../../shared/types/content'
import type { ApiPost } from '../../utils/adaptadores'
import { paraPayloadApi, paraPost } from '../../utils/adaptadores'
import { chamarApi } from '../../utils/api'

export default defineEventHandler(async (event): Promise<Post> => {
  const corpo = await readBody<Record<string, unknown>>(event)

  const criado = await chamarApi<ApiPost>(event, '/posts', {
    method: 'POST',
    body: paraPayloadApi(corpo ?? {}),
    requerSessao: true,
  })

  setResponseStatus(event, 201)
  return paraPost(criado)
})
