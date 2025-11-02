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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  motion,
  AnimatePresence
} from "framer-motion";

import * as Tooltip from "./Tooltip";

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
  const [collapsed, setCollapsed] = useState(false);
  const [isOver, setIsOver] = useState(false);
  
  useEffect(() => setTitle(column.title), [column.title]);

  return (
    <Tooltip.Provider delayDuration={150}>

      <motion.section
        draggable
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        animate={{
          width: collapsed ? 72 : 320, // 4.5rem when collapsed (enough for icon)
        }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="flex shrink-0 flex-col rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"
      >
        {/* ---- Header ---- */}
        <div className="flex items-center justify-between gap-2 p-3">
          <div className="flex items-center gap-2 overflow-hidden">
            <Tooltip.Tip tip="Drag/Drop Column">
              <GripVertical className="h-4 w-4 text-slate-400 shrink-0" />
            </Tooltip.Tip>
            <Tooltip.Tip tip="Doble-click para editar">
              {!collapsed ? (
                !isEditingTitle ? (
                  <h2
                    className="text-sm font-semibold truncate"
                    onDoubleClick={() => setIsEditingTitle(true)}
                  >
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
                )
              ) : (
                <div className="text-[10px] font-semibold text-slate-500 -rotate-90 origin-left w-0 whitespace-nowrap">
                  {column.title}
                </div>
              )}
            </Tooltip.Tip>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Add Card */}
            <Tooltip.Tip tip="Añadir tarjeta">
              {!collapsed && (
                <button
                  onClick={onAddCard}
                  className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
                >
                  <Plus className="h-4 w-4" />
                </button>
              )}
            </Tooltip.Tip>

            {/* Collapse Column */}
            <Tooltip.Tip tip={collapsed ? "Expandir columna" : "Colapsar columna"}>
              <button
                onClick={() => setCollapsed((v) => !v)}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
              >
                {collapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </button>
            </Tooltip.Tip>

            {/* Delete Column */}
            <Tooltip.Tip tip="Eliminar columna">
              {!collapsed && (
                <button
                  onClick={onDeleteColumn}
                  className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </Tooltip.Tip>
          </div>

        </div>

        {/* ---- Cards area ---- */}
        <motion.div
          className={classNames(
            "flex flex-1 flex-col gap-2 min-h-80 px-3 pb-3 rounded-xl transition-colors duration-200",
            isOver ? "bg-slate-50 ring-2 ring-slate-300" : "bg-transparent"
          )}
          animate={{
            opacity: collapsed ? 0 : 1,
            pointerEvents: collapsed ? "none" : "auto",
          }}
          transition={{ duration: 0.25 }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOver(true);
          }}
          onDragLeave={(e) => {
            e.stopPropagation();
            setIsOver(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOver(false);

            // Parse drag data
            let data;
            try {
              data = JSON.parse(e.dataTransfer.getData("text/plain"));
            } catch {
              data = null;
            }
            if (!data) return;
            const { cardId, fromColumnId } = data;

            // Drop at the end if not over a specific card
            onCardDrop(e, column.id, cards.length);
          }}
        >
          {!collapsed && (
            <>
              {/* Cards */}
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
                      e.preventDefault();
                      e.stopPropagation();
                      onCardDragOver(e, column.id, idx);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsOver(false);
                      onCardDrop(e, column.id, idx);
                    }}
                    className="group rounded-xl border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing"
                    transition={{ layout: { duration: 0.25, ease: "easeInOut" } }}
                  >

                    <div className="mb-1 flex items-start justify-between gap-2">
                      <h3 className="line-clamp-2 text-sm font-medium">
                        {card.title || "(Sin título)"}
                      </h3>
                      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Tooltip.Tip tip="Editar tarjeta">
                          <button
                            className="rounded-lg p-1 hover:bg-slate-100"
                            title="Editar"
                            onClick={() => onCardEdit(card.id)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                        </Tooltip.Tip>
                        <Tooltip.Tip tip="Borrar tarjeta">
                          <button
                            className="rounded-lg p-1 hover:bg-slate-100"
                            title="Eliminar"
                            onClick={() => onCardDelete(card.id)}
                          >
                            <Trash2 className="h-4 w-4 hover:text-red-600" />
                          </button>
                        </Tooltip.Tip>
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
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {card.description}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </>
          )}
        </motion.div>


      </motion.section>
    </Tooltip.Provider>

  );
}
