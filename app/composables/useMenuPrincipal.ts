import type { ItemMenu, ItemPrincipal } from '~/utils/navegacao'
import { MENU_PRINCIPAL, rotaDaCategoria } from '~/utils/navegacao'

/** Item já pronto para desenhar: sem campo opcional, sem resolver nada na view. */
export interface ItemNavegacao {
  chave: string
  rotulo: string
  para: string
  icone?: string
  filhos?: ItemMenu[]
  ativo: boolean
}

/**
 * O menu principal resolvido contra a taxonomia da API.
 *
 * Existe para que o menu de cima e a barra de editorias não possam mais
 * discordar: os dois passam por aqui, então saem com o mesmo rótulo, o mesmo
 * ícone, o mesmo destino e o mesmo estado ativo. O que estava acontecendo antes
 * era o oposto — a barra lia do banco, o menu tinha a lista escrita à mão, e
 * "Cultura" levava a duas páginas diferentes, com contagens diferentes de
 * matéria.
 *
 * Uma editoria que não está no banco (ou que perdeu o destaque no menu) some
 * daqui sozinha, em vez de virar um link para uma listagem vazia.
 */
export function useMenuPrincipal() {
  const portal = usePortalStore()
  const rota = useRoute()

  /**
   * A editoria está aberta?
   *
   * Compara o caminho inteiro, e não `rota.params.slug`: o parâmetro se chama
   * `slug` tanto em `/categoria/[slug]` quanto em `/regioes/[slug]`, então uma
   * região acenderia a editoria de mesmo nome.
   */
  function categoriaAtiva(slug: string): boolean {
    return rota.path === rotaDaCategoria(slug)
  }

  function ativo(item: ItemPrincipal, para: string): boolean {
    // A raiz só acende nela mesma — `startsWith('/')` casaria com o site todo.
    if (para === '/') return rota.path === '/'

    if (item.categoria && categoriaAtiva(item.categoria)) return true

    // As páginas curadas do submenu acendem o item que as abriga: quem está em
    // /cultura/grupo-danca continua vendo onde se meteu.
    if (item.filhos?.some(filho => rota.path === filho.para || rota.path.startsWith(`${filho.para}/`))) {
      return true
    }

    return rota.path === para || rota.path.startsWith(`${para}/`)
  }

  const itens = computed<ItemNavegacao[]>(() =>
    MENU_PRINCIPAL.flatMap((item) => {
      if (!item.categoria) {
        const para = item.para!
        return [{
          chave: para,
          rotulo: item.rotulo!,
          para,
          icone: item.icone,
          filhos: item.filhos,
          ativo: ativo(item, para),
        }]
      }

      const categoria = portal.categoria(item.categoria)
      if (!categoria) return []

      const para = rotaDaCategoria(categoria.slug)
      return [{
        chave: `categoria:${categoria.slug}`,
        rotulo: item.rotulo ?? categoria.nome,
        para,
        icone: categoria.icone,
        filhos: item.filhos,
        ativo: ativo(item, para),
      }]
    }),
  )

  return { itens, categoriaAtiva, rotaDaCategoria }
}
