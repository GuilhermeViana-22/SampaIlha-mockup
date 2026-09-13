import type { Previsao } from '#shared/types/content'
import { arredondarCoordenada, localizarRequisicao } from '../utils/geo'
import { montarPrevisao, type RespostaOpenMeteo } from '../utils/tempo'

/**
 * Previsão do tempo da região de quem está lendo, do Open-Meteo
 * (open-meteo.com) — API pública, sem chave e sem limite para uso não
 * comercial.
 *
 * A chamada acontece aqui, no servidor: o navegador não fala com o serviço
 * externo, o que evita CORS e deixa o resultado em cache para todo mundo que
 * estiver na mesma região. De onde é a região, quem decide é `utils/geo`.
 */

/**
 * Cache de 30 minutos por ponto do mapa: o Open-Meteo atualiza a cada 15, e
 * assim o portal aguenta qualquer volume de visita com uma chamada externa por
 * meia hora e por cidade. A falha também é guardada, de propósito: com o
 * serviço fora do ar, cada região tenta de novo a cada meia hora em vez de a
 * cada visita.
 */
const buscarPrevisao = defineCachedFunction(async (latitude: number, longitude: number) => {
  try {
    return await $fetch<RespostaOpenMeteo>('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude,
        longitude,
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
        timezone: 'auto',
        forecast_days: 16,
      },
      // Quatro segundos e uma tentativa só. O padrão do ofetch repete o GET,
      // então um serviço pendurado custava o dobro do timeout — 16 s de espera
      // para mostrar um widget de canto de tela.
      timeout: 4000,
      retry: 0,
    })
  }
  catch {
    // Open-Meteo fora do ar não é erro do portal: a rota responde vazio e o
    // widget simplesmente não aparece, em vez de devolver 500.
    return null
  }
}, {
  maxAge: 60 * 30,
  name: 'tempo',
  getKey: (latitude: number, longitude: number) => `${latitude},${longitude}`,
})

export default defineEventHandler(async (event): Promise<Previsao | null> => {
  const local = await localizarRequisicao(event)
  const dados = await buscarPrevisao(
    arredondarCoordenada(local.latitude),
    arredondarCoordenada(local.longitude),
  )
  if (!dados) {
    setResponseStatus(event, 204)
    return null
  }
  return montarPrevisao(dados, local)
})
