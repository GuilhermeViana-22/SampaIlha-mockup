<script setup lang="ts">
import { onKeyStroke, useScrollLock } from '@vueuse/core'
import { MENU_PRINCIPAL } from '~/utils/navegacao'

const portal = usePortalStore()
const rota = useRoute()

// Fecha o menu sempre que a rota muda.
watch(() => rota.fullPath, () => portal.fecharMenu())

/** Com o menu aberto a página atrás não rola — o toque fica preso na gaveta. */
const travado = useScrollLock(import.meta.client ? document.body : null)
watch(() => portal.menuAberto, aberto => (travado.value = aberto))
onBeforeUnmount(() => (travado.value = false))

onKeyStroke('Escape', () => {
  if (portal.menuAberto) portal.fecharMenu()
})

function ativo(para: string) {
  return para === '/' ? rota.path === '/' : rota.path.startsWith(para)
}
</script>

<template>
  <div>
    <!-- Véu: tocar fora fecha o menu, o gesto que todo mundo já espera. Vai
         para o body para escurecer a página sem escurecer o cabeçalho. -->
    <Teleport to="body">
      <div
        v-if="portal.menuAberto"
        class="mobile-nav__veu"
        aria-hidden="true"
        @click="portal.fecharMenu()"
      />
    </Teleport>

    <nav
      id="menu-mobile"
      class="mobile-nav"
      :class="{ 'is-open': portal.menuAberto }"
      aria-label="Menu principal"
    >
      <template v-for="item in MENU_PRINCIPAL" :key="item.para">
        <NuxtLink
          :to="item.para"
          :class="{ active: ativo(item.para) }"
          :aria-current="ativo(item.para) ? 'page' : undefined"
        >
          <i :class="item.icone" /> {{ item.rotulo }}
        </NuxtLink>
        <div v-if="item.filhos" class="mobile-nav__group">
          <span>{{ item.rotulo }}</span>
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
      </template>

      <div v-if="portal.categoriasDoMenu.length" class="mobile-nav__group">
        <span>Editorias</span>
        <NuxtLink
          v-for="categoria in portal.categoriasDoMenu"
          :key="categoria.slug"
          :to="`/categoria/${categoria.slug}`"
          :class="{ active: rota.params.slug === categoria.slug }"
          :aria-current="rota.params.slug === categoria.slug ? 'page' : undefined"
        >
          <i :class="categoria.icone" /> {{ categoria.nome }}
        </NuxtLink>
      </div>

      <div v-if="portal.regioes.length" class="mobile-nav__group">
        <span>Regiões</span>
        <NuxtLink
          v-for="regiao in portal.regioes"
          :key="regiao.slug"
          :to="`/regioes/${regiao.slug}`"
          :class="{ active: rota.params.slug === regiao.slug }"
          :aria-current="rota.params.slug === regiao.slug ? 'page' : undefined"
        >
          <i :class="regiao.icone" /> {{ regiao.nome }}
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>
