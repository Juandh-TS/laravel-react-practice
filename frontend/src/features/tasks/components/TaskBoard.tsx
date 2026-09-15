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
  onReorder: (task: Task, status: TaskStatus, position: number) => void;
}

const POSITION_GAP = 1000;

function isTaskStatus(value: unknown): value is TaskStatus {
  return TASK_STATUSES.includes(value as TaskStatus);
}

function sortByPosition(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
}

export function TaskBoard({
  tasks,
  currentUserId,
  onSelect,
  onReorder,
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
    let overTaskId: number | undefined;
    if (isTaskStatus(over.id)) {
      targetStatus = over.id;
    } else {
      overTaskId = over.id as number;
      targetStatus = tasks.find((t) => t.id === overTaskId)?.status;
    }
    if (!targetStatus) return;

    const columnTasks = sortByPosition(
      tasks.filter((t) => t.status === targetStatus && t.id !== task.id),
    );

    const insertIndex =
      overTaskId !== undefined
        ? Math.max(
            columnTasks.findIndex((t) => t.id === overTaskId),
            0,
          )
        : columnTasks.length;

    const prev = columnTasks[insertIndex - 1];
    const next = columnTasks[insertIndex];

    let newPosition: number;
    if (prev && next) {
      newPosition = (prev.position! + next.position!) / 2;
    } else if (next) {
      newPosition = next.position! - POSITION_GAP;
    } else if (prev) {
      newPosition = prev.position! + POSITION_GAP;
    } else {
      newPosition = POSITION_GAP;
    }

    if (
      targetStatus === task.status &&
      Math.abs(newPosition - (task.position ?? 0)) < 1e-6
    ) {
      return;
    }

    onReorder(task, targetStatus, newPosition);
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="task-board">
        {TASK_STATUSES.map((status) => (
          <BoardColumn
            key={status}
            status={status}
            tasks={sortByPosition(tasks.filter((t) => t.status === status))}
            currentUserId={currentUserId}
            onSelect={onSelect}
          />
        ))}
      </div>
    </DndContext>
  );
}
