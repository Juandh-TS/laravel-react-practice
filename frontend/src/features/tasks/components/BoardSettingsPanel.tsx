import { useState } from "react";
import { COLOR_PALETTE } from "../constants";
import type { PriorityOption, TaskStatusOption } from "../types";

interface BoardSettingsPanelProps {
  statuses: TaskStatusOption[];
  priorities: PriorityOption[];
  onClose: () => void;
  onCreateStatus: (label: string, color: string, isDone: boolean) => Promise<void>;
  onUpdateStatus: (
    id: number,
    data: Partial<{ label: string; color: string; position: number; is_done: boolean }>,
  ) => Promise<void>;
  onDeleteStatus: (id: number) => Promise<void>;
  onCreatePriority: (label: string, color: string) => Promise<void>;
  onUpdatePriority: (
    id: number,
    data: Partial<{ label: string; color: string; position: number }>,
  ) => Promise<void>;
  onDeletePriority: (id: number) => Promise<void>;
}

export function BoardSettingsPanel({
  statuses,
  priorities,
  onClose,
  onCreateStatus,
  onUpdateStatus,
  onDeleteStatus,
  onCreatePriority,
  onUpdatePriority,
  onDeletePriority,
}: BoardSettingsPanelProps) {
  const [error, setError] = useState<string | null>(null);
  const [newStatusLabel, setNewStatusLabel] = useState("");
  const [newStatusColor, setNewStatusColor] = useState(COLOR_PALETTE[0]);
  const [newPriorityLabel, setNewPriorityLabel] = useState("");
  const [newPriorityColor, setNewPriorityColor] = useState(COLOR_PALETTE[0]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const sortedStatuses = [...statuses].sort((a, b) => a.position - b.position);
  const sortedPriorities = [...priorities].sort((a, b) => a.position - b.position);

  async function runAction(key: string, action: () => Promise<void>) {
    setError(null);
    setBusyId(key);
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo completar la acción.");
    } finally {
      setBusyId(null);
    }
  }

  async function moveStatus(index: number, direction: -1 | 1) {
    const target = sortedStatuses[index + direction];
    const current = sortedStatuses[index];
    if (!target) return;
    await runAction(`status-move-${current.id}`, async () => {
      await onUpdateStatus(current.id, { position: target.position });
      await onUpdateStatus(target.id, { position: current.position });
    });
  }

  async function movePriority(index: number, direction: -1 | 1) {
    const target = sortedPriorities[index + direction];
    const current = sortedPriorities[index];
    if (!target) return;
    await runAction(`priority-move-${current.id}`, async () => {
      await onUpdatePriority(current.id, { position: target.position });
      await onUpdatePriority(target.id, { position: current.position });
    });
  }

  return (
    <div className="task-detail-overlay" role="presentation" onClick={onClose}>
      <aside
        className="task-detail-panel board-settings-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Gestionar estados y prioridades"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="task-detail-header">
          <h2 className="task-detail-title">Estados y prioridades</h2>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Cerrar panel"
            title="Cerrar"
          >
            <i className="bi bi-x-lg" aria-hidden="true" />
          </button>
        </div>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <section className="board-settings-section">
          <h3>Estados del tablero</h3>
          <ul className="board-settings-list">
            {sortedStatuses.map((status, index) => (
              <li key={status.id} className="board-settings-item">
                <span className="board-settings-color-dot" style={{ backgroundColor: status.color }} />
                <input
                  type="text"
                  defaultValue={status.label}
                  className="board-settings-label-input"
                  disabled={busyId !== null}
                  onBlur={(e) => {
                    const label = e.target.value.trim();
                    if (label && label !== status.label) {
                      runAction(`status-label-${status.id}`, () => onUpdateStatus(status.id, { label }));
                    } else {
                      e.target.value = status.label;
                    }
                  }}
                />
                <div className="board-settings-color-picker">
                  {COLOR_PALETTE.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`task-tag-color-swatch ${status.color === color ? "active" : ""}`}
                      style={{ backgroundColor: color }}
                      disabled={busyId !== null}
                      aria-label={`Color ${color}`}
                      onClick={() => runAction(`status-color-${status.id}`, () => onUpdateStatus(status.id, { color }))}
                    />
                  ))}
                </div>
                <label className="board-settings-done-toggle" title="Marcar como estado de 'completada'">
                  <input
                    type="radio"
                    name="status-is-done"
                    checked={status.is_done}
                    disabled={busyId !== null}
                    onChange={() => runAction(`status-done-${status.id}`, () => onUpdateStatus(status.id, { is_done: true }))}
                  />
                  Completada
                </label>
                <div className="board-settings-order-btns">
                  <button
                    type="button"
                    className="icon-btn"
                    disabled={index === 0 || busyId !== null}
                    onClick={() => moveStatus(index, -1)}
                    aria-label="Mover arriba"
                  >
                    <i className="bi bi-arrow-up" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    disabled={index === sortedStatuses.length - 1 || busyId !== null}
                    onClick={() => moveStatus(index, 1)}
                    aria-label="Mover abajo"
                  >
                    <i className="bi bi-arrow-down" aria-hidden="true" />
                  </button>
                </div>
                <button
                  type="button"
                  className="icon-btn danger"
                  disabled={sortedStatuses.length <= 1 || busyId !== null}
                  title={sortedStatuses.length <= 1 ? "Debe existir al menos un estado" : "Eliminar estado"}
                  onClick={() => runAction(`status-delete-${status.id}`, () => onDeleteStatus(status.id))}
                >
                  <i className="bi bi-trash" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>

          <form
            className="board-settings-add-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!newStatusLabel.trim()) return;
              runAction("status-create", async () => {
                await onCreateStatus(newStatusLabel.trim(), newStatusColor, false);
                setNewStatusLabel("");
              });
            }}
          >
            <input
              type="text"
              placeholder="Nuevo estado..."
              value={newStatusLabel}
              onChange={(e) => setNewStatusLabel(e.target.value)}
              disabled={busyId !== null}
            />
            <div className="task-tag-color-picker">
              {COLOR_PALETTE.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`task-tag-color-swatch ${newStatusColor === color ? "active" : ""}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setNewStatusColor(color)}
                  aria-label={`Color ${color}`}
                />
              ))}
            </div>
            <button type="submit" className="btn btn-sm primary" disabled={!newStatusLabel.trim() || busyId !== null}>
              <i className="bi bi-plus" aria-hidden="true" /> Agregar
            </button>
          </form>
        </section>

        <section className="board-settings-section">
          <h3>Prioridades</h3>
          <ul className="board-settings-list">
            {sortedPriorities.map((priority, index) => (
              <li key={priority.id} className="board-settings-item">
                <span className="board-settings-color-dot" style={{ backgroundColor: priority.color }} />
                <input
                  type="text"
                  defaultValue={priority.label}
                  className="board-settings-label-input"
                  disabled={busyId !== null}
                  onBlur={(e) => {
                    const label = e.target.value.trim();
                    if (label && label !== priority.label) {
                      runAction(`priority-label-${priority.id}`, () => onUpdatePriority(priority.id, { label }));
                    } else {
                      e.target.value = priority.label;
                    }
                  }}
                />
                <div className="board-settings-color-picker">
                  {COLOR_PALETTE.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`task-tag-color-swatch ${priority.color === color ? "active" : ""}`}
                      style={{ backgroundColor: color }}
                      disabled={busyId !== null}
                      aria-label={`Color ${color}`}
                      onClick={() => runAction(`priority-color-${priority.id}`, () => onUpdatePriority(priority.id, { color }))}
                    />
                  ))}
                </div>
                <div className="board-settings-order-btns">
                  <button
                    type="button"
                    className="icon-btn"
                    disabled={index === 0 || busyId !== null}
                    onClick={() => movePriority(index, -1)}
                    aria-label="Mover arriba"
                  >
                    <i className="bi bi-arrow-up" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    disabled={index === sortedPriorities.length - 1 || busyId !== null}
                    onClick={() => movePriority(index, 1)}
                    aria-label="Mover abajo"
                  >
                    <i className="bi bi-arrow-down" aria-hidden="true" />
                  </button>
                </div>
                <button
                  type="button"
                  className="icon-btn danger"
                  disabled={sortedPriorities.length <= 1 || busyId !== null}
                  title={sortedPriorities.length <= 1 ? "Debe existir al menos una prioridad" : "Eliminar prioridad"}
                  onClick={() => runAction(`priority-delete-${priority.id}`, () => onDeletePriority(priority.id))}
                >
                  <i className="bi bi-trash" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>

          <form
            className="board-settings-add-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!newPriorityLabel.trim()) return;
              runAction("priority-create", async () => {
                await onCreatePriority(newPriorityLabel.trim(), newPriorityColor);
                setNewPriorityLabel("");
              });
            }}
          >
            <input
              type="text"
              placeholder="Nueva prioridad..."
              value={newPriorityLabel}
              onChange={(e) => setNewPriorityLabel(e.target.value)}
              disabled={busyId !== null}
            />
            <div className="task-tag-color-picker">
              {COLOR_PALETTE.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`task-tag-color-swatch ${newPriorityColor === color ? "active" : ""}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setNewPriorityColor(color)}
                  aria-label={`Color ${color}`}
                />
              ))}
            </div>
            <button type="submit" className="btn btn-sm primary" disabled={!newPriorityLabel.trim() || busyId !== null}>
              <i className="bi bi-plus" aria-hidden="true" /> Agregar
            </button>
          </form>
        </section>
      </aside>
    </div>
  );
}
