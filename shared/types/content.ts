/**
 * Tipos compartilhados entre o front-end (app/) e a API (server/).
 * Ficam em shared/ para que Nuxt os auto-importe nos dois lados.
 */

/** Cada conteúdo do portal é uma dessas três coisas. */
export type PostTipo = 'noticia' | 'dica' | 'informacao'

/**
 * O que a peça do mídia kit é.
 *
 * Ninguém escolhe isto no formulário: a API deduz do conteúdo do arquivo. Serve
 * para o card saber que ícone mostrar — o que a peça significa ("logo
 * horizontal", "apresentação comercial") está no título que quem subiu deu a
 * ela.
 */
export type MidiaKitTipo = 'imagem' | 'pdf' | 'documento'

/** `em_revisao`: escrito por um editor e à espera da validação do editor-chefe. */
export type PostStatus = 'publicado' | 'rascunho' | 'em_revisao' | 'agendado'

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

/**
 * Peça do mídia kit — o material que o comercial manda para patrocinador.
 *
 * Acervo interno: nenhuma página pública lista isto, e por isso a peça não tem
 * status, slug nem data de publicação como o resto do conteúdo do portal.
 */
export interface MidiaKit {
  id: string
  titulo: string
  /** Dimensões, formato e regras de uso — o texto que iria solto no e-mail. */
  descricao: string
  url: string
  nomeArquivo: string
  tipo: MidiaKitTipo
  /** Tamanho em bytes. */
  tamanho: number
  criadoEm: string
  atualizadoEm: string
}

/**
 * Situação de um anúncio no painel.
 *
 * `status` responde à decisão de quem administra; a visibilidade responde ao
 * que o leitor vê. As duas divergem sempre que há janela contratada: um
 * anúncio publicado com data futura ainda não estreou, e um com data vencida
 * já saiu da coluna sozinho.
 */
export type PublicidadeStatus = 'publicado' | 'rascunho'
export type PublicidadeVisibilidade = 'no_ar' | 'agendado' | 'encerrado' | 'rascunho'

/**
 * Anúncio da coluna lateral do portal.
 *
 * O anúncio é a arte: `imagemUrl` é obrigatório na API, e é ele que o card
 * mostra. Sem nenhum anúncio no ar, o portal não desenha card de publicidade
 * nenhum — nem moldura vazia, nem convite para anunciar.
 */
export interface Publicidade {
  id: string
  /** Nome da campanha. Aparece acima da arte e identifica o anúncio no painel. */
  titulo: string
  /** Linha de apoio, abaixo do título. Pode ser vazia. */
  descricao: string
  imagemUrl: string
  /** Para onde o clique leva. Nulo deixa o banner sem link. */
  linkUrl: string | null
  status: PublicidadeStatus
  /** Janela contratada, em ISO (aaaa-mm-dd). Nula não restringe nada. */
  publicarDe: string | null
  publicarAte: string | null
  /** Ordem na coluna. Menor primeiro. */
  ordem: number
  visibilidade: PublicidadeVisibilidade
  criadoEm: string
  atualizadoEm: string
}

/** Campos que o formulário do painel envia — a arte vai separada. */
export interface PublicidadeInput {
  titulo: string
  descricao: string
  linkUrl: string | null
  status: PublicidadeStatus
  publicarDe: string | null
  publicarAte: string | null
  ordem: number
}

/** As duas escolhas do formulário, com o que cada uma significa na coluna. */
export const STATUS_PUBLICIDADE: { valor: PublicidadeStatus, rotulo: string, descricao: string }[] = [
  { valor: 'rascunho', rotulo: 'Rascunho', descricao: 'Fica só no painel; não vai para a coluna do portal.' },
  { valor: 'publicado', rotulo: 'Publicado', descricao: 'Vai ao ar, respeitando a janela contratada.' },
]

/** Como cada situação aparece na listagem do painel. */
export const VISIBILIDADE_PUBLICIDADE: Record<
  PublicidadeVisibilidade,
  { rotulo: string, variante: 'default' | 'secondary' | 'outline', ajuda: string }
> = {
  no_ar: { rotulo: 'No ar', variante: 'default', ajuda: 'Aparecendo na coluna do portal agora.' },
  agendado: { rotulo: 'Agendado', variante: 'outline', ajuda: 'Publicado, mas a data de início ainda não chegou.' },
  encerrado: { rotulo: 'Encerrado', variante: 'outline', ajuda: 'Saiu da coluna sozinho: a data de fim já passou.' },
  rascunho: { rotulo: 'Rascunho', variante: 'secondary', ajuda: 'Só o painel enxerga.' },
}

export interface Categoria {
  /** Só vem da API; é o que a remoção usa. */
  id?: string
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
/** Recado da redação na faixa do topo — vale só pelo dia em que foi cadastrado. */
export type TipoAviso = 'urgente' | 'informacao' | 'acontecendo'

export interface Aviso {
  id: string
  mensagem: string
  tipo: TipoAviso
  /** Dia em que o aviso aparece no portal (data no fuso de São Paulo). */
  exibirEm: string
  /** Falso para avisos de outros dias, que já saíram (ou ainda não entraram) no ar. */
  noAr: boolean
  criadoEm: string
}

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

export type PapelUsuario = 'editor-chefe' | 'editor'

export interface Usuario {
  id: string
  nome: string
  email: string
  papel: PapelUsuario
  bio?: string
  avatarUrl?: string | null
  ativo?: boolean
  /** Quantos conteúdos a pessoa assina — mostrado na lista da equipe. */
  totalPosts?: number
  /** Senha vem de ADMIN_PASSWORD: o painel não consegue trocá-la. */
  senhaDoAmbiente?: boolean
  criadoEm?: string
}

/** Campos que o editor-chefe manda ao abrir acesso para mais alguém. */
export interface NovoUsuario {
  nome: string
  email: string
  senha: string
  papel: PapelUsuario
  bio?: string
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
