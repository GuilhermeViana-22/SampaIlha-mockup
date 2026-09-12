import type { Episodio, PlataformaEpisodio, StatusEpisodio } from '../../shared/types/podcast'
import { urlAbsoluta } from './adaptadores'

/**
 * Tradução entre o contrato da API Python (inglês, snake_case) e o modelo do
 * front (português). Fica só aqui — nenhum componente conhece a API.
 */

export interface ApiEpisodio {
  id: string
  title: string
  description: string
  media_url: string
  platform: PlataformaEpisodio
  embed_url: string | null
  cover_url: string | null
  episode_number: number | null
  duration: string | null
  status: StatusEpisodio
  published_at: string
  created_at: string
  updated_at: string
}

export function paraEpisodio(api: ApiEpisodio): Episodio {
  return {
    id: api.id,
    titulo: api.title,
    descricao: api.description ?? '',
    midiaUrl: api.media_url,
    plataforma: api.platform,
    // O embed aponta para a plataforma, não para os uploads da API: passar por
    // `urlAbsoluta` prefixaria o domínio errado e o player não carregaria.
    embedUrl: api.embed_url,
    capaUrl: urlAbsoluta(api.cover_url),
    numero: api.episode_number,
    duracao: api.duration,
    status: api.status,
    publicadoEm: api.published_at,
    criadoEm: api.created_at,
    atualizadoEm: api.updated_at,
  }
}

/** Corpo de criação/edição, no formato que a API espera. */
export function paraPayloadEpisodio(dados: Record<string, any>): Record<string, unknown> {
  const mapa: Record<string, string> = {
    titulo: 'title',
    descricao: 'description',
    midiaUrl: 'media_url',
    numero: 'episode_number',
    duracao: 'duration',
    status: 'status',
    publicadoEm: 'published_at',
  }

  const payload: Record<string, unknown> = {}
  for (const [chave, valor] of Object.entries(dados)) {
    const destino = mapa[chave]
    if (destino !== undefined && valor !== undefined) payload[destino] = valor
  }

  // Campos vazios voltam como null: a API trata "sem valor" e "string vazia" de
  // formas diferentes, e o formulário só sabe produzir string vazia.
  for (const campo of ['duration', 'episode_number']) {
    if (payload[campo] === '') payload[campo] = null
  }

  return payload
}
