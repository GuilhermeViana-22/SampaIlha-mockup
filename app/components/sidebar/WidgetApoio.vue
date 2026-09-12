<script setup lang="ts">
/**
 * Bloco "apoie o portal" na coluna lateral.
 *
 * Só existe quando o administrador ligou e informou um destino — link ou chave
 * Pix. Sem isso, o widget não desenha nada: um convite para apoiar que não
 * leva a lugar nenhum é pior do que não ter convite.
 *
 * Fica separado do card de publicidade de propósito. São coisas diferentes:
 * um é espaço vendido, o outro é o portal falando em nome próprio — e misturar
 * os dois faria o leitor ler o pedido de apoio como mais um anúncio.
 */
const apoio = useApoioStore()
await apoio.carregar()

const copiada = ref(false)
let devolver: ReturnType<typeof setTimeout> | undefined

async function copiarPix() {
  const chave = apoio.dados.chavePix
  if (!chave) return

  try {
    await navigator.clipboard.writeText(chave)
    copiada.value = true
    clearTimeout(devolver)
    // O rótulo volta sozinho: sem isso, o botão fica dizendo "Copiada!" para
    // sempre e o leitor não sabe se o segundo clique funcionou.
    devolver = setTimeout(() => { copiada.value = false }, 2400)
  }
  catch {
    // Navegador sem permissão para a área de transferência: a chave continua
    // na tela, selecionável — que é como se copiava antes de existir a API.
    copiada.value = false
  }
}

onBeforeUnmount(() => clearTimeout(devolver))
</script>

<template>
  <div v-if="apoio.visivel" class="widget apoio-widget">
    <h3 class="widget-title">
      <i class="fas fa-heart" /> {{ apoio.dados.titulo }}
    </h3>

    <p v-if="apoio.dados.descricao" class="apoio-widget__texto">
      {{ apoio.dados.descricao }}
    </p>

    <a
      v-if="apoio.dados.url"
      class="apoio-widget__botao"
      :href="apoio.dados.url"
      target="_blank"
      rel="noopener"
    >
      <i class="fas fa-hand-holding-heart" /> {{ apoio.dados.rotuloBotao }}
    </a>

    <div v-if="apoio.dados.chavePix" class="apoio-widget__pix">
      <span class="apoio-widget__rotulo">Chave Pix</span>
      <code class="apoio-widget__chave">{{ apoio.dados.chavePix }}</code>
      <button class="apoio-widget__copiar" type="button" @click="copiarPix()">
        <i class="fas" :class="copiada ? 'fa-check' : 'fa-copy'" />
        {{ copiada ? 'Copiada!' : 'Copiar' }}
      </button>
    </div>

    <p v-if="apoio.dados.observacao" class="apoio-widget__nota">
      {{ apoio.dados.observacao }}
    </p>
  </div>
</template>
