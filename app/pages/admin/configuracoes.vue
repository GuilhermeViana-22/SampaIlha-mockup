<script setup lang="ts">
import { LoaderCircleIcon, PaletteIcon, RotateCcwIcon, SaveIcon } from '@lucide/vue'
import { toast } from 'vue-sonner'
import { NIVEIS_TITULO, TEMA_PADRAO } from '#shared/types/tema'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  titulo: 'Configurações',
  descricao: 'Aparência, taxonomia do portal, sessão e dados de demonstração.',
  acao: null,
})
useSeoMeta({ title: 'Configurações — Painel Sampa na Ilha', robots: 'noindex, nofollow' })


const auth = useAuthStore()
const portal = usePortalStore()
const posts = usePostsStore()
const tema = useTemaStore()
const restaurando = ref(false)
const restaurandoTema = ref(false)

/**
 * A aba de aparência edita `tema.rascunho`, que já é o que pinta a tela — a
 * pré-visualização é o próprio site, ao vivo, sem gravar nada até salvar.
 */
await tema.carregar()
tema.editar()
onBeforeUnmount(() => tema.descartar())

const rascunho = computed(() => tema.rascunho ?? tema.tema)

const CORES_BASE = [
  { chave: 'primaria', rotulo: 'Cor principal', descricao: 'Cabeçalho, links, botões e selos.' },
  { chave: 'contrastePrimaria', rotulo: 'Texto sobre a cor principal', descricao: 'Precisa contrastar com ela.' },
  { chave: 'destaque', rotulo: 'Cor de destaque', descricao: 'Ícones e detalhes de apoio.' },
  { chave: 'fundo', rotulo: 'Cor de fundo', descricao: 'Fundo das páginas do site.' },
  { chave: 'texto', rotulo: 'Cor do texto', descricao: 'Texto corrido das matérias.' },
] as const

async function salvarTema() {
  try {
    await tema.salvar()
    toast.success('Aparência do site atualizada.')
  }
  catch {
    toast.error('Não foi possível salvar a aparência.')
  }
}

async function restaurarTema() {
  restaurandoTema.value = true
  try {
    await tema.restaurarPadrao()
    toast.success('Paleta oficial do portal restaurada.')
  }
  catch {
    toast.error('Não foi possível restaurar a paleta padrão.')
  }
  finally {
    restaurandoTema.value = false
  }
}

async function restaurar() {
  restaurando.value = true
  try {
    await $fetch('/api/restaurar-seed', { method: 'POST' })
    await posts.carregar()
    await refreshNuxtData()
    toast.success('Conteúdo original do mockup restaurado.')
  }
  catch {
    toast.error('Não foi possível restaurar o conteúdo.')
  }
  finally {
    restaurando.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <Tabs default-value="aparencia">
      <TabsList>
        <TabsTrigger value="aparencia">Aparência</TabsTrigger>
        <TabsTrigger value="taxonomia">Taxonomia</TabsTrigger>
        <TabsTrigger value="conta">Conta</TabsTrigger>
        <TabsTrigger value="dados">Dados</TabsTrigger>
      </TabsList>

      <TabsContent value="aparencia" class="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2 text-base">
              <PaletteIcon class="size-4 text-primary" /> Paleta do site
            </CardTitle>
            <CardDescription>
              As cores viram variáveis CSS aplicadas no servidor, então o site já carrega pintado —
              sem piscar a cor antiga. Os tons intermediários (hover, fundos suaves) são calculados
              a partir da cor principal.
            </CardDescription>
          </CardHeader>
          <CardContent class="flex flex-col gap-4">
            <AdminConfiguracoesCampoCor
              v-for="campo in CORES_BASE"
              :key="campo.chave"
              v-model="rascunho[campo.chave]"
              :rotulo="campo.rotulo"
              :descricao="campo.descricao"
            />
          </CardContent>
        </Card>

        <div class="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle class="text-base">Títulos</CardTitle>
              <CardDescription>
                A cor padrão vale para todos os níveis. Ajuste um nível só quando ele precisar
                destoar — o botão ao lado devolve o nível à cor padrão.
              </CardDescription>
            </CardHeader>
            <CardContent class="flex flex-col gap-4">
              <AdminConfiguracoesCampoCor
                v-model="rascunho.titulo"
                rotulo="Cor padrão dos títulos"
                descricao="Herdada por h1…h6."
              />
              <Separator />
              <AdminConfiguracoesCampoCor
                v-for="nivel in NIVEIS_TITULO"
                :key="nivel"
                v-model="rascunho[nivel]"
                :rotulo="nivel.toUpperCase()"
                :herdada-de="rascunho.titulo"
                permite-herdar
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle class="text-base">Prévia</CardTitle>
              <CardDescription>Amostra com as cores deste rascunho, antes de salvar.</CardDescription>
            </CardHeader>
            <CardContent>
              <div class="overflow-hidden rounded-lg border border-border" :style="{ background: rascunho.fundo }">
                <div
                  class="px-4 py-3 text-sm font-semibold"
                  :style="{ background: rascunho.primaria, color: rascunho.contrastePrimaria }"
                >
                  Portal Sampa na Ilha
                  <i class="fas fa-leaf ml-1" :style="{ color: rascunho.destaque }" />
                </div>
                <div class="flex flex-col gap-1.5 p-4">
                  <p
                    v-for="nivel in NIVEIS_TITULO"
                    :key="nivel"
                    class="font-serif font-bold leading-tight"
                    :class="{ 'text-xl': nivel === 'h1', 'text-lg': nivel === 'h2', 'text-base': nivel === 'h3' }"
                    :style="{ color: rascunho[nivel] || rascunho.titulo, fontSize: nivel === 'h5' ? '.85rem' : nivel === 'h6' ? '.78rem' : undefined }"
                  >
                    {{ nivel.toUpperCase() }} — Cultura amazônica em São Paulo
                  </p>
                  <p class="mt-1 text-sm" :style="{ color: rascunho.texto }">
                    Texto corrido da matéria, com um
                    <span class="font-semibold underline" :style="{ color: rascunho.primaria }">link interno</span>
                    no meio da frase.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div class="flex flex-wrap items-center gap-2">
            <Button :disabled="tema.salvando || !tema.alterado" @click="salvarTema()">
              <LoaderCircleIcon v-if="tema.salvando" class="size-4 animate-spin" />
              <SaveIcon v-else class="size-4" />
              Salvar aparência
            </Button>
            <Button variant="outline" :disabled="!tema.alterado" @click="tema.descartar()">
              Descartar alterações
            </Button>
            <Button variant="ghost" :disabled="restaurandoTema" @click="restaurarTema()">
              <LoaderCircleIcon v-if="restaurandoTema" class="size-4 animate-spin" />
              <RotateCcwIcon v-else class="size-4" />
              Restaurar paleta padrão ({{ TEMA_PADRAO.primaria }})
            </Button>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="taxonomia" class="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle class="text-base">Editorias</CardTitle>
            <CardDescription>
              Definidas em API Python (<code class="font-mono text-xs">/categories</code>) e usadas
              pelo site e pelo painel.
            </CardDescription>
          </CardHeader>
          <CardContent class="flex flex-col divide-y divide-border">
            <div v-for="categoria in portal.categorias" :key="categoria.slug" class="flex items-center gap-3 py-2.5 first:pt-0">
              <span class="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <i :class="categoria.icone" />
              </span>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium">{{ categoria.nome }}</p>
                <p class="truncate text-xs text-muted-foreground">{{ categoria.descricao }}</p>
              </div>
              <span class="font-mono text-xs text-muted-foreground">{{ categoria.slug }}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="text-base">Regiões</CardTitle>
            <CardDescription>Cobertura nacional dividida em cinco regiões.</CardDescription>
          </CardHeader>
          <CardContent class="flex flex-col divide-y divide-border">
            <div v-for="regiao in portal.regioes" :key="regiao.slug" class="flex items-center gap-3 py-2.5 first:pt-0">
              <span class="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <i :class="regiao.icone" />
              </span>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium">{{ regiao.nome }}</p>
                <p class="truncate text-xs text-muted-foreground">{{ regiao.descricao }}</p>
              </div>
              <Button as-child variant="ghost" size="sm">
                <NuxtLink :to="`/regioes/${regiao.slug}`" target="_blank">Abrir</NuxtLink>
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="conta" class="mt-4">
        <Card class="max-w-xl">
          <CardHeader>
            <CardTitle class="text-base">Sessão atual</CardTitle>
            <CardDescription>
              As credenciais ficam em <code class="font-mono text-xs">runtimeConfig</code> e podem ser
              trocadas pelas variáveis <code class="font-mono text-xs">NUXT_ADMIN_USER</code> e
              <code class="font-mono text-xs">NUXT_ADMIN_PASSWORD</code>.
            </CardDescription>
          </CardHeader>
          <CardContent class="flex flex-col gap-4">
            <div class="flex items-center gap-3">
              <Avatar class="size-12">
                <AvatarFallback class="bg-primary text-primary-foreground">{{ auth.iniciais }}</AvatarFallback>
              </Avatar>
              <div>
                <p class="font-medium">{{ auth.usuario?.nome }}</p>
                <p class="text-sm text-muted-foreground">{{ auth.usuario?.email }}</p>
                <p class="text-xs uppercase tracking-wide text-muted-foreground">{{ auth.usuario?.papel }}</p>
              </div>
            </div>
            <Separator />
            <Button variant="outline" class="self-start" @click="auth.sair()">Encerrar sessão</Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="dados" class="mt-4">
        <Card class="max-w-xl">
          <CardHeader>
            <CardTitle class="text-base">Conteúdo de demonstração</CardTitle>
            <CardDescription>
              Repovoa o banco com os 33 conteúdos de demonstração migrados do mockup HTML —
              mais as vagas, os eventos e os inscritos de exemplo —, descartando o que estiver
              cadastrado hoje. Com o banco zerado, é isto que tira o portal do estado vazio.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" :disabled="restaurando" @click="restaurar()">
              <LoaderCircleIcon v-if="restaurando" class="size-4 animate-spin" />
              <RotateCcwIcon v-else class="size-4" />
              Restaurar conteúdo original
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>
