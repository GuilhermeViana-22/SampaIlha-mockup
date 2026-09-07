/**
 * Vagas de emprego divulgadas pelo portal (/vagas).
 *
 * O portal é o mural, não o RH: nenhum currículo passa por aqui. O que a
 * redação cadastra é a oportunidade — título, foto, descrição, data — e por
 * onde se candidatar. `linkDaVaga` é a ponte para o site de quem contrata;
 * `emailCandidatura` é o caminho de quem chega sem site próprio. Sem nenhum
 * dos dois, o card fica só com o texto.
 */

export type StatusVaga = 'aberta' | 'encerrada' | 'rascunho'

export interface Vaga {
  id: string
  titulo: string
  slug: string
  empresa: string
  local: string
  regime: string
  modelo: string
  descricao: string
  /** Foto da vaga. Nula = o card aparece sem imagem. */
  imagemUrl: string | null
  /** Link externo da vaga. Nulo faz o card cair no e-mail. */
  linkDaVaga: string | null
  emailCandidatura: string | null
  status: StatusVaga
  ordem: number
  publicadoEm: string
  criadoEm: string
  atualizadoEm: string
}

/** O que o formulário do painel edita — o resto é do servidor. */
export type VagaInput = Omit<Vaga, 'id' | 'slug' | 'imagemUrl' | 'criadoEm' | 'atualizadoEm'>

export const STATUS_VAGA: {
  valor: StatusVaga
  rotulo: string
  descricao: string
  variante: 'default' | 'secondary' | 'outline'
}[] = [
  { valor: 'aberta', rotulo: 'Aberta', descricao: 'Aparece em /vagas.', variante: 'default' },
  {
    valor: 'encerrada',
    rotulo: 'Encerrada',
    descricao: 'Sai do site, mas continua guardada no painel.',
    variante: 'outline',
  },
  { valor: 'rascunho', rotulo: 'Rascunho', descricao: 'Só a redação enxerga; fica fora do site.', variante: 'secondary' },
]

/** Como cada status aparece na listagem do painel. */
export const ROTULO_STATUS_VAGA = Object.fromEntries(
  STATUS_VAGA.map(status => [status.valor, status]),
) as Record<StatusVaga, typeof STATUS_VAGA[number]>

/** Regimes e modelos que a redação mais cadastra — o campo aceita outros. */
export const REGIMES_VAGA = ['CLT', 'PJ', 'Estágio', 'Temporário', 'Freelance', 'Aprendiz'] as const
export const MODELOS_VAGA = ['Presencial', 'Híbrido', 'Remoto'] as const
