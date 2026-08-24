/**
 * Tema do site público: as cores que o administrador escolhe em
 * /admin/configuracoes → Aparência viram variáveis CSS injetadas no SSR.
 *
 * Os tons derivados (médio, suave, borda) saem de `color-mix()` no próprio CSS,
 * então o painel pede só as cores que realmente são uma decisão de marca.
 */
export interface Tema {
  /** Cor principal da marca — barra do topo, links, botões, selos. */
  primaria: string
  /** Cor do texto sobre a cor principal. */
  contrastePrimaria: string
  /** Cor de apoio, usada nos ícones e detalhes do rodapé e do cabeçalho. */
  destaque: string
  /** Cor de fundo das páginas. */
  fundo: string
  /** Cor do texto corrido. */
  texto: string
  /** Cor padrão dos títulos; cada nível pode sobrescrever. */
  titulo: string
  /** Cor de fundo do rodapé. */
  rodape: string
  /** Cor do texto sobre o rodapé — o texto some se ela não contrastar. */
  contrasteRodape: string
  /** Vazio (`''`) herda `titulo`. */
  h1: string
  h2: string
  h3: string
  h4: string
  h5: string
  h6: string
}

/** Paleta oficial do portal: verde amazônico. */
export const TEMA_PADRAO: Tema = {
  primaria: '#0c560b',
  contrastePrimaria: '#ffffff',
  destaque: '#d9a441',
  fundo: '#f5f7fa',
  texto: '#111827',
  titulo: '#0c560b',
  rodape: '#0d1b2a',
  contrasteRodape: '#ffffff',
  h1: '',
  h2: '',
  h3: '',
  h4: '',
  h5: '',
  h6: '',
}

export const NIVEIS_TITULO = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const
export type NivelTitulo = (typeof NIVEIS_TITULO)[number]

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

/** Descarta valor inválido em vez de deixá-lo entrar no CSS. */
function cor(valor: string | null | undefined, padrao: string): string {
  const limpo = (valor ?? '').trim()
  return HEX.test(limpo) ? limpo : padrao
}

/** Normaliza qualquer objeto vindo da API para um `Tema` completo e seguro. */
export function normalizarTema(bruto: Partial<Tema> | null | undefined): Tema {
  const base = bruto ?? {}
  const tema: Tema = {
    primaria: cor(base.primaria, TEMA_PADRAO.primaria),
    contrastePrimaria: cor(base.contrastePrimaria, TEMA_PADRAO.contrastePrimaria),
    destaque: cor(base.destaque, TEMA_PADRAO.destaque),
    fundo: cor(base.fundo, TEMA_PADRAO.fundo),
    texto: cor(base.texto, TEMA_PADRAO.texto),
    titulo: cor(base.titulo, TEMA_PADRAO.titulo),
    rodape: cor(base.rodape, TEMA_PADRAO.rodape),
    contrasteRodape: cor(base.contrasteRodape, TEMA_PADRAO.contrasteRodape),
    h1: '', h2: '', h3: '', h4: '', h5: '', h6: '',
  }

  for (const nivel of NIVEIS_TITULO) {
    const valor = (base[nivel] ?? '').trim()
    tema[nivel] = HEX.test(valor) ? valor : ''
  }

  return tema
}

/** Cor efetiva de um nível de título (vazio herda a cor padrão de títulos). */
export function corDoTitulo(tema: Tema, nivel: NivelTitulo): string {
  return tema[nivel] || tema.titulo
}

/**
 * Bloco `:root` com o tema. Vai para uma tag <style> no <head> durante o SSR,
 * então a primeira pintura já sai com as cores certas — sem flash de azul.
 */
export function cssDoTema(bruto: Partial<Tema> | null | undefined): string {
  const tema = normalizarTema(bruto)
  const titulos = NIVEIS_TITULO.map(nivel => `--cor-${nivel}:${corDoTitulo(tema, nivel)};`).join('')

  // `:root:root` para vencer o bloco padrão de base.css seja qual for a ordem
  // em que o Nuxt injeta o CSS (em dev o Vite insere os estilos por JS).
  return ':root:root{'
    + `--cor-primaria:${tema.primaria};`
    + `--cor-primaria-contraste:${tema.contrastePrimaria};`
    + `--cor-destaque:${tema.destaque};`
    + `--cor-fundo:${tema.fundo};`
    + `--cor-texto:${tema.texto};`
    + `--cor-titulo:${tema.titulo};`
    + `--cor-rodape:${tema.rodape};`
    + `--cor-rodape-contraste:${tema.contrasteRodape};`
    + titulos
    + '}'
}
