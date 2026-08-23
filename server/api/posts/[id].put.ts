import type { Post } from '../../../shared/types/content'
import type { ApiPost } from '../../utils/adaptadores'
import { paraPayloadApi, paraPost } from '../../utils/adaptadores'
import { chamarApi } from '../../utils/api'

export default defineEventHandler(async (event): Promise<Post> => {
  const id = getRouterParam(event, 'id')!
  const corpo = await readBody<Record<string, unknown>>(event)

  const atualizado = await chamarApi<ApiPost>(event, `/posts/${id}`, {
    method: 'PUT',
    body: paraPayloadApi(corpo ?? {}),
    requerSessao: true,
  })

  return paraPost(atualizado)
})
