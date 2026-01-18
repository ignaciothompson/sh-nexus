# PocketBase Collections for Planner

This document provides the exact field configurations needed in PocketBase for the Planner feature.

---

## Collection 1: `planner_projects`

**Purpose**: Store project information for organizing planner cards.

### Fields

| Field Name | Type   | Required | Options/Details                                      |
|------------|--------|----------|------------------------------------------------------|
| `name`     | Text   | ✅ Yes   | Min: 1, Max: 100                                     |
| `icon`     | Text   | ❌ No    | Material Symbols icon name (e.g., "rocket_launch")  |
| `color`    | Text   | ❌ No    | Tailwind class (e.g., "text-blue-500")              |

### API Rules (Example)
```javascript
// List/Search Rule
@request.auth.id != ""

// View Rule
@request.auth.id != ""

// Create Rule
@request.auth.id != ""

// Update Rule
@request.auth.id != ""

// Delete Rule
@request.auth.id != ""
```

---

## Collection 2: `planner_items`

**Purpose**: Store individual task/card data.

### Fields

| Field Name       | Type     | Required | Options/Details                                             |
|------------------|----------|----------|-------------------------------------------------------------|
| `title`          | Text     | ✅ Yes   | Min: 1, Max: 200                                            |
| `description`    | Text     | ❌ No    | Long text for details                                       |
| `status`         | Select   | ✅ Yes   | Options: `blocked`, `pending`, `in_progress`, `done`        |
| `priority`       | Select   | ❌ No    | Options: `low`, `medium`, `high`                            |
| `due_date`       | Date     | ❌ No    | ISO date string                                             |
| `order`          | Number   | ✅ Yes   | Default: `0`, for custom ordering                           |
| `project`        | Relation | ❌ No    | Collection: `planner_projects`, Max select: 1               |
| `tags`           | JSON     | ❌ No    | Array of strings, Default: `[]`                             |
| `card_type`      | Select   | ✅ Yes   | Options: `text`, `todo`, `progress`, `note`, Default: `text`|
| `todo_items`     | JSON     | ❌ No    | Array of objects: `[{id, text, completed}]`, Default: `[]`  |
| `progress_value` | Number   | ❌ No    | Min: `0`, Max: `100`, Default: `0`                          |
| `linked_items`   | Relation | ❌ No    | Collection: `planner_items`, Max select: Multiple           |

### Detailed Field Configuration

#### `status` (Select)
- **Values**: `blocked`, `pending`, `in_progress`, `done`
- **Default**: `pending`
- **Display**: Single select dropdown

#### `priority` (Select)
- **Values**: `low`, `medium`, `high`
- **Default**: `medium`
- **Display**: Single select dropdown

#### `card_type` (Select)
- **Values**: `text`, `todo`, `progress`, `note`
- **Default**: `text`
- **Display**: Single select dropdown

#### `project` (Relation)
- **Collection**: `planner_projects`
- **Max Select**: `1` (single)
- **Cascade Delete**: Optional (decide if deleting project should delete cards)

#### `linked_items` (Relation)
- **Collection**: `planner_items` (self-reference)
- **Max Select**: `Multiple`
- **Cascade Delete**: `false` (unlinking, not deleting)

#### `tags` (JSON)
Example value:
```json
["urgent", "frontend", "bug"]
```

#### `todo_items` (JSON)
Example value:
```json
[
  {"id": "1", "text": "Design mockups", "completed": true},
  {"id": "2", "text": "Implement UI", "completed": false},
  {"id": "3", "text": "Write tests", "completed": false}
]
```

### API Rules (Example)
```javascript
// List/Search Rule
@request.auth.id != ""

// View Rule
@request.auth.id != ""

// Create Rule
@request.auth.id != ""

// Update Rule
@request.auth.id != ""

// Delete Rule
@request.auth.id != ""
```

---

## Quick Setup Commands (PocketBase CLI)

If using PocketBase migrations or CLI:

```bash
# Start PocketBase
./pocketbase serve

# Access Admin UI
# Open browser to: http://127.0.0.1:8090/_/
```

---

## Schema Export (JSON)

For automated setup, here's the schema in JSON format:

### `planner_projects.json`
```json
{
  "name": "planner_projects",
  "type": "base",
  "schema": [
    {
      "name": "name",
      "type": "text",
      "required": true,
      "options": {
        "min": 1,
        "max": 100
      }
    },
    {
      "name": "icon",
      "type": "text",
      "required": false,
      "options": {
        "max": 50
      }
    },
    {
      "name": "color",
      "type": "text",
      "required": false,
      "options": {
        "max": 50
      }
    }
  ]
}
```

### `planner_items.json`
```json
{
  "name": "planner_items",
  "type": "base",
  "schema": [
    {
      "name": "title",
      "type": "text",
      "required": true,
      "options": {
        "min": 1,
        "max": 200
      }
    },
    {
      "name": "description",
      "type": "text",
      "required": false
    },
    {
      "name": "status",
      "type": "select",
      "required": true,
      "options": {
        "values": ["blocked", "pending", "in_progress", "done"],
        "maxSelect": 1
      }
    },
    {
      "name": "priority",
      "type": "select",
      "required": false,
      "options": {
        "values": ["low", "medium", "high"],
        "maxSelect": 1
      }
    },
    {
      "name": "due_date",
      "type": "date",
      "required": false
    },
    {
      "name": "order",
      "type": "number",
      "required": true,
      "options": {
        "min": 0
      }
    },
    {
      "name": "project",
      "type": "relation",
      "required": false,
      "options": {
        "collectionId": "<planner_projects_id>",
        "maxSelect": 1
      }
    },
    {
      "name": "tags",
      "type": "json",
      "required": false
    },
    {
      "name": "card_type",
      "type": "select",
      "required": true,
      "options": {
        "values": ["text", "todo", "progress", "note"],
        "maxSelect": 1
      }
    },
    {
      "name": "todo_items",
      "type": "json",
      "required": false
    },
    {
      "name": "progress_value",
      "type": "number",
      "required": false,
      "options": {
        "min": 0,
        "max": 100
      }
    },
    {
      "name": "linked_items",
      "type": "relation",
      "required": false,
      "options": {
        "collectionId": "<planner_items_id>",
        "maxSelect": null
      }
    }
  ]
}
```

---

## Verification Checklist

After creating the collections, verify:

- [ ] `planner_projects` collection exists
- [ ] `planner_items` collection exists
- [ ] All required fields are marked as required
- [ ] Select fields have correct options
- [ ] Relation fields point to correct collections
- [ ] JSON fields have appropriate defaults
- [ ] API rules are set for authenticated users
- [ ] Test creating a sample project via API
- [ ] Test creating a sample card via API

---

## Sample Data (for Testing)

### Sample Project
```json
{
  "name": "Website Redesign",
  "icon": "palette",
  "color": "text-purple-500"
}
```

### Sample Cards

**Text Card:**
```json
{
  "title": "Update landing page copy",
  "description": "Revise the hero section text based on marketing feedback",
  "status": "pending",
  "priority": "high",
  "card_type": "text",
  "tags": ["content", "marketing"],
  "order": 0
}
```

**Todo Card:**
```json
{
  "title": "Implement authentication",
  "status": "in_progress",
  "priority": "high",
  "card_type": "todo",
  "tags": ["backend", "security"],
  "todo_items": [
    {"id": "1", "text": "Set up OAuth", "completed": true},
    {"id": "2", "text": "Add JWT tokens", "completed": false},
    {"id": "3", "text": "Implement refresh logic", "completed": false}
  ],
  "order": 0
}
```

**Progress Card:**
```json
{
  "title": "Database migration",
  "status": "in_progress",
  "card_type": "progress",
  "progress_value": 65,
  "tags": ["database"],
  "order": 0
}
```

---

**Last Updated**: January 17, 2026  
**PocketBase Version**: Compatible with 0.20+
