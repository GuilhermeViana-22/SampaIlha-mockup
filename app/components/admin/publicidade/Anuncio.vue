<script setup lang="ts">
import { CalendarRangeIcon, ExternalLinkIcon, EyeIcon, EyeOffIcon, PencilIcon, Trash2Icon } from '@lucide/vue'
import type { Publicidade } from '#shared/types/content'
import { VISIBILIDADE_PUBLICIDADE } from '#shared/types/content'

/**
 * Um anúncio na listagem do painel.
 *
 * O arquivo não se chama `Card.vue` de propósito: um SFC com esse nome se
 * referenciaria a si mesmo no lugar do `Card` do shadcn.
 *
 * O card mostra a arte em cima porque é ela que o leitor vê — conferir o
 * criativo é a primeira coisa que se faz ao abrir esta tela. O selo de
 * situação vem da API (`visibilidade`), e não do `status`: um anúncio
 * publicado com janela fechada não está no ar, e escrever "Publicado" nele
 * mentiria para quem administra.
 */
defineProps<{ anuncio: Publicidade }>()

const emit = defineEmits<{
  editar: [anuncio: Publicidade]
  alternar: [anuncio: Publicidade]
  excluir: [anuncio: Publicidade]
}>()

/** Data legível a partir do ISO, sem passar pelo fuso do navegador. */
function data(iso: string | null): string {
  if (!iso) return ''
  const [ano, mes, dia] = iso.split('-').map(Number)
  return new Date(ano!, mes! - 1, dia!).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

/** A janela contratada em uma linha. Sem datas, o anúncio não tem prazo. */
function janela(anuncio: Publicidade): string {
  if (!anuncio.publicarDe && !anuncio.publicarAte) return 'Sem prazo'
  if (anuncio.publicarDe && anuncio.publicarAte) return `${data(anuncio.publicarDe)} a ${data(anuncio.publicarAte)}`
  if (anuncio.publicarDe) return `A partir de ${data(anuncio.publicarDe)}`
  return `Até ${data(anuncio.publicarAte)}`
}
</script>

<template>
  <Card class="gap-0 overflow-hidden py-0">
    <img
      :src="anuncio.imagemUrl"
      :alt="`Arte de ${anuncio.titulo}`"
      class="aspect-[6/5] w-full bg-muted object-contain"
    >

    <div class="flex flex-1 flex-col gap-2 border-t p-4">
      <div class="flex items-start justify-between gap-2">
        <h3 class="line-clamp-2 text-sm font-semibold leading-snug">{{ anuncio.titulo }}</h3>
        <Badge
          :variant="VISIBILIDADE_PUBLICIDADE[anuncio.visibilidade].variante"
          :title="VISIBILIDADE_PUBLICIDADE[anuncio.visibilidade].ajuda"
        >
          {{ VISIBILIDADE_PUBLICIDADE[anuncio.visibilidade].rotulo }}
        </Badge>
      </div>

      <p v-if="anuncio.descricao" class="line-clamp-2 text-sm text-muted-foreground">
        {{ anuncio.descricao }}
      </p>

      <p class="flex items-center gap-1.5 text-xs text-muted-foreground">
        <CalendarRangeIcon class="size-3.5 shrink-0" />
        {{ janela(anuncio) }} · posição {{ anuncio.ordem }}
      </p>

      <a
        v-if="anuncio.linkUrl"
        :href="anuncio.linkUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-1.5 truncate text-xs text-primary hover:underline"
        :title="anuncio.linkUrl"
      >
        <ExternalLinkIcon class="size-3.5 shrink-0" />
        <span class="truncate">{{ anuncio.linkUrl }}</span>
      </a>
      <p v-else class="text-xs italic text-muted-foreground/70">Banner sem link.</p>
    </div>

    <div class="flex items-center gap-2 border-t p-3">
      <Button variant="outline" size="sm" class="flex-1" @click="emit('alternar', anuncio)">
        <EyeOffIcon v-if="anuncio.status === 'publicado'" class="size-4" />
        <EyeIcon v-else class="size-4" />
        {{ anuncio.status === 'publicado' ? 'Recolher' : 'Pôr no ar' }}
      </Button>
      <Button variant="ghost" size="icon-sm" title="Editar anúncio" @click="emit('editar', anuncio)">
        <PencilIcon class="size-4" />
      </Button>
      <Button variant="ghost" size="icon-sm" title="Excluir anúncio" @click="emit('excluir', anuncio)">
        <Trash2Icon class="size-4 text-destructive" />
      </Button>
    </div>
  </Card>
</template>
