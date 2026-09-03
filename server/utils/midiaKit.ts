import type { MidiaKit } from '../../shared/types/content'
import { urlAbsoluta } from './adaptadores'

/**
 * Tradução do contrato da API (inglês) para o modelo do painel (português).
 *
 * O `kind` não é escolhido por ninguém no formulário: a API o deduz do
 * conteúdo do arquivo, e ele chega aqui só para o card saber que ícone usar.
 */
export interface ApiMidiaKit {
  id: string
  title: string
  description: string
  url: string
  filename: string
  kind: 'imagem' | 'pdf' | 'documento'
  size: number
  created_at: string
  updated_at: string
}

export function paraMidiaKit(api: ApiMidiaKit): MidiaKit {
  return {
    id: api.id,
    titulo: api.title,
    descricao: api.description,
    // A API devolve caminho relativo; o link de download precisa do endereço completo.
    url: urlAbsoluta(api.url) ?? '',
    nomeArquivo: api.filename,
    tipo: api.kind,
    tamanho: api.size,
    criadoEm: api.created_at,
    atualizadoEm: api.updated_at,
  }
}
