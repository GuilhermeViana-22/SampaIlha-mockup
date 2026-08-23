/** Estrutura de navegação do site público e do dashboard. */

export interface ItemMenu {
  rotulo: string
  para: string
  icone?: string
  filhos?: ItemMenu[]
}

export const MENU_PRINCIPAL: ItemMenu[] = [
  { rotulo: 'Início', para: '/', icone: 'fas fa-house' },
  { rotulo: 'Notícias', para: '/noticias', icone: 'fas fa-newspaper' },
  { rotulo: 'Turismo', para: '/turismo', icone: 'fas fa-suitcase-rolling' },
  { rotulo: 'Dicas', para: '/dicas', icone: 'fas fa-lightbulb' },
  {
    rotulo: 'Cultura',
    para: '/cultura',
    icone: 'fas fa-theater-masks',
    filhos: [
      { rotulo: 'Cultura & Arte', para: '/cultura', icone: 'fas fa-newspaper' },
      { rotulo: 'O Projeto Sampa na Ilha', para: '/cultura/o-projeto', icone: 'fas fa-seedling' },
      { rotulo: 'Grupo de Dança', para: '/cultura/grupo-danca', icone: 'fas fa-music' },
      { rotulo: 'Workshops & Artesanato', para: '/cultura/workshops', icone: 'fas fa-hands-helping' },
      { rotulo: 'Eventos & Atrações', para: '/cultura/eventos', icone: 'fas fa-calendar-day' },
    ],
  },
  { rotulo: 'Vagas', para: '/vagas', icone: 'fas fa-briefcase' },
]

/**
 * Menu lateral do painel. Lista simples, sem seções: a ação de criar conteúdo
 * fica na barra superior, para não competir com o item "Conteúdos".
 */
export const MENU_ADMIN: ItemMenu[] = [
  { rotulo: 'Dashboard', para: '/admin/dashboard', icone: 'LayoutDashboard' },
  { rotulo: 'Conteúdos', para: '/admin/posts', icone: 'FileText' },
  { rotulo: 'Newsletter', para: '/admin/newsletter', icone: 'Mail' },
  { rotulo: 'Configurações', para: '/admin/configuracoes', icone: 'Settings' },
]

export const RODAPE_EDITORIAS: ItemMenu[] = [
  { rotulo: 'Turismo', para: '/categoria/turismo' },
  { rotulo: 'Meio Ambiente', para: '/categoria/meio-ambiente' },
  { rotulo: 'Gastronomia', para: '/categoria/gastronomia' },
  { rotulo: 'Esportes', para: '/categoria/esportes' },
  { rotulo: 'Cultura', para: '/categoria/cultura' },
]

export const RODAPE_PORTAL: ItemMenu[] = [
  { rotulo: 'Sobre nós', para: '/cultura/o-projeto' },
  { rotulo: 'Informações & Serviço', para: '/informacoes' },
  { rotulo: 'Contato', para: '/informacoes' },
  { rotulo: 'Anuncie', para: '/informacoes' },
  { rotulo: 'Trabalhe Conosco', para: '/vagas' },
  { rotulo: 'Política de Privacidade', para: '/informacoes' },
  { rotulo: 'Área da redação', para: '/admin' },
]

export const REDES_SOCIAIS = [
  { rotulo: 'Instagram', icone: 'fab fa-instagram', url: 'https://instagram.com' },
  { rotulo: 'Facebook', icone: 'fab fa-facebook-f', url: 'https://facebook.com' },
  { rotulo: 'YouTube', icone: 'fab fa-youtube', url: 'https://youtube.com' },
  { rotulo: 'WhatsApp', icone: 'fab fa-whatsapp', url: 'https://wa.me/5511913060670' },
  { rotulo: 'Twitter / X', icone: 'fab fa-x-twitter', url: 'https://x.com' },
]

export const CONTATO = {
  email: 'contato@portalsampanailha.com.br',
  telefone: '(11) 91306-0670',
  razaoSocial: 'Sampa na Ilha Produções e Comunicação LTDA',
  cnpj: '66.549.829/0001-56',
  tagline: 'Conectando São Paulo ao Brasil',
}
