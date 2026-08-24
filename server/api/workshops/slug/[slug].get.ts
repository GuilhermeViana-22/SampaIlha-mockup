import type { Workshop } from '../../../../shared/types/workshop'
import type { ApiWorkshop } from '../../../utils/workshops'
import { paraWorkshop } from '../../../utils/workshops'
import { chamarApi, temSessao } from '../../../utils/api'

/** Página pública de uma oficina. Rascunho só abre para quem está logado. */
export default defineEventHandler(async (event): Promise<Workshop> => {
  const slug = getRouterParam(event, 'slug')!
  const oficina = await chamarApi<ApiWorkshop>(event, `/workshops/slug/${slug}`, { auth: temSessao(event) })
  return paraWorkshop(oficina)
})
