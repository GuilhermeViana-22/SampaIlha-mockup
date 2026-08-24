import type { Tema } from '../../../shared/types/tema'
import { chamarApi } from '../../utils/api'
import { daApi } from '../../utils/tema'

/** Volta o site à paleta oficial do portal. */
export default defineEventHandler(async (event): Promise<Tema> => {
  return daApi(await chamarApi(event, '/settings/theme/reset', { method: 'POST', requerSessao: true }))
})
