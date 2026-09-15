import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { commentsApi } from "../api/commentsApi";
import type { Comment } from "../types";

interface TaskCommentsProps {
  taskId: number;
}

export function TaskComments({ taskId }: TaskCommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    commentsApi
      .list(taskId)
      .then((data) => {
        if (!cancelled) setComments(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar los comentarios.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [taskId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const comment = await commentsApi.create(taskId, trimmed);
      setComments((current) => [...current, comment]);
      setBody("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo agregar el comentario.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(commentId: number) {
    const previous = comments;
    setComments((current) => current.filter((c) => c.id !== commentId));
    try {
      await commentsApi.remove(taskId, commentId);
    } catch (err) {
      setComments(previous);
      setError(
        err instanceof Error ? err.message : "No se pudo borrar el comentario.",
      );
    }
  }

  return (
    <div className="task-comments">
      <h3 className="task-comments-title">Comentarios</h3>

      {loading && <p className="state-message">Cargando comentarios...</p>}

      {!loading && comments.length === 0 && (
        <p className="state-message">Aún no hay comentarios.</p>
      )}

      <ul className="comment-list">
        {comments.map((comment) => {
          const canDelete =
            comment.user?.id === user?.id || user?.role === "admin";
          return (
            <li key={comment.id} className="comment-item">
              <div className="comment-item-header">
                <span className="comment-author">
                  {comment.user?.name ?? "Usuario"}
                </span>
                <span className="comment-date">
                  {new Date(comment.created_at).toLocaleString()}
                </span>
                {canDelete && (
                  <button
                    type="button"
                    className="icon-btn danger comment-delete-btn"
                    onClick={() => handleDelete(comment.id)}
                    aria-label="Borrar comentario"
                    title="Borrar comentario"
                  >
                    <i className="bi bi-trash" aria-hidden="true" />
                  </button>
                )}
              </div>
              <p className="comment-body">{comment.body}</p>
            </li>
          );
        })}
      </ul>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <form className="comment-form" onSubmit={handleSubmit}>
        <textarea
          className="comment-input"
          placeholder="Escribe un comentario..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          disabled={isSubmitting}
          rows={2}
        />
        <button
          type="submit"
          className="btn primary"
          disabled={isSubmitting || !body.trim()}
        >
          {isSubmitting ? "Enviando..." : "Comentar"}
        </button>
      </form>
    </div>
  );
}
