/** Metadados de página usados pelo cabeçalho do dashboard. */
declare module '#app' {
  interface PageMeta {
    /** Título exibido na barra superior do painel. */
    titulo?: string
    /** Linha de apoio abaixo do título. */
    descricao?: string
    /** Botão principal à direita; `null` esconde o botão padrão. */
    acao?: { rotulo: string, para: string } | null
  }
}

export {}
