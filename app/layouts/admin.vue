<script setup lang="ts">
/** Casca do dashboard: menu lateral recolhível no desktop, gaveta no mobile. */
const { menuMobile, oculto } = usePainelLayout()

// Carregado aqui (e não em cada página) para que o contador do menu lateral
// já venha correto do servidor, sem divergência na hidratação.
const posts = usePostsStore()
if (!posts.itens.length) await posts.carregar()
</script>

<template>
  <div class="admin-shell min-h-screen">
    <div class="mx-auto flex min-h-screen w-full">
      <!-- Menu lateral (desktop) — escondido pelo hambúrguer da barra superior -->
      <aside
        class="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-sidebar-border bg-sidebar"
        :class="oculto ? 'lg:hidden' : 'lg:block'"
      >
        <AdminLayoutSidebar />
      </aside>

      <!-- Menu lateral (mobile) -->
      <Sheet v-model:open="menuMobile">
        <SheetContent side="left" class="w-64 bg-sidebar p-0">
          <SheetHeader class="sr-only">
            <SheetTitle>Menu do painel</SheetTitle>
            <SheetDescription>Navegação do painel administrativo</SheetDescription>
          </SheetHeader>
          <AdminLayoutSidebar @navegou="menuMobile = false" />
        </SheetContent>
      </Sheet>

      <div class="flex min-w-0 flex-1 flex-col">
        <AdminLayoutTopo />
        <main class="flex-1 px-4 py-6 sm:px-6 md:px-8 lg:px-12 lg:py-8 xl:px-16">
          <div class="mx-auto w-full max-w-[1600px]">
            <slot />
          </div>
        </main>
      </div>
    </div>
    <Toaster position="top-right" rich-colors />
  </div>
</template>
