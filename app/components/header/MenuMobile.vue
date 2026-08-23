<script setup lang="ts">
import { MENU_PRINCIPAL } from '~/utils/navegacao'

const portal = usePortalStore()
const rota = useRoute()

// Fecha o menu sempre que a rota muda.
watch(() => rota.fullPath, () => portal.fecharMenu())
</script>

<template>
  <div class="mobile-nav" :class="{ 'is-open': portal.menuAberto }">
    <template v-for="item in MENU_PRINCIPAL" :key="item.para">
      <NuxtLink :to="item.para" :class="{ active: rota.path === item.para }">
        <i :class="item.icone" /> {{ item.rotulo }}
      </NuxtLink>
      <div v-if="item.filhos" class="mobile-nav__group">
        <span>{{ item.rotulo }}</span>
        <NuxtLink v-for="filho in item.filhos" :key="filho.para" :to="filho.para">
          <i :class="filho.icone" /> {{ filho.rotulo }}
        </NuxtLink>
      </div>
    </template>

    <div class="mobile-nav__group">
      <span>Regiões</span>
      <NuxtLink v-for="regiao in portal.regioes" :key="regiao.slug" :to="`/regioes/${regiao.slug}`">
        <i :class="regiao.icone" /> {{ regiao.nome }}
      </NuxtLink>
    </div>
  </div>
</template>
