<script setup lang="ts">
import { EyeIcon } from '@lucide/vue'
import type { Post } from '#shared/types/content'

/** Ranking de leitura — a mesma contagem que alimenta o widget do portal. */
defineProps<{ posts: Post[] }>()
</script>

<template>
  <Card class="h-full">
    <CardHeader>
      <CardTitle class="text-base">Mais lidos</CardTitle>
      <CardDescription>O que o leitor está acessando no portal.</CardDescription>
    </CardHeader>
    <CardContent class="flex flex-col gap-3">
      <div v-for="(post, indice) in posts" :key="post.id" class="flex items-start gap-3">
        <span class="w-6 shrink-0 font-serif text-xl font-bold leading-none text-muted-foreground/50">
          {{ String(indice + 1).padStart(2, '0') }}
        </span>
        <img
          v-if="post.imagemUrl"
          :src="post.imagemUrl"
          :alt="post.titulo"
          class="h-11 w-16 shrink-0 rounded-md object-cover"
        >
        <div class="min-w-0 flex-1">
          <NuxtLink :to="`/admin/posts/${post.id}`" class="line-clamp-2 text-sm font-medium hover:text-primary hover:underline">
            {{ post.titulo }}
          </NuxtLink>
          <p class="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <EyeIcon class="size-3" /> {{ formatarNumero(post.leituras) }}
            <span aria-hidden="true">·</span> {{ post.categoriaNome }}
          </p>
        </div>
      </div>

      <p v-if="!posts.length" class="py-6 text-center text-sm text-muted-foreground">
        Ainda não foram cadastrados conteúdos.
      </p>
    </CardContent>
  </Card>
</template>
