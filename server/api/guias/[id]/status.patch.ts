import type { Guia } from '../../../../shared/types/content'
import type { ApiPost } from '../../../utils/adaptadores'
import { paraGuia } from '../../../utils/guias'
import { chamarApi } from '../../../utils/api'

/**
 * Publicar/despublicar sem reenviar o texto inteiro.
 *
 * A API tem a palavra final: um editor pedindo `publicado` recebe de volta
 * `em_revisao`, e é esse status que o painel mostra.
 */
export default defineEventHandler(async (event): Promise<Guia> => {
  const id = getRouterParam(event, 'id')!
  const { status } = getQuery(event)

  const atualizado = await chamarApi<ApiPost>(event, `/posts/${id}/status`, {
    method: 'PATCH',
    params: { status },
    requerSessao: true,
  })

  return paraGuia(atualizado)
})
