/** Links de compartilhamento social usados na página de matéria. */
export function useCompartilhar(titulo: MaybeRefOrGetter<string>) {
  const rota = useRoute()
  const config = useRuntimeConfig()
  const copiado = ref(false)

  const url = computed(() => `${config.public.siteUrl}${rota.fullPath}`)
  const texto = computed(() => encodeURIComponent(toValue(titulo)))
  const alvo = computed(() => encodeURIComponent(url.value))

  const redes = computed(() => [
    { rotulo: 'WhatsApp', icone: 'fab fa-whatsapp', classe: 'share-btn--whatsapp', url: `https://wa.me/?text=${texto.value}%20${alvo.value}` },
    { rotulo: 'Facebook', icone: 'fab fa-facebook-f', classe: 'share-btn--facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${alvo.value}` },
    { rotulo: 'Twitter / X', icone: 'fab fa-x-twitter', classe: 'share-btn--x', url: `https://x.com/intent/tweet?text=${texto.value}&url=${alvo.value}` },
    { rotulo: 'Instagram', icone: 'fab fa-instagram', classe: 'share-btn--instagram', url: 'https://instagram.com' },
  ])

  async function copiarLink() {
    try {
      await navigator.clipboard.writeText(url.value)
      copiado.value = true
      setTimeout(() => (copiado.value = false), 2200)
    }
    catch {
      copiado.value = false
    }
  }

  return { url, redes, copiado, copiarLink }
}
