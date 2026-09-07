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

// A checagem vem do `useMenuPrincipal`, o mesmo lugar que o menu de cima usa —
// é o que garante que os dois acendam a mesma editoria ao mesmo tempo. Ela
// compara o caminho inteiro: `rota.params.slug` se chama igual em
// `/regioes/[slug]`, então a região "norte" acendia a editoria "norte".
const { categoriaAtiva, rotaDaCategoria } = useMenuPrincipal()

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
    <nav ref="trilho" class="cat-nav__inner" aria-label="Categorias" @scroll.passive="medir">
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
        :class="{ active: categoriaAtiva(categoria.slug) }"
        :aria-current="categoriaAtiva(categoria.slug) ? 'page' : undefined"
        :to="rotaDaCategoria(categoria.slug)"
      >
        <i :class="categoria.icone" /> {{ categoria.nome }}
      </NuxtLink>
    </nav>
  </div>
</template>
