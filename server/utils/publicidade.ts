import type { Publicidade, PublicidadeInput, PublicidadeStatus, PublicidadeVisibilidade } from '../../shared/types/content'
import { urlAbsoluta } from './adaptadores'

/**
 * Tradução do contrato da API (inglês) para o modelo do painel (português).
 *
 * A `visibility` é calculada lá, cruzando o status com a janela contratada —
 * o painel não recalcula data nenhuma, senão o "no ar" mostrado na tela e o
 * que o portal exibe poderiam discordar na virada do dia.
 */
export interface ApiPublicidade {
  id: string
  title: string
  description: string
  image_url: string
  link_url: string | null
  status: PublicidadeStatus
  published_from: string | null
  published_until: string | null
  sort_order: number
  visibility: PublicidadeVisibilidade
  created_at: string
  updated_at: string
}

export function paraPublicidade(api: ApiPublicidade): Publicidade {
  return {
    id: api.id,
    titulo: api.title,
    descricao: api.description,
    // A API devolve caminho relativo; a coluna do portal precisa do endereço completo.
    imagemUrl: urlAbsoluta(api.image_url) ?? '',
    linkUrl: api.link_url,
    status: api.status,
    publicarDe: api.published_from,
    publicarAte: api.published_until,
    ordem: api.sort_order,
    visibilidade: api.visibility,
    criadoEm: api.created_at,
    atualizadoEm: api.updated_at,
  }
}

/**
 * Payload de edição no contrato da API.
 *
 * Campo ausente quer dizer "não mexe", então só entra o que o formulário
 * mandou. Texto vazio vira `null` nos opcionais: um `link_url` de string vazia
 * seria um `href` para lugar nenhum na coluna do portal.
 */
export function paraPayloadPublicidade(corpo: Partial<PublicidadeInput>): Record<string, unknown> {
  const payload: Record<string, unknown> = {}

  if (corpo.titulo !== undefined) payload.title = corpo.titulo.trim()
  if (corpo.descricao !== undefined) payload.description = corpo.descricao.trim()
  if (corpo.linkUrl !== undefined) payload.link_url = corpo.linkUrl?.trim() || null
  if (corpo.status !== undefined) payload.status = corpo.status
  if (corpo.publicarDe !== undefined) payload.published_from = corpo.publicarDe || null
  if (corpo.publicarAte !== undefined) payload.published_until = corpo.publicarAte || null
  if (corpo.ordem !== undefined) payload.sort_order = corpo.ordem

  return payload
}
