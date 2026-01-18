# Planner Database Schema

## Collections Needed

### 1. `planner_projects`
Already created! ✅

**Fields:**
- `name` (text, required) - Project name
- `icon` (text, optional) - Material icon name
- `color` (text, optional) - Color for the project

---

### 2. `planner_items`
Update your existing collection with these fields:

**Required Fields:**
- `title` (text, required) - Card title
- `status` (select, required) - Options: `blocked`, `pending`, `in_progress`, `done`
- `order` (number, required, default: 0) - For drag & drop ordering

**Optional Fields:**
- `description` (text, optional) - Card description/content
- `priority` (select, optional) - Options: `low`, `medium`, `high`
- `due_date` (date, optional) - Due date for the task
- `project` (relation, optional) - Link to `planner_projects` collection
- `tags` (json, optional) - Array of tag strings `["design", "urgent"]`
- `card_type` (select, optional, default: "text") - Options: `text`, `todo`, `progress`, `note`
- `todo_items` (json, optional) - For todo-list type cards: `[{id: "1", text: "Task 1", completed: false}]`
- `progress_value` (number, optional, min: 0, max: 100) - For progress bar cards
- `linked_items` (json, optional) - Array of related item IDs `["item_id_1", "item_id_2"]`

---

## PocketBase Schema Setup

### Update `planner_items` collection:

```javascript
// In PocketBase Admin:
// 1. Go to Collections → planner_items
// 2. Update/Add these fields:

{
  "name": "planner_items",
  "schema": [
    // Existing
    {"name": "title", "type": "text", "required": true},
    {"name": "order", "type": "number", "required": true},
    
    // Update status options
    {"name": "status", "type": "select", "required": true, 
     "options": {"values": ["blocked", "pending", "in_progress", "done"]}},
    
    // Add/Update these
    {"name": "description", "type": "text"},
    {"name": "priority", "type": "select", 
     "options": {"values": ["low", "medium", "high"]}},
    {"name": "due_date", "type": "date"},
    {"name": "project", "type": "relation", 
     "options": {"collectionId": "planner_projects", "cascadeDelete": false}},
    {"name": "tags", "type": "json"},
    {"name": "card_type", "type": "select",
     "options": {"values": ["text", "todo", "progress", "note"]}},
    {"name": "todo_items", "type": "json"},
    {"name": "progress_value", "type": "number", "min": 0, "max": 100},
    {"name": "linked_items", "type": "json"}
  ]
}
```

---

## Quick Setup Steps

1. **planner_projects** - Already done! ✅

2. **planner_items** - Update fields:
   - Change `status` select options to: `blocked`, `pending`, `in_progress`, `done`
   - Add `project` relation field → `planner_projects`
   - Add `tags` JSON field
   - Add `card_type` select field → `text`, `todo`, `progress`, `note`
   - Add `todo_items` JSON field
   - Add `progress_value` number field (0-100)
   - Add `linked_items` JSON field

---

## Data Examples

### Text Card:
```json
{
  "title": "Draft project timeline",
  "status": "in_progress",
  "card_type": "text",
  "description": "Create detailed timeline for Q4",
  "tags": ["planning", "urgent"],
  "due_date": "2026-01-25",
  "priority": "high",
  "order": 0
}
```

### Todo Card:
```json
{
  "title": "Update dark theme",
  "status": "pending",
  "card_type": "todo",
  "todo_items": [
    {"id": "1", "text": "Update color variables", "completed": true},
    {"id": "2", "text": "Test components", "completed": false},
    {"id": "3", "text": "Update documentation", "completed": false}
  ],
  "tags": ["design"],
  "order": 1
}
```

### Progress Card:
```json
{
  "title": "API Integration",
  "status": "in_progress",
  "card_type": "progress",
  "progress_value": 65,
  "description": "Personal cloud storage integration",
  "tags": ["engineering"],
  "order": 2
}
```

### Linked Card:
```json
{
  "title": "Competitor analysis",
  "status": "done",
  "card_type": "note",
  "description": "Analysis complete",
  "linked_items": ["item_id_123", "item_id_456"],
  "tags": ["discovery"],
  "order": 3
}
```

---

## TypeScript Interfaces

Already updated in `apps/textbook/src/app/models/types.ts`:
- `PlannerProject`
- `PlannerItem` (with all new fields)
- `TodoItem` (helper interface)

---

## Ready to Build! 🚀

Once you've updated the PocketBase schema, we're ready to build:
- ✅ Sidebar with projects
- ✅ Header with filters
- ✅ 4-column kanban (Blocked, Pending, In Progress, Done)
- ✅ Multiple card types
- ✅ Card modals with editing
- ✅ Drag & drop
- ✅ Tags, dates, priorities
- ✅ Linked items
