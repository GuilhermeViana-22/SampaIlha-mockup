import type { Workshop } from '../../../shared/types/workshop'
import type { ApiWorkshop } from '../../utils/workshops'
import { paraWorkshop } from '../../utils/workshops'
import { chamarApi, temSessao } from '../../utils/api'

export default defineEventHandler(async (event): Promise<Workshop> => {
  const id = getRouterParam(event, 'id')!
  const oficina = await chamarApi<ApiWorkshop>(event, `/workshops/${id}`, { auth: temSessao(event) })
  return paraWorkshop(oficina)
})
