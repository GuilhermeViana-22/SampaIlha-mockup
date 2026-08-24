/**
 * Oficinas da frente de Formação Cultural (/cultura/workshops).
 *
 * A inscrição mora sempre em outro site: `inscricaoUrl` é só a ponte. Nulo
 * quer dizer "sem botão de inscrição" — não é um campo obrigatório à espera de
 * preenchimento.
 */

export type StatusWorkshop = 'publicado' | 'rascunho'

/**
 * O que está acontecendo com a oficina agora — vem calculado da API.
 *
 * `status` é a decisão editorial; isto é o que o leitor enxerga. Os dois
 * divergem sempre que há janela: publicada com início no futuro fica
 * `agendada`, e com fim vencido vira `encerrada` sozinha.
 */
export type VisibilidadeWorkshop = 'no_ar' | 'agendada' | 'encerrada' | 'rascunho'

export interface Workshop {
  id: string
  titulo: string
  slug: string
  status: StatusWorkshop
  resumo: string
  /** HTML já higienizado pela API — vem do editor visual. */
  conteudo: string
  imagemUrl: string | null
  inscricaoUrl: string | null
  /** Dia em que a oficina acontece (AAAA-MM-DD). Nulo = ainda sem data. */
  acontecemEm: string | null
  local: string | null
  /** A partir de quando aparece no site. Nulo = já vale. */
  publicarDe: string | null
  /** Até quando aparece. Nulo = sem prazo para sair. */
  publicarAte: string | null
  visibilidade: VisibilidadeWorkshop
  caminho: string
  criadoEm: string
  atualizadoEm: string
}

/** O que o formulário do painel edita — o resto é do servidor. */
export type WorkshopInput = Omit<Workshop, 'id' | 'caminho' | 'criadoEm' | 'atualizadoEm' | 'imagemUrl' | 'visibilidade'>

export const STATUS_WORKSHOP: { valor: StatusWorkshop, rotulo: string, descricao: string }[] = [
  { valor: 'rascunho', rotulo: 'Rascunho', descricao: 'Só a redação enxerga; fica fora do site.' },
  { valor: 'publicado', rotulo: 'Publicado', descricao: 'Aparece em /cultura/workshops.' },
]

export const PERIODOS_WORKSHOP = [
  { valor: 'todos', rotulo: 'Todos os períodos' },
  { valor: 'proximas', rotulo: 'Próximas' },
  { valor: 'realizadas', rotulo: 'Já realizadas' },
] as const

export type PeriodoWorkshop = typeof PERIODOS_WORKSHOP[number]['valor']

/** Como cada situação aparece na listagem do painel. */
export const VISIBILIDADE_WORKSHOP: Record<
  VisibilidadeWorkshop,
  { rotulo: string, variante: 'default' | 'secondary' | 'outline', ajuda: string }
> = {
  no_ar: { rotulo: 'No ar', variante: 'default', ajuda: 'Aparecendo em /cultura/workshops agora.' },
  agendada: { rotulo: 'Agendada', variante: 'outline', ajuda: 'Publicada, mas a data de início ainda não chegou.' },
  encerrada: { rotulo: 'Encerrada', variante: 'outline', ajuda: 'Saiu do site sozinha: a data de fim já passou.' },
  rascunho: { rotulo: 'Rascunho', variante: 'secondary', ajuda: 'Só a redação enxerga.' },
}
