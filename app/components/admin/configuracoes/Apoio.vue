<script setup lang="ts">
import { HeartIcon, LoaderCircleIcon, SaveIcon } from '@lucide/vue'
import type { Apoio } from '#shared/types/apoio'

/**
 * Área de apoio do leitor — o bloco "apoie o portal" na coluna lateral.
 *
 * A regra que a tela toda serve: **um convite que não leva a lugar nenhum não
 * vai ao ar**. Ligar o bloco sem link e sem chave Pix desenharia um card com
 * um botão que não faz nada, e o erro só apareceria para quem está lendo — por
 * isso o aviso aqui, e por isso a API desliga sozinha se passar.
 */
const apoio = useApoioStore()

await apoio.carregar()

/*
   Os campos de texto são string, nunca `null`: o `<Input>` não aceita nulo, e
   o que o leitor não preencheu vira `null` só na hora de salvar — que é onde a
   API distingue "sem valor" de "vazio".
*/
function paraFormulario(dados: Apoio) {
  return {
    ativo: dados.ativo,
    titulo: dados.titulo,
    descricao: dados.descricao,
    rotuloBotao: dados.rotuloBotao,
    url: dados.url ?? '',
    chavePix: dados.chavePix ?? '',
    observacao: dados.observacao,
  }
}

const form = reactive(paraFormulario(apoio.dados))

/** Recarrega o formulário quando a store muda (salvar devolve o gravado). */
watch(() => apoio.dados, (novo) => Object.assign(form, paraFormulario(novo)), { deep: true })

const linkValido = computed(() => {
  const url = form.url.trim()
  return !url || /^https?:\/\//i.test(url)
})

const temDestino = computed(() => !!(form.url.trim() || form.chavePix.trim()))

const podeSalvar = computed(() =>
  form.titulo.trim().length >= 2 && linkValido.value && (!form.ativo || temDestino.value))

async function salvar() {
  try {
    const salvo = await apoio.salvar({
      ...form,
      url: form.url.trim() || null,
      chavePix: form.chavePix.trim() || null,
    })

    if (salvo.ativo) {
      avisar.sucesso('Área de apoio no ar.', 'O bloco já aparece na coluna lateral do portal.')
    }
    else {
      avisar.sucesso('Área de apoio salva e desligada.', 'O portal não desenha o bloco enquanto ela estiver assim.')
    }
  }
  catch (e: unknown) {
    avisar.erro(e, 'Não foi possível salvar a área de apoio.', 'O que você preencheu continua aí.')
  }
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <HeartIcon class="size-4" /> Apoie o portal
      </CardTitle>
      <CardDescription>
        Um bloco na coluna lateral pedindo apoio do leitor. Não é publicidade: não disputa espaço
        com anunciante e o texto é seu, não uma arte enviada.
      </CardDescription>
    </CardHeader>

    <CardContent class="grid gap-4">
      <div class="flex items-start justify-between gap-4 rounded-lg border p-3">
        <div>
          <Label for="apoio-ativo" class="text-sm font-medium">Mostrar no portal</Label>
          <p class="mt-1 text-xs text-muted-foreground">
            Desligado, o bloco simplesmente não é desenhado — sem moldura vazia.
          </p>
        </div>
        <Switch id="apoio-ativo" v-model="form.ativo" />
      </div>

      <p v-if="form.ativo && !temDestino" class="rounded-md bg-amber-50 p-3 text-xs text-amber-700">
        Informe um <strong>link de doação</strong> ou uma <strong>chave Pix</strong> antes de ligar.
        Sem destino, o bloco seria um botão que não faz nada — e ele volta desligado ao salvar.
      </p>

      <div class="grid gap-2">
        <Label for="apoio-titulo">Título</Label>
        <Input id="apoio-titulo" v-model="form.titulo" maxlength="120" placeholder="Apoie o Sampa na Ilha" />
      </div>

      <div class="grid gap-2">
        <Label for="apoio-descricao">Texto</Label>
        <Textarea
          id="apoio-descricao"
          v-model="form.descricao"
          rows="3"
          maxlength="600"
          placeholder="Por que o portal precisa de apoio e o que o leitor ajuda a manter."
        />
      </div>

      <div class="grid gap-2">
        <Label for="apoio-url">Link de doação</Label>
        <Input
          id="apoio-url"
          v-model="form.url"
          maxlength="500"
          placeholder="https://apoia.se/…"
          :aria-invalid="!linkValido"
        />
        <p v-if="!linkValido" class="text-xs text-destructive">
          O link precisa começar com http:// ou https://.
        </p>
        <p v-else class="text-xs text-muted-foreground">
          Apoia.se, PicPay, Vakinha ou qualquer página de doação. Vazio esconde o botão.
        </p>
      </div>

      <div class="grid gap-2 sm:grid-cols-2">
        <div class="grid gap-2">
          <Label for="apoio-botao">Texto do botão</Label>
          <Input id="apoio-botao" v-model="form.rotuloBotao" maxlength="40" placeholder="Quero apoiar" />
        </div>

        <div class="grid gap-2">
          <Label for="apoio-pix">Chave Pix</Label>
          <Input
            id="apoio-pix"
            v-model="form.chavePix"
            maxlength="200"
            placeholder="CNPJ, e-mail ou chave aleatória"
          />
        </div>
      </div>
      <p class="-mt-2 text-xs text-muted-foreground">
        A chave aparece no bloco com um botão de copiar. Vazia, o campo some.
      </p>

      <div class="grid gap-2">
        <Label for="apoio-nota">Observação</Label>
        <Input
          id="apoio-nota"
          v-model="form.observacao"
          maxlength="200"
          placeholder="Ex.: Doação a partir de R$ 10. Recibo por e-mail."
        />
        <p class="text-xs text-muted-foreground">Linha pequena abaixo do botão.</p>
      </div>
    </CardContent>

    <CardFooter>
      <Button :disabled="apoio.salvando || !podeSalvar" @click="salvar()">
        <LoaderCircleIcon v-if="apoio.salvando" class="size-4 animate-spin" />
        <SaveIcon v-else class="size-4" />
        Salvar área de apoio
      </Button>
    </CardFooter>
  </Card>
</template>
