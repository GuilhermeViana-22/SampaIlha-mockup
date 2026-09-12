/**
 * Área de apoio do leitor — o bloco "apoie o portal".
 *
 * Não é publicidade: não disputa a coluna com quem pagou, não tem janela de
 * contrato e não depende de arte enviada. É o portal pedindo apoio em nome
 * próprio, e por isso o texto é editável em vez de ser uma imagem.
 *
 * `ativo` falso é o estado normal enquanto ninguém configurar nada — e a API
 * devolve falso sozinha se o bloco for ligado sem link e sem chave Pix.
 */
export interface Apoio {
  ativo: boolean
  titulo: string
  descricao: string
  rotuloBotao: string
  /** Página de doação (Apoia.se, PicPay, Vakinha…). Nulo esconde o botão. */
  url: string | null
  /** Chave Pix para copiar. Nula esconde o campo. */
  chavePix: string | null
  /** Linha pequena abaixo do botão ("Doação a partir de R$ 10"). */
  observacao: string
}

export const APOIO_PADRAO: Apoio = {
  ativo: false,
  titulo: 'Apoie o Sampa na Ilha',
  descricao: '',
  rotuloBotao: 'Quero apoiar',
  url: null,
  chavePix: null,
  observacao: '',
}
