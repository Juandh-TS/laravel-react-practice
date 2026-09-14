import { useEffect, useState, useCallback } from "react";
import { Badge } from "@/components/common/Badge";
import { ErrorAlert } from "@/components/common/ErrorAlert";
import { Spinner } from "@/components/common/Spinner";
import { useAuth } from "@/features/auth/context/AuthContext";
import { usersApi } from "@/features/users/api/usersApi";
import type { User } from "@/features/users/types";
import { tasksApi } from "./api/tasksApi";
import { TaskForm } from "./components/TaskForm";
import { TaskItem } from "./components/TaskItem";
import type { Task, TaskFilter } from "./types";

export function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState<TaskFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

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

  async function handleCreate(title: string, userId?: number) {
    setFormError(null);
    try {
      await tasksApi.create(title, userId);
      await loadTasks(filter);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "No se pudo crear la tarea.",
      );
      throw err;
    }
  }

  async function handleToggle(task: Task) {
    const previousCompleted = task.completed;

    // Optimistic update: cambiar inmediatamente en la UI
    setTasks((current) =>
      current.map((t) =>
        t.id === task.id ? { ...t, completed: !t.completed } : t,
      ),
    );

    try {
      const updated = await tasksApi.toggle(task);
      setTasks((current) =>
        current.map((t) => (t.id === task.id ? updated : t)),
      );
    } catch (err) {
      // Revertir estado en caso de error
      setTasks((current) =>
        current.map((t) =>
          t.id === task.id ? { ...t, completed: previousCompleted } : t,
        ),
      );
      setFormError(
        err instanceof Error ? err.message : "No se pudo actualizar la tarea.",
      );
    }
  }

  async function handleUpdate(id: number, title: string) {
    try {
      const updated = await tasksApi.update(id, { title });
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

      <ul className="task-list">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            currentUserId={user?.id}
            onToggle={handleToggle}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ))}
      </ul>
    </>
  );
}
