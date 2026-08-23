<script setup lang="ts">
import { LoaderCircleIcon, RotateCcwIcon } from '@lucide/vue'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  titulo: 'Configurações',
  descricao: 'Taxonomia do portal, sessão e dados de demonstração.',
  acao: null,
})
useSeoMeta({ title: 'Configurações — Painel Sampa na Ilha', robots: 'noindex, nofollow' })


const auth = useAuthStore()
const portal = usePortalStore()
const posts = usePostsStore()
const restaurando = ref(false)

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
    <Tabs default-value="taxonomia">
      <TabsList>
        <TabsTrigger value="taxonomia">Taxonomia</TabsTrigger>
        <TabsTrigger value="conta">Conta</TabsTrigger>
        <TabsTrigger value="dados">Dados</TabsTrigger>
      </TabsList>

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
