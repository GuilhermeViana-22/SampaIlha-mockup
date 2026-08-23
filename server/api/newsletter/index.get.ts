import type { InscricaoNewsletter } from '../../../shared/types/content'
import { chamarApi } from '../../utils/api'

interface ApiInscrito {
  id: string
  name: string
  email: string
  created_at: string
}

export default defineEventHandler(async (event): Promise<{ itens: InscricaoNewsletter[], total: number }> => {
  const resposta = await chamarApi<{ items: ApiInscrito[], pagination: { total: number } }>(event, '/newsletter', {
    params: { limit: 100 },
    requerSessao: true,
  })

  return {
    itens: resposta.items.map(item => ({
      id: item.id,
      nome: item.name,
      email: item.email,
      criadoEm: item.created_at,
    })),
    total: resposta.pagination.total,
  }
})
