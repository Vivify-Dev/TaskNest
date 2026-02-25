import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { Task, TaskDraft } from '../domain/types'

interface TaskFormModalProps {
  isOpen: boolean
  initialTask: Task | null
  onClose: () => void
  onSave: (draft: TaskDraft) => void
}

const TaskFormModal = ({
  isOpen,
  initialTask,
  onClose,
  onSave,
}: TaskFormModalProps) => {
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [recurrence, setRecurrence] = useState<Task['recurrence']>('none')

  useEffect(() => {
    if (!isOpen) return
    setTitle(initialTask?.title ?? '')
    setNotes(initialTask?.notes ?? '')
    setDueDate(initialTask?.dueDate ?? '')
    setRecurrence(initialTask?.recurrence ?? 'none')
  }, [initialTask, isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const form = event.currentTarget
    if (!form.reportValidity()) return

    const trimmedTitle = title.trim()
    if (!trimmedTitle) return

    onSave({
      title: trimmedTitle,
      notes: notes.trim(),
      dueDate: dueDate ? dueDate : null,
      recurrence,
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <p className="modal-eyebrow">Task details</p>
            <h2 id="task-modal-title">
              {initialTask ? 'Edit task' : 'Add a task'}
            </h2>
          </div>
          <button type="button" className="ghost-button" onClick={onClose}>
            Close
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Title</span>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="What needs to get done?"
              autoFocus
              required
              maxLength={120}
            />
          </label>

          <label className="form-field">
            <span>Notes</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Add context or links (optional)"
              rows={3}
              maxLength={500}
            />
          </label>

          <div className="form-row">
            <label className="form-field">
              <span>Due date</span>
              <input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </label>

            <label className="form-field">
              <span>Recurrence</span>
              <select
                value={recurrence}
                onChange={(event) =>
                  setRecurrence(event.target.value as Task['recurrence'])
                }
              >
                <option value="none">None</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </label>
          </div>

          <p className="form-hint">
            Recurring tasks keep a single template and advance the next due date
            when completed.
          </p>

          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button">
              {initialTask ? 'Save changes' : 'Add task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TaskFormModal
