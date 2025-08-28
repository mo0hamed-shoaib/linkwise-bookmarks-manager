'use client'

import { useState, useEffect } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Bookmark as BookmarkType } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Hash, Plus, Search, Bookmark, ExternalLink } from 'lucide-react'
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

interface TagWithCount {
  name: string
  count: number
  bookmarks: BookmarkType[]
}

export default function TagsPage() {
  const [user, setUser] = useState<any>(null)
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([])
  const [tags, setTags] = useState<TagWithCount[]>([])
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isCommandOpen, setIsCommandOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
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
      processTags(bookmarksData || [])
    } catch (error) {
      console.error('Error fetching bookmarks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const processTags = (bookmarksData: BookmarkType[]) => {
    const tagMap = new Map<string, BookmarkType[]>()
    
    bookmarksData.forEach(bookmark => {
      if (bookmark.tags && Array.isArray(bookmark.tags)) {
        bookmark.tags.forEach(tag => {
          if (!tagMap.has(tag)) {
            tagMap.set(tag, [])
          }
          tagMap.get(tag)!.push(bookmark)
        })
      }
    })

    const tagsWithCount: TagWithCount[] = Array.from(tagMap.entries()).map(([name, bookmarks]) => ({
      name,
      count: bookmarks.length,
      bookmarks
    })).sort((a, b) => b.count - a.count)

    setTags(tagsWithCount)
  }

  const handleDeleteBookmark = (id: string) => {
    setBookmarks(bookmarks.filter(bookmark => bookmark.id !== id))
    processTags(bookmarks.filter(bookmark => bookmark.id !== id))
  }

  const handleToggleFavorite = (id: string, isFavorite: boolean) => {
    setBookmarks(bookmarks.map(bookmark => 
      bookmark.id === id ? { ...bookmark, is_favorite: isFavorite } : bookmark
    ))
  }

  const handleAddBookmark = () => {
    setIsAddModalOpen(false)
    if (user) {
      fetchBookmarks(user.id)
    }
  }

  const filteredTags = tags.filter(tag => 
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedTagBookmarks = selectedTag 
    ? tags.find(tag => tag.name === selectedTag)?.bookmarks || []
    : []

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
                <BreadcrumbPage>Tags</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Row 2: Page Title + Actions */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Tags</h1>
          <div className="flex items-center gap-2">
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Bookmark
            </Button>
            <ViewToggle view={viewMode} onViewChange={setViewMode} />
          </div>
        </div>

        {/* Row 3: Search */}
        <div className="space-y-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Row 4: Tags Grid */}
        {!selectedTag && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {filteredTags.length} tag{filteredTags.length !== 1 ? 's' : ''} found
            </div>
            {filteredTags.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredTags.map((tag) => (
                  <Card 
                    key={tag.name} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedTag(tag.name)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-muted-foreground" />
                          <CardTitle className="text-sm font-medium">{tag.name}</CardTitle>
                        </div>
                        <Badge variant="secondary">{tag.count}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-muted-foreground">
                        {tag.count} bookmark{tag.count !== 1 ? 's' : ''}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Hash className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No tags found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery 
                      ? 'Try adjusting your search'
                      : 'Start by adding bookmarks with tags'
                    }
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => setIsAddModalOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Bookmark
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Row 5: Selected Tag Bookmarks */}
        {selectedTag && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedTag(null)}
                >
                  ← Back to Tags
                </Button>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  <span className="font-medium">{selectedTag}</span>
                  <Badge variant="secondary">{selectedTagBookmarks.length}</Badge>
                </div>
              </div>
            </div>

            {selectedTagBookmarks.length > 0 ? (
              <div className={viewMode === 'grid' ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'space-y-4'}>
                {selectedTagBookmarks.map((bookmark) => 
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
                  <h3 className="text-lg font-medium mb-2">No bookmarks with this tag</h3>
                  <p className="text-muted-foreground mb-4">
                    The tag "{selectedTag}" has no bookmarks
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
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
