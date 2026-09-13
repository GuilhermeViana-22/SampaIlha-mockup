<script setup lang="ts">
/**
 * Cabeçalho fixo: logo, navegação, busca e ações.
 *
 * Ao lado da imagem não vai texto nenhum. A arte da marca já traz "Sampa na
 * Ilha" e "Portal de Notícias" escritos nela, então o rótulo que ficava aqui
 * repetia a mesma frase duas vezes, uma em imagem e outra em texto. O espaço
 * que sobrou virou tamanho de logo, no desktop e no celular.
 */
const portal = usePortalStore()
const marca = useMarcaStore()
</script>

<template>
  <header class="site-header">
    <div class="header-inner">
      <NuxtLink to="/" class="logo">
        <img :src="marca.logo" class="logo__img" alt="Portal Sampa na Ilha" width="235" height="240">
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
        <NuxtLink class="btn-subscribe" to="/informacoes">
          <i class="fas fa-envelope-open-text" /> <span class="btn-subscribe__rotulo">Assinar</span>
        </NuxtLink>
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
