<script setup lang="ts">
/**
 * As cores escolhidas no painel entram como um <style> no <head>, sobrepondo
 * os valores padrão declarados em `assets/css/portal/base.css`.
 */
const tema = useTemaStore()
const config = useRuntimeConfig()
const rota = useRoute()

useHead(() => ({
  style: [{ id: 'tema-portal', textContent: tema.css }],
}))

/**
 * Base de compartilhamento para o site inteiro.
 *
 * Vale para as listagens e as páginas institucionais, que não têm foto
 * própria; a página de matéria sobrescreve título, descrição e imagem pelo
 * `useSeoConteudo`. Sem este bloco, uma listagem compartilhada no Facebook
 * caía no card sem imagem nenhuma.
 */
useSeoMeta({
  ogSiteName: config.public.siteName,
  ogLocale: 'pt_BR',
  ogType: 'website',
  ogUrl: () => `${(config.public.siteUrl || '').replace(/\/$/, '')}${rota.path}`,
  ogImage: () => `${(config.public.siteUrl || '').replace(/\/$/, '')}/og-padrao.jpg`,
  ogImageAlt: config.public.siteName,
  twitterCard: 'summary_large_image',
  twitterImage: () => `${(config.public.siteUrl || '').replace(/\/$/, '')}/og-padrao.jpg`,
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
