"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
  Bookmark,
  Folder,
  Hash,
  Heart,
  Home,
  Settings2,
  Plus,
  ChevronRight,
  ChevronDown,
} from "lucide-react"
import { createBrowserSupabaseClient } from "@/lib/supabase"
import { Category, CategoryTree } from "@/types"
import { buildCategoryTree } from "@/lib/category-utils"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenuButton,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    name: string
    email: string
    avatar: string
  } | null
}

interface NavItem {
  title: string
  url?: string
  icon: React.ComponentType<{ className?: string }>
  items?: NavItem[]
  isAction?: boolean
}

// Static navigation items
const staticNavItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "All Bookmarks",
    url: "/dashboard/bookmarks",
    icon: Bookmark,
  },
  {
    title: "Favorites",
    url: "/dashboard/favorites",
    icon: Heart,
  },
  {
    title: "Tags",
    url: "/dashboard/tags",
    icon: Hash,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings2,
  },
]

// Category item component with unlimited nesting
function CategoryItem({ 
  category, 
  level = 0, 
  expandedCategories, 
  onToggleExpanded 
}: { 
  category: CategoryTree
  level?: number
  expandedCategories: Set<string>
  onToggleExpanded: (categoryId: string) => void
}) {
  const pathname = usePathname()
  const isActive = pathname === `/dashboard/categories/${category.id}`
  const hasChildren = category.children.length > 0
  const isExpanded = expandedCategories.has(category.id)
  
  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild={!hasChildren}
          onClick={hasChildren ? () => onToggleExpanded(category.id) : undefined}
          className={`pl-${Math.min(level * 4 + 4, 20)} ${isActive ? 'bg-accent text-accent-foreground' : ''}`}
        >
          {hasChildren ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Folder className="h-4 w-4" style={{ color: category.color || '#3b82f6' }} />
                <span className="group-data-[collapsible=icon]:hidden">{category.name}</span>
              </div>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 group-data-[collapsible=icon]:hidden" />
              ) : (
                <ChevronRight className="h-4 w-4 group-data-[collapsible=icon]:hidden" />
              )}
            </div>
          ) : (
            <Link href={`/dashboard/categories/${category.id}`} className="flex items-center gap-2 w-full">
              <Folder className="h-4 w-4" style={{ color: category.color || '#3b82f6' }} />
              <span className="group-data-[collapsible=icon]:hidden">{category.name}</span>
            </Link>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      {hasChildren && isExpanded && (
        <div className="ml-4">
          {category.children.map(child => (
            <CategoryItem
              key={child.id}
              category={child}
              level={level + 1}
              expandedCategories={expandedCategories}
              onToggleExpanded={onToggleExpanded}
            />
          ))}
        </div>
      )}
    </>
  )
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const [categories, setCategories] = useState<CategoryTree[]>([])
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  
  // Default user data if none provided
  const defaultUser = {
    name: "User",
    email: "user@example.com",
    avatar: "",
  }

  const currentUser = user || defaultUser

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
            // Auto-expand root categories
            const rootIds = new Set(categoryTree.map(cat => cat.id))
            setExpandedCategories(rootIds)
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

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

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2">
          <Bookmark className="h-6 w-6" />
          <span className="font-bold text-lg group-data-[collapsible=icon]:hidden">Linkwise</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* Static Navigation */}
        <SidebarMenu>
          {staticNavItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <Link href={item.url || '#'} className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        {/* Categories Section */}
        <div className="mt-6">
          <div className="flex items-center justify-between px-4 mb-2">
            <h3 className="text-sm font-medium text-muted-foreground group-data-[collapsible=icon]:hidden">
              Categories
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 group-data-[collapsible=icon]:hidden"
              asChild
            >
              <Link href="/dashboard/categories/new">
                <Plus className="h-3 w-3" />
              </Link>
            </Button>
          </div>
          
          <SidebarMenu>
            {isLoading ? (
              <div className="px-4 py-2 text-sm text-muted-foreground">
                Loading categories...
              </div>
            ) : categories.length > 0 ? (
              categories.map(category => (
                <CategoryItem
                  key={category.id}
                  category={category}
                  expandedCategories={expandedCategories}
                  onToggleExpanded={handleToggleExpanded}
                />
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-muted-foreground">
                No categories yet
              </div>
            )}
          </SidebarMenu>
        </div>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={currentUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
