import { addDays, todayStr } from './date'
import type { Recurrence, Task } from './types'

export const normalizeDueDateForRecurrence = (
  dueDate: string | null,
  recurrence: Recurrence,
  fallbackDate: string = todayStr(),
) => {
  if (recurrence === 'none') return dueDate
  return dueDate ?? fallbackDate
}

const recurrenceIntervalDays = (recurrence: Recurrence) =>
  recurrence === 'weekly' ? 7 : 1

export const markRecurringTaskCompleted = (
  task: Task,
  completedOn: string,
  nowIso: string,
) => {
  return {
    ...task,
    lastCompletedOn: completedOn,
    prevDueDate: null,
    completedAt: null,
    updatedAt: nowIso,
  }
}

export const completeRecurringTask = (
  task: Task,
  completedOn: string,
  nowIso: string,
) => {
  const baseDate = task.dueDate ?? completedOn
  const increment = recurrenceIntervalDays(task.recurrence)

  return {
    ...task,
    lastCompletedOn: completedOn,
    prevDueDate: task.dueDate,
    completedAt: null,
    dueDate: addDays(baseDate, increment),
    updatedAt: nowIso,
  }
}

export const undoRecurringCompletion = (task: Task, nowIso: string) => {
  return {
    ...task,
    dueDate: task.prevDueDate ?? task.dueDate,
    lastCompletedOn: null,
    prevDueDate: null,
    completedAt: null,
    updatedAt: nowIso,
  }
}
