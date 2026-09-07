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

/**
 * Edita uma categoria já criada.
 *
 * Existe por causa do destaque no menu: até aqui `featured_in_menu` só podia
 * ser escolhido no momento da criação, e depois virava um selo de leitura na
 * tabela do painel. Quem quisesse tirar uma editoria da barra do topo — ou
 * colocar de volta — teria de apagar e recriar, o que a API recusa enquanto
 * houver matéria classificada nela.
 *
 * Só vai para a API o que veio no corpo: o `PUT /categories/{id}` aceita campo
 * a campo, então trocar o destaque não mexe em nome, ícone nem descrição.
 */
export default defineEventHandler(async (event): Promise<Categoria & { id: string }> => {
  const id = getRouterParam(event, 'id')!
  const corpo = await readBody<Record<string, unknown>>(event)

  const corpoApi: Record<string, unknown> = {}
  if (corpo?.nome !== undefined) corpoApi.name = corpo.nome
  if (corpo?.icone !== undefined) corpoApi.icon = corpo.icone
  if (corpo?.cor !== undefined) corpoApi.color = corpo.cor
  if (corpo?.descricao !== undefined) corpoApi.description = corpo.descricao || null
  if (corpo?.destaqueNoMenu !== undefined) corpoApi.featured_in_menu = !!corpo.destaqueNoMenu

  if (!Object.keys(corpoApi).length) {
    throw createError({ statusCode: 422, statusMessage: 'Nada para alterar.' })
  }

  const salva = await chamarApi<ApiCategoria>(event, `/categories/${id}`, {
    method: 'PUT',
    body: corpoApi,
    requerSessao: true,
  })

  return {
    id: salva.id,
    slug: salva.slug,
    nome: salva.name,
    icone: salva.icon,
    cor: salva.color as BadgeCor,
    descricao: salva.description ?? '',
    destaqueNoMenu: salva.featured_in_menu,
    totalPosts: salva.posts_count,
  }
})
