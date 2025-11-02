import React, { useEffect, useState } from "react";
import { FIELD_GROUPS as TEMPLATE_GROUPS } from "./fields-core";

const SCHEMA_KEY = "kanbanFieldSchema";

export default function CardBuilder() {
  const [fieldGroups, setFieldGroups] = useState([]);

  // Load schema or initialize from template
  useEffect(() => {
    const saved = localStorage.getItem(SCHEMA_KEY);
    if (saved) {
      setFieldGroups(JSON.parse(saved));
    } else {
      localStorage.setItem(SCHEMA_KEY, JSON.stringify(TEMPLATE_GROUPS));
      setFieldGroups(TEMPLATE_GROUPS);
    }
  }, []);

  // Save schema when changed
  useEffect(() => {
    if (fieldGroups.length > 0) {
      localStorage.setItem(SCHEMA_KEY, JSON.stringify(fieldGroups));
    }
  }, [fieldGroups]);

  // Handle toggle
  const toggle = (groupIdx, fieldIdx, key) => {
    setFieldGroups((prev) =>
      prev.map((group, gi) => {
        if (gi !== groupIdx) return group;
        return {
          ...group,
          fields: group.fields.map((field, fi) => {
            if (fi !== fieldIdx) return field;
            return { ...field, [key]: !field[key] };
          }),
        };
      })
    );
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md max-w-5xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Card Builder</h1>
      <p className="text-sm text-slate-500 mb-6">
        Toggle which fields are visible in the Kanban and Card Editor. Changes are automatically saved.
      </p>

      {fieldGroups.map((group, gIdx) => (
        <div key={group.group} className="mb-8">
          <h2 className="font-semibold text-slate-700 mb-2">{group.group}</h2>
          <table className="w-full text-sm border border-slate-200 rounded-lg">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-2 px-3 border-b">Field</th>
                <th className="text-left py-2 px-3 border-b">Type</th>
                <th className="text-left py-2 px-3 border-b">Description</th>
                <th className="text-center py-2 px-3 border-b">Show in Kanban</th>
                <th className="text-center py-2 px-3 border-b">Show in Editor</th>
              </tr>
            </thead>
            <tbody>
              {group.fields.map((f, fIdx) => (
                <tr key={f.name} className="border-b hover:bg-slate-50">
                  <td className="py-2 px-3 font-medium text-slate-700">{f.label}</td>
                  <td className="py-2 px-3 text-slate-500">{f.type}</td>
                  <td className="py-2 px-3 text-slate-500">{f.description}</td>
                  <td className="text-center py-2 px-3">
                    <input
                      type="checkbox"
                      checked={!!f.showInKanban}
                      onChange={() => toggle(gIdx, fIdx, "showInKanban")}
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="text-center py-2 px-3">
                    <input
                      type="checkbox"
                      checked={!!f.showInEditor}
                      onChange={() => toggle(gIdx, fIdx, "showInEditor")}
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
