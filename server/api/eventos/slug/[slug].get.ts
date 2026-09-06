import type { Evento } from '../../../../shared/types/evento'
import type { ApiEvento } from '../../../utils/eventos'
import { paraEvento } from '../../../utils/eventos'
import { chamarApi, temSessao } from '../../../utils/api'

/** Página pública de um evento. Rascunho só abre para quem está logado. */
export default defineEventHandler(async (event): Promise<Evento> => {
  const slug = getRouterParam(event, 'slug')!
  const evento = await chamarApi<ApiEvento>(event, `/events/slug/${slug}`, { auth: temSessao(event) })
  return paraEvento(evento)
})
