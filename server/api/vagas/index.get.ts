import type { Vaga } from '../../../shared/types/vaga'
import type { ApiVaga } from '../../utils/vagas'
import { paraVaga } from '../../utils/vagas'
import { chamarApi, temSessao } from '../../utils/api'

/**
 * Listagem de vagas.
 *
 * Autenticado, a API já devolve rascunhos e encerradas — basta repassar o
 * token. O site público chama sem sessão e recebe só o que está aberto.
 *
 * A API pagina; aqui a lista sai inteira. O volume é pequeno — algumas dezenas
 * de oportunidades por vez, não centenas de matérias —, e tanto o mural quanto
 * o painel filtram no cliente, sem ida e volta a cada tecla.
 */
export default defineEventHandler(async (event): Promise<Vaga[]> => {
  const query = getQuery(event)
  const autenticado = temSessao(event)

  const resposta = await chamarApi<{ items: ApiVaga[] }>(event, '/jobs', {
    auth: autenticado,
    params: {
      limit: 100,
      status: autenticado && query.status && query.status !== 'todos' ? query.status : undefined,
      search: query.busca || undefined,
    },
  })

  return resposta.items.map(paraVaga)
})
