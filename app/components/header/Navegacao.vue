<script setup lang="ts">
import { MENU_PRINCIPAL } from '~/utils/navegacao'

const rota = useRoute()

function ativo(para: string) {
  return para === '/' ? rota.path === '/' : rota.path.startsWith(para)
}
</script>

<template>
  <nav class="nav-principal" aria-label="Navegação principal">
    <div v-for="item in MENU_PRINCIPAL" :key="item.para" class="nav-item">
      <NuxtLink
        class="nav-link"
        :class="{ active: ativo(item.para) }"
        :aria-current="ativo(item.para) ? 'page' : undefined"
        :to="item.para"
      >
        {{ item.rotulo }}
        <i v-if="item.filhos" class="fas fa-chevron-down" aria-hidden="true" />
      </NuxtLink>

      <!-- O submenu também abre no foco do teclado (`:focus-within` no CSS),
           não só no hover do mouse. -->
      <div v-if="item.filhos" class="dropdown-menu">
        <NuxtLink
          v-for="filho in item.filhos"
          :key="filho.para"
          :to="filho.para"
          :class="{ active: rota.path === filho.para }"
          :aria-current="rota.path === filho.para ? 'page' : undefined"
        >
          <i :class="filho.icone" /> {{ filho.rotulo }}
        </NuxtLink>
      </div>
    </div>
  </nav>
</template>
