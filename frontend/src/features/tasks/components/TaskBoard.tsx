import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragCancelEvent,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useState } from "react";
import { BoardColumn } from "./BoardColumn";
import { TaskCard } from "./TaskCard";
import type { PriorityOption, Task, TaskStatus, TaskStatusOption } from "../types";

interface TaskBoardProps {
  tasks: Task[];
  statuses: TaskStatusOption[];
  priorities: PriorityOption[];
  currentUserId?: number;
  onSelect: (task: Task) => void;
  onReorder: (task: Task, status: TaskStatus, position: number) => void;
}

const POSITION_GAP = 1000;

function sortByPosition(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
}

export function TaskBoard({
  tasks,
  statuses,
  priorities,
  currentUserId,
  onSelect,
  onReorder,
}: TaskBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const statusSlugs = new Set(statuses.map((s) => s.slug));

  function isTaskStatus(value: unknown): value is TaskStatus {
    return typeof value === "string" && statusSlugs.has(value);
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveTask(tasks.find((t) => t.id === event.active.id) ?? null);
  }

  function handleDragCancel(_event: DragCancelEvent) {
    setActiveTask(null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);

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
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="task-board">
        {[...statuses]
          .sort((a, b) => a.position - b.position)
          .map((status) => (
            <BoardColumn
              key={status.slug}
              status={status}
              tasks={sortByPosition(tasks.filter((t) => t.status === status.slug))}
              priorities={priorities}
              currentUserId={currentUserId}
              onSelect={onSelect}
            />
          ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <TaskCard
            task={activeTask}
            priorities={priorities}
            currentUserId={currentUserId}
            onSelect={() => {}}
            dragOverlay
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}
