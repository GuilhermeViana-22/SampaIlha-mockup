import type { BadgeCor, CapaGradiente, Post, PostImagem } from '../../shared/types/content'

/**
 * Tradução entre o contrato da API Python (inglês, snake_case) e o modelo
 * usado no front (português). Fica só aqui — nenhum componente conhece a API.
 */

export interface ApiTaxonomia {
  slug: string
  name: string
  icon?: string | null
  color?: string | null
}

export interface ApiPost {
  id: string
  type: 'noticia' | 'dica' | 'informacao'
  status: 'publicado' | 'rascunho' | 'agendado'
  title: string
  slug: string
  excerpt: string | null
  content?: string
  category: ApiTaxonomia
  region: ApiTaxonomia | null
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
  images?: {
    id: string
    url: string
    caption: string | null
    credit: string | null
    sort_order: number
    is_featured: boolean
  }[]
}

/** A API devolve caminhos relativos (/api/v1/uploads/...); o <img> precisa da URL completa. */
export function urlAbsoluta(caminho: string | null | undefined): string | null {
  if (!caminho) return null
  if (/^https?:\/\//i.test(caminho)) return caminho
  return `${useRuntimeConfig().public.apiOrigin}${caminho}`
}

export function paraPost(api: ApiPost): Post {
  const imagens: PostImagem[] = (api.images ?? []).map(imagem => ({
    id: imagem.id,
    url: urlAbsoluta(imagem.url) ?? '',
    legenda: imagem.caption,
    credito: imagem.credit,
    ordem: imagem.sort_order,
    capa: imagem.is_featured,
  }))

  // Toda matéria sai daqui com foto (ou fallback de capa), editoria, título e data.
  const foto = urlAbsoluta(api.image_url) ?? imagens.find(imagem => imagem.capa)?.url ?? imagens[0]?.url ?? null

  return {
    id: api.id,
    tipo: api.type,
    status: api.status,
    titulo: api.title,
    slug: api.slug,
    resumo: api.excerpt ?? '',
    conteudo: api.content ?? '',
    categoria: api.category.slug,
    categoriaNome: api.category.name,
    categoriaIcone: api.category.icon ?? 'fas fa-tag',
    categoriaCor: (api.category.color ?? 'blue') as BadgeCor,
    regiao: api.region?.slug ?? null,
    regiaoNome: api.region?.name ?? null,
    autor: api.author_name,
    icone: api.icon,
    capa: api.cover as CapaGradiente,
    imagemUrl: foto,
    imagens,
    destaque: api.featured,
    tags: api.tags,
    leituras: api.views,
    tempoLeitura: api.reading_time,
    publicadoEm: api.published_at,
    atualizadoEm: api.updated_at,
    caminho: api.path,
  }
}

/** Corpo de criação/edição de conteúdo, no formato que a API espera. */
export function paraPayloadApi(dados: Record<string, any>): Record<string, unknown> {
  const mapa: Record<string, string> = {
    tipo: 'type',
    status: 'status',
    titulo: 'title',
    slug: 'slug',
    resumo: 'excerpt',
    conteudo: 'content',
    categoria: 'category',
    regiao: 'region',
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
  return payload
}

/** `{ items, pagination }` da API → `{ itens, total }` que o front consome. */
export function paraLista<T, R>(
  resposta: { items: T[], pagination: { total: number } },
  transformar: (item: T) => R,
): { itens: R[], total: number } {
  return { itens: resposta.items.map(transformar), total: resposta.pagination.total }
}
