import type { Vaga } from '../../../../shared/types/vaga'
import type { ApiVaga } from '../../../utils/vagas'
import { paraVaga } from '../../../utils/vagas'
import { chamarApi } from '../../../utils/api'

/** Abre ou encerra a vaga direto da listagem do painel. */
export default defineEventHandler(async (event): Promise<Vaga> => {
  const id = getRouterParam(event, 'id')!
  const { status } = getQuery(event)

  const atualizada = await chamarApi<ApiVaga>(event, `/jobs/${id}/status`, {
    method: 'PATCH',
    params: { status },
    requerSessao: true,
  })

  return paraVaga(atualizada)
})
