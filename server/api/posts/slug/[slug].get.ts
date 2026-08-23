import type { Post } from '../../../../shared/types/content'
import type { ApiPost } from '../../../utils/adaptadores'
import { paraPost } from '../../../utils/adaptadores'
import { chamarApi, temSessao } from '../../../utils/api'

/** Matéria + relacionadas. A contagem de leitura é feita pela API. */
export default defineEventHandler(async (event): Promise<{ post: Post, relacionados: Post[] }> => {
  const slug = getRouterParam(event, 'slug')!

  const resposta = await chamarApi<{ post: ApiPost, related: ApiPost[] }>(event, `/posts/slug/${slug}`, {
    auth: temSessao(event),
  })

  return { post: paraPost(resposta.post), relacionados: resposta.related.map(paraPost) }
})
