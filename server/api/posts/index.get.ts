import type { Post, RespostaLista } from '../../../shared/types/content'
import type { ApiPost } from '../../utils/adaptadores'
import { paraLista, paraPost } from '../../utils/adaptadores'
import { chamarApi, temSessao } from '../../utils/api'

/**
 * Listagem de conteúdos. Autenticado, a API já devolve rascunhos e agendados —
 * basta repassar o token.
 */
export default defineEventHandler(async (event): Promise<RespostaLista<Post>> => {
  const query = getQuery(event)
  const autenticado = temSessao(event)

  const resposta = await chamarApi<{ items: ApiPost[], pagination: { total: number } }>(event, '/posts', {
    auth: autenticado,
    params: {
      page: query.pagina ?? 1,
      limit: query.limite ?? 20,
      type: query.tipo && query.tipo !== 'todos' ? query.tipo : undefined,
      status: autenticado && query.status && query.status !== 'todos' ? query.status : undefined,
      category: query.categoria || undefined,
      region: query.regiao || undefined,
      tag: query.tag || undefined,
      author: query.autor || undefined,
      featured: query.destaque === undefined ? undefined : query.destaque === 'true',
      search: query.busca || undefined,
      order: query.ordenar ?? 'recentes',
    },
  })

  return paraLista(resposta, paraPost)
})
