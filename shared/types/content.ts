/**
 * Tipos compartilhados entre o front-end (app/) e a API (server/).
 * Ficam em shared/ para que Nuxt os auto-importe nos dois lados.
 */

/** Cada conteúdo do portal é uma dessas três coisas. */
export type PostTipo = 'noticia' | 'dica' | 'informacao'

export type PostStatus = 'publicado' | 'rascunho' | 'agendado'

/** Chave do gradiente usado como capa enquanto não há imagem real. */
export type CapaGradiente =
  | 'bg-1' | 'bg-2' | 'bg-3' | 'bg-4' | 'bg-5'
  | 'bg-6' | 'bg-7' | 'bg-8' | 'bg-9' | 'bg-10'

export interface Post {
  id: string
  tipo: PostTipo
  status: PostStatus
  titulo: string
  slug: string
  resumo: string
  /** Corpo em texto simples; parágrafos separados por linha em branco. */
  conteudo: string
  categoria: string
  /** Nome, ícone e cor da editoria já resolvidos pela API — toda matéria traz. */
  categoriaNome: string
  categoriaIcone: string
  categoriaCor: BadgeCor
  regiao: string | null
  regiaoNome: string | null
  autor: string
  /** Classe do ícone Font Awesome exibido sobre a capa. */
  icone: string
  capa: CapaGradiente
  /** Foto da matéria (URL absoluta). Quando ausente, a capa usa gradiente + ícone. */
  imagemUrl: string | null
  /** Galeria de fotos da matéria. */
  imagens: PostImagem[]
  destaque: boolean
  tags: string[]
  leituras: number
  tempoLeitura: number
  publicadoEm: string
  atualizadoEm: string
  /** Caminho da página no site, montado pela API (ex.: /noticias/slug). */
  caminho: string
}

export interface PostImagem {
  id: string
  url: string
  legenda: string | null
  credito: string | null
  ordem: number
  capa: boolean
}

/** Campos aceitos ao criar/editar um post pelo dashboard. */
export type PostInput = Omit<Post, 'id' | 'atualizadoEm' | 'leituras'> &
  Partial<Pick<Post, 'leituras'>>

export interface Categoria {
  slug: string
  nome: string
  icone: string
  cor: BadgeCor
  descricao: string
  /** Aparece na barra de categorias do topo. */
  destaqueNoMenu: boolean
  totalPosts?: number
}

export type BadgeCor = 'blue' | 'cyan' | 'red' | 'green' | 'purple' | 'gold' | 'gray'

export interface Regiao {
  slug: string
  nome: string
  descricao: string
  icone: string
  totalPosts?: number
}

/** Vaga divulgada pelo portal (vem da API). */
export interface Vaga {
  id: string
  titulo: string
  slug: string
  empresa: string
  local: string
  regime: string
  modelo: string
  descricao: string
  emailCandidatura: string | null
  status: string
  publicadoEm: string
}

/** Item da agenda cultural (ensaios, mostras, shows, festival). */
export interface EventoAgenda {
  id: string
  titulo: string
  slug: string
  descricao: string
  tipo: string
  local: string | null
  inicioEm: string
  /** Dia e mês já formatados pela API para o bloco de agenda. */
  dia: string
  mes: string
}

/** Assunto em alta (tag com contagem). */
export interface TagEmAlta {
  slug: string
  nome: string
  total: number
}

export interface InscricaoNewsletter {
  id: string
  nome: string
  email: string
  criadoEm: string
}

export interface Usuario {
  id: string
  nome: string
  email: string
  papel: 'editor-chefe' | 'editor'
}

/** Uma linha de contagem (editoria, região ou mês). */
export interface ContagemDashboard {
  chave: string
  nome: string
  total: number
}

/**
 * Números do painel — espelho exato de `GET /stats/dashboard` da API.
 * Tudo aqui vem de contagem no banco; nada é calculado no front.
 */
export interface EstatisticasDashboard {
  totalPosts: number
  publicados: number
  rascunhos: number
  agendados: number
  porTipo: Record<PostTipo, number>
  porCategoria: ContagemDashboard[]
  porRegiao: ContagemDashboard[]
  leiturasTotais: number
  inscritosNewsletter: number
  vagasAbertas: number
  eventosProximos: number
  ultimosPosts: Post[]
  maisLidos: Post[]
  publicacoesPorMes: ContagemDashboard[]
}

export interface RespostaLista<T> {
  itens: T[]
  total: number
}

/**
 * Previsão do tempo (Open-Meteo). O front nunca fala com a API externa direto:
 * quem busca e traduz os códigos WMO é `server/api/tempo.get.ts`.
 */
export interface TempoAgora {
  temperatura: number
  sensacao: number
  umidade: number
  vento: number
  rotulo: string
  icone: string
  atualizadoEm: string
}

export interface TempoDia {
  data: string
  diaCurto: string
  diaLongo: string
  minima: number
  maxima: number
  chuva: number
  rotulo: string
  icone: string
}

export interface Previsao {
  cidade: string
  agora: TempoAgora
  dias: TempoDia[]
}
