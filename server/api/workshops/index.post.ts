import type { Workshop } from '../../../shared/types/workshop'
import type { ApiWorkshop } from '../../utils/workshops'
import { paraPayloadWorkshop, paraWorkshop } from '../../utils/workshops'
import { chamarApi } from '../../utils/api'

export default defineEventHandler(async (event): Promise<Workshop> => {
  const corpo = await readBody<Record<string, unknown>>(event)

  const criada = await chamarApi<ApiWorkshop>(event, '/workshops', {
    method: 'POST',
    body: paraPayloadWorkshop(corpo ?? {}),
    requerSessao: true,
  })

  setResponseStatus(event, 201)
  return paraWorkshop(criada)
})
