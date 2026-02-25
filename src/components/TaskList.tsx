import type { FilterKey } from '../domain/filters'
import type { Task } from '../domain/types'
import TaskRow from './TaskRow'

interface TaskListProps {
  tasks: Task[]
  emptyMessage: string
  today: string
  filterKey: FilterKey
  pendingRecurringCompletions: Record<string, true>
  onToggleComplete: (task: Task, checked: boolean) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

const TaskList = ({
  tasks,
  emptyMessage,
  today,
  filterKey,
  pendingRecurringCompletions,
  onToggleComplete,
  onEdit,
  onDelete,
}: TaskListProps) => {
  if (tasks.length === 0) {
    return <div className="empty-state">{emptyMessage}</div>
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          today={today}
          filterKey={filterKey}
          isRecurringCompletionPending={Boolean(pendingRecurringCompletions[task.id])}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  )
}

export default TaskList
