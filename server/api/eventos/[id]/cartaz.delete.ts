import type { Evento } from '../../../../shared/types/evento'
import type { ApiEvento } from '../../../utils/eventos'
import { paraEvento } from '../../../utils/eventos'
import { chamarApi } from '../../../utils/api'

/** Remove o cartaz; o evento passa a usar a imagem padrão da seção. */
export default defineEventHandler(async (event): Promise<Evento> => {
  const id = getRouterParam(event, 'id')!

  const atualizado = await chamarApi<ApiEvento>(event, `/events/${id}/imagem`, {
    method: 'DELETE',
    requerSessao: true,
  })

  return paraEvento(atualizado)
})
