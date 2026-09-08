import type { Guia } from '../../../shared/types/content'
import type { ApiPost } from '../../utils/adaptadores'
import { paraGuia } from '../../utils/guias'
import { chamarApi, temSessao } from '../../utils/api'

export default defineEventHandler(async (event): Promise<Guia> => {
  const id = getRouterParam(event, 'id')!
  const post = await chamarApi<ApiPost>(event, `/posts/${id}`, { auth: temSessao(event) })
  return paraGuia(post)
})
