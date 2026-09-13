import type { H3Event } from 'h3'
import type { FonteLocal } from '#shared/types/content'

/**
 * Descobre de onde o leitor está abrindo o portal, para a previsão do tempo
 * ser a da região dele. Duas fontes, nesta ordem:
 *
 * 1. as coordenadas do navegador (`navigator.geolocation`), quando ele
 *    autoriza — chegam na query `?lat=&lon=`, com precisão de quarteirão;
 * 2. o IP da requisição, resolvido no ipwho.is — vale já no primeiro
 *    carregamento, sem pedir permissão nenhuma, com precisão de cidade (às
 *    vezes só da praça da operadora, que para clima dá na mesma).
 *
 * Sem nenhuma das duas — rede local, IP reservado, serviço fora do ar — vale
 * São Paulo, que é a casa do portal.
 */

export interface Local {
  latitude: number
  longitude: number
  cidade: string
  fonte: FonteLocal
}

export const LOCAL_PADRAO: Local = {
  latitude: -23.5505,
  longitude: -46.6333,
  cidade: 'São Paulo, SP',
  fonte: 'padrao',
}

/**
 * Uma casa decimal ≈ 11 km. É a granularidade do cache da previsão: fina o
 * bastante para o tempo ser o mesmo e grossa o bastante para uma cidade
 * inteira ser servida com uma única chamada ao Open-Meteo.
 */
export function arredondarCoordenada(valor: number): number {
  return Math.round(valor * 10) / 10
}

/** Número dentro da faixa, ou `null` — query string aceita qualquer coisa. */
export function lerCoordenada(valor: unknown, limite: number): number | null {
  if (typeof valor !== 'number') {
    // `Number('')` é zero, e zero é uma coordenada: parâmetro ausente ou em
    // branco tem de morrer aqui, senão vira litoral da África.
    const texto = String(valor ?? '').trim()
    if (!texto) return null
    valor = Number(texto)
  }
  const numero = valor as number
  if (!Number.isFinite(numero) || Math.abs(numero) > limite) return null
  return numero
}

/** `?lat=&lon=` do navegador; qualquer coisa fora do formato é ignorada. */
export function coordenadasDaQuery(query: Record<string, unknown>): { latitude: number, longitude: number } | null {
  const latitude = lerCoordenada(query.lat, 90)
  const longitude = lerCoordenada(query.lon, 180)
  if (latitude === null || longitude === null) return null
  // 0,0 é o Golfo da Guiné: quase sempre é bug de front mandando ref vazia.
  if (latitude === 0 && longitude === 0) return null
  return { latitude, longitude }
}

const FAIXAS_PRIVADAS = [
  /^10\./,
  /^127\./,
  /^169\.254\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^::1$/,
  /^f[cd][0-9a-f]{2}:/i,
  /^fe80:/i,
]

/** Consultar o ipwho.is com IP de rede interna só gasta cota e volta vazio. */
export function ehIpPublico(ip: string | null | undefined): boolean {
  if (!ip) return false
  const limpo = ip.trim().replace(/^::ffff:/i, '')
  if (!limpo || limpo === 'localhost') return false
  return !FAIXAS_PRIVADAS.some(faixa => faixa.test(limpo))
}

/**
 * O IP de quem pediu. Em produção o portal roda atrás do proxy do Dokploy,
 * então o endereço real é o primeiro da lista do `x-forwarded-for` — o resto
 * da cadeia são os próprios proxies.
 */
export function ipDaRequisicao(event: H3Event): string | null {
  const encaminhado = getRequestHeader(event, 'x-forwarded-for')
  const primeiro = encaminhado?.split(',')[0]?.trim()
  return primeiro || getRequestIP(event, { xForwardedFor: true }) || null
}

/** "Manaus, AM" no Brasil; "Lisboa, Portugal" fora. */
function rotularLugar(cidade: string | null, uf: string | null, pais: string | null, codigoPais: string | null): string {
  const lugar = cidade?.trim()
  if (!lugar) return LOCAL_PADRAO.cidade
  const complemento = codigoPais === 'BR' ? uf?.trim() : pais?.trim()
  return complemento ? `${lugar}, ${complemento}` : lugar
}

interface RespostaIpWho {
  success?: boolean
  latitude?: number
  longitude?: number
  city?: string
  region_code?: string
  country?: string
  country_code?: string
}

/**
 * Cache de um dia por IP: o leitor que passa a tarde no portal custa uma
 * consulta só, e o plano gratuito do ipwho.is aguenta o movimento.
 */
const localizarPorIp = defineCachedFunction(async (ip: string): Promise<Local | null> => {
  try {
    const dados = await $fetch<RespostaIpWho>(`https://ipwho.is/${encodeURIComponent(ip)}`, {
      params: { fields: 'success,latitude,longitude,city,region_code,country,country_code' },
      // Curto e sem repetição de propósito: serviço externo fora do ar não
      // pode custar segundos de resposta ao leitor. Sem localização, a
      // previsão sai de São Paulo e ninguém espera por isso.
      timeout: 1500,
      retry: 0,
    })
    if (!dados?.success || typeof dados.latitude !== 'number' || typeof dados.longitude !== 'number') return null
    return {
      latitude: dados.latitude,
      longitude: dados.longitude,
      cidade: rotularLugar(dados.city ?? null, dados.region_code ?? null, dados.country ?? null, dados.country_code ?? null),
      fonte: 'ip',
    }
  }
  catch {
    // Clima não é motivo para derrubar a home: sem resposta, cai no padrão.
    return null
  }
}, { maxAge: 60 * 60 * 24, name: 'geoip', getKey: (ip: string) => ip })

interface RespostaBigDataCloud {
  city?: string
  locality?: string
  principalSubdivision?: string
  principalSubdivisionCode?: string
  countryName?: string
  countryCode?: string
}

/**
 * Nome do lugar a partir das coordenadas do GPS — o navegador entrega números,
 * e o widget mostra cidade. Chaveado pela coordenada arredondada, então o
 * bairro inteiro compartilha a mesma consulta.
 */
const nomeDoLugar = defineCachedFunction(async (latitude: number, longitude: number): Promise<string> => {
  try {
    const dados = await $fetch<RespostaBigDataCloud>('https://api.bigdatacloud.net/data/reverse-geocode-client', {
      params: { latitude, longitude, localityLanguage: 'pt' },
      timeout: 1500,
      retry: 0,
    })
    // `principalSubdivisionCode` vem como "BR-AM"; o widget quer só a UF.
    const uf = dados?.principalSubdivisionCode?.split('-')[1] ?? dados?.principalSubdivision ?? null
    return rotularLugar(
      dados?.city || dados?.locality || null,
      uf,
      dados?.countryName ?? null,
      dados?.countryCode ?? null,
    )
  }
  catch {
    return 'Sua localização'
  }
}, {
  maxAge: 60 * 60 * 24 * 30,
  name: 'geo-reverso',
  getKey: (latitude: number, longitude: number) => `${latitude},${longitude}`,
})

/** O lugar de quem fez a requisição, com o padrão de São Paulo no fim da fila. */
export async function localizarRequisicao(event: H3Event): Promise<Local> {
  const coordenadas = coordenadasDaQuery(getQuery(event) as Record<string, unknown>)
  if (coordenadas) {
    return {
      ...coordenadas,
      cidade: await nomeDoLugar(arredondarCoordenada(coordenadas.latitude), arredondarCoordenada(coordenadas.longitude)),
      fonte: 'gps',
    }
  }

  const ip = ipDaRequisicao(event)
  if (!ehIpPublico(ip)) return LOCAL_PADRAO
  return (await localizarPorIp(ip!)) ?? LOCAL_PADRAO
}
