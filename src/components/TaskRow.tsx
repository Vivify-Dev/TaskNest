import { formatDate } from '../domain/date'
import type { FilterKey } from '../domain/filters'
import { isOverdue } from '../domain/filters'
import type { Task } from '../domain/types'

interface TaskRowProps {
  task: Task
  today: string
  filterKey: FilterKey
  isRecurringCompletionPending: boolean
  onToggleComplete: (task: Task, checked: boolean) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

const TaskRow = ({
  task,
  today,
  filterKey,
  isRecurringCompletionPending,
  onToggleComplete,
  onEdit,
  onDelete,
}: TaskRowProps) => {
  const isOneTimeCompleted = task.recurrence === 'none' && task.completedAt !== null
  const isRecurringCompletedInView =
    task.recurrence !== 'none' &&
    task.lastCompletedOn !== null &&
    filterKey === 'completed'
  const showRecurringCompletedState =
    isRecurringCompletionPending || isRecurringCompletedInView
  const isChecked = isOneTimeCompleted || showRecurringCompletedState
  const overdue = !showRecurringCompletedState && isOverdue(task, today)
  const dueLabel = task.dueDate ? formatDate(task.dueDate) : null
  const hideDueInCompletedForRecurring = isRecurringCompletedInView
  const notesPreview = task.notes.trim()
  const recurringCompletedLabel = isRecurringCompletedInView
    ? task.lastCompletedOn === today
      ? 'Completed today'
      : `Completed on ${task.lastCompletedOn}`
    : null
  const checkboxLabel = isChecked
    ? `Mark ${task.title} incomplete`
    : `Mark ${task.title} complete`

  return (
    <li className={isChecked ? 'task-row task-row--completed' : 'task-row'}>
      <div className="task-main">
        <input
          className="task-checkbox"
          type="checkbox"
          checked={isChecked}
          onChange={(event) => onToggleComplete(task, event.target.checked)}
          aria-label={checkboxLabel}
        />
        <div className="task-content">
          <p className="task-title">{task.title}</p>
          {notesPreview ? (
            <p className="task-notes" title={task.notes}>
              {notesPreview}
            </p>
          ) : null}
          {recurringCompletedLabel ? (
            <p className="task-secondary">{recurringCompletedLabel}</p>
          ) : null}
        </div>
      </div>
      <div className="task-meta">
        {showRecurringCompletedState ? (
          <span className="task-badge task-badge--success">Completed</span>
        ) : null}
        {overdue ? <span className="task-badge">Overdue</span> : null}
        {dueLabel && !hideDueInCompletedForRecurring ? (
          <span className="task-due">Due {dueLabel}</span>
        ) : null}
      </div>
      <div className="task-actions">
        <button type="button" className="ghost-button" onClick={() => onEdit(task)}>
          Edit
        </button>
        <button
          type="button"
          className="ghost-button ghost-button--danger"
          onClick={() => onDelete(task)}
        >
          Delete
        </button>
      </div>
    </li>
  )
}

export default TaskRow
