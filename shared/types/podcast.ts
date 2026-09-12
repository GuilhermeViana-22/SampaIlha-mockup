/**
 * Episódios do podcast Sampa na Ilha (/podcast).
 *
 * O áudio nunca passa pelo portal: mora no Spotify, no YouTube ou no Deezer.
 * O que existe aqui é a chamada — capa, título, texto e o endereço de onde
 * tocar. `embedUrl` é o `src` do player, já traduzido pela API a partir do
 * link que a redação colou; nulo quer dizer "plataforma que não reconhecemos",
 * e aí o card vira link em vez de player.
 */

export type StatusEpisodio = 'publicado' | 'rascunho'

export type PlataformaEpisodio = 'spotify' | 'youtube' | 'deezer' | 'outro'

export interface Episodio {
  id: string
  titulo: string
  descricao: string
  /** O endereço como veio do "compartilhar" da plataforma. */
  midiaUrl: string
  plataforma: PlataformaEpisodio
  /** `src` do `<iframe>`. Nulo = sem player; o card mostra o link. */
  embedUrl: string | null
  capaUrl: string | null
  /** Número do episódio, para o selo "EP 12". Nulo esconde o selo. */
  numero: number | null
  /** Duração como legenda ("48 min"), não como conta. */
  duracao: string | null
  status: StatusEpisodio
  /** Quando o episódio saiu — é o que ordena o feed. */
  publicadoEm: string
  criadoEm: string
  atualizadoEm: string
}

/** O que o formulário do painel edita — o resto é do servidor. */
export type EpisodioInput = Omit<
  Episodio,
  'id' | 'plataforma' | 'embedUrl' | 'capaUrl' | 'criadoEm' | 'atualizadoEm'
>

export const STATUS_EPISODIO: { valor: StatusEpisodio, rotulo: string, descricao: string }[] = [
  { valor: 'rascunho', rotulo: 'Rascunho', descricao: 'Só a redação enxerga; fica fora do feed.' },
  { valor: 'publicado', rotulo: 'Publicado', descricao: 'Aparece em /podcast.' },
]

/**
 * Como cada plataforma se apresenta no card e na listagem do painel.
 *
 * `outro` não é erro: é o episódio que o leitor alcança pelo link, sem player
 * embutido. O rótulo diz isso em vez de fingir que algo deu errado.
 */
export const PLATAFORMAS_EPISODIO: Record<
  PlataformaEpisodio,
  { rotulo: string, icone: string, cor: string }
> = {
  spotify: { rotulo: 'Spotify', icone: 'fab fa-spotify', cor: '#1DB954' },
  youtube: { rotulo: 'YouTube', icone: 'fab fa-youtube', cor: '#FF0000' },
  deezer: { rotulo: 'Deezer', icone: 'fas fa-music', cor: '#A238FF' },
  outro: { rotulo: 'Link externo', icone: 'fas fa-link', cor: '#6c757d' },
}
