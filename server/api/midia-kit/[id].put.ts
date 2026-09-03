import type { MidiaKit } from '../../../shared/types/content'
import type { ApiMidiaKit } from '../../utils/midiaKit'
import { paraMidiaKit } from '../../utils/midiaKit'
import { chamarApi } from '../../utils/api'

/**
 * Corrige o texto da peça: título e descrição.
 *
 * O arquivo fica de fora — a API não o troca por aqui de propósito, para que um
 * link já enviado a um patrocinador nunca passe a apontar para outra coisa.
 */
export default defineEventHandler(async (event): Promise<MidiaKit> => {
  const id = getRouterParam(event, 'id')!
  const corpo = await readBody<{ titulo?: string, descricao?: string }>(event)

  const atualizada = await chamarApi<ApiMidiaKit>(event, `/media-kit/${id}`, {
    method: 'PUT',
    requerSessao: true,
    body: { title: corpo?.titulo, description: corpo?.descricao },
  })

  return paraMidiaKit(atualizada)
})
