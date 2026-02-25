import { addDays, compareDateStr } from './date'
import type { Task } from './types'

export type FilterKey = 'today' | 'upcoming' | 'overdue' | 'completed'
export type UpcomingRange = '14' | '30' | 'all'

export interface FilterDefinition {
  key: FilterKey
  label: string
  emptyMessage: string
}

const UPCOMING_WINDOW_DAYS = 14
const RECURRING_COMPLETED_WINDOW_DAYS = 30

export const FILTERS: FilterDefinition[] = [
  { key: 'today', label: 'Today', emptyMessage: 'No tasks due today.' },
  {
    key: 'upcoming',
    label: 'Upcoming',
    emptyMessage: 'No tasks due in the next 14 days.',
  },
  { key: 'overdue', label: 'Overdue', emptyMessage: 'No overdue tasks.' },
  { key: 'completed', label: 'Completed', emptyMessage: 'No completed tasks yet.' },
]

export const isOverdue = (task: Task, today: string) => {
  if (task.recurrence === 'none' && task.completedAt !== null) return false
  if (!task.dueDate) return false
  return compareDateStr(task.dueDate, today) === -1
}

const isRecurringCompletedRecently = (task: Task, today: string) => {
  if (task.recurrence === 'none') return false
  if (!task.lastCompletedOn) return false

  const windowStart = addDays(today, -RECURRING_COMPLETED_WINDOW_DAYS)
  return (
    compareDateStr(task.lastCompletedOn, windowStart) >= 0 &&
    compareDateStr(task.lastCompletedOn, today) <= 0
  )
}

const completedSortValue = (task: Task) => {
  if (task.recurrence === 'none') {
    return task.completedAt ?? ''
  }

  if (!task.lastCompletedOn) return ''
  return `${task.lastCompletedOn}T23:59:59.999Z`
}

const upcomingWindowDays = (range: UpcomingRange) => {
  if (range === '30') return 30
  return UPCOMING_WINDOW_DAYS
}

export const matchesFilter = (
  task: Task,
  filterKey: FilterKey,
  today: string,
  upcomingRange: UpcomingRange = '14',
) => {
  const isOneTimeCompleted = task.recurrence === 'none' && task.completedAt !== null
  const isRecurringCompleted = isRecurringCompletedRecently(task, today)

  if (filterKey === 'completed') {
    return isOneTimeCompleted || isRecurringCompleted
  }

  if (isOneTimeCompleted) return false
  if (!task.dueDate) return false

  const comparison = compareDateStr(task.dueDate, today)

  if (filterKey === 'today') {
    return comparison === 0
  }

  if (filterKey === 'overdue') {
    return comparison === -1
  }

  if (comparison !== 1) return false
  if (upcomingRange === 'all') return true

  const windowEnd = addDays(today, upcomingWindowDays(upcomingRange))
  return compareDateStr(task.dueDate, windowEnd) <= 0
}

export const filterTasks = (
  tasks: Task[],
  filterKey: FilterKey,
  today: string,
  upcomingRange: UpcomingRange = '14',
) => tasks.filter((task) => matchesFilter(task, filterKey, today, upcomingRange))

export const sortTasks = (tasks: Task[], filterKey: FilterKey) => {
  const sorted = [...tasks]

  sorted.sort((a, b) => {
    if (filterKey === 'completed') {
      const aCompleted = completedSortValue(a)
      const bCompleted = completedSortValue(b)
      return bCompleted.localeCompare(aCompleted)
    }

    const aDue = a.dueDate
    const bDue = b.dueDate

    if (aDue && bDue) {
      const comparison = compareDateStr(aDue, bDue)
      if (comparison !== 0) return comparison
    } else if (aDue && !bDue) {
      return -1
    } else if (!aDue && bDue) {
      return 1
    }

    return a.createdAt.localeCompare(b.createdAt)
  })

  return sorted
}
