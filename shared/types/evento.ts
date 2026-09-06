/**
 * Eventos da agenda cultural (/cultura/eventos).
 *
 * Espelham as oficinas de `workshop.ts` — cartaz, texto e link externo — com o
 * que é próprio da agenda: hora de início e fim, o tipo (`ensaio`, `show`…),
 * a editoria e a orientação do cartaz.
 *
 * A inscrição mora sempre em outro site: `inscricaoUrl` é só a ponte. Nulo
 * quer dizer "sem botão de inscrição" — não é um campo obrigatório à espera de
 * preenchimento.
 */

import type { BadgeCor } from './content'

export type StatusEvento = 'publicado' | 'rascunho'

export type TipoEvento = 'ensaio' | 'mostra' | 'show' | 'workshop' | 'festival' | 'outro'

/**
 * Como a arte do evento foi feita, e portanto como a página precisa exibi-la.
 *
 * Cartaz de show costuma vir em retrato (o formato de flyer de rede social) e
 * foto de mostra em paisagem. Guardar a escolha de quem cadastrou é o que
 * evita o corte no meio do rosto do artista: sem isso, a listagem imporia a
 * mesma proporção a todo mundo.
 */
export type OrientacaoCartaz = 'horizontal' | 'vertical'

/**
 * O que está acontecendo com o evento agora — vem calculado da API.
 *
 * `status` é a decisão editorial; isto é o que o leitor enxerga. Os dois
 * divergem sempre que há janela: publicado com início no futuro fica
 * `agendado`, e com fim vencido vira `encerrado` sozinho.
 */
export type VisibilidadeEvento = 'no_ar' | 'agendado' | 'encerrado' | 'rascunho'

/** Editoria do evento, como a listagem precisa dela para desenhar o selo. */
export interface EditoriaEvento {
  slug: string
  nome: string
  icone: string
  cor: BadgeCor
}

export interface Evento {
  id: string
  titulo: string
  slug: string
  status: StatusEvento
  tipo: TipoEvento
  resumo: string
  /** HTML já higienizado pela API — vem do editor visual. */
  conteudo: string
  imagemUrl: string | null
  orientacaoCartaz: OrientacaoCartaz
  inscricaoUrl: string | null
  /** Nula quando o evento não foi classificado — a agenda funciona sem editoria. */
  editoria: EditoriaEvento | null
  /** Quando o evento começa (ISO, sem fuso). */
  comecaEm: string
  /** Quando termina. Nulo = sem hora de encerramento anunciada. */
  terminaEm: string | null
  local: string | null
  /** A partir de quando aparece no site. Nulo = já vale. */
  publicarDe: string | null
  /** Até quando aparece. Nulo = sem prazo para sair. */
  publicarAte: string | null
  visibilidade: VisibilidadeEvento
  caminho: string
  /** Dia e mês já formatados pela API para o bloco de agenda. */
  dia: string
  mes: string
  criadoEm: string
  atualizadoEm: string
}

/** O que o formulário do painel edita — o resto é do servidor. */
export type EventoInput =
  Omit<Evento, 'id' | 'caminho' | 'dia' | 'mes' | 'criadoEm' | 'atualizadoEm' | 'imagemUrl' | 'visibilidade' | 'editoria'>
  & { /** O formulário manda o slug da editoria; a API devolve o bloco inteiro. */ editoria: string }

export const STATUS_EVENTO: { valor: StatusEvento, rotulo: string, descricao: string }[] = [
  { valor: 'rascunho', rotulo: 'Rascunho', descricao: 'Só a redação enxerga; fica fora do site.' },
  { valor: 'publicado', rotulo: 'Publicado', descricao: 'Aparece em /cultura/eventos.' },
]

export const TIPOS_EVENTO: { valor: TipoEvento, rotulo: string }[] = [
  { valor: 'ensaio', rotulo: 'Ensaio aberto' },
  { valor: 'mostra', rotulo: 'Mostra / exposição' },
  { valor: 'show', rotulo: 'Show' },
  { valor: 'workshop', rotulo: 'Oficina' },
  { valor: 'festival', rotulo: 'Festival' },
  { valor: 'outro', rotulo: 'Outro' },
]

export const ORIENTACOES_CARTAZ: { valor: OrientacaoCartaz, rotulo: string, ajuda: string, proporcao: string }[] = [
  {
    valor: 'horizontal',
    rotulo: 'Horizontal',
    ajuda: 'Foto deitada (paisagem) — o formato de foto de palco e de mostra.',
    proporcao: 'aspect-video',
  },
  {
    valor: 'vertical',
    rotulo: 'Vertical',
    ajuda: 'Cartaz em pé (retrato) — o formato de flyer de show e de rede social.',
    proporcao: 'aspect-[3/4]',
  },
]

/** A classe de proporção que a moldura do cartaz usa em cada orientação. */
export function proporcaoDoCartaz(orientacao: OrientacaoCartaz): string {
  return ORIENTACOES_CARTAZ.find(o => o.valor === orientacao)?.proporcao ?? 'aspect-video'
}

export const PERIODOS_EVENTO = [
  { valor: 'todos', rotulo: 'Todos os períodos' },
  { valor: 'proximos', rotulo: 'Próximos' },
  { valor: 'realizados', rotulo: 'Já realizados' },
] as const

export type PeriodoEvento = typeof PERIODOS_EVENTO[number]['valor']

/** Como cada situação aparece na listagem do painel. */
export const VISIBILIDADE_EVENTO: Record<
  VisibilidadeEvento,
  { rotulo: string, variante: 'default' | 'secondary' | 'outline', ajuda: string }
> = {
  no_ar: { rotulo: 'No ar', variante: 'default', ajuda: 'Aparecendo em /cultura/eventos agora.' },
  agendado: { rotulo: 'Agendado', variante: 'outline', ajuda: 'Publicado, mas a data de início ainda não chegou.' },
  encerrado: { rotulo: 'Encerrado', variante: 'outline', ajuda: 'Saiu do site sozinho: a data de fim já passou.' },
  rascunho: { rotulo: 'Rascunho', variante: 'secondary', ajuda: 'Só a redação enxerga.' },
}
