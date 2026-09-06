/**
 * Limites e conferências dos campos de data do painel.
 *
 * Espelha `app/utils/dates.py` da API: as duas pontas precisam recusar as
 * mesmas datas, senão o formulário deixa passar o que o servidor devolve como
 * erro — ou, pior, aceita calado o que ninguém queria digitar.
 */

/** Ver `ANO_MINIMO` em `app/utils/dates.py`. Mudar aqui exige mudar lá. */
export const ANO_MINIMO = 2000
export const ANOS_A_FRENTE = 25

/**
 * O primeiro e o último dia que o painel aceita, em `AAAA-MM-DD`.
 *
 * Servem para o `min`/`max` do `<input type="date">`: com eles o navegador já
 * marca o campo como inválido e as setas do seletor param na borda, em vez de
 * deixar o ano correr até 275760.
 */
export function limitesDoCalendario(): { min: string, max: string } {
  return {
    min: `${ANO_MINIMO}-01-01`,
    max: `${new Date().getFullYear() + ANOS_A_FRENTE}-12-31`,
  }
}

/** O mesmo par, no formato que o `<input type="datetime-local">` exige. */
export function limitesDoCalendarioComHora(): { min: string, max: string } {
  const { min, max } = limitesDoCalendario()
  return { min: `${min}T00:00`, max: `${max}T23:59` }
}

/**
 * A data está dentro da faixa aceita?
 *
 * Campo vazio conta como válido: "sem data" é resposta legítima nos campos
 * opcionais, e quem exige preenchimento é o formulário, não esta função.
 *
 * A conferência é feita sobre o texto do campo (`AAAA-MM-DD`), e não sobre um
 * `Date`: o `new Date('0202-05-20')` não falha — ele devolve o ano 202 sem
 * reclamar, que é exatamente o valor que precisa ser barrado aqui.
 */
export function dataNoCalendario(valor: string | null | undefined): boolean {
  if (!valor) return true

  // O ano vem do primeiro segmento, e não dos quatro primeiros caracteres: o
  // seletor de data do navegador aceita ano com cinco dígitos (vai até 275760),
  // e cortar em quatro leria `20255` como `2025` — deixando passar justamente o
  // dígito a mais que esta função existe para pegar.
  const ano = Number(valor.split('-')[0])
  if (!Number.isInteger(ano)) return false

  return ano >= ANO_MINIMO && ano <= new Date().getFullYear() + ANOS_A_FRENTE
}

/** A frase que o painel mostra quando a data cai fora da faixa. */
export function avisoDeCalendario(): string {
  return `A data precisa estar entre ${ANO_MINIMO} e ${new Date().getFullYear() + ANOS_A_FRENTE}. `
    + 'Confira o ano — é onde o dígito costuma escapar.'
}

/**
 * O campo tem uma data completa e reconhecível?
 *
 * Um `<input type="date">` deixado pela metade devolve string vazia, mas o
 * valor também chega torto quando o formulário é preenchido por colagem ou
 * por preenchimento automático do navegador. Conferir o formato aqui evita
 * mandar para a API um `starts_at` que ela recusaria com 422.
 */
export function dataCompleta(valor: string | null | undefined, comHora = false): boolean {
  if (!valor) return false

  const formato = comHora ? /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/ : /^\d{4}-\d{2}-\d{2}$/
  if (!formato.test(valor)) return false

  return !Number.isNaN(new Date(valor).getTime())
}
