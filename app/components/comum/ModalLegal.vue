<script setup lang="ts">
import type { ChaveDocumentoLegal } from '~/utils/legal'
import { DOCUMENTOS_LEGAIS } from '~/utils/legal'
import { CONTATO } from '~/utils/navegacao'

/**
 * Termos de Uso e Política de Privacidade, em modal.
 *
 * Montado uma vez no layout do site público; quem abre é o rodapé ou o aviso
 * de cookies, pelo `useDocumentosLegais`. Vai para o `<body>` via `Teleport`
 * porque o gatilho mora dentro do rodapé, onde o modal herdaria o
 * empilhamento da faixa escura e apareceria preso ao fim da página.
 *
 * Os dois documentos dividem a mesma caixa e trocam por abas: quem abre a
 * Política quase sempre quer conferir os Termos em seguida, e fechar para
 * reabrir no outro link é uma volta desnecessária.
 */
const { aberto, documento, abrir, fechar } = useDocumentosLegais()

const ABAS: { chave: ChaveDocumentoLegal, rotulo: string }[] = [
  { chave: 'termos', rotulo: DOCUMENTOS_LEGAIS.termos.titulo },
  { chave: 'privacidade', rotulo: DOCUMENTOS_LEGAIS.privacidade.titulo },
]

const caixa = useTemplateRef<HTMLElement>('caixa')
const corpo = useTemplateRef<HTMLElement>('corpo')
/** Para devolver o foco ao link do rodapé quando o modal fecha. */
let gatilho: HTMLElement | null = null

function aoTeclar(evento: KeyboardEvent) {
  if (evento.key === 'Escape') fechar()
}

watch(aberto, async (chave, anterior) => {
  if (!import.meta.client) return

  document.body.style.overflow = chave ? 'hidden' : ''

  if (!chave) {
    window.removeEventListener('keydown', aoTeclar)
    gatilho?.focus()
    gatilho = null
    return
  }

  if (!anterior) {
    gatilho = document.activeElement as HTMLElement | null
    window.addEventListener('keydown', aoTeclar)
  }

  await nextTick()
  // O foco vai para a caixa, não para o botão de fechar: leitor de tela anuncia
  // o título do documento em vez de "fechar", e o teclado já rola o texto.
  caixa.value?.focus()
  // Trocar de aba com o texto no meio faz a leitura recomeçar do início.
  if (corpo.value) corpo.value.scrollTop = 0
})

onUnmounted(() => {
  if (!import.meta.client) return
  document.body.style.overflow = ''
  window.removeEventListener('keydown', aoTeclar)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="legal-modal">
      <div
        v-if="documento"
        class="legal-modal"
        @click.self="fechar()"
      >
        <div
          ref="caixa"
          class="legal-modal__caixa"
          role="dialog"
          aria-modal="true"
          aria-labelledby="legal-modal-titulo"
          tabindex="-1"
        >
          <header class="legal-modal__topo">
            <div class="legal-modal__selo">
              <i :class="documento.icone" />
            </div>
            <div class="legal-modal__cabecalho">
              <h2 id="legal-modal-titulo" class="legal-modal__titulo">
                {{ documento.titulo }}
              </h2>
              <p class="legal-modal__resumo">
                {{ documento.resumo }}
              </p>
              <p class="legal-modal__vigencia">
                <i class="fas fa-clock-rotate-left" /> Última atualização: {{ documento.atualizadoEm }}
              </p>
            </div>
            <button class="legal-modal__fechar" type="button" aria-label="Fechar" @click="fechar()">
              <i class="fas fa-times" />
            </button>
          </header>

          <nav class="legal-modal__abas" aria-label="Documentos do portal">
            <button
              v-for="aba in ABAS"
              :key="aba.chave"
              type="button"
              class="legal-modal__aba"
              :class="{ 'legal-modal__aba--ativa': aba.chave === documento.chave }"
              :aria-current="aba.chave === documento.chave ? 'true' : undefined"
              @click="abrir(aba.chave)"
            >
              {{ aba.rotulo }}
            </button>
          </nav>

          <div ref="corpo" class="legal-modal__corpo" tabindex="0">
            <section v-for="secao in documento.secoes" :key="secao.titulo" class="legal-secao">
              <h3>{{ secao.titulo }}</h3>
              <p v-for="(paragrafo, i) in secao.paragrafos" :key="i">
                {{ paragrafo }}
              </p>
              <ul v-if="secao.lista">
                <li v-for="(item, i) in secao.lista" :key="i">
                  {{ item }}
                </li>
              </ul>
              <p v-if="secao.nota">
                {{ secao.nota }}
              </p>
            </section>
          </div>

          <footer class="legal-modal__rodape">
            <p>
              <i class="fas fa-envelope" />
              Dúvidas sobre este documento?
              <a :href="`mailto:${CONTATO.email}`">{{ CONTATO.email }}</a>
            </p>
            <button class="legal-modal__btn" type="button" @click="fechar()">
              Entendi
            </button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
