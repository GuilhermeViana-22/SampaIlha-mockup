import { toast } from 'vue-sonner'

/**
 * Avisos do painel — a única porta por onde o dashboard fala com quem usa.
 *
 * Toda ação de escrita (criar, salvar, publicar, excluir) precisa terminar em
 * um aviso: sem isso quem clicou fica sem saber se deu certo. Concentrar as
 * chamadas aqui é o que mantém tom, duração e ícone iguais em todas as telas —
 * e evita que cada página invente o próprio jeito de ler a mensagem de erro.
 *
 * O `<Toaster>` vive nos layouts `admin` e `auth`, com `rich-colors`: verde,
 * âmbar e vermelho já vêm de lá, junto dos ícones.
 */

/** Quanto tempo cada tom fica na tela. Erro dura mais: costuma ter o que ler. */
const DURACAO = {
  sucesso: 4000,
  alerta: 6000,
  erro: 7000,
  info: 5000,
} as const

/**
 * Descobre o que a API realmente disse, atravessando as camadas do caminho.
 *
 * Um erro vindo do painel passa por três envelopes antes de chegar aqui:
 * a API Python responde `{ error: { code, message } }`, o BFF em `server/api/`
 * reempacota isso em `createError({ statusMessage, data })`, e o Nitro serializa
 * de novo para o navegador. A ordem abaixo tenta a mensagem mais específica
 * primeiro e só cai no texto genérico quando nada mais sobrou — é ela que faz a
 * diferença entre "Não foi possível remover" e "Esta editoria ainda tem 4
 * conteúdos".
 */
export function mensagemDoErro(erro: unknown, padrao: string): string {
  const e = erro as any
  return (
    e?.data?.data?.error?.message
    || e?.data?.statusMessage
    || e?.data?.message
    || e?.statusMessage
    || padrao
  )
}

export const avisar = {
  /** Deu certo: o que foi pedido aconteceu. */
  sucesso(titulo: string, descricao?: string) {
    toast.success(titulo, { description: descricao, duration: DURACAO.sucesso })
  },

  /**
   * Não deu certo: nada mudou, ou mudou pela metade.
   *
   * Recebe o erro cru em vez de um texto pronto justamente para que a mensagem
   * da API apareça para quem está usando o painel.
   */
  erro(erro: unknown, padrao: string, descricao?: string) {
    toast.error(mensagemDoErro(erro, padrao), { description: descricao, duration: DURACAO.erro })
  },

  /** Texto de erro já resolvido — para quem guarda a mensagem em um `ref`. */
  falha(titulo: string, descricao?: string) {
    toast.error(titulo, { description: descricao, duration: DURACAO.erro })
  },

  /**
   * Funcionou, mas não como quem clicou esperava.
   *
   * O caso clássico do portal é o editor pedindo publicação: a API aceita o
   * pedido e devolve `em_revisao`. Dizer "publicado" seria mentira e dizer
   * "erro" também — o lugar disso é aqui.
   */
  alerta(titulo: string, descricao?: string) {
    toast.warning(titulo, { description: descricao, duration: DURACAO.alerta })
  },

  /** Recado neutro, sem sucesso nem falha atrás. */
  info(titulo: string, descricao?: string) {
    toast.info(titulo, { description: descricao, duration: DURACAO.info })
  },
}
