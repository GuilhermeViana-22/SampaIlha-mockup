import type { Workshop } from '../../../../shared/types/workshop'
import type { ApiWorkshop } from '../../../utils/workshops'
import { paraWorkshop } from '../../../utils/workshops'
import { chamarApi } from '../../../utils/api'

/** Publica ou recolhe a oficina direto da listagem do painel. */
export default defineEventHandler(async (event): Promise<Workshop> => {
  const id = getRouterParam(event, 'id')!
  const { status } = getQuery(event)

  const atualizada = await chamarApi<ApiWorkshop>(event, `/workshops/${id}/status`, {
    method: 'PATCH',
    params: { status },
    requerSessao: true,
  })

  return paraWorkshop(atualizada)
})
