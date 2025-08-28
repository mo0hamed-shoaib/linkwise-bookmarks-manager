'use client'

import { useState, useEffect } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Bookmark as BookmarkType } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bookmark, Plus, Search, Filter } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { AddBookmarkModal } from '@/components/add-bookmark-modal'
import { ViewToggle, ViewMode } from '@/components/view-toggle'
import { BookmarkCard } from '@/components/bookmark-card'
import { BookmarkList } from '@/components/bookmark-list'
import { CommandMenu } from '@/components/command-menu'

export default function AllBookmarksPage() {
  const [user, setUser] = useState<any>(null)
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([])
  const [filteredBookmarks, setFilteredBookmarks] = useState<BookmarkType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isCommandOpen, setIsCommandOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'favorites' | 'recent'>('all')
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      fetchBookmarks(user.id)
    }

    getUser()
  }, [router, supabase.auth])

  const fetchBookmarks = async (userId: string) => {
    try {
      const { data: bookmarksData } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      setBookmarks(bookmarksData || [])
      setFilteredBookmarks(bookmarksData || [])
    } catch (error) {
      console.error('Error fetching bookmarks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteBookmark = (id: string) => {
    setBookmarks(bookmarks.filter(bookmark => bookmark.id !== id))
    setFilteredBookmarks(filteredBookmarks.filter(bookmark => bookmark.id !== id))
  }

  const handleToggleFavorite = (id: string, isFavorite: boolean) => {
    setBookmarks(bookmarks.map(bookmark => 
      bookmark.id === id ? { ...bookmark, is_favorite: isFavorite } : bookmark
    ))
    setFilteredBookmarks(filteredBookmarks.map(bookmark => 
      bookmark.id === id ? { ...bookmark, is_favorite: isFavorite } : bookmark
    ))
  }

  const handleAddBookmark = () => {
    setIsAddModalOpen(false)
    if (user) {
      fetchBookmarks(user.id)
    }
  }

  // Filter and search bookmarks
  useEffect(() => {
    let filtered = bookmarks

    // Apply filter
    if (filter === 'favorites') {
      filtered = filtered.filter(bookmark => bookmark.is_favorite)
    } else if (filter === 'recent') {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      filtered = filtered.filter(bookmark => new Date(bookmark.created_at) > oneWeekAgo)
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(bookmark => 
        bookmark.title.toLowerCase().includes(query) ||
        bookmark.url.toLowerCase().includes(query) ||
        (bookmark.tags && bookmark.tags.some(tag => tag.toLowerCase().includes(query)))
      )
    }

    setFilteredBookmarks(filtered)
  }, [bookmarks, filter, searchQuery])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Row 1: Breadcrumbs */}
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>All Bookmarks</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Row 2: Page Title + Actions */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">All Bookmarks</h1>
          <div className="flex items-center gap-2">
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Bookmark
            </Button>
            <ViewToggle view={viewMode} onViewChange={setViewMode} />
          </div>
        </div>

        {/* Row 3: Search and Filters */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bookmarks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                variant={filter === 'favorites' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('favorites')}
              >
                Favorites
              </Button>
              <Button
                variant={filter === 'recent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('recent')}
              >
                Recent
              </Button>
            </div>
          </div>
        </div>

        {/* Row 4: Results Count */}
        <div className="text-sm text-muted-foreground">
          {filteredBookmarks.length} bookmark{filteredBookmarks.length !== 1 ? 's' : ''} found
        </div>

        {/* Row 5: Bookmarks Grid/List */}
        {filteredBookmarks.length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'space-y-4'}>
            {filteredBookmarks.map((bookmark) => 
              viewMode === 'grid' ? (
                <BookmarkCard
                  key={bookmark.id}
                  bookmark={bookmark}
                  onDelete={handleDeleteBookmark}
                  onToggleFavorite={handleToggleFavorite}
                />
              ) : (
                <BookmarkList
                  key={bookmark.id}
                  bookmark={bookmark}
                  onDelete={handleDeleteBookmark}
                  onToggleFavorite={handleToggleFavorite}
                />
              )
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No bookmarks found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || filter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Start by adding your first bookmark'
                }
              </p>
              {!searchQuery && filter === 'all' && (
                <Button onClick={() => setIsAddModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Bookmark
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      
      <AddBookmarkModal 
        open={isAddModalOpen} 
        onOpenChange={setIsAddModalOpen} 
      />
      
      <CommandMenu 
        open={isCommandOpen} 
        onOpenChange={setIsCommandOpen} 
      />
    </>
  )
}
