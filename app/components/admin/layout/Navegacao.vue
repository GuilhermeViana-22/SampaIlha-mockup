<script setup lang="ts">
import {
  FileIcon, FileTextIcon, GraduationCapIcon, LayoutDashboardIcon, MailIcon, MegaphoneIcon, SettingsIcon,
  TagsIcon, UserCircleIcon, UsersIcon,
} from '@lucide/vue'

/**
 * Itens do menu lateral. Todas as linhas seguem a mesma métrica do menu
 * (`h-9`, `px-2`, coluna de ícone `size-5`), para alinhar ícones e rótulos
 * no mesmo eixo vertical do rodapé e da marca.
 */
const icones: Record<string, unknown> = {
  LayoutDashboard: LayoutDashboardIcon,
  FileText: FileTextIcon,
  File: FileIcon,
  Mail: MailIcon,
  Settings: SettingsIcon,
  Megaphone: MegaphoneIcon,
  Tags: TagsIcon,
  Users: UsersIcon,
  UserCircle: UserCircleIcon,
  GraduationCap: GraduationCapIcon,
}

/** Onde o menu deve continuar aceso ao entrar em uma página filha. */
const SECOES_COM_SUBROTAS = ['/admin/posts', '/admin/workshops']

const rota = useRoute()
const posts = usePostsStore()
const auth = useAuthStore()

const itens = computed(() => MENU_ADMIN.filter(item => !item.soChefe || auth.ehChefe).map(item => ({
  ...item,
  componente: icones[item.icone ?? ''],
  // Seções com páginas filhas (formulários) mantêm o item aceso na edição.
  ativo: SECOES_COM_SUBROTAS.includes(item.para)
    ? rota.path.startsWith(item.para)
    : rota.path === item.para,
  contador: item.para === '/admin/posts' ? posts.total : undefined,
})))

defineEmits<{ navegou: [] }>()
</script>

<template>
  <nav class="flex flex-col gap-0.5">
    <NuxtLink
      v-for="item in itens"
      :key="item.para"
      :to="item.para"
      class="admin-linha text-sm font-medium"
      :class="item.ativo
        ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
        : 'text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'"
      @click="$emit('navegou')"
    >
      <span class="admin-icone">
        <component :is="item.componente" class="size-4" />
      </span>
      <span class="flex-1 truncate">{{ item.rotulo }}</span>
      <span
        v-if="item.contador !== undefined"
        class="rounded-full px-1.5 py-0.5 text-[11px] font-semibold leading-none tabular-nums"
        :class="item.ativo
          ? 'bg-white/20 text-white'
          : 'bg-sidebar-accent text-sidebar-accent-foreground'"
      >
        {{ item.contador }}
      </span>
    </NuxtLink>
  </nav>
</template>
