import { chamarApi } from '../utils/api'

interface ApiTag {
  slug: string
  name: string
  posts_count: number
}

/** Assuntos em alta — widget da sidebar. */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const tags = await chamarApi<ApiTag[]>(event, '/tags', { params: { limit: query.limite ?? 12 } })

  return tags.map(tag => ({ slug: tag.slug, nome: tag.name, total: tag.posts_count }))
})
