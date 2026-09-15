import { useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { TASK_STATUSES, TASK_STATUS_LABELS } from "../types";
import type { Task, TaskStatus } from "../types";
import { TaskComments } from "./TaskComments";

interface TaskDetailPanelProps {
  task: Task | null;
  currentUserId?: number;
  onClose: () => void;
  onUpdate: (
    id: number,
    data: Partial<{
      title: string;
      status: TaskStatus;
      start_date: string | null;
      end_date: string | null;
    }>,
  ) => Promise<void>;
  onDelete: (id: number) => void;
}

export function TaskDetailPanel({
  task,
  currentUserId,
  onClose,
  onUpdate,
  onDelete,
}: TaskDetailPanelProps) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle(task?.title ?? "");
    setError(null);
  }, [task]);

  useEffect(() => {
    if (!task) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [task, onClose]);

  if (!task) return null;

  const isAssignedByOther = Boolean(
    task.assigned_by_user_id && task.assigned_by_user_id !== currentUserId,
  );
  const canEditTitle = !isAssignedByOther;

  async function saveTitle() {
    const trimmed = title.trim();
    if (!trimmed || trimmed === task!.title) {
      setTitle(task!.title);
      return;
    }
    try {
      await onUpdate(task!.id, { title: trimmed });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo actualizar el título.",
      );
      setTitle(task!.title);
    }
  }

  async function handleStatusChange(status: TaskStatus) {
    try {
      await onUpdate(task!.id, { status });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo actualizar el estado.",
      );
    }
  }

  async function handleDateChange(field: "start_date" | "end_date", value: string) {
    try {
      await onUpdate(task!.id, { [field]: value || null });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo actualizar la fecha.",
      );
    }
  }

  return (
    <div className="task-detail-overlay" role="presentation" onClick={onClose}>
      <aside
        className="task-detail-panel"
        role="dialog"
        aria-modal="true"
        aria-label={`Detalle de tarea: ${task.title}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="task-detail-header">
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Cerrar panel"
            title="Cerrar"
          >
            <i className="bi bi-x-lg" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="icon-btn danger"
            onClick={() => setConfirmingDelete(true)}
            aria-label="Borrar tarea"
            title="Borrar tarea"
          >
            <i className="bi bi-trash" aria-hidden="true" />
          </button>
        </div>

        {canEditTitle ? (
          <input
            type="text"
            className="task-detail-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
          />
        ) : (
          <h2 className="task-detail-title">{task.title}</h2>
        )}

        <div className="task-detail-field">
          <label htmlFor="task-detail-status">Estado</label>
          <select
            id="task-detail-status"
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
          >
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {TASK_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>

        <div className="task-detail-dates">
          <div className="task-detail-field">
            <label htmlFor="task-detail-start">Fecha de inicio</label>
            <input
              id="task-detail-start"
              type="date"
              value={task.start_date ?? ""}
              max={task.end_date ?? undefined}
              onChange={(e) => handleDateChange("start_date", e.target.value)}
            />
          </div>
          <div className="task-detail-field">
            <label htmlFor="task-detail-end">Fecha de fin</label>
            <input
              id="task-detail-end"
              type="date"
              value={task.end_date ?? ""}
              min={task.start_date ?? undefined}
              onChange={(e) => handleDateChange("end_date", e.target.value)}
            />
          </div>
        </div>

        {(task.user || task.assigned_by) && (
          <div className="task-detail-meta">
            {task.user && (
              <span className="task-assigned-to-badge">
                <i className="bi bi-person-fill" aria-hidden="true" />
                Asignada a: <strong>{task.user.name}</strong>
              </span>
            )}
            {task.assigned_by && (
              <span className="task-assigned-badge">
                <i className="bi bi-shield-check" aria-hidden="true" />
                Asignada por: <strong>{task.assigned_by.name}</strong>
              </span>
            )}
          </div>
        )}

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <TaskComments taskId={task.id} />
      </aside>

      <ConfirmDialog
        open={confirmingDelete}
        title="Borrar tarea"
        description={`¿Seguro que quieres borrar "${task.title}"? Esta acción no se puede deshacer.`}
        onConfirm={() => {
          setConfirmingDelete(false);
          onDelete(task.id);
          onClose();
        }}
        onCancel={() => setConfirmingDelete(false)}
      />
    </div>
  );
}
