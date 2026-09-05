import type { Publicidade } from '../../../../shared/types/content'
import type { ApiPublicidade } from '../../../utils/publicidade'
import { paraPublicidade } from '../../../utils/publicidade'
import { chamarApi } from '../../../utils/api'

/** Põe o anúncio no ar ou recolhe, direto da listagem do painel. */
export default defineEventHandler(async (event): Promise<Publicidade> => {
  const id = getRouterParam(event, 'id')!
  const { status } = getQuery(event)

  const atualizado = await chamarApi<ApiPublicidade>(event, `/advertisements/${id}/status`, {
    method: 'PATCH',
    params: { status },
    requerSessao: true,
  })

  return paraPublicidade(atualizado)
})
