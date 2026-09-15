import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { BoardColumn } from "./BoardColumn";
import { TASK_STATUSES } from "../types";
import type { Task, TaskStatus } from "../types";

interface TaskBoardProps {
  tasks: Task[];
  currentUserId?: number;
  onSelect: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
}

function isTaskStatus(value: unknown): value is TaskStatus {
  return TASK_STATUSES.includes(value as TaskStatus);
}

export function TaskBoard({
  tasks,
  currentUserId,
  onSelect,
  onStatusChange,
}: TaskBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const task = tasks.find((t) => t.id === active.id);
    if (!task) return;

    let targetStatus: TaskStatus | undefined;
    if (isTaskStatus(over.id)) {
      targetStatus = over.id;
    } else {
      targetStatus = tasks.find((t) => t.id === over.id)?.status;
    }

    if (targetStatus && targetStatus !== task.status) {
      onStatusChange(task, targetStatus);
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="task-board">
        {TASK_STATUSES.map((status) => (
          <BoardColumn
            key={status}
            status={status}
            tasks={tasks.filter((t) => t.status === status)}
            currentUserId={currentUserId}
            onSelect={onSelect}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>
    </DndContext>
  );
}
