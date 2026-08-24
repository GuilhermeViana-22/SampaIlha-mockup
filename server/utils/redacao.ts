import type { Usuario } from '../../shared/types/content'

/** Como a API descreve alguém da redação. */
export interface ApiUsuario {
  id: string
  name: string
  email: string
  role: string
  bio: string | null
  avatar_url: string | null
  is_active: boolean
  posts_count: number
  password_managed_by_env: boolean
  created_at: string
}

/**
 * A API fala em `admin`/`editor`; o painel fala em editor-chefe e editor, que é
 * a linguagem da redação. A tradução mora aqui para não se espalhar.
 */
export function paraUsuario(api: ApiUsuario): Usuario {
  return {
    id: api.id,
    nome: api.name,
    email: api.email,
    papel: api.role === 'admin' ? 'editor-chefe' : 'editor',
    bio: api.bio ?? '',
    avatarUrl: api.avatar_url,
    ativo: api.is_active,
    totalPosts: api.posts_count,
    senhaDoAmbiente: api.password_managed_by_env,
    criadoEm: api.created_at,
  }
}

export function paraPapelApi(papel: string | undefined): 'admin' | 'editor' | undefined {
  if (papel === 'editor-chefe' || papel === 'admin') return 'admin'
  if (papel === 'editor') return 'editor'
  return undefined
}
