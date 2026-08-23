<script setup lang="ts">
import { CONTATO } from '~/utils/navegacao'

/** Cabeçalho fixo: logo, navegação, busca e ações. */
const portal = usePortalStore()
</script>

<template>
  <header class="site-header">
    <div class="header-inner">
      <NuxtLink to="/" class="logo">
        <div class="logo__icon">
          <i class="fas fa-water" />
        </div>
        <div>
          <div class="logo__name">Sampa na Ilha</div>
          <div class="logo__tagline">{{ CONTATO.tagline }}</div>
        </div>
      </NuxtLink>

      <HeaderNavegacao />

      <div class="header-actions">
        <button class="btn-search" title="Buscar" aria-label="Buscar" @click="portal.alternarBusca()">
          <i class="fas fa-search" />
        </button>
        <NuxtLink class="btn-subscribe" to="/informacoes">
          <i class="fas fa-envelope-open-text" /> <span class="btn-subscribe__rotulo">Assinar</span>
        </NuxtLink>
        <button class="btn-menu" title="Menu" aria-label="Abrir menu" @click="portal.alternarMenu()">
          <i class="fas" :class="portal.menuAberto ? 'fa-times' : 'fa-bars'" />
        </button>
      </div>
    </div>

    <HeaderBusca />
    <HeaderMenuMobile />
  </header>
</template>
