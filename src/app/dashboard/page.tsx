import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bookmark, Plus, Star, Hash, Folder } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth')
  }

  // Fetch recent bookmarks
  const { data: recentBookmarks } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch stats
  const { count: totalBookmarks } = await supabase
    .from('bookmarks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { count: favoriteBookmarks } = await supabase
    .from('bookmarks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_favorite', true)

  const { count: totalTags } = await supabase
    .from('tags')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { count: totalCategories } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your bookmarks.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/bookmarks/add">
            <Plus className="mr-2 h-4 w-4" />
            Add Bookmark
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookmarks</CardTitle>
            <Bookmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookmarks || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorites</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{favoriteBookmarks || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tags</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTags || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCategories || 0}</div>
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
          {recentBookmarks && recentBookmarks.length > 0 ? (
            <div className="space-y-4">
              {recentBookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                      <Bookmark className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-medium">{bookmark.title}</h3>
                      <p className="text-sm text-muted-foreground">{bookmark.url}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {bookmark.is_favorite && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                    <Button variant="outline" size="sm" asChild>
                      <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
                        Visit
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No bookmarks yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by adding your first bookmark
              </p>
              <Button asChild>
                <Link href="/dashboard/bookmarks/add">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Bookmark
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
