import { Category, CategoryTree } from '@/types'

/**
 * Builds a hierarchical tree structure from flat categories array
 */
export function buildCategoryTree(categories: Category[]): CategoryTree[] {
  const categoryMap = new Map<string, CategoryTree>()
  const rootCategories: CategoryTree[] = []

  // First pass: create all category nodes
  categories.forEach(category => {
    categoryMap.set(category.id, {
      ...category,
      children: [],
      level: 0,
      path: [category.name]
    })
  })

  // Second pass: build the tree structure
  categories.forEach(category => {
    const categoryNode = categoryMap.get(category.id)!
    
    if (category.parent_id) {
      const parent = categoryMap.get(category.parent_id)
      if (parent) {
        parent.children.push(categoryNode)
        categoryNode.level = parent.level + 1
        categoryNode.path = [...parent.path, category.name]
      }
    } else {
      rootCategories.push(categoryNode)
    }
  })

  // Sort categories by sort_order
  const sortCategories = (cats: CategoryTree[]): CategoryTree[] => {
    return cats.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      .map(cat => ({
        ...cat,
        children: sortCategories(cat.children)
      }))
  }

  return sortCategories(rootCategories)
}

/**
 * Flattens a category tree back to a flat array
 */
export function flattenCategoryTree(categoryTree: CategoryTree[]): Category[] {
  const result: Category[] = []
  
  const flatten = (categories: CategoryTree[]) => {
    categories.forEach(category => {
      result.push({
        id: category.id,
        user_id: category.user_id,
        parent_id: category.parent_id,
        name: category.name,
        color: category.color,
        icon: category.icon,
        sort_order: category.sort_order,
        created_at: category.created_at,
        updated_at: category.updated_at
      })
      if (category.children.length > 0) {
        flatten(category.children)
      }
    })
  }
  
  flatten(categoryTree)
  return result
}

/**
 * Gets the full path of a category as a string
 */
export function getCategoryPath(categoryTree: CategoryTree[], categoryId: string): string[] {
  const findPath = (categories: CategoryTree[], targetId: string): string[] | null => {
    for (const category of categories) {
      if (category.id === targetId) {
        return category.path
      }
      const childPath = findPath(category.children, targetId)
      if (childPath) {
        return childPath
      }
    }
    return null
  }
  
  return findPath(categoryTree, categoryId) || []
}

/**
 * Gets all descendants of a category
 */
export function getCategoryDescendants(categoryTree: CategoryTree[], categoryId: string): Category[] {
  const descendants: Category[] = []
  
  const findDescendants = (categories: CategoryTree[], targetId: string): boolean => {
    for (const category of categories) {
      if (category.id === targetId) {
        // Add all children and their descendants
        const addDescendants = (cats: CategoryTree[]) => {
          cats.forEach(cat => {
            descendants.push({
              id: cat.id,
              user_id: cat.user_id,
              parent_id: cat.parent_id,
              name: cat.name,
              color: cat.color,
              icon: cat.icon,
              sort_order: cat.sort_order,
              created_at: cat.created_at,
              updated_at: cat.updated_at
            })
            addDescendants(cat.children)
          })
        }
        addDescendants(category.children)
        return true
      }
      if (findDescendants(category.children, targetId)) {
        return true
      }
    }
    return false
  }
  
  findDescendants(categoryTree, categoryId)
  return descendants
}

/**
 * Validates if a category can be moved to a new parent
 * (prevents circular references)
 */
export function canMoveCategory(
  categoryTree: CategoryTree[], 
  categoryId: string, 
  newParentId: string | null
): boolean {
  if (!newParentId) return true // Moving to root is always allowed
  
  // Check if new parent is a descendant of the category being moved
  const descendants = getCategoryDescendants(categoryTree, categoryId)
  return !descendants.some(desc => desc.id === newParentId)
}

/**
 * Gets the maximum depth of the category tree
 */
export function getMaxDepth(categoryTree: CategoryTree[]): number {
  const getDepth = (categories: CategoryTree[]): number => {
    if (categories.length === 0) return 0
    return Math.max(...categories.map(cat => 1 + getDepth(cat.children)))
  }
  return getDepth(categoryTree)
}
