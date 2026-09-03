<script setup lang="ts">
import {
  CheckIcon, CopyIcon, DownloadIcon, FileIcon, FileTextIcon, ImageIcon, PencilIcon, Trash2Icon,
} from '@lucide/vue'
import type { MidiaKit, MidiaKitTipo } from '#shared/types/content'

/**
 * Um card do acervo — uma peça do mídia kit.
 *
 * O card responde ao que o comercial precisa saber antes de mandar o arquivo:
 * o que é, que dimensões tem e quanto pesa. Daí o destaque da descrição — é
 * ali que estão as regras de uso, e não em um campo escondido.
 */
const props = defineProps<{ peca: MidiaKit }>()

const emit = defineEmits<{
  editar: [peca: MidiaKit]
  excluir: [peca: MidiaKit]
}>()

const copiado = ref(false)
let devolverIcone: ReturnType<typeof setTimeout> | undefined

const ICONES: Record<MidiaKitTipo, unknown> = {
  imagem: ImageIcon,
  pdf: FileIcon,
  documento: FileTextIcon,
}

const ROTULOS: Record<MidiaKitTipo, string> = {
  imagem: 'Imagem',
  pdf: 'PDF',
  documento: 'Documento',
}

function tamanhoLegivel(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const unidades = ['KB', 'MB', 'GB']
  let valor = bytes / 1024
  let i = 0
  while (valor >= 1024 && i < unidades.length - 1) {
    valor /= 1024
    i++
  }
  return `${valor.toFixed(valor >= 10 ? 0 : 1).replace('.', ',')} ${unidades[i]}`
}

const enviadoEm = computed(() =>
  new Date(props.peca.criadoEm).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  }),
)

/**
 * Copia o link do arquivo — é a ação do dia a dia aqui.
 *
 * Responder "manda o mídia kit" é colar este endereço no e-mail; obrigar a
 * baixar o arquivo para reenviá-lo em anexo seria o caminho longo para a mesma
 * coisa. O ícone vira um "certo" por alguns segundos porque a área de
 * transferência não dá sinal nenhum de que a cópia aconteceu.
 */
async function copiarLink() {
  try {
    await navigator.clipboard.writeText(props.peca.url)
    copiado.value = true
    clearTimeout(devolverIcone)
    devolverIcone = setTimeout(() => (copiado.value = false), 2500)
    avisar.sucesso('Link copiado.', 'Cole no e-mail para o patrocinador.')
  }
  catch {
    // Navegador sem permissão de área de transferência (ou fora de HTTPS):
    // o link continua alcançável pelo botão de baixar, ao lado.
    avisar.alerta('Não foi possível copiar.', 'Use o botão de baixar para abrir o arquivo.')
  }
}

onUnmounted(() => clearTimeout(devolverIcone))
</script>

<template>
  <Card class="group gap-0 py-0 transition-shadow hover:shadow-md">
    <div class="flex items-start justify-between gap-2 border-b p-4">
      <div class="flex min-w-0 items-start gap-3">
        <span class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          <component :is="ICONES[peca.tipo]" class="size-5 text-muted-foreground" />
        </span>
        <div class="min-w-0">
          <h3 class="line-clamp-2 text-sm font-semibold leading-snug">{{ peca.titulo }}</h3>
          <p class="mt-0.5 text-xs text-muted-foreground">
            {{ ROTULOS[peca.tipo] }} · {{ tamanhoLegivel(peca.tamanho) }} · {{ enviadoEm }}
          </p>
        </div>
      </div>

      <div class="flex shrink-0 gap-0.5">
        <Button variant="ghost" size="icon-sm" title="Editar título e dimensões" @click="emit('editar', peca)">
          <PencilIcon class="size-4" />
        </Button>
        <Button variant="ghost" size="icon-sm" title="Excluir peça" @click="emit('excluir', peca)">
          <Trash2Icon class="size-4 text-destructive" />
        </Button>
      </div>
    </div>

    <div class="flex-1 p-4">
      <p v-if="peca.descricao" class="whitespace-pre-line text-sm text-muted-foreground">
        {{ peca.descricao }}
      </p>
      <p v-else class="text-sm italic text-muted-foreground/70">
        Sem dimensões anotadas.
      </p>
    </div>

    <div class="flex items-center gap-2 border-t p-3">
      <Button as-child variant="outline" size="sm" class="flex-1">
        <a :href="peca.url" target="_blank" rel="noopener noreferrer" :title="peca.nomeArquivo">
          <DownloadIcon class="size-4" />
          <span class="truncate">{{ peca.nomeArquivo }}</span>
        </a>
      </Button>
      <Button variant="ghost" size="icon-sm" title="Copiar link do arquivo" @click="copiarLink()">
        <CheckIcon v-if="copiado" class="size-4 text-emerald-600 dark:text-emerald-400" />
        <CopyIcon v-else class="size-4" />
      </Button>
    </div>
  </Card>
</template>
