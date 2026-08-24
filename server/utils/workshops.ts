import type { StatusWorkshop, VisibilidadeWorkshop, Workshop } from '../../shared/types/workshop'
import { urlAbsoluta, urlRelativa } from './adaptadores'

/**
 * Tradução entre o contrato da API Python (inglês, snake_case) e o modelo do
 * front (português). Fica só aqui — nenhum componente conhece a API.
 */

export interface ApiWorkshop {
  id: string
  title: string
  slug: string
  status: StatusWorkshop
  summary: string | null
  content: string
  image_url: string | null
  registration_url: string | null
  happens_on: string | null
  location: string | null
  published_from: string | null
  published_until: string | null
  visibility: VisibilidadeWorkshop
  path: string
  created_at: string
  updated_at: string
}

export function paraWorkshop(api: ApiWorkshop): Workshop {
  return {
    id: api.id,
    titulo: api.title,
    slug: api.slug,
    status: api.status,
    resumo: api.summary ?? '',
    conteudo: api.content ?? '',
    imagemUrl: urlAbsoluta(api.image_url),
    inscricaoUrl: api.registration_url,
    acontecemEm: api.happens_on,
    local: api.location,
    publicarDe: api.published_from,
    publicarAte: api.published_until,
    visibilidade: api.visibility,
    caminho: api.path,
    criadoEm: api.created_at,
    atualizadoEm: api.updated_at,
  }
}

/** Corpo de criação/edição, no formato que a API espera. */
export function paraPayloadWorkshop(dados: Record<string, any>): Record<string, unknown> {
  const mapa: Record<string, string> = {
    titulo: 'title',
    slug: 'slug',
    status: 'status',
    resumo: 'summary',
    conteudo: 'content',
    inscricaoUrl: 'registration_url',
    acontecemEm: 'happens_on',
    local: 'location',
    publicarDe: 'published_from',
    publicarAte: 'published_until',
    imagemUrl: 'image_url',
  }

  const payload: Record<string, unknown> = {}
  for (const [chave, valor] of Object.entries(dados)) {
    const destino = mapa[chave]
    if (destino !== undefined && valor !== undefined) payload[destino] = valor
  }

  // Campos de texto vazios voltam como null: a API trata "sem valor" e "string
  // vazia" de formas diferentes, e o formulário só sabe produzir string vazia.
  for (const campo of ['summary', 'registration_url', 'location', 'happens_on', 'published_from', 'published_until']) {
    if (payload[campo] === '') payload[campo] = null
  }

  // O cartaz volta do formulário como URL absoluta; a API guarda o relativo.
  if (typeof payload.image_url === 'string') payload.image_url = urlRelativa(payload.image_url)

  return payload
}
