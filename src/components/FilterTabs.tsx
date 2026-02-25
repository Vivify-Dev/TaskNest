import type { FilterDefinition, FilterKey } from '../domain/filters'

interface FilterTabsProps {
  filters: FilterDefinition[]
  selected: FilterKey
  onSelect: (filter: FilterKey) => void
}

const FilterTabs = ({ filters, selected, onSelect }: FilterTabsProps) => (
  <div className="filter-tabs" role="tablist" aria-label="Task filters">
    {filters.map((filter) => (
      <button
        key={filter.key}
        className={
          filter.key === selected
            ? 'filter-tab filter-tab--active'
            : 'filter-tab'
        }
        role="tab"
        type="button"
        aria-selected={filter.key === selected}
        onClick={() => onSelect(filter.key)}
      >
        {filter.label}
      </button>
    ))}
  </div>
)

export default FilterTabs
