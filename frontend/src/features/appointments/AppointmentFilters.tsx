import { RotateCcw, Search } from 'lucide-react'
import { Input } from '@/components/Input'
import { Select } from '@/components/Select'
import { Button } from '@/components/Button'
import { APPOINTMENT_TYPES } from '@/types/api'
import type { AppointmentFilterParams } from '@/types/api'

interface AppointmentFiltersProps {
  filters: AppointmentFilterParams
  onFiltersChange: (next: AppointmentFilterParams) => void
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder: string
}

export function AppointmentFilters({ filters, onFiltersChange, search, onSearchChange, searchPlaceholder }: AppointmentFiltersProps) {
  const isDefault = !filters.status && !filters.appointment_type && !filters.date_from && !filters.date_to && !search

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4 sm:flex-row sm:items-end sm:flex-wrap">
      <div className="min-w-[200px] flex-1">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9"
            aria-label="Search"
          />
        </div>
      </div>

      <div className="w-full sm:w-40">
        <Select
          value={filters.status ?? ''}
          onChange={(e) => onFiltersChange({ ...filters, status: (e.target.value || undefined) as never })}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="no_show">No-show</option>
          <option value="needs_rescheduling">Needs rescheduling</option>
          <option value="cancelled">Cancelled</option>
        </Select>
      </div>

      <div className="w-full sm:w-44">
        <Select
          value={filters.appointment_type ?? ''}
          onChange={(e) => onFiltersChange({ ...filters, appointment_type: (e.target.value || undefined) as never })}
          aria-label="Filter by appointment type"
        >
          <option value="">All types</option>
          {APPOINTMENT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="w-full sm:w-36">
        <Input
          type="date"
          value={filters.date_from ?? ''}
          onChange={(e) => onFiltersChange({ ...filters, date_from: e.target.value || undefined })}
          aria-label="From date"
        />
      </div>
      <div className="w-full sm:w-36">
        <Input
          type="date"
          value={filters.date_to ?? ''}
          onChange={(e) => onFiltersChange({ ...filters, date_to: e.target.value || undefined })}
          aria-label="To date"
        />
      </div>

      <Button
        variant="ghost"
        size="md"
        disabled={isDefault}
        onClick={() => {
          onFiltersChange({})
          onSearchChange('')
        }}
      >
        <RotateCcw className="h-4 w-4" /> Reset
      </Button>
    </div>
  )
}
