<script setup lang="ts">
import { useElementSize } from '@vueuse/core'

/**
 * Barra de consentimento de cookies, no rodapé da janela.
 *
 * Fica sobre o conteúdo em vez de empurrá-lo: quem chega por uma matéria
 * compartilhada precisa ver o texto da matéria, não uma faixa de aviso onde
 * esperava a manchete. Também não bloqueia a página — o portal é aberto, e
 * exigir a decisão antes de ler transformaria o consentimento em pedágio.
 */
const { avisoVisivel, painelAberto, rascunho, aceitarTodos, rejeitarOpcionais, decidir } = useConsentimentoCookies()
const { abrir: abrirDocumento } = useDocumentosLegais()

const barra = useTemplateRef<HTMLElement>('barra')
const { height } = useElementSize(barra, undefined, { box: 'border-box' })

/**
 * O botão "voltar ao topo" mora no mesmo canto. Publicar a altura da barra
 * como variável de CSS deixa ele subir sozinho pelo tanto exato que a barra
 * ocupa — que muda com o texto quebrando no celular e com o painel aberto.
 */
watchEffect(() => {
  if (import.meta.server) return
  const raiz = document.documentElement
  if (avisoVisivel.value && height.value) raiz.style.setProperty('--altura-aviso-cookies', `${Math.round(height.value)}px`)
  else raiz.style.removeProperty('--altura-aviso-cookies')
})

onBeforeUnmount(() => document.documentElement.style.removeProperty('--altura-aviso-cookies'))

const CATEGORIAS = [
  {
    chave: 'analise' as const,
    titulo: 'Audiência e desempenho',
    descricao: 'Contam quantas pessoas leram cada matéria e onde o site trava. Números agregados, sem identificar quem leu.',
  },
  {
    chave: 'marketing' as const,
    titulo: 'Publicidade',
    descricao: 'Permitem medir campanhas e anúncios de parceiros. Sem eles, os anúncios continuam aparecendo, só não são medidos.',
  },
]
</script>

<template>
  <Transition name="aviso-cookies">
    <section
      v-if="avisoVisivel"
      ref="barra"
      class="aviso-cookies"
      role="dialog"
      aria-labelledby="aviso-cookies-titulo"
      aria-describedby="aviso-cookies-texto"
    >
      <div class="aviso-cookies__conteudo">
        <div class="aviso-cookies__texto">
          <h2 id="aviso-cookies-titulo">
            <i class="fas fa-cookie-bite" /> Este site usa cookies
          </h2>
          <p id="aviso-cookies-texto">
            Usamos cookies necessários para o portal funcionar e, com a sua autorização, cookies de
            audiência e publicidade. Você pode escolher o que aceitar e mudar de ideia quando quiser.
            <!-- Abre em modal, sobre a barra: a decisão sobre cookies é tomada
                 aqui mesmo, e trocar de página perderia o aviso de vista. -->
            <button type="button" class="aviso-cookies__link" @click="abrirDocumento('privacidade')">
              Política de Privacidade
            </button>
          </p>
        </div>

        <div class="aviso-cookies__acoes">
          <button type="button" class="aviso-cookies__btn" @click="painelAberto = !painelAberto">
            <i class="fas fa-sliders" /> Personalizar
          </button>
          <button type="button" class="aviso-cookies__btn" @click="rejeitarOpcionais()">
            Rejeitar opcionais
          </button>
          <button type="button" class="aviso-cookies__btn aviso-cookies__btn--principal" @click="aceitarTodos()">
            Aceitar todos
          </button>
        </div>
      </div>

      <div v-if="painelAberto" class="aviso-cookies__painel">
        <div class="aviso-cookies__categoria">
          <label class="aviso-cookies__interruptor">
            <input type="checkbox" checked disabled>
            <span>Necessários <em>sempre ativos</em></span>
          </label>
          <p>Sessão, preferências de exibição e segurança. Sem eles o portal não funciona, então não há o que consentir.</p>
        </div>

        <div v-for="categoria in CATEGORIAS" :key="categoria.chave" class="aviso-cookies__categoria">
          <label class="aviso-cookies__interruptor">
            <input v-model="rascunho[categoria.chave]" type="checkbox">
            <span>{{ categoria.titulo }}</span>
          </label>
          <p>{{ categoria.descricao }}</p>
        </div>

        <div class="aviso-cookies__acoes">
          <button
            type="button"
            class="aviso-cookies__btn aviso-cookies__btn--principal"
            @click="decidir({ ...rascunho })"
          >
            Salvar preferências
          </button>
        </div>
      </div>
    </section>
  </Transition>
</template>
