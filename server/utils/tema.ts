import type { Tema } from '../../shared/types/tema'
import { NIVEIS_TITULO, normalizarTema } from '../../shared/types/tema'

/**
 * Tradução entre o `theme` da API Python (chaves em inglês, `null` para
 * "herda") e o `Tema` do front (chaves em português, `''` para "herda").
 */

export interface ApiTema {
  primary: string
  primary_contrast: string
  accent: string
  background: string
  text: string
  heading: string
  footer: string
  footer_contrast: string
  heading_1: string | null
  heading_2: string | null
  heading_3: string | null
  heading_4: string | null
  heading_5: string | null
  heading_6: string | null
}

export function daApi(bruto: Partial<ApiTema> | null | undefined): Tema {
  const api = bruto ?? {}

  return normalizarTema({
    primaria: api.primary,
    contrastePrimaria: api.primary_contrast,
    destaque: api.accent,
    fundo: api.background,
    texto: api.text,
    titulo: api.heading,
    rodape: api.footer,
    contrasteRodape: api.footer_contrast,
    h1: api.heading_1 ?? '',
    h2: api.heading_2 ?? '',
    h3: api.heading_3 ?? '',
    h4: api.heading_4 ?? '',
    h5: api.heading_5 ?? '',
    h6: api.heading_6 ?? '',
  })
}

export function paraApi(tema: Tema): ApiTema {
  const titulos = Object.fromEntries(
    NIVEIS_TITULO.map((nivel, indice) => [`heading_${indice + 1}`, tema[nivel] || null]),
  ) as Pick<ApiTema, 'heading_1' | 'heading_2' | 'heading_3' | 'heading_4' | 'heading_5' | 'heading_6'>

  return {
    primary: tema.primaria,
    primary_contrast: tema.contrastePrimaria,
    accent: tema.destaque,
    background: tema.fundo,
    text: tema.texto,
    heading: tema.titulo,
    footer: tema.rodape,
    footer_contrast: tema.contrasteRodape,
    ...titulos,
  }
}
