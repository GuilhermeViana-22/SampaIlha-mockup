<script setup lang="ts">
/**
 * Mural de vagas de /vagas — só o que está aberto.
 *
 * A store é a mesma do painel: quem acabou de publicar uma vaga vê aqui
 * exatamente o que gravou, sem um segundo contrato de leitura para manter.
 */
const vagas = useVagasStore()

await vagas.carregar()
</script>

<template>
  <div>
    <VagasCard v-for="vaga in vagas.noAr" :key="vaga.id" :vaga="vaga" />

    <ComumEstadoVazio
      v-if="!vagas.noAr.length && !vagas.carregando"
      titulo="Nenhuma vaga aberta no momento"
      descricao="Assim que uma nova oportunidade for recebida pela redação, ela aparece aqui."
      icone="fas fa-briefcase"
    />
  </div>
</template>
