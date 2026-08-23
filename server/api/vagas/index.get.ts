import type { Vaga } from '../../../shared/types/content'
import { chamarApi, temSessao } from '../../utils/api'

interface ApiVaga {
  id: string
  title: string
  slug: string
  company: string
  location: string
  contract_type: string
  work_model: string
  description: string | null
  apply_email: string | null
  status: string
  published_at: string
}

export default defineEventHandler(async (event): Promise<{ itens: Vaga[], total: number }> => {
  const resposta = await chamarApi<{ items: ApiVaga[], pagination: { total: number } }>(event, '/jobs', {
    auth: temSessao(event),
    params: { limit: 50 },
  })

  return {
    itens: resposta.items.map(item => ({
      id: item.id,
      titulo: item.title,
      slug: item.slug,
      empresa: item.company,
      local: item.location,
      regime: item.contract_type,
      modelo: item.work_model,
      descricao: item.description ?? '',
      emailCandidatura: item.apply_email,
      status: item.status,
      publicadoEm: item.published_at,
    })),
    total: resposta.pagination.total,
  }
})
