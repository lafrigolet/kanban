import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Plus, Trash2, Edit3, Save, X, Calendar, User, Flag, GripVertical, Settings, RotateCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as Tooltip from "@radix-ui/react-tooltip";

import ColumnView from "./ColumnView";
import CardEditor from "./CardEditor";

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
  case ACTIONS.ADD_EXISTING_CARD: {
    const { columnId, card } = action.payload;
    return {
      ...state,
      cards: { ...state.cards, [card.id]: card },
      columns: {
        ...state.columns,
        [columnId]: {
          ...state.columns[columnId],
          cardIds: [...state.columns[columnId].cardIds, card.id],
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
  const [visibleFields, setVisibleFields] = useState(() => {
    // Cargar desde localStorage si existía
    const saved = localStorage.getItem("kanban-visible-fields");
    return saved
      ? JSON.parse(saved)
      : { description: true, assignee: true, dueDate: true, priority: true };
  });
  const [showSettings, setShowSettings] = useState(false);
  const [newCardColumnId, setNewCardColumnId] = useState(null);
  
  // Persistir configuración
  useEffect(() => {
    localStorage.setItem("kanban-visible-fields", JSON.stringify(visibleFields));
  }, [visibleFields]);
  
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
        <Tooltip.Provider delayDuration={150}>
          <div className="flex flex-wrap items-center gap-2">
            {!addingCol ? (
              <Tooltip.Root>
                <Tooltip.Trigger asChild>

                  <button
                    onClick={() => setAddingCol(true)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-white shadow hover:bg-slate-800"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    side="bottom"
                    sideOffset={6}
                    className="z-50 rounded-md bg-slate-800 px-2 py-1 text-xs text-white shadow-md animate-in fade-in"
                  >
                    Añadir columna
                    <Tooltip.Arrow className="fill-slate-800" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
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
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  onClick={() => setShowSettings(true)}
                  className="rounded-2xl border border-slate-300 px-4 py-2 text-sm hover:bg-white flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  side="bottom"
                  sideOffset={6}
                  className="z-50 rounded-md bg-slate-800 px-2 py-1 text-xs text-white shadow-md animate-in fade-in"
                >
                  Configurar tarjeta
                  <Tooltip.Arrow className="fill-slate-800" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>

            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  onClick={() => {
                    localStorage.removeItem("kanban-state");
                    dispatch({ type: ACTIONS.INIT, payload: sampleState });
                  }}
                  className="rounded-2xl border border-slate-300 px-4 py-2 text-sm hover:bg-white"
                >
                  <RotateCw className="h-4 w-4" />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  side="bottom"
                  sideOffset={6}
                  className="z-50 rounded-md bg-slate-800 px-2 py-1 text-xs text-white shadow-md animate-in fade-in"
                >
                  Restablecer demo
                  <Tooltip.Arrow className="fill-slate-800" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>

          </div>
        </Tooltip.Provider>
      </header>
      
      <div className="flex gap-4 overflow-x-auto pb-8">
        <AnimatePresence mode="popLayout">
          {state.columnOrder.map((columnId) => (
            <motion.div key={columnId} layout transition={{ layout: { duration: 0.25 } }}>
              <ColumnView
                key={columnId}
                column={state.columns[columnId]}
                cards={state.columns[columnId].cardIds.map((id) => state.cards[id]).filter(Boolean)}
                visibleFields={visibleFields}
                onAddCard={() => setNewCardColumnId(columnId)}
                onDeleteColumn={() => {
                  const ok = confirm("¿Eliminar columna y sus tarjetas?");
                  if (ok) dispatch({ type: ACTIONS.DELETE_COLUMN, payload: { id: columnId } });
                }}
                onRename={(title) => dispatch({ type: ACTIONS.RENAME_COLUMN, payload: { id: columnId, title } })}
                onCardEdit={(id) => setEditingCardId(id)}
                onCardDelete={(id) => dispatch({ type: ACTIONS.DELETE_CARD, payload: { id, fromColumnId: columnId } })}
                onDragStart={(e) => onColDragStart(e, columnId)}
                onDragOver={(e) => onColDragOver(e, columnId)}
                onDragEnd={onColDragEnd}
                onCardDragStart={onCardDragStart}
                onCardDragOver={onCardDragOver}
                onCardDrop={onCardDrop}
              />
            </motion.div>
          ))}
        </AnimatePresence>
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

      {newCardColumnId && (
        <CardEditor
          card={{
            id: uid(),
            title: "",
            description: "",
            assignee: "",
            dueDate: "",
            priority: "",
          }}
          onClose={() => setNewCardColumnId(null)}
          onSave={(newData) => {
            const id = uid();
            const newCard = {
              id,
              ...newData,
              createdAt: Date.now(),
            };
            
            dispatch({
              type: ACTIONS.INIT,
              payload: {
                ...state,
                cards: { ...state.cards, [id]: newCard },
                columns: {
                  ...state.columns,
                  [newCardColumnId]: {
                    ...state.columns[newCardColumnId],
                    cardIds: [...state.columns[newCardColumnId].cardIds, id],
                  },
                },
              },
            });
            
            setNewCardColumnId(null);
          }}
        />
      )}
      
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowSettings(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
            <h3 className="text-lg font-semibold mb-4">Campos visibles en las tarjetas</h3>
            <div className="space-y-3">
              {Object.keys(visibleFields).map((field) => (
                <label key={field} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={visibleFields[field]}
                    onChange={(e) =>
                      setVisibleFields({ ...visibleFields, [field]: e.target.checked })
                    }
                    className="h-4 w-4"
                  />
                  <span className="capitalize">{field}</span>
                </label>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}


