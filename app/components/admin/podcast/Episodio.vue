<script setup lang="ts">
import { CalendarIcon, ClockIcon, ExternalLinkIcon, EyeIcon, EyeOffIcon, PencilIcon, Trash2Icon, TriangleAlertIcon } from '@lucide/vue'
import type { Episodio } from '#shared/types/podcast'
import { PLATAFORMAS_EPISODIO } from '#shared/types/podcast'

/**
 * Um episódio na listagem do painel.
 *
 * O nome do arquivo não é `Card.vue` de propósito: um SFC com esse nome se
 * referenciaria a si mesmo no lugar do `Card` do shadcn.
 *
 * O que a linha precisa responder de relance é "este episódio vai tocar?".
 * Por isso a plataforma aparece como selo e o aviso de "sem player embutido"
 * fica em destaque — é quase sempre link errado colado (a página do programa
 * no lugar da do episódio), e o card no portal vira um botão para sair do site.
 */
defineProps<{ episodio: Episodio }>()

const emit = defineEmits<{
  editar: [episodio: Episodio]
  alternar: [episodio: Episodio]
  excluir: [episodio: Episodio]
}>()

function data(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  })
}
</script>

<template>
  <Card class="gap-0 overflow-hidden py-0">
    <div class="flex flex-1 flex-col gap-2 p-4">
      <div class="flex items-start justify-between gap-2">
        <h3 class="line-clamp-2 text-sm font-semibold leading-snug">
          <span v-if="episodio.numero !== null" class="text-muted-foreground">EP {{ episodio.numero }} · </span>
          {{ episodio.titulo }}
        </h3>
        <Badge :variant="episodio.status === 'publicado' ? 'default' : 'secondary'">
          {{ episodio.status === 'publicado' ? 'Publicado' : 'Rascunho' }}
        </Badge>
      </div>

      <p v-if="episodio.descricao" class="line-clamp-2 text-sm text-muted-foreground">
        {{ episodio.descricao }}
      </p>

      <p class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span class="flex items-center gap-1.5">
          <CalendarIcon class="size-3.5 shrink-0" /> {{ data(episodio.publicadoEm) }}
        </span>
        <span v-if="episodio.duracao" class="flex items-center gap-1.5">
          <ClockIcon class="size-3.5 shrink-0" /> {{ episodio.duracao }}
        </span>
        <span class="flex items-center gap-1.5">
          <i :class="PLATAFORMAS_EPISODIO[episodio.plataforma].icone" />
          {{ PLATAFORMAS_EPISODIO[episodio.plataforma].rotulo }}
        </span>
      </p>

      <p v-if="!episodio.embedUrl" class="flex items-start gap-1.5 text-xs text-amber-600">
        <TriangleAlertIcon class="mt-0.5 size-3.5 shrink-0" />
        Sem player embutido — o card mostra um botão que tira o leitor do site. Confira se o link é
        o do episódio, e não o da página do programa.
      </p>

      <a
        :href="episodio.midiaUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-1.5 truncate text-xs text-primary hover:underline"
        :title="episodio.midiaUrl"
      >
        <ExternalLinkIcon class="size-3.5 shrink-0" />
        <span class="truncate">{{ episodio.midiaUrl }}</span>
      </a>
    </div>

    <div class="flex items-center gap-2 border-t p-3">
      <Button variant="outline" size="sm" class="flex-1" @click="emit('alternar', episodio)">
        <EyeOffIcon v-if="episodio.status === 'publicado'" class="size-4" />
        <EyeIcon v-else class="size-4" />
        {{ episodio.status === 'publicado' ? 'Recolher' : 'Publicar' }}
      </Button>
      <Button variant="ghost" size="icon-sm" title="Editar episódio" @click="emit('editar', episodio)">
        <PencilIcon class="size-4" />
      </Button>
      <Button variant="ghost" size="icon-sm" title="Excluir episódio" @click="emit('excluir', episodio)">
        <Trash2Icon class="size-4 text-destructive" />
      </Button>
    </div>
  </Card>
</template>
