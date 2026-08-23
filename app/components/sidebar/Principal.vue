<script setup lang="ts">
/** Coluna lateral do portal — a ordem dos widgets é definida aqui. */
withDefaults(defineProps<{
  tempo?: boolean
  maisLidos?: boolean
  dicas?: boolean
  newsletter?: boolean
  tags?: boolean
  anuncio?: boolean
}>(), {
  tempo: true,
  maisLidos: true,
  dicas: true,
  newsletter: true,
  tags: true,
  anuncio: true,
})
</script>

<template>
  <aside class="sidebar">
    <SidebarWidgetTempo v-if="tempo" />
    <SidebarWidgetMaisLidos v-if="maisLidos" />
    <DicasWidget v-if="dicas" />
    <SidebarWidgetNewsletter v-if="newsletter" />
    <SidebarWidgetTags v-if="tags" />
    <SidebarWidgetAnuncio v-if="anuncio" />
    <slot />
  </aside>
</template>
