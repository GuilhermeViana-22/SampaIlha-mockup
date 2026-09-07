<script setup lang="ts">
import { onKeyStroke, useScrollLock } from '@vueuse/core'

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

// Mesma resolução do menu de cima: editorias vindas do banco, um destino só
// por editoria e o mesmo estado ativo. A gaveta do celular não pode discordar
// do cabeçalho do desktop.
const { itens, categoriaAtiva, rotaDaCategoria } = useMenuPrincipal()
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
      <template v-for="item in itens" :key="item.chave">
        <NuxtLink
          :to="item.para"
          :class="{ active: item.ativo }"
          :aria-current="item.ativo ? 'page' : undefined"
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
        <span>Categorias</span>
        <NuxtLink
          v-for="categoria in portal.categoriasDoMenu"
          :key="categoria.slug"
          :to="rotaDaCategoria(categoria.slug)"
          :class="{ active: categoriaAtiva(categoria.slug) }"
          :aria-current="categoriaAtiva(categoria.slug) ? 'page' : undefined"
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
