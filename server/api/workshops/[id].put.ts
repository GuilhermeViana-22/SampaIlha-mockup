import type { Workshop } from '../../../shared/types/workshop'
import type { ApiWorkshop } from '../../utils/workshops'
import { paraPayloadWorkshop, paraWorkshop } from '../../utils/workshops'
import { chamarApi } from '../../utils/api'

export default defineEventHandler(async (event): Promise<Workshop> => {
  const id = getRouterParam(event, 'id')!
  const corpo = await readBody<Record<string, unknown>>(event)

  const atualizada = await chamarApi<ApiWorkshop>(event, `/workshops/${id}`, {
    method: 'PUT',
    body: paraPayloadWorkshop(corpo ?? {}),
    requerSessao: true,
  })

  return paraWorkshop(atualizada)
})
