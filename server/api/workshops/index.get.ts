import type { Workshop } from '../../../shared/types/workshop'
import type { ApiWorkshop } from '../../utils/workshops'
import { paraWorkshop } from '../../utils/workshops'
import { chamarApi, temSessao } from '../../utils/api'

/**
 * Listagem de oficinas.
 *
 * Autenticado, a API já devolve os rascunhos — basta repassar o token. O site
 * público chama sem sessão e recebe só o que está publicado.
 */
export default defineEventHandler(async (event): Promise<Workshop[]> => {
  const query = getQuery(event)
  const autenticado = temSessao(event)

  const lista = await chamarApi<ApiWorkshop[]>(event, '/workshops', {
    auth: autenticado,
    params: {
      status: autenticado && query.status && query.status !== 'todos' ? query.status : undefined,
      search: query.busca || undefined,
      periodo: query.periodo && query.periodo !== 'todos' ? query.periodo : undefined,
    },
  })

  return lista.map(paraWorkshop)
})
