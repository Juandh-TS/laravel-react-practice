import { useEffect, useState, useCallback } from "react";
import { Badge } from "@/components/common/Badge";
import { ErrorAlert } from "@/components/common/ErrorAlert";
import { Spinner } from "@/components/common/Spinner";
import { useAuth } from "@/features/auth/context/AuthContext";
import { usersApi } from "@/features/users/api/usersApi";
import type { User } from "@/features/users/types";
import { tasksApi } from "./api/tasksApi";
import { TaskBoard } from "./components/TaskBoard";
import { TaskDetailPanel } from "./components/TaskDetailPanel";
import { TaskForm } from "./components/TaskForm";
import type { Priority, Task, TaskFilter, TaskStatus } from "./types";

export function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  const isAdmin = user?.role === "admin";

  const loadTasks = useCallback(async (currentFilter: TaskFilter) => {
    setLoading(true);
    try {
      const data = await tasksApi.list(currentFilter);
      setTasks(data);
      setError(null);
    } catch {
      setError(
        'No se pudo conectar con la API. ¿Corriste "php artisan serve" en backend/?',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks(filter);
  }, [filter, loadTasks]);

  useEffect(() => {
    if (isAdmin) {
      usersApi
        .list()
        .then(setUsers)
        .catch((err) =>
          console.error("Error al cargar lista de usuarios:", err),
        );
    }
  }, [isAdmin]);

  async function handleCreate(
    title: string,
    userId?: number,
    priority?: Priority,
  ) {
    setFormError(null);
    try {
      await tasksApi.create({ title, user_id: userId, priority });
      await loadTasks(filter);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "No se pudo crear la tarea.",
      );
      throw err;
    }
  }

  async function handleStatusChange(task: Task, status: TaskStatus) {
    const previousStatus = task.status;

    // Optimistic update: cambiar inmediatamente en la UI
    setTasks((current) =>
      current.map((t) => (t.id === task.id ? { ...t, status } : t)),
    );

    try {
      const updated = await tasksApi.update(task.id, { status });
      setTasks((current) =>
        current.map((t) => (t.id === task.id ? updated : t)),
      );
    } catch (err) {
      // Revertir estado en caso de error
      setTasks((current) =>
        current.map((t) =>
          t.id === task.id ? { ...t, status: previousStatus } : t,
        ),
      );
      setFormError(
        err instanceof Error ? err.message : "No se pudo actualizar la tarea.",
      );
    }
  }

  async function handleUpdate(
    id: number,
    data: Partial<{
      title: string;
      status: TaskStatus;
      priority: Priority;
      start_date: string | null;
      end_date: string | null;
      tag_ids: number[];
    }>,
  ) {
    try {
      const updated = await tasksApi.update(id, data);
      setTasks((current) => current.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "No se pudo actualizar la tarea.",
      );
      throw err;
    }
  }

  async function handleDelete(id: number) {
    const deletedTask = tasks.find((t) => t.id === id);

    // Optimistic update: quitar inmediatamente de la lista
    setTasks((current) => current.filter((t) => t.id !== id));
    setSelectedTaskId((current) => (current === id ? null : current));

    try {
      await tasksApi.remove(id);
    } catch (err) {
      // Revertir agregando la tarea si falló la petición
      if (deletedTask) {
        setTasks((current) => [deletedTask, ...current]);
      }
      setFormError(
        err instanceof Error ? err.message : "No se pudo borrar la tarea.",
      );
    }
  }

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) ?? null;

  return (
    <>
      <h1>
        Tareas
        {!loading && !error && <Badge count={tasks.length} />}
      </h1>
      <p className="subtitle">Gestiona tus tareas diarias</p>

      <TaskForm
        isAdmin={isAdmin}
        users={users}
        currentUserId={user?.id}
        onSubmit={handleCreate}
      />

      {isAdmin && (
        <div className="task-filter-bar">
          <span className="task-filter-label">Filtrar:</span>
          <div className="task-filter-group">
            <button
              type="button"
              className={`task-filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              Todas
            </button>
            <button
              type="button"
              className={`task-filter-btn ${filter === "assigned_to_me" ? "active" : ""}`}
              onClick={() => setFilter("assigned_to_me")}
            >
              Mis tareas
            </button>
            <button
              type="button"
              className={`task-filter-btn ${filter === "assigned_by_me" ? "active" : ""}`}
              onClick={() => setFilter("assigned_by_me")}
            >
              Asignadas a otros
            </button>
          </div>
        </div>
      )}

      <ErrorAlert message={formError} />
      <ErrorAlert message={error} />

      {loading && <Spinner message="Cargando tareas..." />}

      {!loading && !error && tasks.length === 0 && (
        <p className="state-message">No hay tareas pendientes. ¡Agrega una!</p>
      )}

      {!loading && !error && tasks.length > 0 && (
        <TaskBoard
          tasks={tasks}
          currentUserId={user?.id}
          onSelect={(task) => setSelectedTaskId(task.id)}
          onStatusChange={handleStatusChange}
        />
      )}

      <TaskDetailPanel
        task={selectedTask}
        currentUserId={user?.id}
        onClose={() => setSelectedTaskId(null)}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </>
  );
}
