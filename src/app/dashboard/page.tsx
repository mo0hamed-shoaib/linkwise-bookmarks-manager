'use client'

import { useState, useEffect } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Bookmark as BookmarkType } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bookmark, Plus, Star, Hash, Folder } from 'lucide-react'
import Link from 'next/link'
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
import { Footer } from '@/components/footer'
import { CommandMenu } from '@/components/command-menu'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isCommandOpen, setIsCommandOpen] = useState(false)
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
    } catch (error) {
      console.error('Error fetching bookmarks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteBookmark = (id: string) => {
    setBookmarks(bookmarks.filter(bookmark => bookmark.id !== id))
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Calculate stats
  const totalBookmarks = bookmarks.length
  const favoriteBookmarks = bookmarks.filter(b => b.is_favorite).length
  const recentBookmarks = bookmarks.slice(0, 5)

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
                <BreadcrumbPage>Overview</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Row 2: Page Title + Actions */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex items-center gap-2">
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Bookmark
            </Button>
            <ViewToggle view={viewMode} onViewChange={setViewMode} />
          </div>
        </div>

        {/* Row 3: Subtitle + Search */}
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your bookmarks.
          </p>
          <Button
            variant="outline"
            className="w-full max-w-md justify-start text-muted-foreground"
            onClick={() => setIsCommandOpen(true)}
          >
            <Bookmark className="mr-2 h-4 w-4" />
            <span>Search bookmarks, tags, categories...</span>
          </Button>
        </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Bookmarks</CardTitle>
              <div className="p-2 rounded-lg bg-muted/50">
                <Bookmark className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-6">
            <div className="text-2xl font-bold tabular-nums">{totalBookmarks || 0}</div>
            <p className="text-sm text-muted-foreground mt-1">All saved links</p>
          </CardContent>
        </Card>
        <Card className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Favorites</CardTitle>
              <div className="p-2 rounded-lg bg-muted/50">
                <Star className="h-4 w-4 text-destructive" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-6">
            <div className="text-2xl font-bold tabular-nums">{favoriteBookmarks || 0}</div>
            <p className="text-sm text-muted-foreground mt-1">Starred bookmarks</p>
          </CardContent>
        </Card>
        <Card className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Recent</CardTitle>
              <div className="p-2 rounded-lg bg-muted/50">
                <Bookmark className="h-4 w-4 text-accent-foreground" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-6">
            <div className="text-2xl font-bold tabular-nums">{recentBookmarks.length}</div>
            <p className="text-sm text-muted-foreground mt-1">Added this week</p>
          </CardContent>
        </Card>
        <Card className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Tags</CardTitle>
              <div className="p-2 rounded-lg bg-muted/50">
                <Hash className="h-4 w-4 text-secondary-foreground" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-6">
            <div className="text-2xl font-bold tabular-nums">
              {bookmarks.reduce((acc, bookmark) => {
                return acc + (bookmark.tags?.length || 0)
              }, 0)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Total tags used</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookmarks */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookmarks</CardTitle>
          <CardDescription>
            Your most recently added bookmarks
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bookmarks.length > 0 ? (
            <div className={viewMode === 'grid' ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
              {bookmarks.map((bookmark) => 
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
            <div className="text-center py-8">
              <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No bookmarks yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by adding your first bookmark
              </p>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Bookmark
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
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
