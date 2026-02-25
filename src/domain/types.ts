export type Recurrence = 'none' | 'daily' | 'weekly'

export interface Task {
  id: string
  title: string
  notes: string
  dueDate: string | null
  recurrence: Recurrence
  completedAt: string | null
  lastCompletedOn: string | null
  prevDueDate: string | null
  createdAt: string
  updatedAt: string
}

export interface TaskDraft {
  title: string
  notes: string
  dueDate: string | null
  recurrence: Recurrence
}
