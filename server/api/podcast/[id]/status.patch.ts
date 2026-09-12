import type { Episodio } from '../../../../shared/types/podcast'
import type { ApiEpisodio } from '../../../utils/podcast'
import { paraEpisodio } from '../../../utils/podcast'
import { chamarApi } from '../../../utils/api'

/** Publica ou recolhe o episódio direto da listagem do painel. */
export default defineEventHandler(async (event): Promise<Episodio> => {
  const id = getRouterParam(event, 'id')!
  const { status } = getQuery(event)

  const atualizado = await chamarApi<ApiEpisodio>(event, `/podcast/${id}/status`, {
    method: 'PATCH',
    params: { status },
    requerSessao: true,
  })

  return paraEpisodio(atualizado)
})
