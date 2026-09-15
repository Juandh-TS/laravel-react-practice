import { useDroppable } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { Badge } from "@/components/common/Badge";
import { TaskCard } from "./TaskCard";
import { TASK_STATUS_LABELS } from "../types";
import type { Task, TaskStatus } from "../types";

interface BoardColumnProps {
  status: TaskStatus;
  tasks: Task[];
  currentUserId?: number;
  onSelect: (task: Task) => void;
}

export function BoardColumn({
  status,
  tasks,
  currentUserId,
  onSelect,
}: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className={`board-column ${isOver ? "over" : ""}`}>
      <div className={`board-column-header status-${status}`}>
        <span>{TASK_STATUS_LABELS[status]}</span>
        <Badge count={tasks.length} />
      </div>

      <SortableContext items={tasks.map((t) => t.id)}>
        <ul ref={setNodeRef} className="board-column-list">
          {tasks.length === 0 && (
            <li className="board-column-empty">Sin tareas</li>
          )}
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              currentUserId={currentUserId}
              onSelect={onSelect}
            />
          ))}
        </ul>
      </SortableContext>
    </div>
  );
}
