'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Bookmark, Hash, Folder } from 'lucide-react'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { Bookmark as BookmarkType, Category, Tag } from '@/types'

interface CommandMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const router = useRouter()
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(true)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [onOpenChange])

  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open])

  const fetchData = async () => {
    setLoading(true)
    const supabase = createBrowserSupabaseClient()

    try {
      // Fetch bookmarks
      const { data: bookmarksData } = await supabase
        .from('bookmarks')
        .select('*')
        .order('created_at', { ascending: false })

      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      // Fetch tags
      const { data: tagsData } = await supabase
        .from('tags')
        .select('*')
        .order('name')

      setBookmarks(bookmarksData || [])
      setCategories(categoriesData || [])
      setTags(tagsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (type: string, id: string) => {
    onOpenChange(false)
    
    switch (type) {
      case 'bookmark':
        router.push(`/dashboard/bookmarks/${id}`)
        break
      case 'category':
        router.push(`/dashboard/categories/${id}`)
        break
      case 'tag':
        router.push(`/dashboard/tags/${id}`)
        break
    }
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search bookmarks, tags, categories..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        {bookmarks.length > 0 && (
          <CommandGroup heading="Bookmarks">
            {bookmarks.map((bookmark) => (
              <CommandItem
                key={bookmark.id}
                onSelect={() => handleSelect('bookmark', bookmark.id)}
              >
                <Bookmark className="mr-2 h-4 w-4" />
                <span>{bookmark.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {categories.length > 0 && (
          <CommandGroup heading="Categories">
            {categories.map((category) => (
              <CommandItem
                key={category.id}
                onSelect={() => handleSelect('category', category.id)}
              >
                <Folder className="mr-2 h-4 w-4" />
                <span>{category.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {tags.length > 0 && (
          <CommandGroup heading="Tags">
            {tags.map((tag) => (
              <CommandItem
                key={tag.id}
                onSelect={() => handleSelect('tag', tag.id)}
              >
                <Hash className="mr-2 h-4 w-4" />
                <span>{tag.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  )
}
