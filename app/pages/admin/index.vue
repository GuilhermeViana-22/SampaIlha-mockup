<script setup lang="ts">
definePageMeta({ layout: 'auth' })

useSeoMeta({ title: 'Painel da Redação — Portal Sampa na Ilha', robots: 'noindex, nofollow' })

// Quem já está logado vai direto para o dashboard.
const auth = useAuthStore()
await auth.verificarSessao()
if (auth.autenticado) {
  await navigateTo('/admin/dashboard', { replace: true })
}
</script>

<template>
  <AdminLoginFormulario />
</template>
