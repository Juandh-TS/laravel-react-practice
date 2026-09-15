import type { User } from "@/types";
import { useState, type FormEvent } from "react";
import { PRIORITIES, PRIORITY_LABELS, type Priority } from "../types";

interface TaskFormProps {
  isAdmin?: boolean;
  users?: User[];
  currentUserId?: number;
  onSubmit: (title: string, userId?: number, priority?: Priority) => Promise<void>;
}

export function TaskForm({
  isAdmin = false,
  users = [],
  currentUserId,
  onSubmit,
}: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignedUserId, setAssignedUserId] = useState<number | undefined>(
    undefined,
  );

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(trimmed, assignedUserId, priority);
      setTitle("");
      setPriority("medium");
      setAssignedUserId(undefined);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="task-form-row">
        <div className="task-form-input-group">
          <input
            type="text"
            placeholder="Nueva tarea..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            className="task-form-input"
          />

          <div className="task-form-priority-wrapper">
            <select
              className="task-form-priority-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              disabled={isSubmitting}
              aria-label="Prioridad de la tarea"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABELS[p]}
                </option>
              ))}
            </select>
          </div>

          {isAdmin && (
            <div className="task-form-assign-wrapper">
              <i
                className="bi bi-person-fill-add task-form-assign-icon"
                aria-hidden="true"
              />
              <select
                className="task-form-assign-select"
                value={assignedUserId ?? ""}
                onChange={(e) =>
                  setAssignedUserId(
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                disabled={isSubmitting}
                aria-label="Asignar tarea a un usuario"
              >
                <option value="">Para mí (sin asignar)</option>
                {users
                  .filter((user) => user.id !== currentUserId)
                  .map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} {user.company?.name ? `(${user.company.name})` : ""}
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="btn primary task-form-submit-btn"
          disabled={isSubmitting || !title.trim()}
        >
          <i className="bi bi-plus-lg" aria-hidden="true"></i>
          <span>{isSubmitting ? "Guardando..." : "Agregar"}</span>
        </button>
      </div>
    </form>
  );
}

