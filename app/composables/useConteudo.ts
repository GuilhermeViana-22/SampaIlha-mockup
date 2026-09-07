import type { Post, PostTipo, RespostaLista } from '#shared/types/content'

type ParametrosLista = Record<string, string | number | boolean | undefined>

/**
 * Busca conteúdos publicados para as páginas do site.
 *
 * A chave do cache inclui os parâmetros, e não só o prefixo. Isso não é
 * detalhe: o Nuxt guarda o resultado por chave, então uma chave fixa numa
 * página de filtro faz todas as variações compartilharem a mesma entrada — e a
 * segunda categoria aberta mostra o conteúdo da primeira.
 *
 * Era exatamente o que acontecia em `/categoria/[slug]`: a URL mudava, o título
 * mudava (vem da store, não da busca), e a lista continuava a mesma. Quem abria
 * Cotidiano, que não tem nada publicado, via a matéria de Política. Valia
 * também para `/regioes/[slug]`, `/busca` e a listagem de notícias filtrada.
 *
 * Com os parâmetros na chave, cada filtro tem a sua entrada: a navegação entre
 * editorias volta a buscar, e voltar para uma já vista continua instantâneo.
 */
export function useListaConteudo(chave: string, params: ParametrosLista | (() => ParametrosLista)) {
  const parametros = computed(() => (typeof params === 'function' ? params() : params))

  return useFetch<RespostaLista<Post>>('/api/posts', {
    key: () => `${chave}:${JSON.stringify(parametros.value)}`,
    params: parametros,
    default: () => ({ itens: [], total: 0 }),
  })
}

export function useMateria(slug: MaybeRefOrGetter<string>) {
  return useFetch<{ post: Post, relacionados: Post[] }>(
    () => `/api/posts/slug/${toValue(slug)}`,
    { key: () => `materia-${toValue(slug)}` },
  )
}

/** Rótulo legível do tipo de conteúdo. */
export function rotuloTipo(tipo: PostTipo): string {
  return { noticia: 'Notícia', dica: 'Dica', informacao: 'Informação' }[tipo]
}

/**
 * Caminho público de um conteúdo. A API já devolve pronto em `caminho`;
 * o cálculo local cobre a prévia do formulário, que ainda não foi salva.
 */
export function caminhoDoPost(post: Pick<Post, 'tipo' | 'slug'> & { caminho?: string }): string {
  if (post.caminho) return post.caminho
  const raiz = { noticia: '/noticias', dica: '/dicas', informacao: '/informacoes' }[post.tipo]
  return `${raiz}/${post.slug}`
}
