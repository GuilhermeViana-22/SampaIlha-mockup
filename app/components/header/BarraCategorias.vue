<script setup lang="ts">
const portal = usePortalStore()
const rota = useRoute()
</script>

<template>
  <div class="cat-nav">
    <div class="cat-nav__inner">
      <NuxtLink class="cat-link" :class="{ active: rota.path === '/noticias' }" to="/noticias">
        <i class="fas fa-th-large" /> Todos
      </NuxtLink>
      <NuxtLink
        v-for="categoria in portal.categoriasDoMenu"
        :key="categoria.slug"
        class="cat-link"
        :class="{ active: rota.params.slug === categoria.slug }"
        :to="`/categoria/${categoria.slug}`"
      >
        <i :class="categoria.icone" /> {{ categoria.nome }}
      </NuxtLink>
    </div>
  </div>
</template>
