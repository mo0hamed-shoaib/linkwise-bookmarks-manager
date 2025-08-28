'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Bookmark, ExternalLink, Heart, MoreHorizontal, Star, Trash2 } from 'lucide-react'
import { Bookmark as BookmarkType } from '@/types'

interface BookmarkListProps {
  bookmark: BookmarkType
  onDelete: (id: string) => void
  onToggleFavorite: (id: string, isFavorite: boolean) => void
}

export function BookmarkList({ bookmark, onDelete, onToggleFavorite }: BookmarkListProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)
    const supabase = createBrowserSupabaseClient()

    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', bookmark.id)

      if (error) throw error

      toast.success('Bookmark deleted successfully')
      onDelete(bookmark.id)
    } catch (error) {
      console.error('Error deleting bookmark:', error)
      toast.error('Failed to delete bookmark')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleFavorite = async () => {
    setIsLoading(true)
    const supabase = createBrowserSupabaseClient()

    try {
      const { error } = await supabase
        .from('bookmarks')
        .update({ is_favorite: !bookmark.is_favorite })
        .eq('id', bookmark.id)

      if (error) throw error

      onToggleFavorite(bookmark.id, !bookmark.is_favorite)
      toast.success(bookmark.is_favorite ? 'Removed from favorites' : 'Added to favorites')
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('Failed to update favorite status')
    } finally {
      setIsLoading(false)
    }
  }

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
    } catch {
      return null
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="flex items-center justify-between p-6 border rounded-xl hover:bg-muted/50 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        <div className="flex-shrink-0">
          {getFaviconUrl(bookmark.url) ? (
            <img
              src={getFaviconUrl(bookmark.url)!}
              alt=""
              className="w-8 h-8 rounded"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : (
            <Bookmark className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="font-medium truncate">{bookmark.title}</h3>
            {bookmark.is_favorite && (
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">{bookmark.url}</p>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-xs text-muted-foreground">
              {formatDate(bookmark.created_at)}
            </span>
            {bookmark.tags && bookmark.tags.length > 0 && (
              <div className="flex items-center space-x-1">
                {bookmark.tags.slice(0, 2).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {bookmark.tags.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{bookmark.tags.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleFavorite}
          disabled={isLoading}
          className="hover:bg-accent hover:text-accent-foreground"
        >
          {bookmark.is_favorite ? (
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
          ) : (
            <Heart className="w-4 h-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="hover:bg-accent hover:text-accent-foreground"
        >
          <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4" />
          </a>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent hover:text-accent-foreground"
              disabled={isLoading}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleToggleFavorite}>
              {bookmark.is_favorite ? (
                <>
                  <Star className="mr-2 h-4 w-4" />
                  Remove from favorites
                </>
              ) : (
                <>
                  <Heart className="mr-2 h-4 w-4" />
                  Add to favorites
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open link
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
