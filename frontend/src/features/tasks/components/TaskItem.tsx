import {
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type SyntheticEvent,
} from "react";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import type { Task } from "../types";

interface TaskItemProps {
  task: Task;
  currentUserId?: number;
  onToggle: (task: Task) => void;
  onUpdate: (id: number, title: string) => Promise<void>;
  onDelete: (id: number) => void;
}

export function TaskItem({
  task,
  currentUserId,
  onToggle,
  onUpdate,
  onDelete,
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const isAssignedByOther = Boolean(
    task.assigned_by_user_id && task.assigned_by_user_id !== currentUserId,
  );
  const canEdit = !isAssignedByOther;
  const canDelete = !isAssignedByOther;

  function startEditing() {
    setEditTitle(task.title);
    setIsEditing(true);
  }

  function cancelEditing() {
    setEditTitle(task.title);
    setIsEditing(false);
  }

  function handleDoubleClick(e: MouseEvent<HTMLLIElement>) {
    if (!canEdit) return;

    const target = e.target as HTMLElement;
    // Ignore double click if clicking directly on buttons or checkboxes
    if (target.closest("button") || target.tagName === "INPUT") {
      return;
    }
    startEditing();
  }

  async function handleSave(e?: SyntheticEvent) {
    e?.preventDefault();
    const trimmed = editTitle.trim();

    if (!trimmed || isSaving) return;

    if (trimmed === task.title) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onUpdate(task.id, trimmed);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      cancelEditing();
    } else if (e.key === "Enter") {
      handleSave();
    }
  }

  return (
    <li
      className={`task-item ${task.completed ? "completed done" : ""} ${isEditing ? "editing" : ""} ${isSaving ? "saving" : ""}`}
      onDoubleClick={handleDoubleClick}
      data-tooltip={!isEditing && canEdit ? "Doble clic para editar" : undefined}
    >
      {isEditing ? (
        <form onSubmit={handleSave} className="task-edit-form">
          <input
            type="text"
            className="edit-input"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            autoFocus
            disabled={isSaving}
          />
        </form>
      ) : (
        <>
          <div className="task-content">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onToggle(task)}
              aria-label={`Marcar como completada: ${task.title}`}
            />
            <div className="task-body">
              <div className="task-header-line">
                <span className="task-title">{task.title}</span>
                <span
                  className={`task-scope ${task.company_id ? "shared" : "personal"}`}
                >
                  {task.company_id
                    ? task.user_id === currentUserId
                      ? "Compartida"
                      : `De ${task.user?.name ?? "un compañero"}`
                    : "Personal"}
                </span>
              </div>

              {(() => {
                const assigner = task.assigned_by;
                const assignedDate = task.assigned_at;
                const isAssignedToOther =
                  currentUserId && task.user_id !== currentUserId && task.user;

                if (
                  !isAssignedToOther &&
                  (!assigner || assigner.id === currentUserId)
                ) {
                  return null;
                }

                return (
                  <div className="task-meta-badges">
                    {isAssignedToOther && (
                      <span className="task-assigned-to-badge">
                        <i className="bi bi-person-fill" aria-hidden="true" />
                        Asignada a: <strong>{task.user?.name}</strong>
                      </span>
                    )}
                    {assigner && assigner.id !== currentUserId && (
                      <span className="task-assigned-badge">
                        <i className="bi bi-shield-check" aria-hidden="true" />
                        Asignada por: <strong>{assigner.name}</strong>
                        {assignedDate &&
                          ` (${new Date(assignedDate).toLocaleDateString()})`}
                      </span>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
          <div className="task-actions">
            {canEdit && (
              <button
                type="button"
                className="icon-btn"
                onClick={startEditing}
                aria-label="Editar tarea"
                title="Editar tarea"
              >
                <i className="bi bi-pencil-square" aria-hidden="true" />
              </button>
            )}
            {canDelete && (
              <button
                type="button"
                className="icon-btn danger"
                onClick={() => setConfirmingDelete(true)}
                aria-label="Borrar tarea"
                title="Borrar tarea"
              >
                <i className="bi bi-trash" aria-hidden="true" />
              </button>
            )}
            {!canEdit && !canDelete && (
              <span
                className="icon-btn"
                style={{ opacity: 0.5, cursor: "not-allowed" }}
                title="Solo el administrador puede modificar o eliminar esta tarea"
                aria-label="Tarea bloqueada"
              >
                <i className="bi bi-lock-fill" aria-hidden="true" />
              </span>
            )}
          </div>
        </>
      )}

      <ConfirmDialog
        open={confirmingDelete}
        title="Borrar tarea"
        description={`¿Seguro que quieres borrar "${task.title}"? Esta acción no se puede deshacer.`}
        onConfirm={() => {
          onDelete(task.id);
          setConfirmingDelete(false);
        }}
        onCancel={() => setConfirmingDelete(false)}
      />
    </li>
  );
}
