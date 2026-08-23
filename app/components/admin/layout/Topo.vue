<script setup lang="ts">
import { ExternalLinkIcon, LogOutIcon, MenuIcon, MoonIcon, PlusCircleIcon, SunIcon } from '@lucide/vue'

/**
 * Barra superior do painel. Título e descrição vêm do `definePageMeta`
 * de cada página — assim já saem corretos na renderização do servidor.
 * O hambúrguer abre a gaveta no mobile; no desktop ele só aparece com o menu
 * lateral escondido (com o menu aberto, quem recolhe é o botão do próprio menu).
 */
const rota = useRoute()
const auth = useAuthStore()
const { escuro, alternar } = useTemaAdmin()
const { oculto, alternarSidebar } = usePainelLayout()

const acao = computed(() =>
  rota.meta.acao === null
    ? null
    : rota.meta.acao ?? { rotulo: 'Novo conteúdo', para: '/admin/posts/novo' },
)
</script>

<template>
  <header class="sticky top-0 z-30 flex flex-wrap items-center gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur sm:px-6 md:px-8 lg:gap-4 lg:px-12 xl:px-16">
    <Button
      variant="ghost"
      size="icon"
      class="shrink-0"
      :class="oculto ? '' : 'lg:hidden'"
      aria-label="Mostrar menu lateral"
      title="Mostrar menu lateral"
      @click="alternarSidebar()"
    >
      <MenuIcon class="size-5" />
    </Button>

    <!-- Com o menu escondido, a marca continua visível na barra -->
    <AdminLayoutMarca v-if="oculto" compacto class="hidden lg:flex" />

    <div class="min-w-0 flex-1">
      <h1 class="truncate font-serif text-xl font-bold tracking-tight">
        {{ rota.meta.titulo ?? 'Painel' }}
      </h1>
      <p v-if="rota.meta.descricao" class="truncate text-sm text-muted-foreground">
        {{ rota.meta.descricao }}
      </p>
    </div>

    <div class="flex items-center gap-2">
      <Button v-if="acao" as-child size="sm">
        <NuxtLink :to="acao.para">
          <PlusCircleIcon class="size-4" /> {{ acao.rotulo }}
        </NuxtLink>
      </Button>
      <Button variant="outline" size="icon" :title="escuro ? 'Tema claro' : 'Tema escuro'" @click="alternar()">
        <SunIcon v-if="escuro" class="size-4" />
        <MoonIcon v-else class="size-4" />
      </Button>

      <!-- Com o menu escondido, a conta sai do rodapé do menu e vem para cá -->
      <DropdownMenu v-if="oculto">
        <DropdownMenuTrigger as-child>
          <button type="button" class="hidden lg:block" :title="auth.usuario?.nome">
            <Avatar class="size-9">
              <AvatarFallback class="bg-primary text-xs font-semibold text-primary-foreground">
                {{ auth.iniciais }}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-56">
          <DropdownMenuLabel class="flex flex-col gap-0.5">
            <span class="truncate text-sm">{{ auth.usuario?.nome }}</span>
            <span class="truncate text-xs font-normal text-muted-foreground">{{ auth.usuario?.email }}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem as-child>
            <NuxtLink to="/" target="_blank">
              <ExternalLinkIcon class="size-4" /> Ver o portal
            </NuxtLink>
          </DropdownMenuItem>
          <DropdownMenuItem @select="auth.sair()">
            <LogOutIcon class="size-4" /> Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </header>
</template>
