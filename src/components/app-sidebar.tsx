"use client"

import * as React from "react"
import {
  Bookmark,
  Folder,
  Hash,
  Heart,
  Home,
  Settings2,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
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
import { useSidebar } from "@/components/ui/sidebar"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    name: string
    email: string
    avatar: string
  } | null
}

// Navigation data for the bookmark manager
const navItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    items: [
      {
        title: "Overview",
        url: "/dashboard",
      },
    ],
  },
  {
    title: "All Bookmarks",
    url: "/dashboard/bookmarks",
    icon: Bookmark,
  },
  {
    title: "Tags",
    url: "/dashboard/tags",
    icon: Hash,
  },
  {
    title: "Categories",
    url: "/dashboard/categories",
    icon: Folder,
  },
  {
    title: "Favorites",
    url: "/dashboard/favorites",
    icon: Heart,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings2,
  },
]

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const { isCollapsed, setCollapsed } = useSidebar()
  
  // Default user data if none provided
  const defaultUser = {
    name: "User",
    email: "user@example.com",
    avatar: "",
  }

  const currentUser = user || defaultUser

  const handleExpandCollapse = () => {
    setCollapsed(!isCollapsed)
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
        <NavMain items={navItems} />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              tooltip={isCollapsed ? "Expand All" : "Collapse All"}
              onClick={handleExpandCollapse}
            >
              {isCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
              <span className="group-data-[collapsible=icon]:hidden">
                {isCollapsed ? "Expand All" : "Collapse All"}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={currentUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
