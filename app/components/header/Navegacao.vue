<script setup lang="ts">
/**
 * Menu principal do site público.
 *
 * As editorias vêm da API (ver `useMenuPrincipal`), então este menu e a barra
 * de categorias mostram sempre a mesma coisa e apontam para o mesmo lugar.
 *
 * O sublinhado é um elemento só, que desliza do item antigo para o novo em vez
 * de piscar de lugar. Ele mede a posição do link ativo no DOM porque os
 * rótulos vêm do banco: a largura de "Meio Ambiente" não dá para saber antes de
 * a fonte carregar e o texto existir na tela.
 */
const { itens } = useMenuPrincipal()
const rota = useRoute()

const trilho = ref<HTMLElement | null>(null)
const marcador = reactive({ esquerda: 0, largura: 0, visivel: false })

/**
 * Leva o sublinhado até um link. Sem link, ele some.
 *
 * A medida sai de `getBoundingClientRect`, e não de `offsetLeft`: cada link
 * mora dentro de um `.nav-item` com `position: relative` (é ele que ancora o
 * submenu), então o `offsetLeft` do link é relativo ao próprio item — daria
 * quase zero para todos, e o traço ficaria parado na ponta esquerda.
 */
function moverPara(link: HTMLElement | null | undefined) {
  const nav = trilho.value

  if (!nav || !link) {
    marcador.visivel = false
    return
  }

  const alvo = link.getBoundingClientRect()
  const barra = nav.getBoundingClientRect()

  // Largura zero e o menu escondido (no celular quem navega e a gaveta, e o
  // CSS troca esta barra por ela). Sem esta guarda sobraria um risco de 2px
  // preso na ponta esquerda do cabecalho.
  if (alvo.width === 0) {
    marcador.visivel = false
    return
  }

  marcador.esquerda = alvo.left - barra.left + nav.scrollLeft
  marcador.largura = alvo.width
  marcador.visivel = true
}

/** Volta o sublinhado para a página aberta. */
function medirMarcador() {
  moverPara(trilho.value?.querySelector<HTMLElement>('.nav-link.active'))
}

/**
 * O sublinhado acompanha o item sob o cursor e volta sozinho ao sair.
 *
 * É o que faz a barra parecer uma coisa só em vez de sete links soltos: o
 * traço percorre o caminho entre um item e outro, então o olho já sabe para
 * onde vai antes do clique. Vale também para o teclado (`focusin`), senão
 * quem navega com Tab perde a única pista de onde está.
 */
function aoApontar(evento: Event) {
  // `currentTarget` e nao `target`: o alvo pode ser a setinha dentro do link.
  moverPara(evento.currentTarget as HTMLElement)
}

onMounted(() => {
  medirMarcador()
  window.addEventListener('resize', medirMarcador, { passive: true })

  // A fonte troca depois do primeiro desenho e muda a largura dos rótulos; sem
  // remedir, o sublinhado fica alguns pixels fora do item.
  document.fonts?.ready.then(medirMarcador).catch(() => {})
})

onBeforeUnmount(() => window.removeEventListener('resize', medirMarcador))

// `nextTick` porque a classe `active` só troca depois de o Vue redesenhar.
watch(() => rota.fullPath, () => nextTick(medirMarcador))
watch(() => itens.value.length, () => nextTick(medirMarcador))
</script>

<template>
  <nav
    ref="trilho"
    class="nav-principal"
    aria-label="Navegação principal"
    @mouseleave="medirMarcador"
    @focusout="medirMarcador"
  >
    <div v-for="item in itens" :key="item.chave" class="nav-item">
      <NuxtLink
        class="nav-link"
        :class="{ active: item.ativo }"
        :aria-current="item.ativo ? 'page' : undefined"
        :to="item.para"
        @mouseenter="aoApontar"
        @focusin="aoApontar"
      >
        {{ item.rotulo }}
        <i v-if="item.filhos" class="fas fa-chevron-down" aria-hidden="true" />
      </NuxtLink>

      <!-- O submenu também abre no foco do teclado (`:focus-within` no CSS),
           não só no hover do mouse. -->
      <div v-if="item.filhos" class="dropdown-menu">
        <NuxtLink
          v-for="filho in item.filhos"
          :key="filho.para"
          :to="filho.para"
          :class="{ active: rota.path === filho.para }"
          :aria-current="rota.path === filho.para ? 'page' : undefined"
        >
          <i :class="filho.icone" /> {{ filho.rotulo }}
        </NuxtLink>
      </div>
    </div>

    <!-- Decorativo: quem usa leitor de tela já tem o `aria-current` do link. -->
    <span
      class="nav-marcador"
      aria-hidden="true"
      :style="{
        transform: `translateX(${marcador.esquerda}px)`,
        width: `${marcador.largura}px`,
        opacity: marcador.visivel ? 1 : 0,
      }"
    />
  </nav>
</template>
