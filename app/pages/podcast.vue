<script setup lang="ts">
useSeoMeta({
  title: 'Podcast & Ao Vivo (Rascunho) — Portal Sampa na Ilha',
  description: 'Podcast e Ao Vivo do Portal Sampa na Ilha — página em rascunho, ainda não divulgada ao público.',
  robots: 'noindex, nofollow',
})
</script>

<template>
  <div>
    <ComumHeroPagina
      titulo="Podcast & Ao Vivo"
      descricao="Página pronta e programada na estrutura do site. Fica oculta do menu principal até o lançamento oficial do projeto, acessível apenas pelo caminho /podcast."
      etiqueta="Rascunho — página ainda não divulgada"
      etiqueta-icone="fas fa-eye-slash"
      etiqueta-cor="gray"
    />

    <div class="container">
      <div class="layout">
        <main class="page-content">
          <ComumAviso icone="fas fa-eye-slash">
            <strong>Status:</strong> esta página não está linkada em nenhum menu. Para ativá-la no
            lançamento, basta acrescentar o item “Podcast / Ao Vivo” em
            <code>app/utils/navegacao.ts</code> apontando para <code>/podcast</code>.
          </ComumAviso>

          <ComumCabecalhoSecao titulo="Podcast" />
          <p>
            Espaço para os episódios do podcast Sampa na Ilha. Basta colar aqui o embed/player do
            Spotify, Deezer ou YouTube de cada episódio.
          </p>
          <PodcastEpisodio
            titulo="Episódio 01 — em breve"
            descricao="Espaço reservado para o embed do player (Spotify / Deezer / YouTube)."
          />
          <PodcastEmbed rotulo="Player do episódio — inserir código de embed aqui" icone="fas fa-podcast" />

          <ComumCabecalhoSecao titulo="Transmissão ao Vivo" />
          <span class="live-badge"><span class="live-dot" /> No Ar</span>
          <p style="margin-top:12px;">
            Bloco central para a integração/embed de transmissões ao vivo vindas do YouTube ou da
            Twitch. O selo “No Ar” acima é dinâmico e deve aparecer apenas durante uma transmissão ativa.
          </p>
          <PodcastEmbed rotulo="Player de transmissão ao vivo — inserir embed do YouTube/Twitch aqui" icone="fas fa-video" />
        </main>

        <SidebarPrincipal :tempo="false" :dicas="false" />
      </div>
    </div>
  </div>
</template>
