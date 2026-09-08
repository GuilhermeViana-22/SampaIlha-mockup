import type { Guia } from '../../../../shared/types/content'
import type { ApiPost } from '../../../utils/adaptadores'
import { paraGuia } from '../../../utils/guias'
import { chamarApi } from '../../../utils/api'

/** Liga/desliga o destaque na vitrine da home. Só o editor-chefe. */
export default defineEventHandler(async (event): Promise<Guia> => {
  const id = getRouterParam(event, 'id')!

  const atualizado = await chamarApi<ApiPost>(event, `/posts/${id}/featured`, {
    method: 'PATCH',
    requerSessao: true,
  })

  return paraGuia(atualizado)
})
