<script setup lang="ts">
/** Layout do site público: ticker, cabeçalho, barra de categorias e rodapé. */
</script>

<template>
  <div>
    <HeaderBreakingNews />
    <HeaderPrincipal />
    <HeaderBarraCategorias />

    <slot />

    <FooterPrincipal />
  </div>
</template>
