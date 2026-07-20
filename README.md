# Sampa na Ilha — Mockup

Layout premium do Portal Sampa na Ilha (**portalsampanailha.com.br**) — portal de notícias com raiz cultural amazônica, cobertura nacional e um ecossistema cultural (Festival de Parintins, Grupo de Dança, Workshops, Eventos).

## Tecnologias

- HTML5 semântico
- CSS3 (Grid, Flexbox, Custom Properties) — compartilhado via `assets/css/style.css`
- Font Awesome 5 (ícones)
- Google Fonts (Playfair Display + Inter)

## Estrutura

```
sampaIlha/
├── assets/
│   ├── css/style.css        # Estilos compartilhados por todas as páginas
│   └── img/logo.png          # Logo do portal (a ser adicionada)
├── index.html                 # Home
├── turismo.html                # Turismo / Festival de Parintins
├── noticia.html                 # Página modelo de matéria (compartilhamento social + newsletter)
├── vagas.html                    # Vagas de emprego
├── podcast.html                   # Podcast & Ao Vivo — RASCUNHO, fora do menu até o lançamento
├── cultura/
│   ├── cultura-arte.html            # Cultura & Arte (conteúdo jornalístico/histórico)
│   ├── o-projeto.html                # Página institucional "O Projeto Sampa na Ilha"
│   ├── grupo-danca.html               # Grupo de Dança
│   ├── workshops.html                  # Workshops & Artesanato
│   └── eventos.html                     # Eventos & Atrações
└── regioes/
    ├── norte.html, nordeste.html, centro-oeste.html, sudeste.html, sul.html
```

## Funcionalidades do Layout

- Breaking news ticker animado
- Header sticky com navegação responsiva e dropdown de Cultura
- Barra de categorias temáticas/nacionais (não mais focada em litoral/praias)
- Hero grid (destaque principal + 2 secundários)
- Grade de notícias (3 colunas) + "Giro de Notícias"
- Sidebar: previsão do tempo, mais lidos, newsletter, tags, anúncio
- Página de notícia com compartilhamento social (WhatsApp, Instagram, Facebook, X, copiar link) e newsletter
- Footer completo com colunas de Editorias, Regiões (Norte/Nordeste/Centro-Oeste/Sudeste/Sul) e redes sociais
- Totalmente responsivo (mobile / tablet / desktop)

## Conteúdo pendente (placeholders)

As páginas abaixo têm conteúdo de exemplo marcado com um aviso visual, aguardando o material real do cliente:

- `turismo.html` — migrar conteúdo da aba "Festival de Parintins" do site atual
- `cultura/cultura-arte.html` — migrar conteúdo da aba "Cultura & Arte" do site atual
- `cultura/grupo-danca.html`, `cultura/workshops.html`, `cultura/eventos.html` — formulários de inscrição, termos de participação e fotos
- `podcast.html` — embeds reais de player (Spotify/Deezer/YouTube) e transmissão ao vivo (YouTube/Twitch); manter fora do menu até o lançamento oficial
- `assets/img/logo.png` — arquivo da logo do portal enviado pelo cliente

## Próximos Passos

- [ ] Integrar com CMS (back-end Laravel 12)
- [ ] Substituir placeholders por conteúdo e imagens reais do portal
- [ ] Implementar busca funcional
- [ ] SEO: meta tags, Open Graph, sitemap
- [ ] Ativar `podcast.html` no menu principal no lançamento oficial

## Desenvolvido por

**Guilherme Augusto dos Santos Viana**  
CNPJ: 61.676.448/0001-14
