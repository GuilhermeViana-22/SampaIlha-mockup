<script setup lang="ts">
/** Layout do site público: ticker, cabeçalho, barra de categorias e rodapé. */
</script>

<template>
  <div class="portal-tema">
    <!-- Toda navegação busca conteúdo novo na API; a barra de progresso conta
         isso ao leitor em vez de deixar a página parada sem explicação. -->
    <NuxtLoadingIndicator color="var(--cor-destaque)" :height="3" />

    <a class="pular-conteudo" href="#conteudo">Ir para o conteúdo</a>

    <HeaderBreakingNews />
    <HeaderPrincipal />
    <HeaderBarraCategorias />

    <div id="conteudo" tabindex="-1">
      <slot />
    </div>

    <FooterPrincipal />
    <ComumVoltarAoTopo />
  </div>
</template>
