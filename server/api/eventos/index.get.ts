import type { EventoAgenda } from '../../../shared/types/content'
import { chamarApi, temSessao } from '../../utils/api'

interface ApiEvento {
  id: string
  title: string
  slug: string
  description: string | null
  kind: string
  location: string | null
  starts_at: string
  day: string
  month: string
}

export default defineEventHandler(async (event): Promise<{ itens: EventoAgenda[], total: number }> => {
  const query = getQuery(event)

  const resposta = await chamarApi<{ items: ApiEvento[], pagination: { total: number } }>(event, '/events', {
    auth: temSessao(event),
    params: {
      limit: query.limite ?? 20,
      kind: query.tipo || undefined,
      upcoming_only: query.futuros === 'true' ? true : undefined,
    },
  })

  return {
    itens: resposta.items.map(item => ({
      id: item.id,
      titulo: item.title,
      slug: item.slug,
      descricao: item.description ?? '',
      tipo: item.kind,
      local: item.location,
      inicioEm: item.starts_at,
      dia: item.day,
      mes: item.month,
    })),
    total: resposta.pagination.total,
  }
})
