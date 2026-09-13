<script setup lang="ts">
/**
 * Cabeçalho fixo: logo, navegação, busca e ações.
 *
 * Ao lado da imagem da marca vai "Portal de Notícias", em caixa alta e no
 * verde do tema. O mesmo rótulo aparece no rodapé, lá em branco — é a mesma
 * classe, com a cor trocada pelo contraste do rodapé.
 *
 * O botão "Assinar" saiu daqui: levava para /informacoes, que está desligada
 * por enquanto (ver `ignore` no nuxt.config). O markup dele está no histórico,
 * em `git show f73ea29:app/components/header/Principal.vue`.
 */
const portal = usePortalStore()
const marca = useMarcaStore()
</script>

<template>
  <header class="site-header">
    <div class="header-inner">
      <NuxtLink to="/" class="logo">
        <img :src="marca.logo" class="logo__img" alt="Portal Sampa na Ilha" width="235" height="240">
        <span class="logo__portal">Portal de Notícias</span>
      </NuxtLink>

      <HeaderNavegacao />

      <div class="header-actions">
        <button
          class="btn-search"
          type="button"
          :title="portal.buscaAberta ? 'Fechar busca' : 'Buscar'"
          :aria-label="portal.buscaAberta ? 'Fechar busca' : 'Buscar'"
          :aria-expanded="portal.buscaAberta"
          aria-controls="busca-portal"
          @click="portal.alternarBusca()"
        >
          <i class="fas" :class="portal.buscaAberta ? 'fa-times' : 'fa-search'" />
        </button>
        <button
          class="btn-menu"
          type="button"
          :title="portal.menuAberto ? 'Fechar menu' : 'Menu'"
          :aria-label="portal.menuAberto ? 'Fechar menu' : 'Abrir menu'"
          :aria-expanded="portal.menuAberto"
          aria-controls="menu-mobile"
          @click="portal.alternarMenu()"
        >
          <i class="fas" :class="portal.menuAberto ? 'fa-times' : 'fa-bars'" />
        </button>
      </div>
    </div>

    <HeaderBusca />
    <HeaderMenuMobile />
  </header>
</template>
