import type { Vaga } from '../../../../shared/types/vaga'
import type { ApiVaga } from '../../../utils/vagas'
import { paraVaga } from '../../../utils/vagas'
import { chamarApi } from '../../../utils/api'

/** Remove a foto; a vaga volta a aparecer só com texto. */
export default defineEventHandler(async (event): Promise<Vaga> => {
  const id = getRouterParam(event, 'id')!

  const atualizada = await chamarApi<ApiVaga>(event, `/jobs/${id}/imagem`, {
    method: 'DELETE',
    requerSessao: true,
  })

  return paraVaga(atualizada)
})
