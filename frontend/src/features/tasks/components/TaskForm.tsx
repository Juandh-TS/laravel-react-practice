import type { User } from "@/types";
import { useState, type FormEvent } from "react";

interface TaskFormProps {
  isAdmin?: boolean;
  users?: User[];
  currentUserId?: number;
  onSubmit: (title: string, userId?: number) => Promise<void>;
}

export function TaskForm({
  isAdmin = false,
  users = [],
  currentUserId,
  onSubmit,
}: TaskFormProps) {
  const [title, setTitle] = useState("");
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
      await onSubmit(trimmed, assignedUserId);
      setTitle("");
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
