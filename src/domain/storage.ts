import type { FilterKey, UpcomingRange } from './filters'
import { isDateStr } from './date'
import type { Task } from './types'

const STORAGE_VERSION = 1

export const TASKS_STORAGE_KEY = 'tasknest.tasks.v1'
export const UI_STORAGE_KEY = 'tasknest.ui.v1'

const allowedRecurrence = new Set(['none', 'daily', 'weekly'])
const allowedFilters = new Set<FilterKey>([
  'today',
  'upcoming',
  'overdue',
  'completed',
])
const allowedUpcomingRanges = new Set<UpcomingRange>(['14', '30', 'all'])

export interface UiState {
  lastFilter: FilterKey
  upcomingRange: UpcomingRange
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isValidNullableDate = (value: unknown) =>
  value === null || (typeof value === 'string' && isDateStr(value))

const isValidNullableString = (value: unknown) =>
  value === null || typeof value === 'string'

const toNullableDate = (value: unknown): string | null => {
  if (!isValidNullableDate(value)) return null
  return value as string | null
}

const toNullableString = (value: unknown): string | null => {
  if (!isValidNullableString(value)) return null
  return value as string | null
}

const coerceTask = (value: unknown): Task | null => {
  if (!isObject(value)) return null

  if (
    typeof value.id !== 'string' ||
    typeof value.title !== 'string' ||
    typeof value.notes !== 'string' ||
    typeof value.createdAt !== 'string' ||
    typeof value.updatedAt !== 'string'
  ) {
    return null
  }

  const recurrence =
    typeof value.recurrence === 'string' && allowedRecurrence.has(value.recurrence)
      ? value.recurrence
      : 'none'

  return {
    id: value.id,
    title: value.title,
    notes: value.notes,
    dueDate: toNullableDate(value.dueDate),
    recurrence: recurrence as Task['recurrence'],
    completedAt: toNullableString(value.completedAt),
    lastCompletedOn: toNullableDate(value.lastCompletedOn),
    prevDueDate: toNullableDate(value.prevDueDate),
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  }
}

export const serializeTasks = (tasks: Task[]) =>
  JSON.stringify({ version: STORAGE_VERSION, tasks })

export const deserializeTasks = (raw: string): Task[] => {
  try {
    const parsed = JSON.parse(raw)
    if (!isObject(parsed)) return []
    if (parsed.version !== STORAGE_VERSION) return []
    if (!Array.isArray(parsed.tasks)) return []
    return parsed.tasks
      .map((task) => coerceTask(task))
      .filter((task): task is Task => task !== null)
  } catch {
    return []
  }
}

export const serializeUi = (uiState: UiState) =>
  JSON.stringify({ version: STORAGE_VERSION, ...uiState })

export const deserializeUi = (raw: string, fallback: UiState): UiState => {
  try {
    const parsed = JSON.parse(raw)
    if (!isObject(parsed)) return fallback
    if (parsed.version !== STORAGE_VERSION) return fallback

    const lastFilter =
      typeof parsed.lastFilter === 'string' &&
      allowedFilters.has(parsed.lastFilter as FilterKey)
        ? (parsed.lastFilter as FilterKey)
        : fallback.lastFilter

    const upcomingRange =
      typeof parsed.upcomingRange === 'string' &&
      allowedUpcomingRanges.has(parsed.upcomingRange as UpcomingRange)
        ? (parsed.upcomingRange as UpcomingRange)
        : fallback.upcomingRange

    return {
      lastFilter,
      upcomingRange,
    }
  } catch {
    return fallback
  }
}
