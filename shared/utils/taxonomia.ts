/**
 * Constantes de apresentação usadas pelo painel.
 *
 * Editorias e regiões NÃO ficam aqui: são cadastro, vêm da API
 * (`/categories` e `/regions`) através da store `portal`.
 */

/** Rótulos legíveis dos tipos de conteúdo (notícia, dica, informação). */
export const TIPOS_CONTEUDO = [
  { valor: 'noticia', rotulo: 'Notícia', plural: 'Notícias', icone: 'fas fa-newspaper', descricao: 'Matérias jornalísticas do portal.' },
  { valor: 'dica', rotulo: 'Dica', plural: 'Dicas & Guias', icone: 'fas fa-lightbulb', descricao: 'Guias práticos, roteiros e recomendações.' },
  { valor: 'informacao', rotulo: 'Informação', plural: 'Informações', icone: 'fas fa-circle-info', descricao: 'Serviço, utilidade pública e institucional.' },
] as const

export const STATUS_POST = [
  { valor: 'publicado', rotulo: 'Publicado', cor: 'green' },
  { valor: 'rascunho', rotulo: 'Rascunho', cor: 'gray' },
  { valor: 'agendado', rotulo: 'Agendado', cor: 'gold' },
] as const

export const CAPAS = [
  { valor: 'bg-1', rotulo: 'Azul oceano' },
  { valor: 'bg-2', rotulo: 'Verde floresta' },
  { valor: 'bg-3', rotulo: 'Roxo festival' },
  { valor: 'bg-4', rotulo: 'Vermelho pôr do sol' },
  { valor: 'bg-5', rotulo: 'Azul profundo' },
  { valor: 'bg-6', rotulo: 'Grafite' },
  { valor: 'bg-7', rotulo: 'Terracota' },
  { valor: 'bg-8', rotulo: 'Noite' },
  { valor: 'bg-9', rotulo: 'Garantido & Caprichoso' },
  { valor: 'bg-10', rotulo: 'Boi vermelho' },
] as const

/** Gera um slug de URL a partir de um título. */
export function gerarSlug(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 90)
}
