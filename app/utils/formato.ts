/** Formatações de data e número usadas em todo o portal. */

const FUSO = 'America/Sao_Paulo'

export function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric', timeZone: FUSO,
  })
}

export function formatarDataCurta(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric', timeZone: FUSO,
  }).replace('.', '')
}

export function formatarDataHora(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: FUSO,
  })
}

/** "13" + "JUL" — usado nos blocos de cronograma e agenda. */
export function dataEmPartes(iso: string): { dia: string, mes: string } {
  const data = new Date(iso)
  return {
    dia: data.toLocaleDateString('pt-BR', { day: '2-digit', timeZone: FUSO }),
    mes: data.toLocaleDateString('pt-BR', { month: 'short', timeZone: FUSO })
      .replace('.', '').toUpperCase(),
  }
}

/** Converte para o formato aceito por <input type="datetime-local">. */
export function paraInputDataHora(iso: string): string {
  const data = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${data.getFullYear()}-${pad(data.getMonth() + 1)}-${pad(data.getDate())}T${pad(data.getHours())}:${pad(data.getMinutes())}`
}

export function formatarNumero(valor: number): string {
  return valor.toLocaleString('pt-BR')
}

/** 8400 → "8,4 mil leituras" */
export function formatarLeituras(valor: number): string {
  if (valor >= 1000) return `${(valor / 1000).toFixed(1).replace('.', ',')} mil leituras`
  return `${valor} ${valor === 1 ? 'leitura' : 'leituras'}`
}

/** "há 2 dias" — usado na lista de atividades do dashboard. */
export function tempoRelativo(iso: string): string {
  const diferenca = Date.now() - new Date(iso).getTime()
  const minutos = Math.round(diferenca / 60000)
  const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' })

  if (Math.abs(minutos) < 60) return rtf.format(-minutos, 'minute')
  const horas = Math.round(minutos / 60)
  if (Math.abs(horas) < 24) return rtf.format(-horas, 'hour')
  const dias = Math.round(horas / 24)
  if (Math.abs(dias) < 30) return rtf.format(-dias, 'day')
  return rtf.format(-Math.round(dias / 30), 'month')
}

/** Divide o corpo do post em parágrafos, destacando **negrito** e listas. */
export function paragrafos(conteudo: string): { tipo: 'p' | 'li', html: string }[] {
  return conteudo
    .split(/\n{2,}/)
    .map(bloco => bloco.trim())
    .filter(Boolean)
    .map((bloco) => {
      const item = /^\d+\.\s+/.test(bloco)
      const html = bloco
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/^\d+\.\s+/, '')
        .replace(/\n/g, '<br />')
      return { tipo: item ? ('li' as const) : ('p' as const), html }
    })
}
