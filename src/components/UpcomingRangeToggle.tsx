import type { UpcomingRange } from '../domain/filters'

interface UpcomingRangeToggleProps {
  value: UpcomingRange
  onChange: (value: UpcomingRange) => void
}

const UPCOMING_RANGES: Array<{ value: UpcomingRange; label: string }> = [
  { value: '14', label: '14d' },
  { value: '30', label: '30d' },
  { value: 'all', label: 'All' },
]

const UpcomingRangeToggle = ({ value, onChange }: UpcomingRangeToggleProps) => (
  <div className="upcoming-range-toggle" role="group" aria-label="Upcoming range">
    {UPCOMING_RANGES.map((range) => (
      <button
        key={range.value}
        type="button"
        className={
          value === range.value
            ? 'upcoming-range-button upcoming-range-button--active'
            : 'upcoming-range-button'
        }
        aria-pressed={value === range.value}
        onClick={() => onChange(range.value)}
      >
        {range.label}
      </button>
    ))}
  </div>
)

export default UpcomingRangeToggle
