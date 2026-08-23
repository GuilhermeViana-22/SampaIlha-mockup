<script setup lang="ts">
/** Layout da tela de login: fundo com a identidade do portal. */
</script>

<template>
  <div class="admin-shell relative flex min-h-screen items-center justify-center overflow-hidden p-4">
    <div class="absolute inset-0 bg-gradient-to-br from-[#0a4fa8] via-[#0f6bb8] to-[#00b4d8]" />
    <div class="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_20%_20%,white_1px,transparent_1px)] [background-size:28px_28px]" />
    <div class="relative w-full max-w-md">
      <slot />
    </div>
    <Toaster position="top-right" rich-colors />
  </div>
</template>
