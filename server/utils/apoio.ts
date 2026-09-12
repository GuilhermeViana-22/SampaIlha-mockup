import type { Apoio } from '../../shared/types/apoio'

/**
 * Tradução entre o contrato da API Python (inglês, snake_case) e o modelo do
 * front (português). Fica só aqui — nenhum componente conhece a API.
 */

export interface ApiApoio {
  enabled: boolean
  title: string
  description: string
  button_label: string
  url: string | null
  pix_key: string | null
  note: string
}

export function paraApoio(api: ApiApoio): Apoio {
  return {
    ativo: api.enabled,
    titulo: api.title,
    descricao: api.description ?? '',
    rotuloBotao: api.button_label || 'Quero apoiar',
    url: api.url,
    chavePix: api.pix_key,
    observacao: api.note ?? '',
  }
}

export function paraPayloadApoio(dados: Partial<Apoio>): Record<string, unknown> {
  return {
    enabled: dados.ativo ?? false,
    title: dados.titulo ?? '',
    description: dados.descricao ?? '',
    button_label: dados.rotuloBotao ?? '',
    // String vazia vira null: a API trata "sem valor" e "vazio" de formas
    // diferentes, e o formulário só sabe produzir string vazia.
    url: dados.url?.trim() || null,
    pix_key: dados.chavePix?.trim() || null,
    note: dados.observacao ?? '',
  }
}
