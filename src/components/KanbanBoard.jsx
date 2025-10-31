import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Plus, Trash2, Edit3, Save, X, Calendar, User, Flag, GripVertical } from "lucide-react";

/**
 * Kanban Board — React + Tailwind + Vite (JavaScript)
 *
 * Features
 * - Add, rename, drag-reorder, and delete columns
 * - Add, edit, drag between columns, reorder, and delete cards
 * - Editable card fields: title, description, assignee, due date, priority
 * - Data stored in component state (JS objects/arrays) with localStorage persistence
 *
 * Notes
 * - No external drag-and-drop lib: uses native HTML5 drag & drop
 * - Everything in one file for easy copy-paste into a Vite project
 */

// ---------- Types (JSDoc for clarity) ----------
/** @typedef {{ id: string, title: string, description: string, assignee: string, dueDate: string, priority: 'Low'|'Medium'|'High'|'', createdAt: number }} Card */
/** @typedef {{ id: string, title: string, cardIds: string[] }} Column */
/** @typedef {{ columns: Record<string, Column>, columnOrder: string[], cards: Record<string, Card> }} BoardState */

// ---------- Sample Data (objects + arrays) ----------
const sampleState /** @type {BoardState} */ = {
  columns: {
    todo: {
      id: "todo",
      title: "Por hacer",
      cardIds: ["c1", "c2"],
    },
    doing: {
      id: "doing",
      title: "En progreso",
      cardIds: ["c3"],
    },
    done: {
      id: "done",
      title: "Hecho",
      cardIds: [],
    },
  },
  columnOrder: ["todo", "doing", "done"],
  cards: {
    c1: {
      id: "c1",
      title: "Configurar Vite",
      description: "Crear proyecto con Vite y React.",
      assignee: "Ana",
      dueDate: "",
      priority: "Medium",
      createdAt: Date.now() - 1000 * 60 * 60 * 24,
    },
    c2: {
      id: "c2",
      title: "Diseñar columnas",
      description: "Definir estructura de columnas y tarjetas.",
      assignee: "Luis",
      dueDate: "",
      priority: "High",
      createdAt: Date.now() - 1000 * 60 * 60 * 2,
    },
    c3: {
      id: "c3",
      title: "Editar tarjetas",
      description: "Permitir edición inline de campos.",
      assignee: "",
      dueDate: "",
      priority: "Low",
      createdAt: Date.now() - 1000 * 60 * 30,
    },
  },
};

// ---------- Helpers ----------
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

const PRIORITIES = ["", "Low", "Medium", "High"];

function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}

// ---------- Reducer ----------
const ACTIONS = {
  INIT: "INIT",
  ADD_COLUMN: "ADD_COLUMN",
  RENAME_COLUMN: "RENAME_COLUMN",
  DELETE_COLUMN: "DELETE_COLUMN",
  REORDER_COLUMNS: "REORDER_COLUMNS",
  ADD_CARD: "ADD_CARD",
  UPDATE_CARD: "UPDATE_CARD",
  DELETE_CARD: "DELETE_CARD",
  MOVE_CARD: "MOVE_CARD",
  REORDER_CARDS_IN_COLUMN: "REORDER_CARDS_IN_COLUMN",
};

/** @param {BoardState} state @param {{type: string, payload?: any}} action */
function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.INIT: {
      return action.payload || state;
    }
    case ACTIONS.ADD_COLUMN: {
      const id = uid();
      const col = { id, title: action.payload?.title || "Nueva columna", cardIds: [] };
      return {
        ...state,
        columns: { ...state.columns, [id]: col },
        columnOrder: [...state.columnOrder, id],
      };
    }
    case ACTIONS.RENAME_COLUMN: {
      const { id, title } = action.payload;
      return {
        ...state,
        columns: { ...state.columns, [id]: { ...state.columns[id], title } },
      };
    }
    case ACTIONS.DELETE_COLUMN: {
      const { id } = action.payload;
      const { [id]: removed, ...restCols } = state.columns;
      const newOrder = state.columnOrder.filter((c) => c !== id);
      // also delete cards contained in this column
      const cardsToDelete = new Set(removed?.cardIds || []);
      const newCards = Object.fromEntries(
        Object.entries(state.cards).filter(([cid]) => !cardsToDelete.has(cid))
      );
      return { ...state, columns: restCols, columnOrder: newOrder, cards: newCards };
    }
    case ACTIONS.REORDER_COLUMNS: {
      return { ...state, columnOrder: action.payload.order };
    }
    case ACTIONS.ADD_CARD: {
      const { columnId } = action.payload;
      const id = uid();
      const card = {
        id,
        title: "Nueva tarea",
        description: "",
        assignee: "",
        dueDate: "",
        priority: "",
        createdAt: Date.now(),
      };
      return {
        ...state,
        cards: { ...state.cards, [id]: card },
        columns: {
          ...state.columns,
          [columnId]: {
            ...state.columns[columnId],
            cardIds: [...state.columns[columnId].cardIds, id],
          },
        },
      };
    }
    case ACTIONS.UPDATE_CARD: {
      const { id, patch } = action.payload;
      return { ...state, cards: { ...state.cards, [id]: { ...state.cards[id], ...patch } } };
    }
    case ACTIONS.DELETE_CARD: {
      const { id, fromColumnId } = action.payload;
      const { [id]: removed, ...restCards } = state.cards;
      const col = state.columns[fromColumnId];
      const newIds = col.cardIds.filter((cid) => cid !== id);
      return {
        ...state,
        cards: restCards,
        columns: { ...state.columns, [fromColumnId]: { ...col, cardIds: newIds } },
      };
    }
    case ACTIONS.MOVE_CARD: {
      const { cardId, fromColumnId, toColumnId, toIndex } = action.payload;
      if (!state.columns[fromColumnId] || !state.columns[toColumnId]) return state;
      const from = state.columns[fromColumnId];
      const to = state.columns[toColumnId];
      const fromIds = from.cardIds.filter((id) => id !== cardId);
      const toIds = [...to.cardIds];
      const insertAt = Math.min(Math.max(0, toIndex ?? toIds.length), toIds.length);
      toIds.splice(insertAt, 0, cardId);
      return {
        ...state,
        columns: {
          ...state.columns,
          [fromColumnId]: { ...from, cardIds: fromIds },
          [toColumnId]: { ...to, cardIds: toIds },
        },
      };
    }
    case ACTIONS.REORDER_CARDS_IN_COLUMN: {
      const { columnId, newOrder } = action.payload;
      const col = state.columns[columnId];
      return { ...state, columns: { ...state.columns, [columnId]: { ...col, cardIds: newOrder } } };
    }
    default:
      return state;
  }
}

// ---------- Main Component ----------
export default function KanbanBoard() {
  const [state, dispatch] = useReducer(reducer, sampleState);
  const [addingCol, setAddingCol] = useState(false);
  const [newColTitle, setNewColTitle] = useState("");
  const [editingCardId, setEditingCardId] = useState(null);
  const [dragColId, setDragColId] = useState(null);
  const [dragCardInfo, setDragCardInfo] = useState(null); // {cardId, fromColumnId}

  // LocalStorage persistence
  useEffect(() => {
    const saved = localStorage.getItem("kanban-state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.columns && parsed.cards && parsed.columnOrder) {
          dispatch({ type: ACTIONS.INIT, payload: parsed });
        }
      } catch (_) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("kanban-state", JSON.stringify(state));
  }, [state]);

  const handleAddColumn = () => {
    dispatch({ type: ACTIONS.ADD_COLUMN, payload: { title: newColTitle.trim() || undefined } });
    setNewColTitle("");
    setAddingCol(false);
  };

  // Column drag handlers
  const onColDragStart = (e, columnId) => {
    setDragColId(columnId);
    e.dataTransfer.effectAllowed = "move";
  };
  const onColDragOver = (e, overId) => {
    e.preventDefault();
    if (dragColId == null || dragColId === overId) return;
    const order = [...state.columnOrder];
    const from = order.indexOf(dragColId);
    const to = order.indexOf(overId);
    if (from === -1 || to === -1) return;
    order.splice(from, 1);
    order.splice(to, 0, dragColId);
    dispatch({ type: ACTIONS.REORDER_COLUMNS, payload: { order } });
  };
  const onColDragEnd = () => setDragColId(null);

  // Card drag handlers
  const onCardDragStart = (e, cardId, fromColumnId, index) => {
    setDragCardInfo({ cardId, fromColumnId, fromIndex: index });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", JSON.stringify({ cardId, fromColumnId }));
  };
  const onCardDragOver = (e, columnId, overIndex) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const info = dragCardInfo;
    if (!info) return;
    // Reorder visually while dragging within same column
    if (info.fromColumnId === columnId) {
      const ids = [...state.columns[columnId].cardIds];
      const from = ids.indexOf(info.cardId);
      if (from === -1) return;
      const to = overIndex;
      if (to === -1 || to === from) return;
      ids.splice(from, 1);
      ids.splice(to, 0, info.cardId);
      dispatch({ type: ACTIONS.REORDER_CARDS_IN_COLUMN, payload: { columnId, newOrder: ids } });
      setDragCardInfo({ ...info, fromIndex: to });
    }
  };
  const onCardDrop = (e, toColumnId, toIndex) => {
    e.preventDefault();
    e.stopPropagation(); // 🛑 evita que el drop burbujee a otros elementos

    // Evita ejecución doble
    if (e.dataTransfer.dropEffect === "none") return;

    let data;
    try {
      data = JSON.parse(e.dataTransfer.getData("text/plain"));
    } catch {
      data = dragCardInfo;
    }
    if (!data) return;

    const { cardId, fromColumnId } = data;

    if (fromColumnId === toColumnId && dragCardInfo?.fromIndex === toIndex) {
      return; // no mover si está en el mismo lugar
    }

    dispatch({
      type: ACTIONS.MOVE_CARD,
      payload: { cardId, fromColumnId, toColumnId, toIndex },
    });

    setDragCardInfo(null);
    e.dataTransfer.dropEffect = "none"; // marca el drop como procesado ✅
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 p-6">
      <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Tablero Kanban</h1>
        <div className="flex flex-wrap items-center gap-2">
          {!addingCol ? (
            <button
              onClick={() => setAddingCol(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-white shadow hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" /> Añadir columna
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={newColTitle}
                onChange={(e) => setNewColTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddColumn()}
                placeholder="Título de la columna"
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
              <button onClick={handleAddColumn} className="rounded-xl bg-emerald-600 px-3 py-2 text-white shadow hover:bg-emerald-500">
                <Save className="h-4 w-4" />
              </button>
              <button onClick={() => setAddingCol(false)} className="rounded-xl bg-slate-200 px-3 py-2 hover:bg-slate-300">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          <button
            onClick={() => {
              localStorage.removeItem("kanban-state");
              dispatch({ type: ACTIONS.INIT, payload: sampleState });
            }}
            className="rounded-2xl border border-slate-300 px-4 py-2 text-sm hover:bg-white"
          >
            Restablecer demo
          </button>
        </div>
      </header>

      <div className="flex gap-4 overflow-x-auto pb-8">
        {state.columnOrder.map((columnId) => (
          <ColumnView
            key={columnId}
            column={state.columns[columnId]}
            cards={state.columns[columnId].cardIds.map((id) => state.cards[id]).filter(Boolean)}
            onAddCard={() => dispatch({ type: ACTIONS.ADD_CARD, payload: { columnId } })}
            onDeleteColumn={() => {
              const ok = confirm("¿Eliminar columna y sus tarjetas?");
              if (ok) dispatch({ type: ACTIONS.DELETE_COLUMN, payload: { id: columnId } });
            }}
            onRename={(title) => dispatch({ type: ACTIONS.RENAME_COLUMN, payload: { id: columnId, title } })}
            onCardEdit={(id) => setEditingCardId(id)}
            onCardDelete={(id) => dispatch({ type: ACTIONS.DELETE_CARD, payload: { id, fromColumnId: columnId } })}
            // Drag & drop (columns)
            onDragStart={(e) => onColDragStart(e, columnId)}
            onDragOver={(e) => onColDragOver(e, columnId)}
            onDragEnd={onColDragEnd}
            // Drag & drop (cards)
            onCardDragStart={onCardDragStart}
            onCardDragOver={onCardDragOver}
            onCardDrop={onCardDrop}
          />
        ))}
      </div>

      {editingCardId && (
        <CardEditor
          card={state.cards[editingCardId]}
          onClose={() => setEditingCardId(null)}
          onSave={(patch) => {
            dispatch({ type: ACTIONS.UPDATE_CARD, payload: { id: editingCardId, patch } });
            setEditingCardId(null);
          }}
        />
      )}
    </div>
  );
}

// ---------- Column View ----------
function ColumnView({
  column,
  cards,
  onAddCard,
  onDeleteColumn,
  onRename,
  onCardEdit,
  onCardDelete,
  onDragStart,
  onDragOver,
  onDragEnd,
  onCardDragStart,
  onCardDragOver,
  onCardDrop,
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(column.title);
  useEffect(() => setTitle(column.title), [column.title]);

  return (
    <section
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      className="flex w-80 shrink-0 flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-slate-400" />
          {!isEditingTitle ? (
            <h2 className="text-sm font-semibold" onDoubleClick={() => setIsEditingTitle(true)}>
              {column.title}
            </h2>
          ) : (
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => {
                setIsEditingTitle(false);
                if (title.trim() && title !== column.title) onRename(title.trim());
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
                if (e.key === "Escape") {
                  setTitle(column.title);
                  setIsEditingTitle(false);
                }
              }}
              className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
              autoFocus
            />
          )}
        </div>
        <button
          onClick={onDeleteColumn}
          className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-red-600"
          title="Eliminar columna"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div
        className="flex flex-1 flex-col gap-2"
        onDragOver={(e) => onCardDragOver(e, column.id, cards.length)}
        onDrop={(e) => {
          e.stopPropagation(); // 🔥 previene doble llamada
          onCardDrop(e, column.id, cards.length);
        }}
      >
        {cards.map((card, idx) => (
          <div
            key={card.id}
            draggable
            onDragStart={(e) => {
              e.stopPropagation();
              onCardDragStart(e, card.id, column.id, idx);
            }}
            onDragOver={(e) => onCardDragOver(e, column.id, idx)}
            onDrop={(e) => onCardDrop(e, column.id, idx)}
            className="group rounded-xl border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md"
          >
            <div className="mb-1 flex items-start justify-between gap-2">
              <h3 className="line-clamp-2 text-sm font-medium">{card.title || "(Sin título)"}</h3>
              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  className="rounded-lg p-1 hover:bg-slate-100"
                  title="Editar"
                  onClick={() => onCardEdit(card.id)}
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  className="rounded-lg p-1 hover:bg-slate-100"
                  title="Eliminar"
                  onClick={() => onCardDelete(card.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
              {card.assignee && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5">
                  <User className="h-3 w-3" /> {card.assignee}
                </span>
              )}
              {card.dueDate && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5">
                  <Calendar className="h-3 w-3" /> {card.dueDate}
                </span>
              )}
              {card.priority && (
                <span className={classNames(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5",
                  card.priority === "High" && "bg-red-100 text-red-700",
                  card.priority === "Medium" && "bg-amber-100 text-amber-700",
                  card.priority === "Low" && "bg-emerald-100 text-emerald-700"
                )}>
                  <Flag className="h-3 w-3" /> {card.priority}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onAddCard}
        className="mt-1 inline-flex items-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-600 hover:border-slate-400 hover:bg-slate-50"
      >
        <Plus className="h-4 w-4" /> Añadir tarjeta
      </button>
    </section>
  );
}

// ---------- Card Editor (Modal) ----------
function CardEditor({ card, onClose, onSave }) {
  const [form, setForm] = useState({ ...card });
  const dialogRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div ref={dialogRef} className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-lg font-semibold">Editar tarjeta</h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>

        <div className="space-y-4">
          <Field label="Título">
            <input
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Nombre de la tarea"
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
            />
          </Field>

          <Field label="Descripción">
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Detalles..."
              rows={4}
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field label="Responsable">
              <input
                value={form.assignee}
                onChange={(e) => update("assignee", e.target.value)}
                placeholder="Nombre"
                className="w-full rounded-xl border border-slate-300 px-3 py-2"
              />
            </Field>
            <Field label="Vence">
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => update("dueDate", e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2"
              />
            </Field>
            <Field label="Prioridad">
              <select
                value={form.priority}
                onChange={(e) => update("priority", e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p || "(ninguna)"}</option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-xl px-4 py-2 hover:bg-slate-100">Cancelar</button>
          <button
            onClick={() => onSave({
              title: form.title.trim(),
              description: form.description,
              assignee: form.assignee.trim(),
              dueDate: form.dueDate,
              priority: form.priority,
            })}
            className="rounded-xl bg-slate-900 px-4 py-2 text-white shadow hover:bg-slate-800"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-slate-600">{label}</span>
      {children}
    </label>
  );
}
