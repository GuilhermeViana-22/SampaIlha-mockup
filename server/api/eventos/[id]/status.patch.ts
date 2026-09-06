import type { Evento } from '../../../../shared/types/evento'
import type { ApiEvento } from '../../../utils/eventos'
import { paraEvento } from '../../../utils/eventos'
import { chamarApi } from '../../../utils/api'

/** Publica ou recolhe o evento direto da listagem do painel. */
export default defineEventHandler(async (event): Promise<Evento> => {
  const id = getRouterParam(event, 'id')!
  const { status } = getQuery(event)

  const atualizado = await chamarApi<ApiEvento>(event, `/events/${id}/status`, {
    method: 'PATCH',
    params: { status },
    requerSessao: true,
  })

  return paraEvento(atualizado)
})
