import {
  useEffect, 
  useState
} from "react";

import {
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  Calendar, 
  User, 
  Flag, 
  GripVertical, 
} from "lucide-react";

import {
  motion,
  AnimatePresence
} from "framer-motion";

// ---------- Helpers ----------
function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}

// ---------- Column View ----------
export default function ColumnView({
  column,
  cards,
  onAddCard,
  visibleFields,
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
        className="flex flex-1 flex-col gap-2 min-h-80"
        onDragOver={(e) => onCardDragOver(e, column.id, cards.length)}
        onDrop={(e) => {
          e.stopPropagation();
          onCardDrop(e, column.id, cards.length);
        }}
      >
        <AnimatePresence mode="popLayout">
          {cards.map((card, idx) => (
            <motion.div
              key={card.id}
              layout
              layoutId={card.id}
              draggable
              onDragStart={(e) => {
                e.stopPropagation();
                onCardDragStart(e, card.id, column.id, idx);
              }}
              onDragOver={(e) => {
                e.stopPropagation();
                onCardDragOver(e, column.id, idx);
              }}
              onDrop={(e) => {
                e.stopPropagation();
                onCardDrop(e, column.id, idx);
              }}
              className="group rounded-xl border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing"
              transition={{ layout: { duration: 0.25, ease: "easeInOut" } }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
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

              {/* Campos visibles */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                {visibleFields.assignee && card.assignee && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5">
                    <User className="h-3 w-3" /> {card.assignee}
                  </span>
                )}
                {visibleFields.dueDate && card.dueDate && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5">
                    <Calendar className="h-3 w-3" /> {card.dueDate}
                  </span>
                )}
                {visibleFields.priority && card.priority && (
                  <span
                    className={classNames(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5",
                      card.priority === "High" && "bg-red-100 text-red-700",
                      card.priority === "Medium" && "bg-amber-100 text-amber-700",
                      card.priority === "Low" && "bg-emerald-100 text-emerald-700"
                    )}
                  >
                    <Flag className="h-3 w-3" /> {card.priority}
                  </span>
                )}
                {visibleFields.description && card.description && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{card.description}</p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

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
