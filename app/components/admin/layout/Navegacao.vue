<script setup lang="ts">
import {
  BriefcaseIcon, CalendarDaysIcon, FileIcon, FileTextIcon, GraduationCapIcon, ImageIcon, LayoutDashboardIcon,
  LightbulbIcon, MailIcon, MegaphoneIcon, MicIcon, SettingsIcon, TagsIcon, UserCircleIcon, UsersIcon,
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
  Lightbulb: LightbulbIcon,
  Mail: MailIcon,
  Settings: SettingsIcon,
  Megaphone: MegaphoneIcon,
  Image: ImageIcon,
  Tags: TagsIcon,
  Users: UsersIcon,
  UserCircle: UserCircleIcon,
  GraduationCap: GraduationCapIcon,
  CalendarDays: CalendarDaysIcon,
  Briefcase: BriefcaseIcon,
  Mic: MicIcon,
}

/** Onde o menu deve continuar aceso ao entrar em uma página filha. */
const SECOES_COM_SUBROTAS = ['/admin/posts', '/admin/guias', '/admin/workshops', '/admin/eventos', '/admin/vagas']

const rota = useRoute()
const posts = usePostsStore()
const auth = useAuthStore()
const redacao = useRedacaoStore()
const newsletter = useNewsletterStore()

/** De quanto em quanto tempo o menu confere se chegou assinante novo. */
const INTERVALO_NEWSLETTER = 120_000

let relogioNewsletter: ReturnType<typeof setInterval> | undefined

/**
 * A fila de pedidos de senha alimenta o contador de Equipe.
 *
 * Carregada aqui, e não na página, porque o menu acompanha o painel inteiro: um
 * pedido feito enquanto o chefe está em outra tela precisa aparecer sem ele ter
 * de passar por Equipe. A API recusa a fila para quem não é chefe, então nem se
 * pede.
 */
onMounted(() => {
  if (auth.ehChefe) redacao.carregarPedidosSenha().catch(() => {})

  // A marca de leitura mora no navegador: só depois da hidratação dá para saber
  // o que já foi visto — daí o contador nascer zerado no SSR.
  newsletter.lerMarca()
  newsletter.carregar()
  // A base cresce sozinha, com o painel aberto o dia inteiro. Sem a passada
  // periódica, um cadastro feito às 9h só apareceria no próximo F5.
  relogioNewsletter = setInterval(() => newsletter.carregar(), INTERVALO_NEWSLETTER)
})

onUnmounted(() => clearInterval(relogioNewsletter))

function contadorDe(para: string): number | undefined {
  if (para === '/admin/posts') return posts.total
  // Zero não vira badge: um "0" aceso ao lado de Equipe diria que há algo a
  // fazer justamente quando não há.
  if (para === '/admin/equipe') return redacao.totalPedidosSenha || undefined
  if (para === '/admin/newsletter') return newsletter.totalNovos || undefined
  return undefined
}

const itens = computed(() => MENU_ADMIN.filter(item => !item.soChefe || auth.ehChefe).map(item => ({
  ...item,
  componente: icones[item.icone ?? ''],
  // Seções com páginas filhas (formulários) mantêm o item aceso na edição.
  ativo: SECOES_COM_SUBROTAS.includes(item.para)
    ? rota.path.startsWith(item.para)
    : rota.path === item.para,
  contador: contadorDe(item.para),
  // Newsletter é o único contador que é aviso, e não estatística: quem chegou
  // e ainda não foi visto. Por isso acende, pulsa e pode ser apagado no clique.
  novidade: item.para === '/admin/newsletter' && !!newsletter.totalNovos,
})))

/** Apaga o aviso sem sair da página em que se está. */
function marcarNewsletterVista() {
  newsletter.marcarVistos()
}

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
      <!-- Aviso de cadastro novo: apagar não exige abrir a lista, basta clicar
           no badge — por isso é um botão, e não um pedaço do link. -->
      <button
        v-if="item.novidade"
        type="button"
        class="relative flex shrink-0 items-center rounded-full"
        :title="`${item.contador} cadastro(s) novo(s) na newsletter — clique para marcar como visto`"
        :aria-label="`${item.contador} cadastro(s) novo(s) na newsletter. Marcar como visto`"
        @click.stop.prevent="marcarNewsletterVista()"
      >
        <span class="absolute inset-0 animate-ping rounded-full bg-emerald-500/60" aria-hidden="true" />
        <span
          class="relative rounded-full bg-emerald-500 px-1.5 py-0.5 text-[11px] font-semibold leading-none
                 text-white shadow-sm ring-1 ring-emerald-300/50 transition hover:bg-emerald-600"
        >
          {{ (item.contador ?? 0) > 99 ? '99+' : item.contador }}
        </span>
      </button>
      <span
        v-else-if="item.contador !== undefined"
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
