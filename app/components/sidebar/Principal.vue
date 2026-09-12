<script setup lang="ts">
/** Coluna lateral do portal — a ordem dos widgets é definida aqui. */
withDefaults(defineProps<{
  tempo?: boolean
  maisLidos?: boolean
  dicas?: boolean
  newsletter?: boolean
  tags?: boolean
  anuncio?: boolean
  apoio?: boolean
}>(), {
  tempo: true,
  maisLidos: true,
  dicas: true,
  newsletter: true,
  tags: true,
  anuncio: true,
  apoio: true,
})
</script>

<template>
  <aside class="sidebar">
    <SidebarWidgetTempo v-if="tempo" />
    <SidebarWidgetMaisLidos v-if="maisLidos" />
    <DicasWidget v-if="dicas" />
    <SidebarWidgetNewsletter v-if="newsletter" />
    <SidebarWidgetTags v-if="tags" />
    <!-- O apoio vem antes da publicidade: é o portal falando em nome
         próprio, e sair depois do espaço vendido faria os dois se lerem
         como a mesma coisa. -->
    <SidebarWidgetApoio v-if="apoio" />
    <SidebarWidgetAnuncio v-if="anuncio" />
    <slot />
  </aside>
</template>
