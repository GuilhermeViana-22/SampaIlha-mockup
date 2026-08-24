<script setup lang="ts">
/**
 * Faixa de editorias sob o cabeçalho. É rolável na horizontal desde sempre,
 * mas nada indicava isso: no celular a lista parecia terminar na borda da
 * tela. Agora as bordas ganham sombra enquanto houver editoria fora de vista,
 * e a editoria aberta é trazida para o campo de visão.
 */
const portal = usePortalStore()
const rota = useRoute()

const trilho = ref<HTMLElement | null>(null)
const temAntes = ref(false)
const temDepois = ref(false)

function medir() {
  const el = trilho.value
  if (!el) return
  temAntes.value = el.scrollLeft > 4
  temDepois.value = el.scrollWidth - el.clientWidth - el.scrollLeft > 4
}

function mostrarAtiva() {
  const el = trilho.value
  const ativa = el?.querySelector<HTMLElement>('.cat-link.active')
  if (!el || !ativa) return
  el.scrollTo({
    left: Math.max(0, ativa.offsetLeft - (el.clientWidth - ativa.offsetWidth) / 2),
    behavior: 'smooth',
  })
}

function ehAtiva(slug: string) {
  return rota.params.slug === slug
}

onMounted(() => {
  medir()
  mostrarAtiva()
  window.addEventListener('resize', medir, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('resize', medir))

watch(() => rota.fullPath, () => nextTick(mostrarAtiva))
watch(() => portal.categoriasDoMenu.length, () => nextTick(medir))
</script>

<template>
  <div class="cat-nav" :class="{ 'cat-nav--antes': temAntes, 'cat-nav--depois': temDepois }">
    <nav ref="trilho" class="cat-nav__inner" aria-label="Editorias" @scroll.passive="medir">
      <NuxtLink
        class="cat-link"
        :class="{ active: rota.path === '/noticias' }"
        :aria-current="rota.path === '/noticias' ? 'page' : undefined"
        to="/noticias"
      >
        <i class="fas fa-th-large" /> Todos
      </NuxtLink>
      <NuxtLink
        v-for="categoria in portal.categoriasDoMenu"
        :key="categoria.slug"
        class="cat-link"
        :class="{ active: ehAtiva(categoria.slug) }"
        :aria-current="ehAtiva(categoria.slug) ? 'page' : undefined"
        :to="`/categoria/${categoria.slug}`"
      >
        <i :class="categoria.icone" /> {{ categoria.nome }}
      </NuxtLink>
    </nav>
  </div>
</template>
