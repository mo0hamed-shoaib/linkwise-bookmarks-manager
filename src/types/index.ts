export interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
}

export interface Bookmark {
  id: string
  user_id: string
  title: string
  url: string
  description?: string
  favicon_url?: string
  is_favorite: boolean
  tags: string[]
  category_id?: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  user_id: string
  parent_id?: string
  name: string
  color?: string
  icon?: string
  sort_order?: number
  created_at: string
  updated_at: string
  children?: Category[]
}

export interface CategoryTree extends Category {
  children: CategoryTree[]
  level: number
  path: string[]
}

export interface Tag {
  id: string
  user_id: string
  name: string
  created_at: string
  updated_at: string
}

export interface BookmarkWithRelations extends Bookmark {
  category?: Category
  tags: Tag[]
}
