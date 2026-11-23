import { useEffect, useState, type FormEvent } from 'react'
import { Search, X } from 'lucide-react'
import { Button } from '@/frontend/components/ui/button'
import { Card, CardContent } from '@/frontend/components/ui/card'
import { Input } from '@/frontend/components/ui/input'
import { Select } from '@/frontend/components/ui/select'
import { Label } from '@/frontend/components/ui/label'
import { EMPTY_FILTERS, hasActiveFilters, type SessionFilterValues } from './filterState'

interface SessionFiltersProps {
  /** Currently applied filters (from the URL). */
  value: SessionFilterValues
  onApply: (next: SessionFilterValues) => void
}

/**
 * Filter bar: date range, minimum risk, host, device serial, detection status.
 * Edits are staged locally and applied on submit (Enter or the Apply button).
 */
export function SessionFilters({ value, onApply }: SessionFiltersProps) {
  const [draft, setDraft] = useState<SessionFilterValues>(value)

  // Keep the form in sync when filters change externally (e.g. back/forward navigation).
  useEffect(() => setDraft(value), [value])

  const set = <K extends keyof SessionFilterValues>(key: K, v: SessionFilterValues[K]) => setDraft((d) => ({ ...d, [key]: v }))

  function submit(e: FormEvent) {
    e.preventDefault()
    onApply(draft)
  }

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={submit} aria-label="Filter sessions" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <div className="space-y-1.5">
            <Label htmlFor="f-from">From</Label>
            <Input id="f-from" type="date" value={draft.from} max={draft.to || undefined} onChange={(e) => set('from', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="f-to">To</Label>
            <Input id="f-to" type="date" value={draft.to} min={draft.from || undefined} onChange={(e) => set('to', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="f-risk">Min. risk score</Label>
            <Input
              id="f-risk"
              type="number"
              inputMode="numeric"
              min={0}
              max={100}
              placeholder="0"
              value={draft.minRisk}
              onChange={(e) => set('minRisk', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="f-host">Host</Label>
            <Input id="f-host" value={draft.host} placeholder="Host name" onChange={(e) => set('host', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="f-device">Device serial</Label>
            <Input id="f-device" value={draft.device} placeholder="Serial" onChange={(e) => set('device', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="f-detection">Detection</Label>
            <Select
              id="f-detection"
              value={draft.detection}
              onChange={(e) => set('detection', e.target.value as SessionFilterValues['detection'])}
            >
              <option value="all">All</option>
              <option value="complete">Complete</option>
              <option value="incomplete">Incomplete</option>
            </Select>
          </div>
          <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-6">
            <Button type="submit">
              <Search className="h-4 w-4" aria-hidden="true" />
              Apply filters
            </Button>
            {hasActiveFilters(value) && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setDraft(EMPTY_FILTERS)
                  onApply(EMPTY_FILTERS)
                }}
              >
                <X className="h-4 w-4" aria-hidden="true" />
                Clear
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
