import type { Evento } from '../../../shared/types/evento'
import type { ApiEvento } from '../../utils/eventos'
import { paraEvento } from '../../utils/eventos'
import { chamarApi, temSessao } from '../../utils/api'

export default defineEventHandler(async (event): Promise<Evento> => {
  const id = getRouterParam(event, 'id')!
  const evento = await chamarApi<ApiEvento>(event, `/events/${id}`, { auth: temSessao(event) })
  return paraEvento(evento)
})
