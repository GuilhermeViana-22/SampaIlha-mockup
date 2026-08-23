import type { EstatisticasDashboard, PostTipo } from '../../shared/types/content'
import type { ApiPost } from '../utils/adaptadores'
import { paraPost } from '../utils/adaptadores'
import { chamarApi } from '../utils/api'

interface ApiContagem {
  key: string
  label: string
  total: number
}

interface ApiDashboard {
  total_posts: number
  published: number
  drafts: number
  scheduled: number
  by_type: Record<PostTipo, number>
  by_category: ApiContagem[]
  by_region: ApiContagem[]
  total_views: number
  newsletter_subscribers: number
  open_jobs: number
  upcoming_events: number
  latest_posts: ApiPost[]
  most_read: ApiPost[]
  posts_per_month: ApiContagem[]
}

const contagem = (item: ApiContagem) => ({ chave: item.key, nome: item.label, total: item.total })

/**
 * Números do painel. É um repasse direto de `/stats/dashboard` — toda contagem
 * é feita em SQL na API; aqui só traduzimos os nomes dos campos.
 */
export default defineEventHandler(async (event): Promise<EstatisticasDashboard> => {
  const dados = await chamarApi<ApiDashboard>(event, '/stats/dashboard', { requerSessao: true })

  return {
    totalPosts: dados.total_posts,
    publicados: dados.published,
    rascunhos: dados.drafts,
    agendados: dados.scheduled,
    porTipo: dados.by_type,
    porCategoria: dados.by_category.map(contagem),
    porRegiao: dados.by_region.map(contagem),
    leiturasTotais: dados.total_views,
    inscritosNewsletter: dados.newsletter_subscribers,
    vagasAbertas: dados.open_jobs,
    eventosProximos: dados.upcoming_events,
    ultimosPosts: dados.latest_posts.map(paraPost),
    maisLidos: dados.most_read.map(paraPost),
    publicacoesPorMes: dados.posts_per_month.map(contagem),
  }
})
