// ---- All available fields with type + description ----
export const FIELD_GROUPS = [
  {
    group: "Core",
    fields: [
      { name: "title", label: "Title", type: "text", description: "Short name or summary of the card" },
      { name: "description", label: "Description", type: "textarea", description: "Detailed explanation or notes" },
      { name: "status", label: "Status", type: "select", description: "Current workflow state (Todo, Doing, Done)" },
      { name: "assignee", label: "Assignee", type: "user", description: "Person responsible for this task" },
      { name: "priority", label: "Priority", type: "select", description: "Importance level of the task" },
      { name: "dueDate", label: "Due Date", type: "date", description: "Deadline for completion" },
      { name: "startDate", label: "Start Date", type: "date", description: "When work should start" },
      { name: "createdAt", label: "Created At", type: "date", description: "Date the card was created" },
      { name: "updatedAt", label: "Updated At", type: "date", description: "Last time the card was modified" },
    ],
  },
  {
    group: "Time Tracking",
    fields: [
      { name: "estimate", label: "Estimate", type: "number", description: "Estimated effort (hours or points)" },
      { name: "timeSpent", label: "Time Spent", type: "number", description: "Actual work time logged" },
      { name: "deadline", label: "Deadline", type: "date", description: "Strict final due date" },
      { name: "targetDate", label: "Target Date", type: "date", description: "Goal or SLA completion date" },
    ],
  },
  {
    group: "People",
    fields: [
      { name: "reporter", label: "Reporter", type: "user", description: "Who created the card" },
      { name: "reviewer", label: "Reviewer", type: "user", description: "Person responsible for review or QA" },
      { name: "followers", label: "Followers", type: "multi-select", description: "Users watching this card" },
      { name: "team", label: "Team", type: "select", description: "Team or department assigned" },
    ],
  },
  {
    group: "Classification",
    fields: [
      { name: "labels", label: "Labels / Tags", type: "multi-select", description: "Flexible categories or tags" },
      { name: "category", label: "Category", type: "select", description: "Main classification of this card" },
      { name: "project", label: "Project / Epic", type: "select", description: "Parent project or epic" },
      { name: "sprint", label: "Sprint / Iteration", type: "select", description: "Current agile iteration" },
      { name: "version", label: "Version / Milestone", type: "text", description: "Release or milestone target" },
    ],
  },
  {
    group: "Task Management",
    fields: [
      { name: "checklist", label: "Checklist", type: "list", description: "Subtasks or steps within the card" },
      { name: "progress", label: "Progress (%)", type: "number", description: "Completion percentage" },
      { name: "dependencies", label: "Dependencies", type: "list", description: "Tasks that block this card" },
      { name: "related", label: "Related Issues", type: "list", description: "Linked cards or references" },
      { name: "attachments", label: "Attachments", type: "file", description: "Images or documents attached" },
    ],
  },
  {
    group: "Productivity / Metrics",
    fields: [
      { name: "effort", label: "Effort", type: "number", description: "Workload or complexity measure" },
      { name: "impact", label: "Impact", type: "number", description: "Business value or outcome" },
      { name: "risk", label: "Risk Level", type: "select", description: "Likelihood and severity of risk" },
      { name: "confidence", label: "Confidence", type: "number", description: "Certainty of estimation (%)" },
      { name: "score", label: "Score / RICE / WSJF", type: "formula", description: "Calculated prioritization score" },
    ],
  },
  {
    group: "Visual",
    fields: [
      { name: "color", label: "Color / Label Color", type: "color", description: "Accent or category color" },
      { name: "icon", label: "Icon / Emoji", type: "text", description: "Visual icon or emoji for quick ID" },
      { name: "cover", label: "Cover Image", type: "image", description: "Displayed image or banner" },
      { name: "badge", label: "Custom Badge", type: "text", description: "Short tag or highlight" },
    ],
  },
  {
    group: "Communication",
    fields: [
      { name: "comments", label: "Comments", type: "list", description: "Threaded feedback or discussion" },
      { name: "mentions", label: "Mentions", type: "multi-select", description: "Users mentioned in comments" },
      { name: "activityLog", label: "Activity Log", type: "list", description: "History of actions or changes" },
      { name: "links", label: "External Links", type: "list", description: "References or external docs" },
    ],
  },
  {
    group: "Automation / Integration",
    fields: [
      { name: "webhook", label: "Webhook Triggered", type: "boolean", description: "Whether automation ran" },
      { name: "integrationId", label: "Integration ID", type: "text", description: "External system reference" },
      { name: "commitLink", label: "Commit / PR Link", type: "text", description: "Git commit or PR reference" },
      { name: "lastSynced", label: "Last Synced", type: "date", description: "Last update from integration" },
    ],
  },
];
