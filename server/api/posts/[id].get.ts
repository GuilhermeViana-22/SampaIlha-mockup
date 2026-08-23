import type { Post } from '../../../shared/types/content'
import type { ApiPost } from '../../utils/adaptadores'
import { paraPost } from '../../utils/adaptadores'
import { chamarApi, temSessao } from '../../utils/api'

export default defineEventHandler(async (event): Promise<Post> => {
  const id = getRouterParam(event, 'id')!
  const post = await chamarApi<ApiPost>(event, `/posts/${id}`, { auth: temSessao(event) })
  return paraPost(post)
})
