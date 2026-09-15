import { useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { tagsApi } from "../api/tagsApi";
import { PRIORITIES, PRIORITY_LABELS, TASK_STATUSES, TASK_STATUS_LABELS } from "../types";
import type { Priority, Tag, Task, TaskStatus } from "../types";
import { TaskComments } from "./TaskComments";

const TAG_COLOR_PALETTE = [
  "#6366f1", // Indigo
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#f43f5e", // Rose
  "#0ea5e9", // Sky
  "#a855f7", // Purple
  "#ec4899", // Pink
  "#14b8a6", // Teal
];

interface TaskDetailPanelProps {
  task: Task | null;
  currentUserId?: number;
  onClose: () => void;
  onUpdate: (
    id: number,
    data: Partial<{
      title: string;
      status: TaskStatus;
      priority: Priority;
      start_date: string | null;
      end_date: string | null;
      tag_ids: number[];
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

  // Tags state
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(TAG_COLOR_PALETTE[0]);
  const [isSavingTag, setIsSavingTag] = useState(false);

  useEffect(() => {
    setTitle(task?.title ?? "");
    setError(null);
    setIsCreatingTag(false);
    setNewTagName("");
  }, [task]);

  useEffect(() => {
    tagsApi
      .list()
      .then(setAvailableTags)
      .catch((err) => console.error("Error al cargar tags:", err));
  }, []);

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

  async function handlePriorityChange(priority: Priority) {
    try {
      await onUpdate(task!.id, { priority });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo actualizar la prioridad.",
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

  async function handleRemoveTag(tagIdToRemove: number) {
    const currentTagIds = (task?.tags ?? []).map((t) => t.id);
    const nextTagIds = currentTagIds.filter((id) => id !== tagIdToRemove);
    try {
      await onUpdate(task!.id, { tag_ids: nextTagIds });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo remover el tag.",
      );
    }
  }

  async function handleAddExistingTag(tagIdToAdd: number) {
    if (!tagIdToAdd) return;
    const currentTagIds = (task?.tags ?? []).map((t) => t.id);
    if (currentTagIds.includes(tagIdToAdd)) return;
    const nextTagIds = [...currentTagIds, tagIdToAdd];
    try {
      await onUpdate(task!.id, { tag_ids: nextTagIds });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo agregar el tag.",
      );
    }
  }

  async function handleCreateAndAttachTag() {
    const trimmed = newTagName.trim();
    if (!trimmed || isSavingTag) return;
    setIsSavingTag(true);
    try {
      const createdTag = await tagsApi.create(trimmed, newTagColor);
      setAvailableTags((prev) => {
        if (prev.some((t) => t.id === createdTag.id)) return prev;
        return [...prev, createdTag];
      });

      const currentTagIds = (task?.tags ?? []).map((t) => t.id);
      await onUpdate(task!.id, { tag_ids: [...currentTagIds, createdTag.id] });

      setNewTagName("");
      setIsCreatingTag(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo crear el tag.",
      );
    } finally {
      setIsSavingTag(false);
    }
  }

  const assignedTagIds = new Set((task.tags ?? []).map((t) => t.id));
  const unassignedTags = availableTags.filter((t) => !assignedTagIds.has(t.id));

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

        <div className="task-detail-row">
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

          <div className="task-detail-field">
            <label htmlFor="task-detail-priority">Prioridad</label>
            <select
              id="task-detail-priority"
              value={task.priority ?? "medium"}
              onChange={(e) => handlePriorityChange(e.target.value as Priority)}
            >
              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {PRIORITY_LABELS[priority]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tags management */}
        <div className="task-detail-tags-section">
          <div className="task-detail-tags-header">
            <label className="task-detail-tags-label">
              <i className="bi bi-tags-fill" aria-hidden="true" /> Tags
            </label>
            {!isCreatingTag && (
              <button
                type="button"
                className="task-tag-add-btn"
                onClick={() => setIsCreatingTag(true)}
              >
                <i className="bi bi-plus" aria-hidden="true" /> Nuevo tag
              </button>
            )}
          </div>

          <div className="task-detail-tags-list">
            {task.tags && task.tags.length > 0 ? (
              task.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="tag-chip-editable"
                  style={{
                    backgroundColor: `${tag.color}20`,
                    borderColor: `${tag.color}55`,
                    color: tag.color,
                  }}
                >
                  #{tag.name}
                  <button
                    type="button"
                    className="tag-chip-remove-btn"
                    onClick={() => handleRemoveTag(tag.id)}
                    title={`Quitar tag ${tag.name}`}
                    aria-label={`Quitar tag ${tag.name}`}
                  >
                    ×
                  </button>
                </span>
              ))
            ) : (
              <span className="task-no-tags-text">Sin tags asignados</span>
            )}
          </div>

          {unassignedTags.length > 0 && !isCreatingTag && (
            <div className="task-add-existing-tag">
              <select
                className="task-tag-select"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddExistingTag(Number(e.target.value));
                    e.target.value = "";
                  }
                }}
              >
                <option value="" disabled>
                  + Agregar tag existente...
                </option>
                {unassignedTags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    #{tag.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {isCreatingTag && (
            <div className="task-create-tag-box">
              <div className="task-create-tag-inputs">
                <input
                  type="text"
                  placeholder="Nombre del tag..."
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="task-create-tag-input"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCreateAndAttachTag();
                    }
                  }}
                />
                <div className="task-tag-color-picker">
                  {TAG_COLOR_PALETTE.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`task-tag-color-swatch ${newTagColor === color ? "active" : ""}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewTagColor(color)}
                      aria-label={`Color ${color}`}
                    />
                  ))}
                </div>
              </div>
              <div className="task-create-tag-actions">
                <button
                  type="button"
                  className="btn btn-sm primary"
                  onClick={handleCreateAndAttachTag}
                  disabled={!newTagName.trim() || isSavingTag}
                >
                  {isSavingTag ? "Guardando..." : "Crear y asignar"}
                </button>
                <button
                  type="button"
                  className="btn btn-sm secondary"
                  onClick={() => {
                    setIsCreatingTag(false);
                    setNewTagName("");
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
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

