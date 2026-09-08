import type { Guia } from '../../shared/types/content'
import type { ApiPost } from './adaptadores'
import { paraPayloadApi, paraPost } from './adaptadores'

/**
 * Guia é a dica vista pelo painel.
 *
 * Não existe tabela de guias na API: o que o painel chama de guia é um post de
 * `type=dica` — o mesmo registro que o site público lê em `/dicas`. Antes estas
 * rotas guardavam os guias num array em memória do Nitro, o que dava a
 * impressão de funcionar dentro de uma sessão e perdia tudo no primeiro
 * restart do contêiner; nada do que era criado no painel chegava ao site.
 *
 * Aqui fica só a tradução entre o vocabulário do painel (português) e o
 * contrato da API (inglês, snake_case) — a mesma divisão de
 * `utils/adaptadores.ts`, de onde vêm as funções de post reaproveitadas.
 */

/** Tipo do post que representa um guia na API. */
export const TIPO_GUIA = 'dica' as const

export function paraGuia(api: ApiPost): Guia {
  const post = paraPost(api)

  return {
    id: post.id,
    status: post.status,
    titulo: post.titulo,
    slug: post.slug,
    resumo: post.resumo,
    conteudo: post.conteudo,
    categoria: post.categoria,
    categoriaNome: post.categoriaNome,
    autor: post.autor,
    icone: post.icone,
    capa: post.capa,
    imagemUrl: post.imagemUrl,
    destaque: post.destaque,
    tags: post.tags,
    leituras: post.leituras,
    tempoLeitura: post.tempoLeitura,
    publicadoEm: post.publicadoEm,
    atualizadoEm: post.atualizadoEm,
    caminho: post.caminho,
  }
}

/**
 * Corpo de criação/edição de guia, no formato que a API espera.
 *
 * O `type` vai fixo: quem edita pelo painel de guias não escolhe — e sem ele
 * um PUT vindo do formulário transformaria a dica em notícia.
 */
export function paraPayloadGuia(dados: Record<string, any>): Record<string, unknown> {
  return { ...paraPayloadApi(dados), type: TIPO_GUIA }
}

/** Filtros da listagem do painel → query string da API. */
export function paramsListagemGuias(
  query: Record<string, any>,
  autenticado: boolean,
): Record<string, unknown> {
  return {
    page: query.pagina ?? 1,
    limit: query.limite ?? 20,
    type: TIPO_GUIA,
    status: autenticado && query.status && query.status !== 'todos' ? query.status : undefined,
    category: query.categoria && query.categoria !== 'todas' ? query.categoria : undefined,
    tag: query.tag || undefined,
    author: query.autor || undefined,
    featured: query.destaque === undefined ? undefined : query.destaque === 'true',
    search: query.busca || undefined,
    order: query.ordenar ?? 'recentes',
  }
}
