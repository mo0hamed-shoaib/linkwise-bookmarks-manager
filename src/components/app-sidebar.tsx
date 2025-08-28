"use client"

import * as React from "react"
import {
  Bookmark,
  Folder,
  Hash,
  Heart,
  Home,
  Settings2,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

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
      {
        title: "Recent Bookmarks",
        url: "/dashboard/recent",
      },
    ],
  },
  {
    title: "All Bookmarks",
    url: "/dashboard/bookmarks",
    icon: Bookmark,
    items: [
      {
        title: "View All",
        url: "/dashboard/bookmarks",
      },
      {
        title: "Add Bookmark",
        url: "/dashboard/bookmarks/add",
      },
    ],
  },
  {
    title: "Tags",
    url: "/dashboard/tags",
    icon: Hash,
    items: [
      {
        title: "All Tags",
        url: "/dashboard/tags",
      },
      {
        title: "Create Tag",
        url: "/dashboard/tags/create",
      },
    ],
  },
  {
    title: "Categories",
    url: "/dashboard/categories",
    icon: Folder,
    items: [
      {
        title: "All Categories",
        url: "/dashboard/categories",
      },
      {
        title: "Create Category",
        url: "/dashboard/categories/create",
      },
    ],
  },
  {
    title: "Favorites",
    url: "/dashboard/favorites",
    icon: Heart,
    items: [
      {
        title: "View Favorites",
        url: "/dashboard/favorites",
      },
    ],
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings2,
    items: [
      {
        title: "Profile",
        url: "/dashboard/settings/profile",
      },
      {
        title: "Preferences",
        url: "/dashboard/settings/preferences",
      },
    ],
  },
]

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  // Default user data if none provided
  const defaultUser = {
    name: "User",
    email: "user@example.com",
    avatar: "",
  }

  const currentUser = user || defaultUser

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2">
          <Bookmark className="h-6 w-6" />
          <span className="font-bold text-lg">Linkwise</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={currentUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
