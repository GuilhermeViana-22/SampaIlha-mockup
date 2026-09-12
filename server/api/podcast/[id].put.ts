import type { Episodio } from '../../../shared/types/podcast'
import type { ApiEpisodio } from '../../utils/podcast'
import { paraEpisodio, paraPayloadEpisodio } from '../../utils/podcast'
import { chamarApi } from '../../utils/api'

export default defineEventHandler(async (event): Promise<Episodio> => {
  const id = getRouterParam(event, 'id')!
  const corpo = await readBody<Record<string, unknown>>(event)

  const atualizado = await chamarApi<ApiEpisodio>(event, `/podcast/${id}`, {
    method: 'PUT',
    body: paraPayloadEpisodio(corpo ?? {}),
    requerSessao: true,
  })

  return paraEpisodio(atualizado)
})
