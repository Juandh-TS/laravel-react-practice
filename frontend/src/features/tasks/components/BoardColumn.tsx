import { useDroppable } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { Badge } from "@/components/common/Badge";
import { TaskCard } from "./TaskCard";
import type { PriorityOption, Task, TaskStatusOption } from "../types";

interface BoardColumnProps {
  status: TaskStatusOption;
  tasks: Task[];
  priorities: PriorityOption[];
  currentUserId?: number;
  onSelect: (task: Task) => void;
}

export function BoardColumn({
  status,
  tasks,
  priorities,
  currentUserId,
  onSelect,
}: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status.slug });

  return (
    <div className={`board-column ${isOver ? "over" : ""}`}>
      <div className="board-column-header" style={{ borderBottomColor: status.color }}>
        <span>{status.label}</span>
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
              priorities={priorities}
              currentUserId={currentUserId}
              onSelect={onSelect}
            />
          ))}
        </ul>
      </SortableContext>
    </div>
  );
}
