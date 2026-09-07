<script setup lang="ts">
/**
 * Assinatura da newsletter, em modal.
 *
 * Vai para o `<body>` pelo `Teleport` porque o gatilho mora dentro da coluna
 * lateral: ali o modal herdaria o `overflow` e o empilhamento do widget, e a
 * caixa apareceria presa à coluna em vez de centralizada na tela.
 *
 * Pede nome e e-mail, e nada além disso. Cada campo a mais é uma pessoa a
 * menos que termina de preencher, e o resto o portal não precisa saber para
 * mandar a newsletter.
 */
const props = defineProps<{ aberto: boolean }>()
const emit = defineEmits<{ fechar: [] }>()

const newsletter = useNewsletterStore()

const nome = ref('')
const email = ref('')
const campoNome = ref<HTMLInputElement | null>(null)

function aoTeclar(evento: KeyboardEvent) {
  if (evento.key === 'Escape') emit('fechar')
}

// Esc fecha, a página atrás não rola e o cursor já chega no primeiro campo.
// O resultado da inscrição anterior é limpo na abertura: o aviso de sucesso
// vive na store, e sem isso o modal abriria mostrando a resposta da última vez.
watch(() => props.aberto, async (aberto) => {
  if (!import.meta.client) return

  document.body.style.overflow = aberto ? 'hidden' : ''

  if (!aberto) {
    window.removeEventListener('keydown', aoTeclar)
    return
  }

  newsletter.limpar()
  window.addEventListener('keydown', aoTeclar)
  await nextTick()
  campoNome.value?.focus()
})

onUnmounted(() => {
  if (!import.meta.client) return
  document.body.style.overflow = ''
  window.removeEventListener('keydown', aoTeclar)
})

async function enviar() {
  const ok = await newsletter.inscrever(nome.value, email.value)
  if (ok) {
    nome.value = ''
    email.value = ''
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="nl-modal">
      <div
        v-if="aberto"
        class="nl-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="nl-modal-titulo"
        @click.self="emit('fechar')"
      >
        <div class="nl-modal__caixa">
          <button class="nl-modal__fechar" type="button" aria-label="Fechar" @click="emit('fechar')">
            <i class="fas fa-times" />
          </button>

          <div class="nl-modal__selo">
            <i class="fas fa-envelope-open-text" />
          </div>

          <h2 id="nl-modal-titulo" class="nl-modal__titulo">
            Assine a newsletter
          </h2>
          <p class="nl-modal__slogan">
            Ao se inscrever você recebe de antemão as novidades do Portal Sampa na Ilha,
            direto no seu e-mail.
          </p>

          <div v-if="newsletter.mensagem" class="nl-modal__pronto">
            <i class="fas fa-circle-check" />
            <p>{{ newsletter.mensagem }}</p>
            <button class="nl-modal__btn" type="button" @click="emit('fechar')">
              Voltar para o portal
            </button>
          </div>

          <form v-else class="nl-modal__form" @submit.prevent="enviar">
            <label class="nl-modal__campo">
              <span>Nome</span>
              <input ref="campoNome" v-model="nome" type="text" placeholder="Como podemos te chamar" autocomplete="name">
            </label>

            <label class="nl-modal__campo">
              <span>E-mail</span>
              <input v-model="email" type="email" placeholder="seu@email.com.br" autocomplete="email" required>
            </label>

            <p v-if="newsletter.erro" class="nl-modal__erro">
              <i class="fas fa-circle-exclamation" /> {{ newsletter.erro }}
            </p>

            <button class="nl-modal__btn" type="submit" :disabled="newsletter.enviando">
              <i class="fas" :class="newsletter.enviando ? 'fa-spinner fa-spin' : 'fa-paper-plane'" />
              {{ newsletter.enviando ? 'Enviando…' : 'Quero receber' }}
            </button>

            <p class="nl-modal__nota">
              Só novidades do portal. Você pode sair da lista quando quiser.
            </p>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
