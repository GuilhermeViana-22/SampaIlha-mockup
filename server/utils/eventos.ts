import type { BadgeCor } from '../../shared/types/content'
import type {
  Evento, OrientacaoCartaz, StatusEvento, TipoEvento, VisibilidadeEvento,
} from '../../shared/types/evento'
import type { ApiTaxonomia } from './adaptadores'
import { urlAbsoluta, urlRelativa } from './adaptadores'

/**
 * Tradução entre o contrato da API Python (inglês, snake_case) e o modelo do
 * front (português). Fica só aqui — nenhum componente conhece a API.
 */

export interface ApiEvento {
  id: string
  title: string
  slug: string
  status: StatusEvento
  kind: TipoEvento
  summary: string | null
  content: string
  image_url: string | null
  image_orientation: OrientacaoCartaz
  registration_url: string | null
  category: ApiTaxonomia | null
  location: string | null
  starts_at: string
  ends_at: string | null
  published_from: string | null
  published_until: string | null
  visibility: VisibilidadeEvento
  path: string
  day: string
  month: string
  created_at: string
  updated_at: string
}

export function paraEvento(api: ApiEvento): Evento {
  return {
    id: api.id,
    titulo: api.title,
    slug: api.slug,
    status: api.status,
    tipo: api.kind,
    resumo: api.summary ?? '',
    conteudo: api.content ?? '',
    imagemUrl: urlAbsoluta(api.image_url),
    orientacaoCartaz: api.image_orientation,
    inscricaoUrl: api.registration_url,
    editoria: api.category
      ? {
          slug: api.category.slug,
          nome: api.category.name,
          icone: api.category.icon ?? 'fas fa-tag',
          cor: (api.category.color ?? 'blue') as BadgeCor,
        }
      : null,
    comecaEm: api.starts_at,
    terminaEm: api.ends_at,
    local: api.location,
    publicarDe: api.published_from,
    publicarAte: api.published_until,
    visibilidade: api.visibility,
    caminho: api.path,
    dia: api.day,
    mes: api.month,
    criadoEm: api.created_at,
    atualizadoEm: api.updated_at,
  }
}

/** Corpo de criação/edição, no formato que a API espera. */
export function paraPayloadEvento(dados: Record<string, any>): Record<string, unknown> {
  const mapa: Record<string, string> = {
    titulo: 'title',
    slug: 'slug',
    status: 'status',
    tipo: 'kind',
    resumo: 'summary',
    conteudo: 'content',
    inscricaoUrl: 'registration_url',
    editoria: 'category',
    comecaEm: 'starts_at',
    terminaEm: 'ends_at',
    local: 'location',
    publicarDe: 'published_from',
    publicarAte: 'published_until',
    imagemUrl: 'image_url',
    orientacaoCartaz: 'image_orientation',
  }

  const payload: Record<string, unknown> = {}
  for (const [chave, valor] of Object.entries(dados)) {
    const destino = mapa[chave]
    if (destino !== undefined && valor !== undefined) payload[destino] = valor
  }

  // Campos de texto vazios voltam como null: a API trata "sem valor" e "string
  // vazia" de formas diferentes, e o formulário só sabe produzir string vazia.
  for (const campo of [
    'summary', 'registration_url', 'location', 'category',
    'ends_at', 'published_from', 'published_until',
  ]) {
    if (payload[campo] === '') payload[campo] = null
  }

  // O cartaz volta do formulário como URL absoluta; a API guarda o relativo.
  if (typeof payload.image_url === 'string') payload.image_url = urlRelativa(payload.image_url)

  return payload
}
