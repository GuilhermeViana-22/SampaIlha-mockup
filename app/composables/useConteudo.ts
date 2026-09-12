import type { Ref } from 'vue'
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
export function useListaConteudo<T = Post>(
  chave: string,
  params: ParametrosLista | (() => ParametrosLista),
  rota = '/api/posts',
) {
  const parametros = computed(() => (typeof params === 'function' ? params() : params))

  return useFetch<RespostaLista<T>>(rota, {
    key: () => `${chave}:${JSON.stringify(parametros.value)}`,
    params: parametros,
    default: () => ({ itens: [], total: 0 }),
  })
}

/**
 * A mesma listagem, com "Ver mais".
 *
 * `useListaConteudo` traz uma página e para por aí: o `limite` da página é uma
 * janela sobre as matérias mais recentes, então cada publicação nova empurrava
 * a mais antiga para fora da lista — e nem o "Ver todas" mostrava tudo, porque
 * ele leva para outra página com o mesmo teto. O `total` que o cabeçalho exibe
 * sempre foi o número real do servidor, o que deixava a conta à vista: "37
 * matérias publicadas" com 24 na tela.
 *
 * Aqui a primeira página continua vindo do SSR (é ela que o Google lê e o
 * leitor vê de cara) e as seguintes são buscadas no clique e acrescentadas ao
 * fim. Nada é substituído: a lista só cresce até bater no total.
 */
export async function useListaPaginada<T extends { id: string } = Post>(
  chave: string,
  params: ParametrosLista | (() => ParametrosLista),
  porPagina = 24,
  /*
     A listagem de episódios do podcast tem a mesma forma da de matérias
     (`itens` + `total`, paginada por `pagina`/`limite`), então o feed reaproveita
     tudo isto trocando só o endereço — inclusive o "Ver mais".
  */
  rota = '/api/posts',
) {
  const base = computed<ParametrosLista>(() => ({
    ...(typeof params === 'function' ? params() : params),
    limite: porPagina,
  }))

  /** Páginas 2+; a primeira mora em `data`, que o Nuxt hidrata do servidor. */
  const extras = ref<T[]>([]) as Ref<T[]>
  const pagina = ref(1)
  const carregandoMais = ref(false)
  const erroMais = ref<string | null>(null)

  /*
     Trocar de filtro recomeça a contagem. Sem isto, a página 2 de "Cultura"
     continuaria pendurada no fim da lista de "Esportes" — e o próximo clique
     em "Ver mais" pediria a página 3 de uma lista que só tem uma.

     Registrado antes do `await`: depois dele o componente já não é o ativo, e
     um `watch` criado fora do escopo não é descartado ao sair da página.
  */
  watch(base, () => {
    extras.value = []
    pagina.value = 1
    erroMais.value = null
  }, { deep: true })

  /* O `await` é o mesmo das listagens antigas: sem ele o SSR devolveria a
     página sem as matérias, e quem indexa o portal veria uma lista vazia. */
  const { data, status, refresh } = await useListaConteudo<T>(chave, () => base.value, rota)

  const itens = computed<T[]>(() => [...(data.value?.itens ?? []), ...extras.value])
  const total = computed(() => data.value?.total ?? 0)
  const carregando = computed(() => status.value === 'pending')
  const temMais = computed(() => itens.value.length < total.value)

  async function carregarMais() {
    if (!temMais.value || carregandoMais.value || carregando.value) return
    carregandoMais.value = true
    erroMais.value = null
    try {
      const resposta = await $fetch<RespostaLista<T>>(rota, {
        params: { ...base.value, pagina: pagina.value + 1 },
      })
      /*
         A API ordena por data de publicação. Se a redação publicar entre um
         clique e outro, tudo desce uma posição e o primeiro item da página
         seguinte já está na tela — por isso a lista de ids em vez de concatenar
         direto.
      */
      const naTela = new Set(itens.value.map(item => item.id))
      extras.value = [...extras.value, ...resposta.itens.filter(item => !naTela.has(item.id))]
      pagina.value += 1
    }
    catch (e: any) {
      erroMais.value = e?.data?.statusMessage || 'Não foi possível carregar mais conteúdos.'
    }
    finally {
      carregandoMais.value = false
    }
  }

  return { itens, total, temMais, carregando, carregandoMais, erroMais, carregarMais, status, refresh }
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
