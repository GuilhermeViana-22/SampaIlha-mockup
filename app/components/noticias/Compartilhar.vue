<script setup lang="ts">
const props = withDefaults(defineProps<{ titulo: string, flutuante?: boolean }>(), { flutuante: false })
const { redes, copiado, copiarLink } = useCompartilhar(() => props.titulo)
</script>

<template>
  <div class="share-bar" :class="{ 'share-bar--floating': flutuante }">
    <span v-if="!flutuante" class="share-bar__label">Compartilhar:</span>

    <template v-for="rede in redes" :key="rede.rotulo">
      <!-- Instagram não tem URL de share: vira botão com o menu nativo do sistema. -->
      <button
        v-if="rede.acao"
        class="share-btn"
        :class="rede.classe"
        :title="`Compartilhar no ${rede.rotulo}`"
        type="button"
        @click="rede.acao()"
      >
        <i :class="rede.icone" />
      </button>
      <a
        v-else
        class="share-btn"
        :class="rede.classe"
        :href="rede.url"
        :title="`Compartilhar no ${rede.rotulo}`"
        target="_blank"
        rel="noopener"
      >
        <i :class="rede.icone" />
      </a>
    </template>

    <button
      class="share-btn share-btn--copy"
      :title="copiado ? 'Link copiado!' : 'Copiar link'"
      type="button"
      @click="copiarLink()"
    >
      <i :class="copiado ? 'fas fa-check' : 'fas fa-link'" />
    </button>
  </div>
</template>
