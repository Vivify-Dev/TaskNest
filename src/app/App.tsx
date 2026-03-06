import { useEffect, useMemo, useRef, useState } from 'react'
import FilterTabs from '../components/FilterTabs'
import TaskFormModal from '../components/TaskFormModal'
import TaskList from '../components/TaskList'
import TopBar from '../components/TopBar'
import UpcomingRangeToggle from '../components/UpcomingRangeToggle'
import { todayStr } from '../domain/date'
import { FILTERS, filterTasks, sortTasks } from '../domain/filters'
import type { FilterKey, UpcomingRange } from '../domain/filters'
import {
  completeRecurringTask,
  markRecurringTaskCompleted,
  normalizeDueDateForRecurrence,
  undoRecurringCompletion,
} from '../domain/recurrence'
import {
  deserializeTasks,
  deserializeUi,
  serializeTasks,
  serializeUi,
  TASKS_STORAGE_KEY,
  UI_STORAGE_KEY,
  type UiState,
} from '../domain/storage'
import type { Task, TaskDraft } from '../domain/types'
import { useLocalStorageState } from '../hooks/useLocalStorageState'

const DEFAULT_FILTER: FilterKey = 'today'
const DEFAULT_UPCOMING_RANGE: UpcomingRange = '14'
const DEFAULT_UI_STATE: UiState = {
  lastFilter: DEFAULT_FILTER,
  upcomingRange: DEFAULT_UPCOMING_RANGE,
}
const RECURRING_COMPLETION_FEEDBACK_MS = 450

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const App = () => {
  const [tasks, setTasks] = useLocalStorageState<Task[]>(TASKS_STORAGE_KEY, [], {
    serialize: serializeTasks,
    deserialize: deserializeTasks,
  })
  const [uiState, setUiState] = useLocalStorageState<UiState>(
    UI_STORAGE_KEY,
    DEFAULT_UI_STATE,
    {
      serialize: serializeUi,
      deserialize: (raw) => deserializeUi(raw, DEFAULT_UI_STATE),
    },
  )
  const selectedFilter = uiState.lastFilter
  const upcomingRange = uiState.upcomingRange

  const [isModalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [pendingRecurringCompletions, setPendingRecurringCompletions] = useState<
    Record<string, true>
  >({})
  const recurringCompletionTimersRef = useRef<Map<string, number>>(new Map())

  const today = todayStr()
  const currentFilter =
    FILTERS.find((filter) => filter.key === selectedFilter) ?? FILTERS[0]

  const filteredTasks = useMemo(() => {
    const matching = filterTasks(tasks, selectedFilter, today, upcomingRange)
    return sortTasks(matching, selectedFilter)
  }, [tasks, selectedFilter, today, upcomingRange])

  const setSelectedFilter = (filter: FilterKey) => {
    setUiState((prev) => ({
      ...prev,
      lastFilter: filter,
    }))
  }

  const setUpcomingRange = (range: UpcomingRange) => {
    setUiState((prev) => ({
      ...prev,
      upcomingRange: range,
    }))
  }

  const currentEmptyMessage =
    selectedFilter === 'upcoming'
      ? upcomingRange === '30'
        ? 'No tasks due in the next 30 days.'
        : upcomingRange === 'all'
          ? 'No upcoming tasks.'
          : 'No tasks due in the next 14 days.'
      : currentFilter.emptyMessage

  const openCreateModal = () => {
    setEditingTask(null)
    setModalOpen(true)
  }

  const openEditModal = (task: Task) => {
    setEditingTask(task)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingTask(null)
  }

  const clearPendingRecurringCompletion = (taskId: string) => {
    setPendingRecurringCompletions((prev) => {
      if (!prev[taskId]) return prev
      const next = { ...prev }
      delete next[taskId]
      return next
    })
  }

  const clearRecurringCompletionTimer = (taskId: string) => {
    const existing = recurringCompletionTimersRef.current.get(taskId)
    if (existing === undefined) return
    window.clearTimeout(existing)
    recurringCompletionTimersRef.current.delete(taskId)
  }

  useEffect(() => {
    return () => {
      for (const timeoutId of recurringCompletionTimersRef.current.values()) {
        window.clearTimeout(timeoutId)
      }
      recurringCompletionTimersRef.current.clear()
    }
  }, [])

  const handleSaveTask = (draft: TaskDraft) => {
    const nowIso = new Date().toISOString()
    const normalizedDueDate = normalizeDueDateForRecurrence(
      draft.dueDate,
      draft.recurrence,
      today,
    )

    if (editingTask) {
      clearRecurringCompletionTimer(editingTask.id)
      clearPendingRecurringCompletion(editingTask.id)

      setTasks((prev) =>
        prev.map((task) => {
          if (task.id !== editingTask.id) return task
          const updatedTask: Task = {
            ...task,
            title: draft.title,
            notes: draft.notes,
            dueDate: normalizedDueDate,
            recurrence: draft.recurrence,
            updatedAt: nowIso,
          }

          if (draft.recurrence === 'none') {
            updatedTask.lastCompletedOn = null
            updatedTask.prevDueDate = null
          } else {
            updatedTask.completedAt = null
          }

          return updatedTask
        }),
      )
    } else {
      const newTask: Task = {
        id: createId(),
        title: draft.title,
        notes: draft.notes,
        dueDate: normalizedDueDate,
        recurrence: draft.recurrence,
        completedAt: null,
        lastCompletedOn: null,
        prevDueDate: null,
        createdAt: nowIso,
        updatedAt: nowIso,
      }

      setTasks((prev) => [newTask, ...prev])
    }

    closeModal()
  }

  const handleDeleteTask = (task: Task) => {
    const confirmed = window.confirm(`Delete "${task.title}"?`)
    if (!confirmed) return

    clearRecurringCompletionTimer(task.id)
    clearPendingRecurringCompletion(task.id)
    setTasks((prev) => prev.filter((item) => item.id !== task.id))
  }

  const handleToggleComplete = (task: Task, checked: boolean) => {
    const nowIso = new Date().toISOString()

    if (task.recurrence !== 'none') {
      clearRecurringCompletionTimer(task.id)
      if (!checked) {
        clearPendingRecurringCompletion(task.id)
      }
    }

    setTasks((prev) =>
      prev.map((item) => {
        if (item.id !== task.id) return item

        if (item.recurrence === 'none') {
          return {
            ...item,
            completedAt: checked ? nowIso : null,
            lastCompletedOn: null,
            prevDueDate: null,
            updatedAt: nowIso,
          }
        }

        if (!checked) {
          return undoRecurringCompletion(item, nowIso)
        }

        return markRecurringTaskCompleted(item, today, nowIso)
      }),
    )

    if (task.recurrence !== 'none' && checked) {
      setPendingRecurringCompletions((prev) => ({ ...prev, [task.id]: true }))
      const completedOn = today

      const timeoutId = window.setTimeout(() => {
        setTasks((prev) =>
          prev.map((item) => {
            if (item.id !== task.id) return item
            if (item.recurrence === 'none') return item
            if (item.lastCompletedOn !== completedOn) return item
            return completeRecurringTask(item, completedOn, new Date().toISOString())
          }),
        )
        clearPendingRecurringCompletion(task.id)
        recurringCompletionTimersRef.current.delete(task.id)
      }, RECURRING_COMPLETION_FEEDBACK_MS)

      recurringCompletionTimersRef.current.set(task.id, timeoutId)
    }
  }

  return (
    <div className="app-shell">
      <TopBar />
      <div className="primary-action-row">
        <button
          className="primary-button primary-button--add-task"
          type="button"
          onClick={openCreateModal}
        >
          + Add task
        </button>
      </div>
      <div className="app-panel">
        <div className="panel-controls">
          <FilterTabs
            filters={FILTERS}
            selected={selectedFilter}
            onSelect={setSelectedFilter}
          />
          {selectedFilter === 'upcoming' ? (
            <UpcomingRangeToggle value={upcomingRange} onChange={setUpcomingRange} />
          ) : null}
        </div>
        <TaskList
          tasks={filteredTasks}
          emptyMessage={currentEmptyMessage}
          today={today}
          filterKey={selectedFilter}
          pendingRecurringCompletions={pendingRecurringCompletions}
          onToggleComplete={handleToggleComplete}
          onEdit={openEditModal}
          onDelete={handleDeleteTask}
        />
      </div>
      <TaskFormModal
        isOpen={isModalOpen}
        initialTask={editingTask}
        onClose={closeModal}
        onSave={handleSaveTask}
      />
    </div>
  )
}

export default App
