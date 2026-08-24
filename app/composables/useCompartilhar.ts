interface RedeCompartilhamento {
  rotulo: string
  icone: string
  classe: string
  /** Link direto de share. Ausente quando a rede exige uma ação (Instagram). */
  url?: string
  acao?: () => void | Promise<void>
}

/** Links de compartilhamento social usados na página de matéria. */
export function useCompartilhar(titulo: MaybeRefOrGetter<string>) {
  const rota = useRoute()
  const config = useRuntimeConfig()
  const copiado = ref(false)

  const url = computed(() => `${config.public.siteUrl}${rota.fullPath}`)
  const texto = computed(() => encodeURIComponent(toValue(titulo)))
  const alvo = computed(() => encodeURIComponent(url.value))

  async function copiar(): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(url.value)
      return true
    }
    catch {
      return false
    }
  }

  /**
   * O Instagram não tem URL de compartilhamento como as outras redes. No celular
   * o menu nativo do sistema resolve (o Instagram aparece entre as opções); no
   * desktop copiamos o link e abrimos o site para quem quiser colar num story.
   */
  async function compartilharNoInstagram() {
    if (navigator.share) {
      try {
        await navigator.share({ title: toValue(titulo), url: url.value })
        return
      }
      catch {
        // Cancelado pelo usuário ou indisponível: segue para o plano B.
      }
    }

    copiado.value = await copiar()
    if (copiado.value) setTimeout(() => (copiado.value = false), 2200)
    window.open('https://www.instagram.com/', '_blank', 'noopener')
  }

  const redes = computed<RedeCompartilhamento[]>(() => [
    { rotulo: 'WhatsApp', icone: 'fab fa-whatsapp', classe: 'share-btn--whatsapp', url: `https://wa.me/?text=${texto.value}%20${alvo.value}` },
    { rotulo: 'Facebook', icone: 'fab fa-facebook-f', classe: 'share-btn--facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${alvo.value}` },
    { rotulo: 'Twitter / X', icone: 'fab fa-x-twitter', classe: 'share-btn--x', url: `https://x.com/intent/tweet?text=${texto.value}&url=${alvo.value}` },
    { rotulo: 'Instagram', icone: 'fab fa-instagram', classe: 'share-btn--instagram', acao: compartilharNoInstagram },
  ])

  async function copiarLink() {
    copiado.value = await copiar()
    if (copiado.value) setTimeout(() => (copiado.value = false), 2200)
  }

  return { url, redes, copiado, copiarLink }
}
