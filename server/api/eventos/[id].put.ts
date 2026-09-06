import type { Evento } from '../../../shared/types/evento'
import type { ApiEvento } from '../../utils/eventos'
import { paraEvento, paraPayloadEvento } from '../../utils/eventos'
import { chamarApi } from '../../utils/api'

export default defineEventHandler(async (event): Promise<Evento> => {
  const id = getRouterParam(event, 'id')!
  const corpo = await readBody<Record<string, unknown>>(event)

  const atualizado = await chamarApi<ApiEvento>(event, `/events/${id}`, {
    method: 'PUT',
    body: paraPayloadEvento(corpo ?? {}),
    requerSessao: true,
  })

  return paraEvento(atualizado)
})
