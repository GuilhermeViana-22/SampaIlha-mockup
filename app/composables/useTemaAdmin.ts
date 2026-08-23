/** Alterna o tema claro/escuro do dashboard (classe `dark` no <html>). */
export function useTemaAdmin() {
  const escuro = useState('admin-tema-escuro', () => false)

  function aplicar() {
    if (import.meta.client) {
      document.documentElement.classList.toggle('dark', escuro.value)
    }
  }

  onMounted(() => {
    const salvo = localStorage.getItem('sampa-admin-tema')
    escuro.value = salvo ? salvo === 'escuro' : window.matchMedia('(prefers-color-scheme: dark)').matches
    aplicar()
  })

  onUnmounted(() => {
    if (import.meta.client) document.documentElement.classList.remove('dark')
  })

  function alternar() {
    escuro.value = !escuro.value
    localStorage.setItem('sampa-admin-tema', escuro.value ? 'escuro' : 'claro')
    aplicar()
  }

  return { escuro, alternar }
}
