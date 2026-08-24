<script setup lang="ts">
/** Layout do site público: ticker, cabeçalho, barra de categorias e rodapé. */
</script>

<template>
  <div class="portal-tema">
    <HeaderBreakingNews />
    <HeaderPrincipal />
    <HeaderBarraCategorias />

    <slot />

    <FooterPrincipal />
  </div>
</template>
