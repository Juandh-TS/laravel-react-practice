import type { Task } from '../types'

interface TaskItemProps {
  task: Task
  onToggle: (task: Task) => void
  onDelete: (id: number) => void
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  return (
    <li className={`task-item ${task.completed ? 'done' : ''}`}>
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task)}
        />
        <span className="task-title">{task.title}</span>
      </label>
      <button
        type="button"
        className="icon-btn danger"
        onClick={() => onDelete(task.id)}
        aria-label="Borrar tarea"
      >
        ✕
      </button>
    </li>
  )
}
