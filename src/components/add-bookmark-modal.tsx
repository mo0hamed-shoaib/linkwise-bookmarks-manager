'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createBrowserSupabaseClient } from '@/lib/supabase'
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

interface AddBookmarkModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddBookmarkModal({ open, onOpenChange }: AddBookmarkModalProps) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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
          is_favorite: false
        })

      if (error) {
        throw error
      }

      toast.success('Bookmark added successfully!')
      setTitle('')
      setUrl('')
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
