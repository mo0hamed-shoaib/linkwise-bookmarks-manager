'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { Category, CategoryTree } from '@/types'
import { buildCategoryTree, getCategoryDescendants } from '@/lib/category-utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Folder, 
  Plus, 
  Search, 
  ChevronRight, 
  ChevronDown,
  MoreHorizontal,
  Edit,
  Trash2,
  Bookmark
} from 'lucide-react'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface CategoryWithStats extends CategoryTree {
  bookmarkCount: number
  childCount: number
}

export default function CategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<CategoryWithStats[]>([])
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [bookmarkCounts, setBookmarkCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const supabase = createBrowserSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true })
      
      if (categoriesData) {
        const categoryTree = buildCategoryTree(categoriesData)
        
        // Fetch bookmark counts for each category
        const { data: bookmarksData } = await supabase
          .from('bookmarks')
          .select('category_id')
          .eq('user_id', user.id)
          .not('category_id', 'is', null)

        const counts: Record<string, number> = {}
        bookmarksData?.forEach(bookmark => {
          if (bookmark.category_id) {
            counts[bookmark.category_id] = (counts[bookmark.category_id] || 0) + 1
          }
        })

        setBookmarkCounts(counts)

        // Add stats to categories
        const categoriesWithStats = categoryTree.map(category => ({
          ...category,
          bookmarkCount: counts[category.id] || 0,
          childCount: category.children.length
        }))

        setCategories(categoriesWithStats)
        
        // Auto-expand root categories
        const rootIds = new Set(categoryTree.map(cat => cat.id))
        setExpandedCategories(rootIds)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Failed to load categories')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleExpanded = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This will also remove all subcategories.')) {
      return
    }

    try {
      const supabase = createBrowserSupabaseClient()
      
      // Get all descendants to delete
      const descendants = getCategoryDescendants(categories, categoryId)
      const idsToDelete = [categoryId, ...descendants.map(d => d.id)]
      
      // Delete categories
      const { error } = await supabase
        .from('categories')
        .delete()
        .in('id', idsToDelete)

      if (error) throw error

      toast.success('Category deleted successfully')
      fetchCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Failed to delete category')
    }
  }

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.path.some(path => path.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const renderCategoryItem = (category: CategoryWithStats, level: number = 0) => {
    const isExpanded = expandedCategories.has(category.id)
    const hasChildren = category.children.length > 0
    const totalBookmarks = category.bookmarkCount + 
      category.children.reduce((sum, child) => sum + (bookmarkCounts[child.id] || 0), 0)

    return (
      <div key={category.id} className="space-y-2">
        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 hover:shadow-md hover:border-primary/20 transition-all duration-200 group border">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-2" style={{ marginLeft: `${level * 20}px` }}>
              {hasChildren ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleExpanded(category.id)}
                  className="h-6 w-6 p-0 hover:bg-accent hover:text-accent-foreground"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              ) : (
                <div className="w-6" />
              )}
              
              <Folder 
                className="h-5 w-5 flex-shrink-0" 
                style={{ color: category.color || '#3b82f6' }} 
              />
              
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-medium truncate">{category.name}</span>
                <div className="flex items-center gap-1">
                  {totalBookmarks > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {totalBookmarks} {totalBookmarks === 1 ? 'bookmark' : 'bookmarks'}
                    </Badge>
                  )}
                  {category.childCount > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {category.childCount} {category.childCount === 1 ? 'subcategory' : 'subcategories'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/dashboard/categories/${category.id}`)}
              className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent hover:text-accent-foreground"
            >
              <Bookmark className="h-4 w-4" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent hover:text-accent-foreground"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(`/dashboard/categories/${category.id}/edit`)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Category
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleDeleteCategory(category.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Category
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="ml-6">
            {category.children.map(child => renderCategoryItem(child as CategoryWithStats, level + 1))}
          </div>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
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
              <BreadcrumbPage>Categories</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Row 2: Page Title + Actions */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <Button onClick={() => router.push('/dashboard/categories/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Row 3: Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        />
      </div>

      {/* Row 4: Categories List */}
      {filteredCategories.length > 0 ? (
        <div className="space-y-2">
          {filteredCategories.map(category => renderCategoryItem(category))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {searchQuery ? 'No categories found' : 'No categories yet'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? 'Try adjusting your search'
                : 'Start by creating your first category to organize your bookmarks'
              }
            </p>
            {!searchQuery && (
              <Button onClick={() => router.push('/dashboard/categories/new')}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Category
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
