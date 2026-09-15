import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "../types";

interface TaskCardProps {
  task: Task;
  currentUserId?: number;
  onSelect: (task: Task) => void;
}

export function TaskCard({ task, currentUserId, onSelect }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const isAssignedToOther =
    currentUserId && task.user_id !== currentUserId && task.user;
  const assigner = task.assigned_by;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`task-card ${isDragging ? "dragging" : ""}`}
      onClick={() => onSelect(task)}
      {...attributes}
      {...listeners}
    >
      <div className="task-card-title">{task.title}</div>

      {(isAssignedToOther || (assigner && assigner.id !== currentUserId)) && (
        <div className="task-card-meta">
          {isAssignedToOther && (
            <span className="task-assigned-to-badge">
              <i className="bi bi-person-fill" aria-hidden="true" />
              {task.user?.name}
            </span>
          )}
          {assigner && assigner.id !== currentUserId && (
            <span className="task-assigned-badge">
              <i className="bi bi-shield-check" aria-hidden="true" />
              {assigner.name}
            </span>
          )}
        </div>
      )}

      {(task.start_date || task.end_date) && (
        <div className="task-card-dates">
          <i className="bi bi-calendar-event" aria-hidden="true" />
          <span>
            {task.start_date ?? "…"} → {task.end_date ?? "…"}
          </span>
        </div>
      )}

      {!!task.comments_count && (
        <div className="task-card-footer">
          <span className="task-card-comments">
            <i className="bi bi-chat-left-text" aria-hidden="true" />
            {task.comments_count}
          </span>
        </div>
      )}
    </li>
  );
}
