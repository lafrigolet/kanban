import {
  useEffect, 
  useRef, 
  useState
} from "react";

import {
  X, 
} from "lucide-react";


// ---------- Helpers ----------
const PRIORITIES = ["", "Low", "Medium", "High"];


// ---------- Card Editor (Modal) ----------
export default function CardEditor({ card, onClose, onSave }) {
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
