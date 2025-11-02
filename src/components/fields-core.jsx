import React from "react";

// ---- Basic Field Components ----
export const TitleField = ({ value, onChange }) => (
  <div className="col-span-12">
    <label className="block text-sm font-semibold text-slate-700 mb-1">
      Title
    </label>
    <input
      type="text"
      value={value || ""}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder="Enter title"
      className="w-full border border-slate-300 rounded px-2 py-1 text-sm"
    />
  </div>
);
TitleField.cols = 12;

export const DescriptionField = ({ value, onChange }) => (
  <div className="col-span-12">
    <label className="block text-sm font-semibold text-slate-700 mb-1">
      Description
    </label>
    <textarea
      value={value || ""}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder="Describe this task..."
      rows={3}
      className="w-full border border-slate-300 rounded px-2 py-1 text-sm"
    />
  </div>
);
DescriptionField.cols = 12;

export const StatusField = ({ value, onChange }) => (
  <div className="col-span-6">
    <label className="block text-sm font-semibold text-slate-700 mb-1">
      Status
    </label>
    <select
      value={value || ""}
      onChange={(e) => onChange?.(e.target.value)}
      className="w-full border border-slate-300 rounded px-2 py-1 text-sm"
    >
      {["Todo", "Doing", "Done"].map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);
StatusField.cols = 6;

export const AssigneeField = ({ value, onChange }) => (
  <div className="col-span-6">
    <label className="block text-sm font-semibold text-slate-700 mb-1">
      Assignee
    </label>
    <input
      type="text"
      value={value || ""}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder="Who is responsible?"
      className="w-full border border-slate-300 rounded px-2 py-1 text-sm"
    />
  </div>
);
AssigneeField.cols = 6;

export const PriorityField = ({ value, onChange }) => (
  <div className="col-span-6">
    <label className="block text-sm font-semibold text-slate-700 mb-1">
      Priority
    </label>
    <select
      value={value || ""}
      onChange={(e) => onChange?.(e.target.value)}
      className="w-full border border-slate-300 rounded px-2 py-1 text-sm"
    >
      {["Low", "Medium", "High", "Urgent"].map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);
PriorityField.cols = 6;

export const DueDateField = ({ value, onChange }) => (
  <div className="col-span-6">
    <label className="block text-sm font-semibold text-slate-700 mb-1">
      Due Date
    </label>
    <input
      type="date"
      value={value || ""}
      onChange={(e) => onChange?.(e.target.value)}
      className="w-full border border-slate-300 rounded px-2 py-1 text-sm"
    />
  </div>
);
DueDateField.cols = 6;

export const StartDateField = ({ value, onChange }) => (
  <div className="col-span-6">
    <label className="block text-sm font-semibold text-slate-700 mb-1">
      Start Date
    </label>
    <input
      type="date"
      value={value || ""}
      onChange={(e) => onChange?.(e.target.value)}
      className="w-full border border-slate-300 rounded px-2 py-1 text-sm"
    />
  </div>
);
StartDateField.cols = 6;

export const CreatedAtField = ({ value }) => (
  <div className="col-span-6 opacity-70">
    <label className="block text-sm font-semibold text-slate-700 mb-1">
      Created At
    </label>
    <input
      type="date"
      value={value || ""}
      readOnly
      className="w-full border border-slate-300 rounded px-2 py-1 text-sm bg-slate-50"
    />
  </div>
);
CreatedAtField.cols = 6;

export const UpdatedAtField = ({ value }) => (
  <div className="col-span-6 opacity-70">
    <label className="block text-sm font-semibold text-slate-700 mb-1">
      Updated At
    </label>
    <input
      type="date"
      value={value || ""}
      readOnly
      className="w-full border border-slate-300 rounded px-2 py-1 text-sm bg-slate-50"
    />
  </div>
);
UpdatedAtField.cols = 6;


export const FIELD_GROUPS = [
  {
    group: "Core",
    fields: [
      {
        name: "title",
        label: "Title",
        type: "text",
        description: "Short name or summary of the card",
        showInKanban: true,
        showInEditor: true,
        editable: false,
        component: TitleField,
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        description: "Detailed explanation or notes",
        showInKanban: false,
        showInEditor: true,
        editable: true,
        component: DescriptionField,
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        description: "Current workflow state (Todo, Doing, Done)",
        showInKanban: true,
        showInEditor: true,
        editable: true,
        component: StatusField,
      },
      {
        name: "assignee",
        label: "Assignee",
        type: "user",
        description: "Person responsible for this task",
        showInKanban: true,
        showInEditor: true,
        editable: true,
        component: AssigneeField,
      },
      {
        name: "priority",
        label: "Priority",
        type: "select",
        description: "Importance level of the task",
        showInKanban: true,
        showInEditor: true,
        editable: true,
        component: PriorityField,
      },
      {
        name: "dueDate",
        label: "Due Date",
        type: "date",
        description: "Deadline for completion",
        showInKanban: true,
        showInEditor: true,
        editable: true,
        component: DueDateField,
      },
      {
        name: "startDate",
        label: "Start Date",
        type: "date",
        description: "When work should start",
        showInKanban: false,
        showInEditor: true,
        editable: true,
        component: StartDateField,
      },
      {
        name: "createdAt",
        label: "Created At",
        type: "date",
        description: "Date the card was created",
        showInKanban: false,
        showInEditor: true,
        editable: false,
        component: CreatedAtField,
      },
      {
        name: "updatedAt",
        label: "Updated At",
        type: "date",
        description: "Last time the card was modified",
        showInKanban: false,
        showInEditor: true,
        editable: false,
        component: UpdatedAtField,
      },
    ],
  },
];
