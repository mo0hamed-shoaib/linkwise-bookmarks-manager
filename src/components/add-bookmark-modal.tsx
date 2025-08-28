'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { Category, CategoryTree } from '@/types'
import { buildCategoryTree } from '@/lib/category-utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Folder } from 'lucide-react'

interface AddBookmarkModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddBookmarkModal({ open, onOpenChange }: AddBookmarkModalProps) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [categories, setCategories] = useState<CategoryTree[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const supabase = createBrowserSupabaseClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const { data: categoriesData } = await supabase
            .from('categories')
            .select('*')
            .eq('user_id', user.id)
            .order('sort_order', { ascending: true })
          
          if (categoriesData) {
            const categoryTree = buildCategoryTree(categoriesData)
            setCategories(categoryTree)
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setIsLoadingCategories(false)
      }
    }

    if (open) {
      fetchCategories()
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !url.trim()) {
      toast.error('Please fill in both title and URL')
      return
    }

    // Basic URL validation
    try {
      new URL(url)
    } catch {
      toast.error('Please enter a valid URL')
      return
    }

    setIsLoading(true)
    const supabase = createBrowserSupabaseClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('You must be logged in to add bookmarks')
        return
      }

      const { error } = await supabase
        .from('bookmarks')
        .insert({
          user_id: user.id,
          title: title.trim(),
          url: url.trim(),
          description: '',
          tags: [],
          category_id: categoryId,
          is_favorite: false
        })

      if (error) {
        throw error
      }

      toast.success('Bookmark added successfully!')
      setTitle('')
      setUrl('')
      setCategoryId(null)
      onOpenChange(false)
      
      // Refresh the page to show the new bookmark
      router.refresh()
    } catch (error) {
      console.error('Error adding bookmark:', error)
      toast.error('Failed to add bookmark. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setTitle('')
      setUrl('')
      setCategoryId(null)
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground rounded-xl border shadow-sm">
        <DialogHeader className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 py-6">
          <DialogTitle>Add Bookmark</DialogTitle>
          <DialogDescription>
            Add a new bookmark to your collection. Enter the title and URL below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 px-6">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter bookmark title"
                className="flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category (Optional)</Label>
                             <Select
                 value={categoryId || 'none'}
                 onValueChange={(value) => setCategoryId(value === 'none' ? null : value)}
                 disabled={isLoading || isLoadingCategories}
               >
                 <SelectTrigger className="flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]">
                   <SelectValue placeholder="Select a category (optional)" />
                 </SelectTrigger>
                                 <SelectContent>
                   <SelectItem value="none">No category</SelectItem>
                   {categories.map(category => (
                     <SelectItem key={category.id} value={category.id}>
                       <div className="flex items-center gap-2">
                         <Folder 
                           className="h-4 w-4" 
                           style={{ color: category.color || '#3b82f6' }} 
                         />
                         {category.path.join(' > ')}
                       </div>
                     </SelectItem>
                   ))}
                 </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex items-center justify-end gap-4 px-6 py-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
              className="border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-primary text-primary-foreground shadow-xs hover:bg-primary/90"
            >
              {isLoading ? 'Adding...' : 'Add Bookmark'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
