<script setup lang="ts">
const newsletter = useNewsletterStore()

const nome = ref('')
const email = ref('')

async function enviar() {
  const ok = await newsletter.inscrever(nome.value, email.value)
  if (ok) {
    nome.value = ''
    email.value = ''
  }
}
</script>

<template>
  <div class="widget newsletter-widget">
    <div class="widget-title">
      <i class="fas fa-envelope" /> Newsletter
    </div>
    <p>Receba os principais destaques, cultura e notícias de todo o Brasil diretamente no seu e-mail.</p>

    <form class="nl-form" @submit.prevent="enviar">
      <input v-model="nome" type="text" class="nl-input" placeholder="Seu nome">
      <input v-model="email" type="email" class="nl-input" placeholder="Seu e-mail" required>
      <button class="nl-btn" type="submit" :disabled="newsletter.enviando">
        <i class="fas" :class="newsletter.enviando ? 'fa-spinner fa-spin' : 'fa-paper-plane'" />
        {{ newsletter.enviando ? 'Enviando…' : 'Quero receber' }}
      </button>
    </form>

    <p v-if="newsletter.mensagem" style="margin-top:10px;color:var(--verde);font-weight:600;font-size:.82rem;">
      <i class="fas fa-circle-check" /> {{ newsletter.mensagem }}
    </p>
    <p v-if="newsletter.erro" style="margin-top:10px;color:var(--vermelho);font-weight:600;font-size:.82rem;">
      <i class="fas fa-circle-exclamation" /> {{ newsletter.erro }}
    </p>
  </div>
</template>
