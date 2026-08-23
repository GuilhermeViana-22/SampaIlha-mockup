<script setup lang="ts">
import type { NuxtError } from '#app'

/** Página de erro do portal (404 e demais falhas). */
const props = defineProps<{ error: NuxtError }>()

// Nas rotas do painel o erro aparece sem o cabeçalho/rodapé do portal.
const rota = useRoute()
const admin = computed(() => rota.path.startsWith('/admin'))

useSeoMeta({
  title: () => `${props.error.statusCode} — Portal Sampa na Ilha`,
  robots: 'noindex, nofollow',
})
</script>

<template>
  <div>
    <template v-if="!admin">
      <HeaderPrincipal />
      <HeaderBarraCategorias />
    </template>

    <div class="container">
      <section class="page-hero" style="margin:32px 0;border-radius:var(--raio);">
        <span class="badge badge--gray">
          <i class="fas fa-triangle-exclamation" /> Erro {{ error.statusCode }}
        </span>
        <h1>{{ error.statusCode === 404 ? 'Página não encontrada' : 'Algo deu errado' }}</h1>
        <p>
          {{ error.statusCode === 404
            ? 'O endereço que você acessou não existe ou o conteúdo saiu do ar.'
            : (error.statusMessage || 'Tente novamente em alguns instantes.') }}
        </p>
      </section>

      <div style="display:flex;gap:12px;justify-content:center;padding-bottom:56px;flex-wrap:wrap;">
        <button class="btn-subscribe" @click="clearError({ redirect: '/' })">
          <i class="fas fa-house" /> Voltar para a home
        </button>
        <NuxtLink class="tag" to="/noticias">
          <i class="fas fa-newspaper" /> Ver as notícias
        </NuxtLink>
        <NuxtLink class="tag" to="/dicas">
          <i class="fas fa-lightbulb" /> Ver as dicas
        </NuxtLink>
      </div>
    </div>

    <FooterPrincipal v-if="!admin" />
  </div>
</template>
