import type { BadgeCor, Categoria } from '../../../../shared/types/content'
import { chamarApi } from '../../../utils/api'

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

export default defineEventHandler(async (event): Promise<Categoria & { id: string }> => {
  const corpo = await readBody<Record<string, any>>(event)

  const criada = await chamarApi<ApiCategoria>(event, '/categories', {
    method: 'POST',
    body: {
      name: corpo?.nome,
      slug: corpo?.slug || undefined,
      icon: corpo?.icone || 'fas fa-newspaper',
      color: corpo?.cor || 'blue',
      description: corpo?.descricao || null,
      featured_in_menu: corpo?.destaqueNoMenu ?? true,
    },
    requerSessao: true,
  })

  setResponseStatus(event, 201)
  return {
    id: criada.id,
    slug: criada.slug,
    nome: criada.name,
    icone: criada.icon,
    cor: criada.color as BadgeCor,
    descricao: criada.description ?? '',
    destaqueNoMenu: criada.featured_in_menu,
    totalPosts: criada.posts_count,
  }
})
