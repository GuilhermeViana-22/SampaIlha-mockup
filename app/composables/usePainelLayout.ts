const CHAVE_SIDEBAR = 'sampa-admin-sidebar'

/**
 * Casca do painel: gaveta no mobile e menu lateral recolhível no desktop.
 * A escolha do desktop fica no localStorage (o SSR sempre renderiza aberto,
 * mesmo critério usado pelo tema em `useTemaAdmin`).
 */
export function usePainelLayout() {
  const menuMobile = useState('admin-menu-mobile', () => false)
  const oculto = useState('admin-sidebar-oculto', () => false)

  onMounted(() => {
    oculto.value = localStorage.getItem(CHAVE_SIDEBAR) === 'oculto'
  })

  /** No mobile abre/fecha a gaveta; no desktop esconde ou mostra o menu fixo. */
  function alternarSidebar() {
    if (window.innerWidth < 1024) {
      menuMobile.value = !menuMobile.value
      return
    }
    oculto.value = !oculto.value
    localStorage.setItem(CHAVE_SIDEBAR, oculto.value ? 'oculto' : 'visivel')
  }

  return { menuMobile, oculto, alternarSidebar }
}
