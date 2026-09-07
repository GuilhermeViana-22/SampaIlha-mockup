<script setup lang="ts">
/**
 * Chamada da newsletter na coluna lateral.
 *
 * O formulário saiu daqui e virou modal (`NewsletterModal`). Três campos
 * espremidos numa coluna de 300px, no meio de uma página de leitura, é o
 * formato que a pessoa passa direto: o widget agora faz o convite, e quem
 * aceita preenche numa caixa centralizada, sem o resto da página competindo.
 */
const aberto = ref(false)
</script>

<template>
  <div class="widget newsletter-widget">
    <div class="widget-title">
      <i class="fas fa-envelope" /> Newsletter
    </div>
    <p>Receba os principais destaques, cultura e notícias de todo o Brasil diretamente no seu e-mail.</p>

    <button class="nl-btn" type="button" @click="aberto = true">
      <i class="fas fa-paper-plane" /> Quero receber
    </button>

    <NewsletterModal :aberto="aberto" @fechar="aberto = false" />
  </div>
</template>
