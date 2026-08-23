import type { Post, PostTipo, RespostaLista } from '#shared/types/content'

type ParametrosLista = Record<string, string | number | boolean | undefined>

/**
 * Busca conteúdos publicados para as páginas do site.
 * `chave` mantém o cache do Nuxt estável entre navegações.
 */
export function useListaConteudo(chave: string, params: ParametrosLista | (() => ParametrosLista)) {
  return useFetch<RespostaLista<Post>>('/api/posts', {
    key: chave,
    params: typeof params === 'function' ? computed(params) : params,
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
