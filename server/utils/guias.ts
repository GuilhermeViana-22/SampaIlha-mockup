import type { BadgeCor, CapaGradiente, Guia } from '../../shared/types/content'
import { urlAbsoluta, urlRelativa } from './adaptadores'

/**
 * Tradução entre o contrato da API Python (inglês, snake_case) e o modelo
 * usado no front (português) para guias.
 */

export interface ApiGuia {
  id: string
  status: 'publicado' | 'rascunho'
  title: string
  slug: string
  excerpt: string | null
  content?: string
  category: { slug: string, name: string, icon?: string | null, color?: string | null }
  author_name: string
  icon: string
  cover: string
  image_url: string | null
  featured: boolean
  tags: string[]
  reading_time: number
  views: number
  published_at: string
  updated_at: string
  path: string
}

export function paraGuia(api: ApiGuia): Guia {
  return {
    id: api.id,
    status: api.status,
    titulo: api.title,
    slug: api.slug,
    resumo: api.excerpt ?? '',
    conteudo: api.content ?? '',
    categoria: api.category.slug,
    categoriaNome: api.category.name,
    autor: api.author_name,
    icone: api.icon,
    capa: api.cover as CapaGradiente,
    imagemUrl: urlAbsoluta(api.image_url),
    destaque: api.featured,
    tags: api.tags,
    leituras: api.views,
    tempoLeitura: api.reading_time,
    publicadoEm: api.published_at,
    atualizadoEm: api.updated_at,
    caminho: api.path,
  }
}

/** Corpo de criação/edição de guia, no formato que a API espera. */
export function paraPayloadGuia(dados: Record<string, any>): Record<string, unknown> {
  const mapa: Record<string, string> = {
    status: 'status',
    titulo: 'title',
    slug: 'slug',
    resumo: 'excerpt',
    conteudo: 'content',
    categoria: 'category',
    autor: 'author_name',
    icone: 'icon',
    capa: 'cover',
    imagemUrl: 'image_url',
    destaque: 'featured',
    tags: 'tags',
    tempoLeitura: 'reading_time',
    publicadoEm: 'published_at',
  }

  const payload: Record<string, unknown> = {}
  for (const [chave, valor] of Object.entries(dados)) {
    const destino = mapa[chave]
    if (destino !== undefined && valor !== undefined) payload[destino] = valor
  }

  // A capa volta do formulário como URL absoluta; a API guarda caminho relativo.
  if (typeof payload.image_url === 'string') payload.image_url = urlRelativa(payload.image_url)

  return payload
}
