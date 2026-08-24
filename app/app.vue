<script setup lang="ts">
/**
 * As cores escolhidas no painel entram como um <style> no <head>, sobrepondo
 * os valores padrão declarados em `assets/css/portal/base.css`.
 */
const tema = useTemaStore()

useHead(() => ({
  style: [{ id: 'tema-portal', textContent: tema.css }],
}))
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
