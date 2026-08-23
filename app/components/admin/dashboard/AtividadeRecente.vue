<script setup lang="ts">
import { PencilIcon } from '@lucide/vue'
import type { Post } from '#shared/types/content'

defineProps<{ posts: Post[] }>()
</script>

<template>
  <Card class="h-full">
    <CardHeader>
      <CardTitle class="text-base">Atividade recente</CardTitle>
      <CardDescription>Últimos conteúdos criados ou editados.</CardDescription>
      <CardAction>
        <Button as-child variant="ghost" size="sm">
          <NuxtLink to="/admin/posts">Ver todos</NuxtLink>
        </Button>
      </CardAction>
    </CardHeader>
    <CardContent class="flex flex-col divide-y divide-border">
      <p v-if="!posts.length" class="py-6 text-center text-sm text-muted-foreground">
        Ainda não foram cadastrados conteúdos.
      </p>

      <div v-for="post in posts" :key="post.id" class="flex items-center gap-3 py-2.5 first:pt-0">
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium">{{ post.titulo }}</p>
          <p class="text-xs text-muted-foreground">
            {{ post.autor }} · {{ tempoRelativo(post.atualizadoEm) }}
          </p>
        </div>
        <AdminPostsEtiquetaStatus :status="post.status" />
        <Button as-child variant="ghost" size="icon-sm" title="Editar">
          <NuxtLink :to="`/admin/posts/${post.id}`">
            <PencilIcon class="size-4" />
          </NuxtLink>
        </Button>
      </div>
    </CardContent>
  </Card>
</template>
