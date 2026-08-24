import type { Workshop } from '../../../../shared/types/workshop'
import type { ApiWorkshop } from '../../../utils/workshops'
import { paraWorkshop } from '../../../utils/workshops'
import { chamarApi } from '../../../utils/api'

/** Remove o cartaz; a oficina passa a usar a imagem padrão da seção. */
export default defineEventHandler(async (event): Promise<Workshop> => {
  const id = getRouterParam(event, 'id')!

  const atualizada = await chamarApi<ApiWorkshop>(event, `/workshops/${id}/imagem`, {
    method: 'DELETE',
    requerSessao: true,
  })

  return paraWorkshop(atualizada)
})
