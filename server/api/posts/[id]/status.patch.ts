import type { Post } from '../../../../shared/types/content'
import type { ApiPost } from '../../../utils/adaptadores'
import { paraPost } from '../../../utils/adaptadores'
import { chamarApi } from '../../../utils/api'

export default defineEventHandler(async (event): Promise<Post> => {
  const id = getRouterParam(event, 'id')!
  const { status } = getQuery(event)

  const atualizado = await chamarApi<ApiPost>(event, `/posts/${id}/status`, {
    method: 'PATCH',
    params: { status },
    requerSessao: true,
  })

  return paraPost(atualizado)
})
