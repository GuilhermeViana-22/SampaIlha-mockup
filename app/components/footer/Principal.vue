<script setup lang="ts">
import { CONTATO, RODAPE_EDITORIAS, RODAPE_PORTAL, REDES_SOCIAIS } from '~/utils/navegacao'

const portal = usePortalStore()
const ano = new Date().getFullYear()
</script>

<template>
  <footer class="site-footer">
    <div class="footer-top">
      <div class="footer-brand">
        <div class="logo">
          <div class="logo__icon">
            <i class="fas fa-water" />
          </div>
          <div>
            <div class="logo__name">Sampa na Ilha</div>
            <div class="logo__tagline">{{ CONTATO.tagline }}</div>
          </div>
        </div>
        <p>
          O portal de referência para quem busca informação, cultura e notícias de todas as regiões
          do Brasil diretamente da capital paulista. Jornalismo com credibilidade e compromisso.
        </p>
        <p style="margin-top:16px;font-size:.8rem;line-height:1.8;">
          <i class="fas fa-envelope" style="color:var(--ciano);margin-right:6px;" /> {{ CONTATO.email }}<br>
          <i class="fas fa-phone" style="color:var(--ciano);margin-right:6px;" /> {{ CONTATO.telefone }}<br>
          <span style="opacity:.6;">{{ CONTATO.razaoSocial }} — CNPJ: {{ CONTATO.cnpj }}</span>
        </p>
      </div>

      <div class="footer-col">
        <h4><i class="fas fa-newspaper" /> Editorias</h4>
        <ul>
          <li v-for="item in RODAPE_EDITORIAS" :key="item.para">
            <NuxtLink :to="item.para"><i class="fas fa-chevron-right" /> {{ item.rotulo }}</NuxtLink>
          </li>
        </ul>
      </div>

      <div class="footer-col">
        <h4><i class="fas fa-map-marker-alt" /> Regiões</h4>
        <ul>
          <li v-for="regiao in portal.regioes" :key="regiao.slug">
            <NuxtLink :to="`/regioes/${regiao.slug}`"><i class="fas fa-chevron-right" /> {{ regiao.nome }}</NuxtLink>
          </li>
        </ul>
      </div>

      <div class="footer-col">
        <h4><i class="fas fa-info-circle" /> Portal</h4>
        <ul>
          <li v-for="item in RODAPE_PORTAL" :key="item.rotulo">
            <NuxtLink :to="item.para"><i class="fas fa-chevron-right" /> {{ item.rotulo }}</NuxtLink>
          </li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <span><i class="far fa-copyright" /> {{ ano }} Portal Sampa na Ilha — Todos os direitos reservados</span>
      <div class="social-links">
        <a
          v-for="rede in REDES_SOCIAIS"
          :key="rede.rotulo"
          class="social-link"
          :href="rede.url"
          :title="rede.rotulo"
          target="_blank"
          rel="noopener"
        >
          <i :class="rede.icone" />
        </a>
      </div>
    </div>
  </footer>
</template>
