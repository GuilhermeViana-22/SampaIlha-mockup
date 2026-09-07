<script setup lang="ts">
import { CalendarClockIcon, CopyIcon, MailIcon, SendIcon, SparklesIcon, Trash2Icon } from '@lucide/vue'
import type { InscricaoNewsletter } from '#shared/types/content'

/**
 * Ficha de um inscrito — o que o botão de visualizar abre.
 *
 * A tabela mostra o essencial em uma linha; aqui cabe o que se faz com o
 * endereço: copiar para colar em outro lugar, escrever direto ou tirar da base.
 */
const props = defineProps<{ inscricao: InscricaoNewsletter | null, novo?: boolean }>()
const aberto = defineModel<boolean>({ required: true })
const emit = defineEmits<{ remover: [InscricaoNewsletter] }>()

function iniciais(nome: string): string {
  return nome.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('') || '?'
}

async function copiarEmail() {
  const email = props.inscricao?.email
  if (!email) return

  try {
    await navigator.clipboard.writeText(email)
    avisar.sucesso('E-mail copiado.', email)
  }
  catch {
    avisar.falha('O navegador não deixou copiar.', 'Selecione o endereço na tela e copie na mão.')
  }
}
</script>

<template>
  <Dialog v-model:open="aberto">
    <DialogContent v-if="inscricao" class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Inscrição na newsletter</DialogTitle>
        <DialogDescription>Quem é, quando entrou e o que dá para fazer daqui.</DialogDescription>
      </DialogHeader>

      <div class="flex items-center gap-3 rounded-xl border bg-muted/40 p-4">
        <span
          class="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10
                 text-sm font-bold text-primary"
        >
          {{ iniciais(inscricao.nome) }}
        </span>
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <p class="truncate font-medium">{{ inscricao.nome }}</p>
            <Badge v-if="novo" class="gap-1 bg-emerald-500 text-white">
              <SparklesIcon class="size-3" /> Novo
            </Badge>
          </div>
          <p class="flex items-center gap-1.5 truncate text-sm text-muted-foreground">
            <MailIcon class="size-3.5 shrink-0" /> {{ inscricao.email }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2 px-1 text-sm text-muted-foreground">
        <CalendarClockIcon class="size-4 shrink-0" />
        Inscrito em {{ formatarDataHora(inscricao.criadoEm) }}
      </div>

      <DialogFooter class="gap-2 sm:justify-between">
        <Button
          variant="ghost"
          size="sm"
          class="text-destructive hover:bg-destructive/10 hover:text-destructive"
          @click="emit('remover', inscricao)"
        >
          <Trash2Icon class="size-4" /> Remover da lista
        </Button>
        <div class="flex gap-2">
          <Button variant="outline" size="sm" @click="copiarEmail()">
            <CopyIcon class="size-4" /> Copiar e-mail
          </Button>
          <Button as="a" size="sm" :href="`mailto:${inscricao.email}`">
            <SendIcon class="size-4" /> Escrever
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
