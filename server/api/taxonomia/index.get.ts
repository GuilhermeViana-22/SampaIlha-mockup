import type { BadgeCor, Categoria, Regiao } from '../../../shared/types/content'
import { chamarApi } from '../../utils/api'

interface ApiCategoria {
  id: string
  slug: string
  name: string
  icon: string
  color: string
  description: string | null
  featured_in_menu: boolean
  posts_count: number
}

interface ApiRegiao {
  slug: string
  name: string
  icon: string
  description: string | null
  posts_count: number
}

/** Editorias e regiões vindas da API — fonte única para menu, filtros e formulários. */
export default defineEventHandler(async (event): Promise<{ categorias: Categoria[], regioes: Regiao[] }> => {
  const [categorias, regioes] = await Promise.all([
    chamarApi<ApiCategoria[]>(event, '/categories'),
    chamarApi<ApiRegiao[]>(event, '/regions'),
  ])

  return {
    categorias: categorias.map(item => ({
      id: item.id,
      slug: item.slug,
      nome: item.name,
      icone: item.icon,
      cor: item.color as BadgeCor,
      descricao: item.description ?? '',
      destaqueNoMenu: item.featured_in_menu,
      totalPosts: item.posts_count,
    })),
    regioes: regioes.map(item => ({
      slug: item.slug,
      nome: item.name,
      icone: item.icon,
      descricao: item.description ?? '',
      totalPosts: item.posts_count,
    })),
  }
})
