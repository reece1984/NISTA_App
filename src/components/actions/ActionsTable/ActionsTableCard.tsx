import { useState } from 'react'
import CaseCategoryTabs from './CaseCategoryTabs'
import ActionsFilters from './ActionsFilters'
import ActionsTable from './ActionsTable'
import ActionsPagination from './ActionsPagination'
import type { Action, ActionFilters, CaseCategory } from '../../../types/actions'

interface ActionsTableCardProps {
  actions: Action[]
  isLoading: boolean
  filters: ActionFilters
  onCategoryChange: (category: CaseCategory | 'all') => void
  onFiltersChange: (filters: Partial<ActionFilters>) => void
  onOpenDetail: (action: Action) => void
}

const ITEMS_PER_PAGE = 20

export default function ActionsTableCard({
  actions,
  isLoading,
  filters,
  onCategoryChange,
  onFiltersChange,
  onOpenDetail
}: ActionsTableCardProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  // Calculate counts per category
  const categoryCounts = {
    all: actions.length,
    strategic: actions.filter(a => a.case_category === 'strategic').length,
    economic: actions.filter(a => a.case_category === 'economic').length,
    commercial: actions.filter(a => a.case_category === 'commercial').length,
    financial: actions.filter(a => a.case_category === 'financial').length,
    management: actions.filter(a => a.case_category === 'management').length
  }

  // Pagination
  const totalPages = Math.ceil(actions.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedActions = actions.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const handleSelectAll = () => {
    if (selectedIds.size === paginatedActions.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(paginatedActions.map(a => a.id)))
    }
  }

  const handleSelectOne = (id: number) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedIds(newSet)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Five Case Tabs */}
      <CaseCategoryTabs
        activeCategory={filters.caseCategory || 'all'}
        counts={categoryCounts}
        onChange={onCategoryChange}
      />

      {/* Filters Bar */}
      <ActionsFilters
        filters={filters}
        onChange={onFiltersChange}
      />

      {/* Table */}
      <ActionsTable
        actions={paginatedActions}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onSelectAll={handleSelectAll}
        onSelectOne={handleSelectOne}
        onOpenDetail={onOpenDetail}
      />

      {/* Pagination */}
      {actions.length > ITEMS_PER_PAGE && (
        <ActionsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={actions.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  )
}
