<script setup lang="ts">
import Editor from '@tinymce/tinymce-vue'

/**
 * Editor do corpo da matéria.
 *
 * O TinyMCE roda self-hosted (`/tinymce`, servido pelo Nitro a partir do
 * pacote npm): sem CDN, sem chave de API e sem nada saindo para fora.
 *
 * As imagens vão pelo mesmo endpoint da foto da matéria, com `set_as_cover`
 * desligado — a capa continua sendo escolhida no bloco de fotos. Como a API
 * anexa o arquivo a uma matéria existente, o upload só fica disponível depois
 * de o conteúdo ser salvo pela primeira vez.
 */
const props = defineProps<{ postId?: string | null }>()
const conteudo = defineModel<string>({ required: true })

/**
 * O editor monta um iframe próprio e escolhe o skin na inicialização, então
 * mudar o tema do painel recria o componente pela `key`.
 *
 * Lê o mesmo `useState` de `useTemaAdmin` em vez de chamar o composable: ele
 * limpa a classe `dark` do <html> ao desmontar, e o editor sair da tela não
 * pode apagar o tema do painel inteiro.
 */
const escuro = useState('admin-tema-escuro', () => false)

const CONTEUDO_CSS = `
  body { font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 1.75; padding: 12px 16px; }
  h2 { font-family: Arial, Helvetica, sans-serif; font-size: 1.5rem; font-weight: 700; margin: 1.6em 0 .5em; }
  h3 { font-family: Arial, Helvetica, sans-serif; font-size: 1.2rem; font-weight: 700; margin: 1.4em 0 .4em; }
  p { margin: 0 0 1.1em; }
  blockquote { margin: 1.4em 0; padding: .2em 0 .2em 1em; border-left: 3px solid #0a4fa8; font-style: italic; }
  img { max-width: 100%; height: auto; border-radius: 8px; }
  figure { margin: 1.4em 0; }
  figcaption { font-size: .82rem; line-height: 1.45; color: #6b7280; text-align: center; margin-top: .5em; }
  .texto-esquerda { text-align: left; }
  .texto-centro   { text-align: center; }
  .texto-direita  { text-align: right; }
  a { color: #0a4fa8; }
`

async function enviarImagem(blobInfo: { blob: () => Blob, filename: () => string }): Promise<string> {
  if (!props.postId) {
    // A API anexa a imagem a uma matéria existente; sem id não há onde pendurar.
    throw new Error('Salve o conteúdo primeiro — a imagem é anexada à matéria já criada.')
  }

  const corpo = new FormData()
  corpo.append('file', blobInfo.blob(), blobInfo.filename())
  corpo.append('set_as_cover', 'false')

  try {
    const foto = await $fetch<{ url: string }>(`/api/posts/${props.postId}/foto`, {
      method: 'POST',
      body: corpo,
    })
    return foto.url
  }
  catch (e: unknown) {
    // O TinyMCE mostra esta mensagem na própria notificação dele, dentro do
    // editor — por isso aqui se lança em vez de chamar `avisar`.
    throw new Error(mensagemDoErro(e, 'Não foi possível enviar a imagem.'))
  }
}

const configuracao = computed(() => ({
  language: 'pt_BR',
  // A pasta NÃO pode começar com "tinymce": o `publicAssets` do nuxt.config
  // serve node_modules/tinymce sob o baseURL `tinymce` e captura por prefixo,
  // então `/tinymce-i18n/...` era engolido por ele e voltava 404 — o editor
  // caía calado para o inglês.
  language_url: '/editor-i18n/pt_BR.js',
  base_url: '/tinymce',
  suffix: '.min',
  height: 560,
  menubar: false,
  branding: false,
  promotion: false,
  skin: escuro.value ? 'oxide-dark' : 'oxide',
  content_css: escuro.value ? 'dark' : 'default',
  content_style: CONTEUDO_CSS,
  // `wordcount` e `help` ficam de fora: a contagem de palavras já aparece acima
  // do campo, e o diálogo de ajuda do TinyMCE não tem tradução no pacote npm —
  // os dois só deixavam texto em inglês no rodapé.
  plugins: 'lists link image table code fullscreen searchreplace autoresize',
  toolbar: [
    'undo redo | blocks | bold italic underline | bullist numlist blockquote',
    'link image table | alignleft aligncenter alignright | removeformat searchreplace code fullscreen',
  ].join(' | '),
  block_formats: 'Parágrafo=p; Título 2=h2; Título 3=h3',
  autoresize_bottom_margin: 24,
  min_height: 420,
  max_height: 900,
  // Colar do Word/Docs sem arrastar a formatação da origem junto.
  paste_as_text: false,
  paste_data_images: true,
  powerpaste_word_import: 'clean',
  images_upload_handler: enviarImagem,
  automatic_uploads: true,
  file_picker_types: 'image',
  image_caption: true,
  image_dimensions: false,
  image_class_list: [{ title: 'Padrão', value: '' }],
  // Barra em duas linhas em vez de esconder metade dos botões no "…".
  toolbar_mode: 'wrap',
  link_default_target: '_blank',
  link_assume_external_targets: true,
  // Só o que o portal sabe renderizar; o resto é limpo na entrada.
  valid_elements: 'p[class],br,strong/b,em/i,u,s,h2[class],h3[class],blockquote[class],ul,ol,li[class],'
    + 'a[href|target|rel],img[src|alt|width|height],figure[class],figcaption[class],'
    + 'table[border],thead,tbody,tr,th,td,hr',
  /**
   * Alinhamento como classe, não como `style="text-align"`.
   *
   * O `valid_elements` acima existe para o portal só receber o que sabe
   * renderizar, e atributo `style` não está na lista. Com o padrão do TinyMCE
   * — que alinha por style — o botão centralizava na tela do editor e o
   * serializador jogava o style fora ao salvar: o texto voltava para a
   * esquerda depois de publicado, sem nenhum aviso. As três classes abaixo
   * têm regra correspondente em assets/css/portal/noticia.css.
   */
  formats: {
    alignleft: { selector: 'p,h2,h3,blockquote,figure,figcaption,li', classes: 'texto-esquerda' },
    aligncenter: { selector: 'p,h2,h3,blockquote,figure,figcaption,li', classes: 'texto-centro' },
    alignright: { selector: 'p,h2,h3,blockquote,figure,figcaption,li', classes: 'texto-direita' },
  },
  extended_valid_elements: '',
}))

/**
 * O wrapper Vue monta o `setup` do init com o dele, então o aviso vai no
 * evento `init` do componente.
 *
 * Atenção à assinatura: `@init` é o único handler que o wrapper chama como
 * `handler(evento, editor)`, com o editor no SEGUNDO argumento (os demais
 * recebem `(evento, editor)` via `editor.on`). Ler o editor de dentro do
 * primeiro argumento devolve `undefined` — foi o que quebrou a tela de novo
 * conteúdo em produção.
 */
function aoIniciar(_evento: unknown, editor: any) {
  if (props.postId) return

  editor?.notificationManager?.open({
    text: 'Salve o conteúdo uma vez para poder inserir imagens no texto.',
    type: 'info',
    timeout: 6000,
  })
}

const chaveDoEditor = computed(() => `${escuro.value ? 'dark' : 'light'}-${props.postId ?? 'novo'}`)

function avisarSemImagem() {
  if (!props.postId) avisar.info('Salve o conteúdo primeiro para anexar imagens ao texto.')
}
</script>

<template>
  <div class="tinymce-wrapper" @dragover="avisarSemImagem">
    <ClientOnly>
      <!--
        `tinymce-script-src`: sem isso o wrapper busca o editor no CDN da Tiny,
        com chave de API. `license-key`: o wrapper sobrescreve o `license_key`
        do init pelo valor desta prop, e sem ela o editor nasce bloqueado.
      -->
      <Editor
        :key="chaveDoEditor"
        v-model="conteudo"
        tinymce-script-src="/tinymce/tinymce.min.js"
        license-key="gpl"
        :init="configuracao"
        @init="aoIniciar"
      />
      <template #fallback>
        <div class="flex h-[420px] items-center justify-center rounded-md border border-input bg-muted/30 text-sm text-muted-foreground">
          Carregando o editor…
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
/* Encosta a moldura do editor no visual dos outros campos do formulário. */
.tinymce-wrapper :deep(.tox-tinymce) {
  border-radius: var(--radius, 8px);
  border-color: var(--border, #e5e7eb);
}
</style>
