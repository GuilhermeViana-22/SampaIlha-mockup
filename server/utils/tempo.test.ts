import { describe, expect, it } from 'vitest'
import type { Local } from './geo'
import { montarPrevisao, traduzir, type RespostaOpenMeteo } from './tempo'

/**
 * A tradução do Open-Meteo é onde um campo renomeado lá fora apareceria como
 * "0°" na tela sem ninguém perceber — e onde o fuso do lugar precisa vencer o
 * fuso do servidor, agora que a previsão é da região de quem lê.
 */

const MANAUS: Local = { latitude: -3.1, longitude: -60.02, cidade: 'Manaus, AM', fonte: 'ip' }

function resposta(sobrescreve: Partial<RespostaOpenMeteo> = {}): RespostaOpenMeteo {
  return {
    timezone: 'America/Manaus',
    current: {
      time: '2026-09-13T10:00',
      temperature_2m: 31.4,
      apparent_temperature: 36.8,
      relative_humidity_2m: 78.2,
      wind_speed_10m: 11.6,
      weather_code: 80,
      is_day: 1,
    },
    daily: {
      time: Array.from({ length: 16 }, (_, i) => `2026-09-${String(13 + i).padStart(2, '0')}`),
      weather_code: Array.from({ length: 16 }, () => 63),
      temperature_2m_max: Array.from({ length: 16 }, () => 32.6),
      temperature_2m_min: Array.from({ length: 16 }, () => 24.2),
      precipitation_probability_max: Array.from({ length: 16 }, () => 70),
    },
    ...sobrescreve,
  }
}

describe('traduzir', () => {
  it('troca o ícone no período da noite quando existe versão noturna', () => {
    expect(traduzir(0, true).icone).toBe('fas fa-sun')
    expect(traduzir(0, false).icone).toBe('fas fa-moon')
    // Chuva forte não tem lua: o ícone é o mesmo de dia e de noite.
    expect(traduzir(65, false).icone).toBe('fas fa-cloud-showers-heavy')
  })

  it('código desconhecido não quebra o widget', () => {
    expect(traduzir(1234)).toEqual({ rotulo: 'Tempo indefinido', icone: 'fas fa-cloud' })
  })
})

describe('montarPrevisao', () => {
  it('carrega a cidade e a fonte do lugar resolvido', () => {
    const previsao = montarPrevisao(resposta(), MANAUS)

    expect(previsao.cidade).toBe('Manaus, AM')
    expect(previsao.fonte).toBe('ip')
  })

  it('arredonda as medidas do agora e traduz o código', () => {
    const previsao = montarPrevisao(resposta(), MANAUS)

    expect(previsao.agora).toMatchObject({
      temperatura: 31,
      sensacao: 37,
      umidade: 78,
      vento: 12,
      rotulo: 'Pancadas de chuva',
      icone: 'fas fa-cloud-sun-rain',
      atualizadoEm: '2026-09-13T10:00',
    })
  })

  it('entrega 15 dias, mesmo com 16 vindo da API', () => {
    const previsao = montarPrevisao(resposta(), MANAUS)

    expect(previsao.dias).toHaveLength(15)
    expect(previsao.dias[0]).toMatchObject({
      data: '2026-09-13',
      minima: 24,
      maxima: 33,
      chuva: 70,
      rotulo: 'Chuva',
    })
  })

  it('nomeia os dias no fuso do lugar, não no do servidor', () => {
    const previsao = montarPrevisao(resposta(), MANAUS)

    // 13/09/2026 é um domingo em Manaus.
    expect(previsao.dias[0]?.diaCurto).toBe('Dom')
    expect(previsao.dias[0]?.diaLongo).toBe('Dom, 13 de set')
  })

  it('sem probabilidade de chuva o dia vai com zero, não com vazio', () => {
    const dados = resposta()
    dados.daily.precipitation_probability_max[0] = null

    expect(montarPrevisao(dados, MANAUS).dias[0]?.chuva).toBe(0)
  })

  it('sem fuso na resposta, mantém São Paulo', () => {
    const previsao = montarPrevisao(resposta({ timezone: '' }), MANAUS)

    expect(previsao.dias).toHaveLength(15)
  })
})
