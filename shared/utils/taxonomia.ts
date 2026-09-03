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
  { valor: 'em_revisao', rotulo: 'Em revisão', cor: 'gold' },
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

/**
 * Ícones oferecidos no painel, com nome em português.
 *
 * A classe do Font Awesome continua sendo o que vai para o banco, mas ninguém
 * na redação precisa saber que "maleta" se escreve `fas fa-briefcase`. A lista
 * é curta de propósito: são os assuntos que o portal cobre, e uma grade que
 * cabe na tela é mais útil que o catálogo inteiro do Font Awesome.
 */
export const ICONES = [
  { valor: 'fas fa-newspaper', rotulo: 'Jornal' },
  { valor: 'fas fa-envelope', rotulo: 'Envelope' },
  { valor: 'fas fa-pen', rotulo: 'Caneta' },
  { valor: 'fas fa-pencil', rotulo: 'Lápis' },
  { valor: 'fas fa-book', rotulo: 'Livro' },
  { valor: 'fas fa-camera', rotulo: 'Câmera' },
  { valor: 'fas fa-microphone', rotulo: 'Microfone' },
  { valor: 'fas fa-bullhorn', rotulo: 'Anúncio' },
  { valor: 'fas fa-briefcase', rotulo: 'Maleta' },
  { valor: 'fas fa-plane', rotulo: 'Avião' },
  { valor: 'fas fa-bus', rotulo: 'Ônibus' },
  { valor: 'fas fa-ship', rotulo: 'Barco' },
  { valor: 'fas fa-route', rotulo: 'Rota' },
  { valor: 'fas fa-map-location-dot', rotulo: 'Mapa' },
  { valor: 'fas fa-umbrella-beach', rotulo: 'Praia' },
  { valor: 'fas fa-sun', rotulo: 'Sol' },
  { valor: 'fas fa-cloud-rain', rotulo: 'Chuva' },
  { valor: 'fas fa-tree', rotulo: 'Árvore' },
  { valor: 'fas fa-leaf', rotulo: 'Folha' },
  { valor: 'fas fa-fish', rotulo: 'Peixe' },
  { valor: 'fas fa-utensils', rotulo: 'Comida' },
  { valor: 'fas fa-mug-hot', rotulo: 'Café' },
  { valor: 'fas fa-music', rotulo: 'Música' },
  { valor: 'fas fa-drum', rotulo: 'Tambor' },
  { valor: 'fas fa-masks-theater', rotulo: 'Teatro' },
  { valor: 'fas fa-palette', rotulo: 'Arte' },
  { valor: 'fas fa-futbol', rotulo: 'Futebol' },
  { valor: 'fas fa-users', rotulo: 'Pessoas' },
  { valor: 'fas fa-handshake-angle', rotulo: 'Ajuda' },
  { valor: 'fas fa-graduation-cap', rotulo: 'Educação' },
  { valor: 'fas fa-stethoscope', rotulo: 'Saúde' },
  { valor: 'fas fa-scale-balanced', rotulo: 'Justiça' },
  { valor: 'fas fa-building', rotulo: 'Prédio' },
  { valor: 'fas fa-house', rotulo: 'Casa' },
  { valor: 'fas fa-shop', rotulo: 'Loja' },
  { valor: 'fas fa-calendar-days', rotulo: 'Agenda' },
  { valor: 'fas fa-lightbulb', rotulo: 'Ideia' },
  { valor: 'fas fa-circle-info', rotulo: 'Informação' },
  { valor: 'fas fa-heart', rotulo: 'Coração' },
  { valor: 'fas fa-star', rotulo: 'Estrela' },
] as const

/** Nome em português do ícone, ou a própria classe quando ele não está na lista. */
export function rotuloDoIcone(classe: string): string {
  return ICONES.find(icone => icone.valor === classe)?.rotulo ?? classe
}

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
