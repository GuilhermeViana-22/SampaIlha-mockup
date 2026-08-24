<script setup lang="ts">
import {
  BookOpenIcon, BriefcaseIcon, CalendarDaysIcon, FileTextIcon, MailIcon,
  PlusCircleIcon, RefreshCwIcon, TrendingUpIcon,
} from '@lucide/vue'
import type { EstatisticasDashboard } from '#shared/types/content'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  titulo: 'Visão geral',
  descricao: 'Como está o conteúdo do portal hoje.',
})
useSeoMeta({ title: 'Visão geral — Painel Sampa na Ilha', robots: 'noindex, nofollow' })


const portal = usePortalStore()

const { data: stats, refresh } = await useFetch<EstatisticasDashboard>('/api/estatisticas', {
  key: 'estatisticas',
  headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
})


/** Banco zerado: todos os números do painel começam do zero. */
const semConteudo = computed(() => !stats.value || stats.value.totalPosts === 0)

const atalhos = [
  { rotulo: 'Escrever notícia', descricao: 'Nova matéria para a editoria', para: '/admin/posts/novo?tipo=noticia', icone: 'fas fa-newspaper' },
  { rotulo: 'Publicar dica', descricao: 'Guia prático ou roteiro', para: '/admin/posts/novo?tipo=dica', icone: 'fas fa-lightbulb' },
  { rotulo: 'Página de informação', descricao: 'Serviço e institucional', para: '/admin/posts/novo?tipo=informacao', icone: 'fas fa-circle-info' },
  { rotulo: 'Ver inscritos', descricao: 'Base da newsletter', para: '/admin/newsletter', icone: 'fas fa-envelope' },
]
</script>

<template>
  <div v-if="stats" class="flex flex-col gap-6">
    <Card v-if="semConteudo" class="border-dashed bg-muted/40">
      <CardContent class="flex flex-wrap items-center gap-4 py-5">
        <span class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <FileTextIcon class="size-5" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="font-medium">Ainda não foram cadastrados conteúdos</p>
          <p class="text-sm text-muted-foreground">
            O banco do portal está zerado — todos os números abaixo começam do zero e as páginas
            públicas mostram o aviso de que ainda não há publicações.
          </p>
        </div>
        <Button as-child size="sm">
          <NuxtLink to="/admin/posts/novo">
            <PlusCircleIcon class="size-4" /> Criar o primeiro conteúdo
          </NuxtLink>
        </Button>
      </CardContent>
    </Card>

    <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <AdminDashboardCardEstatistica
        rotulo="Conteúdos no portal"
        :valor="stats.totalPosts"
        :descricao="`${stats.publicados} publicados · ${stats.rascunhos} rascunhos · ${stats.agendados} agendados`"
        :icone="FileTextIcon"
        tom="marca"
      />
      <AdminDashboardCardEstatistica
        rotulo="Leituras acumuladas"
        :valor="formatarNumero(stats.leiturasTotais)"
        descricao="Somatório de todas as matérias"
        :icone="BookOpenIcon"
        tom="destaque"
      />
      <AdminDashboardCardEstatistica
        rotulo="Inscritos na newsletter"
        :valor="stats.inscritosNewsletter"
        descricao="Base ativa de leitores"
        :icone="MailIcon"
        tom="verde"
      />
      <AdminDashboardCardEstatistica
        rotulo="Média por matéria"
        :valor="formatarNumero(Math.round(stats.leiturasTotais / Math.max(1, stats.publicados)))"
        descricao="Leituras por conteúdo publicado"
        :icone="TrendingUpIcon"
        tom="roxo"
      />
    </section>

    <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <AdminDashboardCardEstatistica
        rotulo="Vagas abertas"
        :valor="stats.vagasAbertas"
        descricao="Publicadas na página de Vagas"
        :icone="BriefcaseIcon"
        tom="marca"
      />
      <AdminDashboardCardEstatistica
        rotulo="Eventos na agenda"
        :valor="stats.eventosProximos"
        descricao="Ainda por acontecer"
        :icone="CalendarDaysIcon"
        tom="ambar"
      />
      <AdminDashboardCardEstatistica
        rotulo="Editorias em uso"
        :valor="stats.porCategoria.length"
        :descricao="`de ${portal.categorias.length} cadastradas`"
        :icone="FileTextIcon"
        tom="roxo"
      />
      <AdminDashboardCardEstatistica
        rotulo="Regiões cobertas"
        :valor="stats.porRegiao.length"
        :descricao="`de ${portal.regioes.length} do país`"
        :icone="TrendingUpIcon"
        tom="destaque"
      />
    </section>

    <section class="grid gap-4 lg:grid-cols-3">
      <AdminDashboardGraficoCategorias
        class="lg:col-span-2"
        :dados="stats.porCategoria"
        link-base="/categoria/"
      />
      <AdminDashboardDistribuicaoTipos :dados="stats.porTipo" />
    </section>

    <section class="grid items-start gap-4 lg:grid-cols-2">
      <AdminDashboardGraficoCategorias
        :dados="stats.porRegiao"
        titulo="Conteúdos por região"
        descricao="Como a cobertura nacional está distribuída."
        link-base="/regioes/"
      />
      <AdminDashboardMaisLidos :posts="stats.maisLidos" />
    </section>

    <section class="grid gap-4 lg:grid-cols-3">
      <AdminDashboardAtividadeRecente class="lg:col-span-2" :posts="stats.ultimosPosts" />

      <Card class="h-full">
        <CardHeader>
          <CardTitle class="text-base">Atalhos da redação</CardTitle>
          <CardDescription>Comece uma nova pauta em um clique.</CardDescription>
        </CardHeader>
        <CardContent class="flex flex-col gap-2">
          <NuxtLink
            v-for="atalho in atalhos"
            :key="atalho.para"
            :to="atalho.para"
            class="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:border-primary/40 hover:bg-accent"
          >
            <span class="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <i :class="atalho.icone" />
            </span>
            <span class="min-w-0">
              <span class="block text-sm font-medium">{{ atalho.rotulo }}</span>
              <span class="block text-xs text-muted-foreground">{{ atalho.descricao }}</span>
            </span>
          </NuxtLink>

          <Button variant="ghost" size="sm" class="mt-1 self-start" @click="refresh()">
            <RefreshCwIcon class="size-4" /> Atualizar números
          </Button>
        </CardContent>
      </Card>
    </section>
  </div>
</template>
