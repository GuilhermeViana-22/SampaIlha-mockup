<script setup lang="ts">
import { CONTATO, RODAPE_EDITORIAS, RODAPE_PORTAL, REDES_SOCIAIS } from '~/utils/navegacao'
import { DOCUMENTOS_LEGAIS } from '~/utils/legal'

/** Termos e Privacidade, na ordem em que aparecem na coluna "Portal". */
const DOCUMENTOS_RODAPE = [DOCUMENTOS_LEGAIS.termos, DOCUMENTOS_LEGAIS.privacidade]
  .map(doc => ({ chave: doc.chave, rotulo: doc.titulo }))

const portal = usePortalStore()
const { reabrir } = useConsentimentoCookies()
const { abrir: abrirDocumento } = useDocumentosLegais()
const marca = useMarcaStore()
const ano = new Date().getFullYear()
</script>

<template>
  <footer class="site-footer">
    <div class="footer-top">
      <div class="footer-brand">
        <div class="logo">
          <img :src="marca.logo" class="logo__img" alt="Portal Sampa na Ilha" width="235" height="240">
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
          <a :href="CONTATO.whatsappUrl" target="_blank" rel="noopener">
            <i class="fab fa-whatsapp" style="color:var(--ciano);margin-right:6px;" /> {{ CONTATO.whatsapp }}
          </a><br>
          <a :href="CONTATO.instagramUrl" target="_blank" rel="noopener">
            <i class="fab fa-instagram" style="color:var(--ciano);margin-right:6px;" /> {{ CONTATO.instagram }}
          </a>
        </p>
      </div>

      <div class="footer-col">
        <h4><i class="fas fa-newspaper" /> Categorias</h4>
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
          <!-- Botão, e não link: os dois documentos abrem sobre a página, sem
               levar o leitor embora da matéria que ele estava lendo. -->
          <li v-for="doc in DOCUMENTOS_RODAPE" :key="doc.chave">
            <button type="button" class="footer-legal" @click="abrirDocumento(doc.chave)">
              <i class="fas fa-chevron-right" /> {{ doc.rotulo }}
            </button>
          </li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <span>
        <i class="far fa-copyright" /> {{ ano }} Portal Sampa na Ilha — Todos os direitos reservados
        <!-- A LGPD dá o direito de rever o consentimento; sem este botão, quem
             já decidiu não teria como voltar atrás. -->
        · <button type="button" class="footer-cookies" @click="reabrir()">Preferências de cookies</button>
      </span>
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
