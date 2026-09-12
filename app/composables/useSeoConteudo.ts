/**
 * Metadados de compartilhamento (Open Graph + Twitter Card) de uma página.
 *
 * O Facebook, o WhatsApp e o Messenger não abrem o site para escolher a foto:
 * eles leem as tags `og:` do HTML que o servidor entrega. Sem `og:image` o
 * robô sai catando qualquer imagem da página — e no portal a primeira que ele
 * encontra costuma ser a logo do cabeçalho, que é o que aparecia no lugar da
 * foto da matéria.
 *
 * Três detalhes que o robô exige e que é fácil errar:
 *  - a URL da imagem precisa ser absoluta, com domínio (`imagemUrl` já vem
 *    assim da API);
 *  - `og:url` tem de ser o endereço público da página, não o caminho relativo;
 *  - quem não tem foto própria precisa de uma imagem padrão, senão o card sai
 *    sem nada.
 */

/** Card de 1200×630 com a marca, para páginas e matérias sem foto própria. */
export const IMAGEM_PADRAO = '/og-padrao.jpg'
export const LARGURA_PADRAO = 1200
export const ALTURA_PADRAO = 630

/**
 * URL da imagem que vai no card da rede social.
 *
 * A foto da matéria mora na API, não no portal: caminho solto
 * ("/api/v1/uploads/…") ganha o domínio da API, não o do site — colar o
 * domínio errado dá 404 no robô, que então descarta a imagem em silêncio e o
 * card volta a sair sem foto. Sem foto nenhuma, entra o card da marca, que
 * esse sim é servido pelo próprio portal.
 */
export function urlDaImagemSocial(foto: string | null | undefined, site: string, origemApi: string): string {
  const limpa = foto?.trim()
  if (!limpa) return `${site}${IMAGEM_PADRAO}`
  if (/^https?:\/\//i.test(limpa)) return limpa
  return limpa.startsWith('/') ? `${origemApi}${limpa}` : `${origemApi}/${limpa}`
}

export interface SeoConteudo {
  /** Manchete, como ela deve aparecer no card da rede social. */
  titulo: string
  /** Título da aba, quando difere da manchete. Padrão: título + nome do portal. */
  tituloPagina?: string
  resumo?: string | null
  /** Foto de capa, absoluta. Sem ela entra a imagem padrão do portal. */
  imagem?: string | null
  tipo?: 'article' | 'website'
  publicadoEm?: string | null
  atualizadoEm?: string | null
  autor?: string | null
  /** Editoria — vira `article:section`. */
  secao?: string | null
}

export function useSeoConteudo(fonte: MaybeRefOrGetter<SeoConteudo>) {
  const rota = useRoute()
  const config = useRuntimeConfig()

  const site = (config.public.siteUrl || '').replace(/\/$/, '')
  const origemApi = (config.public.apiOrigin || '').replace(/\/$/, '')

  const dados = computed(() => toValue(fonte))
  const url = computed(() => `${site}${rota.path}`)

  const imagem = computed(() => urlDaImagemSocial(dados.value.imagem, site, origemApi))

  const usandoPadrao = computed(() => !dados.value.imagem?.trim())
  const artigo = computed(() => (dados.value.tipo ?? 'article') === 'article')

  useSeoMeta({
    title: () => dados.value.tituloPagina ?? `${dados.value.titulo} — ${config.public.siteName}`,
    description: () => dados.value.resumo || undefined,

    ogTitle: () => dados.value.titulo,
    ogDescription: () => dados.value.resumo || undefined,
    ogType: () => (artigo.value ? 'article' : 'website'),
    ogUrl: () => url.value,
    ogImage: () => imagem.value,
    // O Facebook pede a versão https explícita quando o site roda em https.
    ogImageSecureUrl: () => (imagem.value.startsWith('https://') ? imagem.value : undefined),
    ogImageAlt: () => dados.value.titulo,
    // Só a imagem padrão tem medida declarada, porque é a única cujo tamanho
    // conhecemos. Anunciar tamanho errado para a foto da matéria é pior do que
    // não anunciar: o robô acredita no número e monta o card fora de proporção.
    // É por isso que `app.vue` não declara medida nenhuma — a tag de lá
    // sobreviveria à foto da matéria, que não sobrescreve o que não emite.
    ogImageWidth: () => (usandoPadrao.value ? LARGURA_PADRAO : undefined),
    ogImageHeight: () => (usandoPadrao.value ? ALTURA_PADRAO : undefined),

    articlePublishedTime: () => (artigo.value ? dados.value.publicadoEm || undefined : undefined),
    articleModifiedTime: () => (artigo.value ? dados.value.atualizadoEm || undefined : undefined),
    // A tag aceita mais de um autor, então o tipo é lista mesmo com um nome só.
    articleAuthor: () => (artigo.value && dados.value.autor ? [dados.value.autor] : undefined),
    articleSection: () => (artigo.value ? dados.value.secao || undefined : undefined),

    twitterCard: 'summary_large_image',
    twitterTitle: () => dados.value.titulo,
    twitterDescription: () => dados.value.resumo || undefined,
    twitterImage: () => imagem.value,
    twitterImageAlt: () => dados.value.titulo,
  })

  // Endereço canônico: o mesmo que vai no `og:url`, para o robô não tratar
  // `?utm_source=...` como outra página e reaproveitar o card já montado.
  useHead(() => ({ link: [{ rel: 'canonical', href: url.value }] }))

  return { url, imagem }
}
