<script setup lang="ts">
import { ExternalLinkIcon, LogOutIcon, MenuIcon } from '@lucide/vue'

const auth = useAuthStore()
const { alternarSidebar } = usePainelLayout()

defineEmits<{ navegou: [] }>()
</script>

<template>
  <div class="flex h-full flex-col px-2 py-3">
    <!-- Cabeçalho: marca + hambúrguer que recolhe o menu (desktop) -->
    <div class="flex h-10 items-center gap-2 px-2">
      <AdminLayoutMarca class="flex-1" />
      <Button
        variant="ghost"
        size="icon-sm"
        class="hidden shrink-0 lg:inline-flex"
        aria-label="Esconder menu lateral"
        title="Esconder menu lateral"
        @click="alternarSidebar()"
      >
        <MenuIcon class="size-4" />
      </Button>
    </div>

    <AdminLayoutNavegacao class="mt-5 flex-1" @navegou="$emit('navegou')" />

    <div class="mt-4 flex flex-col gap-1 border-t border-sidebar-border pt-3">
      <NuxtLink
        to="/"
        target="_blank"
        class="admin-linha text-sm text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      >
        <span class="admin-icone"><ExternalLinkIcon class="size-4" /></span>
        <span class="flex-1 truncate">Ver o portal</span>
      </NuxtLink>

      <div class="admin-linha min-h-12 bg-sidebar-accent/60">
        <Avatar class="size-8 shrink-0">
          <AvatarFallback class="bg-primary text-[11px] font-semibold text-primary-foreground">
            {{ auth.iniciais }}
          </AvatarFallback>
        </Avatar>
        <div class="min-w-0 flex-1 leading-tight">
          <p class="truncate text-sm font-medium">{{ auth.usuario?.nome }}</p>
          <p class="truncate text-xs text-muted-foreground">{{ auth.usuario?.email }}</p>
        </div>
        <Button variant="ghost" size="icon-sm" class="shrink-0" title="Sair" @click="auth.sair()">
          <LogOutIcon class="size-4" />
        </Button>
      </div>
    </div>
  </div>
</template>
