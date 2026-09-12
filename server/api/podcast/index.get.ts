import type { RespostaLista } from '../../../shared/types/content'
import type { Episodio } from '../../../shared/types/podcast'
import type { ApiEpisodio } from '../../utils/podcast'
import { paraEpisodio } from '../../utils/podcast'
import { chamarApi, temSessao } from '../../utils/api'

/**
 * Feed do podcast, do mais recente para o mais antigo.
 *
 * Autenticado, a API já devolve os rascunhos — basta repassar o token. O site
 * público chama sem sessão e recebe só o que está publicado.
 *
 * Devolve no mesmo formato das matérias (`itens` + `total`) porque a página
 * pública reaproveita o "Ver mais" das listagens de notícia.
 */
export default defineEventHandler(async (event): Promise<RespostaLista<Episodio>> => {
  const query = getQuery(event)
  const autenticado = temSessao(event)

  const resposta = await chamarApi<{ items: ApiEpisodio[], pagination: { total: number } }>(event, '/podcast', {
    auth: autenticado,
    params: {
      page: query.pagina ?? 1,
      limit: query.limite ?? 20,
      status: autenticado && query.status && query.status !== 'todos' ? query.status : undefined,
      platform: query.plataforma && query.plataforma !== 'todas' ? query.plataforma : undefined,
      search: query.busca || undefined,
    },
  })

  return { itens: resposta.items.map(paraEpisodio), total: resposta.pagination.total }
})
