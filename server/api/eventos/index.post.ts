import type { Evento } from '../../../shared/types/evento'
import type { ApiEvento } from '../../utils/eventos'
import { paraEvento, paraPayloadEvento } from '../../utils/eventos'
import { chamarApi } from '../../utils/api'

export default defineEventHandler(async (event): Promise<Evento> => {
  const corpo = await readBody<Record<string, unknown>>(event)

  const criado = await chamarApi<ApiEvento>(event, '/events', {
    method: 'POST',
    body: paraPayloadEvento(corpo ?? {}),
    requerSessao: true,
  })

  setResponseStatus(event, 201)
  return paraEvento(criado)
})
