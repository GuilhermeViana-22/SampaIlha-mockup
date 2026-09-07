import type { StatusVaga, Vaga } from '../../shared/types/vaga'
import { urlAbsoluta, urlRelativa } from './adaptadores'

/**
 * Tradução entre o contrato da API Python (inglês, snake_case) e o modelo do
 * front (português). Fica só aqui — nenhum componente conhece a API.
 */

export interface ApiVaga {
  id: string
  title: string
  slug: string
  company: string
  location: string
  contract_type: string
  work_model: string
  description: string | null
  image_url: string | null
  apply_url: string | null
  apply_email: string | null
  status: StatusVaga
  sort_order: number
  published_at: string
  created_at: string
  updated_at: string
}

export function paraVaga(api: ApiVaga): Vaga {
  return {
    id: api.id,
    titulo: api.title,
    slug: api.slug,
    empresa: api.company,
    local: api.location,
    regime: api.contract_type,
    modelo: api.work_model,
    descricao: api.description ?? '',
    imagemUrl: urlAbsoluta(api.image_url),
    linkDaVaga: api.apply_url,
    emailCandidatura: api.apply_email,
    status: api.status,
    ordem: api.sort_order,
    publicadoEm: api.published_at,
    criadoEm: api.created_at,
    atualizadoEm: api.updated_at,
  }
}

/** Corpo de criação/edição, no formato que a API espera. */
export function paraPayloadVaga(dados: Record<string, any>): Record<string, unknown> {
  const mapa: Record<string, string> = {
    titulo: 'title',
    empresa: 'company',
    local: 'location',
    regime: 'contract_type',
    modelo: 'work_model',
    descricao: 'description',
    imagemUrl: 'image_url',
    linkDaVaga: 'apply_url',
    emailCandidatura: 'apply_email',
    status: 'status',
    ordem: 'sort_order',
    publicadoEm: 'published_at',
  }

  const payload: Record<string, unknown> = {}
  for (const [chave, valor] of Object.entries(dados)) {
    const destino = mapa[chave]
    if (destino !== undefined && valor !== undefined) payload[destino] = valor
  }

  // Campos de texto vazios voltam como null: a API trata "sem valor" e "string
  // vazia" de formas diferentes, e o formulário só sabe produzir string vazia.
  // `apply_email` é o caso que dobra a aposta — string vazia não passa pelo
  // `EmailStr` e derrubaria o salvamento de toda vaga sem e-mail.
  for (const campo of ['description', 'image_url', 'apply_url', 'apply_email', 'published_at']) {
    if (payload[campo] === '') payload[campo] = null
  }

  // A foto volta do formulário como URL absoluta; a API guarda o relativo.
  if (typeof payload.image_url === 'string') payload.image_url = urlRelativa(payload.image_url)

  return payload
}
