import { beforeEach, describe, expect, it } from 'vitest'
import { criarEvento, fetchFalso } from '../../test/setup'
import {
  arredondarCoordenada,
  coordenadasDaQuery,
  ehIpPublico,
  ipDaRequisicao,
  LOCAL_PADRAO,
  localizarRequisicao,
} from './geo'

/**
 * A previsão do tempo segue quem está lendo, então este arquivo trava as duas
 * decisões que definem a região: o que conta como coordenada válida vinda do
 * navegador e quando vale a pena perguntar ao serviço de IP.
 */

beforeEach(() => {
  fetchFalso.mockReset()
})

describe('ehIpPublico', () => {
  it('aceita endereço roteável', () => {
    expect(ehIpPublico('189.5.4.3')).toBe(true)
    expect(ehIpPublico('2804:14d:5c81::1')).toBe(true)
  })

  it('recusa rede interna, laço e ausência de IP', () => {
    for (const ip of ['10.0.0.1', '192.168.1.5', '172.20.0.4', '172.31.9.9', '127.0.0.1', '169.254.1.1', '::1', 'fd00::1', 'fe80::1', 'localhost', '', null, undefined]) {
      expect(ehIpPublico(ip), `${ip} deveria ser recusado`).toBe(false)
    }
  })

  it('enxerga o IPv4 dentro do IPv6 mapeado', () => {
    expect(ehIpPublico('::ffff:10.0.0.1')).toBe(false)
    expect(ehIpPublico('::ffff:189.5.4.3')).toBe(true)
  })

  it('aceita 172 fora da faixa privada', () => {
    expect(ehIpPublico('172.15.0.1')).toBe(true)
    expect(ehIpPublico('172.32.0.1')).toBe(true)
  })
})

describe('coordenadasDaQuery', () => {
  it('lê os números que o navegador manda como texto', () => {
    expect(coordenadasDaQuery({ lat: '-3.101', lon: '-60.025' })).toEqual({ latitude: -3.101, longitude: -60.025 })
  })

  it('ignora query incompleta, fora de faixa ou não numérica', () => {
    expect(coordenadasDaQuery({})).toBeNull()
    expect(coordenadasDaQuery({ lat: '-3.101' })).toBeNull()
    expect(coordenadasDaQuery({ lat: '91', lon: '0' })).toBeNull()
    expect(coordenadasDaQuery({ lat: '0', lon: '181' })).toBeNull()
    expect(coordenadasDaQuery({ lat: 'aqui', lon: 'ali' })).toBeNull()
  })

  it('ignora 0,0 — é front mandando campo vazio, não o Golfo da Guiné', () => {
    expect(coordenadasDaQuery({ lat: '0', lon: '0' })).toBeNull()
  })
})

describe('arredondarCoordenada', () => {
  it('deixa uma casa decimal, que é a chave do cache da previsão', () => {
    expect(arredondarCoordenada(-23.5505)).toBe(-23.6)
    expect(arredondarCoordenada(-3.101)).toBe(-3.1)
  })
})

describe('ipDaRequisicao', () => {
  it('pega o primeiro da cadeia do proxy', () => {
    const evento = criarEvento({ headers: { 'x-forwarded-for': '189.5.4.3, 10.0.0.2, 10.0.0.3' } })
    expect(ipDaRequisicao(evento)).toBe('189.5.4.3')
  })

  it('cai no IP da conexão quando não há cabeçalho', () => {
    expect(ipDaRequisicao(criarEvento({ ip: '189.5.4.3' }))).toBe('189.5.4.3')
    expect(ipDaRequisicao(criarEvento())).toBeNull()
  })
})

describe('localizarRequisicao', () => {
  it('usa as coordenadas do navegador e busca o nome do lugar', async () => {
    fetchFalso.mockResolvedValue({ city: 'Manaus', principalSubdivisionCode: 'BR-AM', countryCode: 'BR', countryName: 'Brasil' })

    const local = await localizarRequisicao(criarEvento({
      query: { lat: '-3.101', lon: '-60.025' },
      headers: { 'x-forwarded-for': '189.5.4.3' },
    }))

    expect(local).toEqual({ latitude: -3.101, longitude: -60.025, cidade: 'Manaus, AM', fonte: 'gps' })
    // O IP nem é consultado: coordenada do GPS ganha de estimativa de rede.
    expect(fetchFalso).toHaveBeenCalledTimes(1)
    expect(fetchFalso.mock.calls[0]?.[0]).toContain('bigdatacloud')
  })

  it('resolve pelo IP quando o navegador não deu localização', async () => {
    fetchFalso.mockResolvedValue({ success: true, latitude: -3.1, longitude: -60.02, city: 'Manaus', region_code: 'AM', country: 'Brasil', country_code: 'BR' })

    const local = await localizarRequisicao(criarEvento({ headers: { 'x-forwarded-for': '189.5.4.3' } }))

    expect(local).toEqual({ latitude: -3.1, longitude: -60.02, cidade: 'Manaus, AM', fonte: 'ip' })
    expect(fetchFalso.mock.calls[0]?.[0]).toContain('189.5.4.3')
  })

  it('fora do Brasil o complemento é o país', async () => {
    fetchFalso.mockResolvedValue({ success: true, latitude: 38.72, longitude: -9.14, city: 'Lisboa', region_code: 'LI', country: 'Portugal', country_code: 'PT' })

    const local = await localizarRequisicao(criarEvento({ headers: { 'x-forwarded-for': '2.80.1.1' } }))

    expect(local.cidade).toBe('Lisboa, Portugal')
  })

  it('não gasta consulta com IP de rede interna', async () => {
    const local = await localizarRequisicao(criarEvento({ headers: { 'x-forwarded-for': '10.0.0.2' } }))

    expect(local).toEqual(LOCAL_PADRAO)
    expect(fetchFalso).not.toHaveBeenCalled()
  })

  it('serviço fora do ar não derruba a home: volta São Paulo', async () => {
    fetchFalso.mockRejectedValue(new Error('timeout'))

    const local = await localizarRequisicao(criarEvento({ headers: { 'x-forwarded-for': '189.5.4.3' } }))

    expect(local).toEqual(LOCAL_PADRAO)
  })

  it('resposta sem sucesso do ipwho.is também cai no padrão', async () => {
    fetchFalso.mockResolvedValue({ success: false, message: 'Invalid IP address' })

    const local = await localizarRequisicao(criarEvento({ ip: '189.5.4.3' }))

    expect(local).toEqual(LOCAL_PADRAO)
  })

  it('sem nome de cidade no geocoder reverso, o widget não fica vazio', async () => {
    fetchFalso.mockRejectedValue(new Error('offline'))

    const local = await localizarRequisicao(criarEvento({ query: { lat: '-3.101', lon: '-60.025' } }))

    expect(local.fonte).toBe('gps')
    expect(local.cidade).toBe('Sua localização')
  })
})
