import type { Evento } from '../../../shared/types/evento'
import type { ApiEvento } from '../../utils/eventos'
import { paraEvento } from '../../utils/eventos'
import { chamarApi, temSessao } from '../../utils/api'

/**
 * Agenda cultural.
 *
 * Autenticado, a API já devolve os rascunhos — basta repassar o token. O site
 * público chama sem sessão e recebe só o que está publicado e dentro da janela.
 */
export default defineEventHandler(async (event): Promise<{ itens: Evento[], total: number }> => {
  const query = getQuery(event)
  const autenticado = temSessao(event)

  const resposta = await chamarApi<{ items: ApiEvento[], pagination: { total: number } }>(event, '/events', {
    auth: autenticado,
    params: {
      limit: query.limite ?? 20,
      kind: query.tipo || undefined,
      category: query.editoria || undefined,
      status: autenticado && query.status && query.status !== 'todos' ? query.status : undefined,
      search: query.busca || undefined,
      periodo: query.periodo && query.periodo !== 'todos' ? query.periodo : undefined,
    },
  })

  return { itens: resposta.items.map(paraEvento), total: resposta.pagination.total }
})
