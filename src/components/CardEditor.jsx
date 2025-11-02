import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { FIELD_GROUPS as TEMPLATE_GROUPS } from "./fields-core";

const SCHEMA_KEY = "kanbanFieldSchema";

export default function CardEditor({ card, onClose, onSave }) {
  const [form, setForm] = useState({ ...card });
  const [schema, setSchema] = useState([]);
  const dialogRef = useRef(null);

  // Load schema from localStorage or fallback to template
  useEffect(() => {
    const saved = localStorage.getItem(SCHEMA_KEY);
    if (saved) {
      try {
        setSchema(JSON.parse(saved));
      } catch {
        setSchema(TEMPLATE_GROUPS);
      }
    } else {
      setSchema(TEMPLATE_GROUPS);
    }
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div
        ref={dialogRef}
        className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-200"
      >
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-lg font-semibold">Editar tarjeta</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Dynamic Fields */}
        <div className="grid grid-cols-12 gap-4">
          {schema.flatMap((group) =>
            group.fields
              .filter((f) => f.showInEditor)
              .map((field) => {
                const Comp = field.component;
                if (!Comp) return null;
                return (
                  <div key={field.name} className={`col-span-${Comp.cols || 12}`}>
                    <label className="block text-sm mb-1 text-slate-600">
                      {field.label}
                    </label>
                    <Comp
                      value={form[field.name] || ""}
                      onChange={(val) => update(field.name, val)}
                    />
                  </div>
                );
              })
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 hover:bg-slate-100"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="rounded-xl bg-slate-900 px-4 py-2 text-white shadow hover:bg-slate-800"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}
