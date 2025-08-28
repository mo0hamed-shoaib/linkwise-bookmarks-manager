'use client'

import { LayoutGrid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export type ViewMode = 'grid' | 'list'

interface ViewToggleProps {
  view: ViewMode
  onViewChange: (view: ViewMode) => void
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          {view === 'grid' ? (
            <LayoutGrid className="h-4 w-4" />
          ) : (
            <List className="h-4 w-4" />
          )}
          <span className="ml-2 hidden sm:inline">
            {view === 'grid' ? 'Grid' : 'List'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onViewChange('grid')}>
          <LayoutGrid className="mr-2 h-4 w-4" />
          <span>Grid View</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onViewChange('list')}>
          <List className="mr-2 h-4 w-4" />
          <span>List View</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
