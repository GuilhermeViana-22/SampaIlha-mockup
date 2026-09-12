import type { Episodio } from '../../../shared/types/podcast'
import type { ApiEpisodio } from '../../utils/podcast'
import { paraEpisodio, paraPayloadEpisodio } from '../../utils/podcast'
import { chamarApi } from '../../utils/api'

export default defineEventHandler(async (event): Promise<Episodio> => {
  const corpo = await readBody<Record<string, unknown>>(event)

  const criado = await chamarApi<ApiEpisodio>(event, '/podcast', {
    method: 'POST',
    body: paraPayloadEpisodio(corpo ?? {}),
    requerSessao: true,
  })

  setResponseStatus(event, 201)
  return paraEpisodio(criado)
})
