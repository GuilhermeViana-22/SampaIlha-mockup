import type { Previsao, TempoDia } from '#shared/types/content'
import type { Local } from './geo'

/**
 * Tradução da resposta do Open-Meteo para o vocabulário do portal.
 *
 * Fica fora da rota porque não depende de rede: dado o JSON do serviço e o
 * lugar de quem pediu, monta a previsão inteira — o que dá para testar sem
 * subir nada.
 */

/** Códigos WMO → rótulo em português e ícone do Font Awesome. */
const TEMPO_WMO: Record<number, { rotulo: string, icone: string, noturno?: string }> = {
  0: { rotulo: 'Céu limpo', icone: 'fas fa-sun', noturno: 'fas fa-moon' },
  1: { rotulo: 'Predominantemente limpo', icone: 'fas fa-sun', noturno: 'fas fa-moon' },
  2: { rotulo: 'Parcialmente nublado', icone: 'fas fa-cloud-sun', noturno: 'fas fa-cloud-moon' },
  3: { rotulo: 'Nublado', icone: 'fas fa-cloud' },
  45: { rotulo: 'Névoa', icone: 'fas fa-smog' },
  48: { rotulo: 'Névoa com geada', icone: 'fas fa-smog' },
  51: { rotulo: 'Garoa fraca', icone: 'fas fa-cloud-rain' },
  53: { rotulo: 'Garoa', icone: 'fas fa-cloud-rain' },
  55: { rotulo: 'Garoa forte', icone: 'fas fa-cloud-showers-heavy' },
  56: { rotulo: 'Garoa congelante', icone: 'fas fa-icicles' },
  57: { rotulo: 'Garoa congelante forte', icone: 'fas fa-icicles' },
  61: { rotulo: 'Chuva fraca', icone: 'fas fa-cloud-rain' },
  63: { rotulo: 'Chuva', icone: 'fas fa-cloud-showers-heavy' },
  65: { rotulo: 'Chuva forte', icone: 'fas fa-cloud-showers-heavy' },
  66: { rotulo: 'Chuva congelante', icone: 'fas fa-icicles' },
  67: { rotulo: 'Chuva congelante forte', icone: 'fas fa-icicles' },
  71: { rotulo: 'Neve fraca', icone: 'fas fa-snowflake' },
  73: { rotulo: 'Neve', icone: 'fas fa-snowflake' },
  75: { rotulo: 'Neve forte', icone: 'fas fa-snowflake' },
  77: { rotulo: 'Grãos de neve', icone: 'fas fa-snowflake' },
  80: { rotulo: 'Pancadas de chuva', icone: 'fas fa-cloud-sun-rain', noturno: 'fas fa-cloud-moon-rain' },
  81: { rotulo: 'Pancadas fortes', icone: 'fas fa-cloud-showers-heavy' },
  82: { rotulo: 'Temporal de chuva', icone: 'fas fa-cloud-showers-heavy' },
  85: { rotulo: 'Pancadas de neve', icone: 'fas fa-snowflake' },
  86: { rotulo: 'Pancadas de neve fortes', icone: 'fas fa-snowflake' },
  95: { rotulo: 'Trovoada', icone: 'fas fa-bolt' },
  96: { rotulo: 'Trovoada com granizo', icone: 'fas fa-cloud-bolt' },
  99: { rotulo: 'Trovoada com granizo forte', icone: 'fas fa-cloud-bolt' },
}

type Condicao = (typeof TEMPO_WMO)[number]

const PADRAO: Condicao = { rotulo: 'Tempo indefinido', icone: 'fas fa-cloud' }

export function traduzir(codigo: number, ehDia = true) {
  const tempo = TEMPO_WMO[codigo] ?? PADRAO
  return {
    rotulo: tempo.rotulo,
    icone: !ehDia && tempo.noturno ? tempo.noturno : tempo.icone,
  }
}

export interface RespostaOpenMeteo {
  /** Vem preenchido porque a chamada pede `timezone=auto`. */
  timezone: string
  current: {
    time: string
    temperature_2m: number
    apparent_temperature: number
    relative_humidity_2m: number
    wind_speed_10m: number
    weather_code: number
    is_day: number
  }
  daily: {
    time: string[]
    weather_code: number[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    precipitation_probability_max: (number | null)[]
  }
}

export function montarPrevisao(dados: RespostaOpenMeteo, local: Local): Previsao {
  // O fuso acompanha o lugar: quem abre o portal de Manaus vê os dias na hora
  // de Manaus, não na de São Paulo.
  const fuso = dados.timezone || 'America/Sao_Paulo'
  const curto = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', timeZone: fuso })
  // "Seg, 24 de ago" cabe em uma linha na lista dos 15 dias.
  const longo = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short', day: '2-digit', month: 'short', timeZone: fuso,
  })

  const dias: TempoDia[] = dados.daily.time.map((data, i) => {
    // Meio-dia evita o vaivém de fuso que jogaria a data para o dia anterior.
    const referencia = new Date(`${data}T12:00:00`)
    return {
      data,
      diaCurto: curto.format(referencia).replace('.', '').replace(/^\w/, l => l.toUpperCase()),
      diaLongo: longo.format(referencia).replace(/\./g, '').replace(/^\w/, l => l.toUpperCase()),
      minima: Math.round(dados.daily.temperature_2m_min[i] ?? 0),
      maxima: Math.round(dados.daily.temperature_2m_max[i] ?? 0),
      chuva: dados.daily.precipitation_probability_max[i] ?? 0,
      ...traduzir(dados.daily.weather_code[i] ?? 0),
    }
  })

  return {
    cidade: local.cidade,
    fonte: local.fonte,
    agora: {
      temperatura: Math.round(dados.current.temperature_2m),
      sensacao: Math.round(dados.current.apparent_temperature),
      umidade: Math.round(dados.current.relative_humidity_2m),
      vento: Math.round(dados.current.wind_speed_10m),
      atualizadoEm: dados.current.time,
      ...traduzir(dados.current.weather_code, dados.current.is_day === 1),
    },
    dias: dias.slice(0, 15),
  }
}
