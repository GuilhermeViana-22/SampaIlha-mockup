import type { Episodio } from '../../../../shared/types/podcast'
import type { ApiEpisodio } from '../../../utils/podcast'
import { paraEpisodio } from '../../../utils/podcast'
import { chamarApi } from '../../../utils/api'

/**
 * Remove a capa enviada.
 *
 * O card não fica sem rosto: o player do Spotify e o do YouTube trazem a arte
 * do episódio dentro deles.
 */
export default defineEventHandler(async (event): Promise<Episodio> => {
  const id = getRouterParam(event, 'id')!

  const atualizado = await chamarApi<ApiEpisodio>(event, `/podcast/${id}/capa`, {
    method: 'DELETE',
    requerSessao: true,
  })

  return paraEpisodio(atualizado)
})
