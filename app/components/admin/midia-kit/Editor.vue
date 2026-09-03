<script setup lang="ts">
import { LoaderCircleIcon, SaveIcon } from '@lucide/vue'
import type { MidiaKit } from '#shared/types/content'

/**
 * Correção do texto de uma peça: título e dimensões.
 *
 * O arquivo não entra aqui de propósito. O link de uma peça já pode ter ido
 * para um patrocinador, e trocar o conteúdo por baixo do mesmo endereço mudaria
 * o que essa pessoa recebe sem ninguém perceber — arquivo novo é peça nova.
 */
const props = defineProps<{ peca: MidiaKit | null }>()
const aberto = defineModel<boolean>({ required: true })
const emit = defineEmits<{ salva: [peca: MidiaKit] }>()

const salvando = ref(false)
const form = reactive({ titulo: '', descricao: '' })

/** Recarrega o formulário toda vez que o diálogo abre. */
watch(aberto, (abriu) => {
  if (!abriu) return
  form.titulo = props.peca?.titulo ?? ''
  form.descricao = props.peca?.descricao ?? ''
})

const podeSalvar = computed(() => form.titulo.trim().length >= 2)

async function salvar() {
  if (!props.peca || !podeSalvar.value || salvando.value) return

  salvando.value = true

  try {
    const atualizada = await $fetch<MidiaKit>(`/api/midia-kit/${props.peca.id}`, {
      method: 'PUT',
      body: { titulo: form.titulo.trim(), descricao: form.descricao.trim() },
    })

    emit('salva', atualizada)
    aberto.value = false
    avisar.sucesso('Peça atualizada.')
  }
  catch (erro: unknown) {
    avisar.erro(erro, 'Não foi possível salvar a peça.')
  }
  finally {
    salvando.value = false
  }
}
</script>

<template>
  <Dialog v-model:open="aberto">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Editar peça</DialogTitle>
        <DialogDescription>
          O arquivo continua o mesmo — para trocá-lo, exclua esta peça e suba a nova.
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-4 py-2">
        <div class="grid gap-2">
          <Label for="titulo-edicao">Título</Label>
          <Input id="titulo-edicao" v-model="form.titulo" maxlength="180" />
        </div>

        <div class="grid gap-2">
          <Label for="descricao-edicao">Dimensões e uso</Label>
          <Textarea id="descricao-edicao" v-model="form.descricao" rows="5" />
        </div>

        <p class="text-xs text-muted-foreground">
          Arquivo: <span class="font-medium text-foreground">{{ peca?.nomeArquivo }}</span>
        </p>
      </div>

      <DialogFooter>
        <Button variant="outline" :disabled="salvando" @click="aberto = false">Cancelar</Button>
        <Button :disabled="salvando || !podeSalvar" @click="salvar()">
          <LoaderCircleIcon v-if="salvando" class="size-4 animate-spin" />
          <SaveIcon v-else class="size-4" />
          Salvar
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
