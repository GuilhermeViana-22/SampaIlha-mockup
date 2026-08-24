import type { Previsao, TempoDia } from '#shared/types/content'

/**
 * Previsão do tempo de São Paulo, do Open-Meteo (open-meteo.com) — API pública,
 * sem chave e sem limite para uso não comercial.
 *
 * A chamada acontece aqui, no servidor: o navegador não fala com o serviço
 * externo, o que evita CORS e deixa o resultado em cache para todo mundo.
 */

const LATITUDE = -23.5505
const LONGITUDE = -46.6333

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

function traduzir(codigo: number, ehDia = true) {
  const tempo = TEMPO_WMO[codigo] ?? PADRAO
  return {
    rotulo: tempo.rotulo,
    icone: !ehDia && tempo.noturno ? tempo.noturno : tempo.icone,
  }
}

interface RespostaOpenMeteo {
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

/**
 * Cache de 30 minutos: o Open-Meteo atualiza a cada 15, e assim o portal
 * aguenta qualquer volume de visita com uma chamada externa por meia hora.
 */
export default defineCachedEventHandler(async (): Promise<Previsao> => {
  const dados = await $fetch<RespostaOpenMeteo>('https://api.open-meteo.com/v1/forecast', {
    params: {
      latitude: LATITUDE,
      longitude: LONGITUDE,
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
      timezone: 'America/Sao_Paulo',
      forecast_days: 16,
    },
    timeout: 8000,
  })

  const curto = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', timeZone: 'America/Sao_Paulo' })
  // "Seg, 24 de ago" cabe em uma linha na lista dos 15 dias.
  const longo = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short', day: '2-digit', month: 'short', timeZone: 'America/Sao_Paulo',
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
    cidade: 'São Paulo, SP',
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
}, {
  maxAge: 60 * 30,
  name: 'tempo',
  getKey: () => 'sao-paulo',
})
