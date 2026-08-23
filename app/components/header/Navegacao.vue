<script setup lang="ts">
import { MENU_PRINCIPAL } from '~/utils/navegacao'

const rota = useRoute()

function ativo(para: string) {
  return para === '/' ? rota.path === '/' : rota.path.startsWith(para)
}
</script>

<template>
  <nav>
    <div v-for="item in MENU_PRINCIPAL" :key="item.para" class="nav-item">
      <NuxtLink class="nav-link" :class="{ active: ativo(item.para) }" :to="item.para">
        {{ item.rotulo }}
        <i v-if="item.filhos" class="fas fa-chevron-down" />
      </NuxtLink>

      <div v-if="item.filhos" class="dropdown-menu">
        <NuxtLink v-for="filho in item.filhos" :key="filho.para" :to="filho.para">
          <i :class="filho.icone" /> {{ filho.rotulo }}
        </NuxtLink>
      </div>
    </div>
  </nav>
</template>
