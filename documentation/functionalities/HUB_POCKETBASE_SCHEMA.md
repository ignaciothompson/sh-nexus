# Hub PocketBase Schema

This document describes the PocketBase collections required for the Hub application.

---

## Collections Overview

| Collection | Purpose |
|------------|---------|
| `sections` | Dashboard sections/categories for organizing apps |
| `apps` | Applications and bookmarks displayed on the dashboard |

---

## Collection: `sections`

**Purpose:** Groups apps into categories on the dashboard (e.g., "Media", "Infrastructure", "Utilities")

### Schema

| Field | Type | Required | Options |
|-------|------|----------|---------|
| `title` | Text | ✅ Yes | - |
| `order` | Number | No | Default: 0 |

### API Rules (suggested)

- **List/View:** Public or Auth only (your choice)
- **Create/Update/Delete:** Auth only (admin)

### PocketBase Admin Steps

1. Go to **Collections** → **New Collection**
2. Name: `sections`
3. Add fields:
   - `title` (Text, Required)
   - `order` (Number)

---

## Collection: `apps`

**Purpose:** Individual app tiles and bookmarks on the dashboard

### Schema

| Field | Type | Required | Options |
|-------|------|----------|---------|
| `name` | Text | ✅ Yes | - |
| `url` | URL | ✅ Yes | - |
| `icon` | File | No | Single file, image types only |
| `iconUrl` | URL | No | External icon URL (alternative to file) |
| `order` | Number | No | Default: 0 |
| `section` | Relation | No | → `sections` (single) |
| `type` | Select | No | Options: `app`, `bookmark`. Default: `app` |
| `templateId` | Text | No | App template identifier (e.g., `jellyfin`) |
| `config` | JSON | No | Template-specific configuration |
| `healthCheck` | Bool | No | Default: `true` |

### Relation Details

- **`section`**: Relation to `sections` collection
  - Type: Single
  - Cascade Delete: Optional (set to `false` to keep apps if section deleted)

### API Rules (suggested)

- **List/View:** Public or Auth only
- **Create/Update/Delete:** Auth only (admin)

### PocketBase Admin Steps

1. Go to **Collections** → **New Collection**
2. Name: `apps`
3. Add fields:
   - `name` (Text, Required)
   - `url` (URL, Required)
   - `icon` (File, Single, MIME: image/*)
   - `iconUrl` (URL)
   - `order` (Number)
   - `section` (Relation → `sections`, Single)
   - `type` (Select, Options: `app,bookmark`)
   - `templateId` (Text)
   - `config` (JSON)
   - `healthCheck` (Bool, Default: true)

---

## Quick Setup via PocketBase Migrate Script

If you prefer to create collections programmatically, save this in `pb_migrations/`:

```javascript
// pb_migrations/001_hub_schema.js
migrate((app) => {
  // Create sections collection
  const sections = new Collection({
    name: 'sections',
    type: 'base',
    schema: [
      { name: 'title', type: 'text', required: true },
      { name: 'order', type: 'number' }
    ]
  });
  app.save(sections);

  // Create apps collection
  const apps = new Collection({
    name: 'apps',
    type: 'base',
    schema: [
      { name: 'name', type: 'text', required: true },
      { name: 'url', type: 'url', required: true },
      { name: 'icon', type: 'file', options: { maxSelect: 1, mimeTypes: ['image/*'] } },
      { name: 'iconUrl', type: 'url' },
      { name: 'order', type: 'number' },
      { name: 'section', type: 'relation', options: { collectionId: sections.id, maxSelect: 1 } },
      { name: 'type', type: 'select', options: { values: ['app', 'bookmark'] } },
      { name: 'templateId', type: 'text' },
      { name: 'config', type: 'json' },
      { name: 'healthCheck', type: 'bool' }
    ]
  });
  app.save(apps);
}, (app) => {
  app.delete(app.findCollectionByNameOrId('apps'));
  app.delete(app.findCollectionByNameOrId('sections'));
});
```

---

## Example Data

### Section
```json
{
  "id": "abc123",
  "title": "Media",
  "order": 0
}
```

### App
```json
{
  "id": "xyz789",
  "name": "Jellyfin",
  "url": "https://jellyfin.example.com",
  "icon": "icon_abc.png",
  "iconUrl": "",
  "order": 0,
  "section": "abc123",
  "type": "app",
  "templateId": "jellyfin",
  "config": { "apiKey": "your-api-key" },
  "healthCheck": true
}
```

### Bookmark
```json
{
  "id": "qrs456",
  "name": "GitHub",
  "url": "https://github.com",
  "iconUrl": "https://github.githubassets.com/favicons/favicon.svg",
  "order": 0,
  "section": null,
  "type": "bookmark",
  "healthCheck": false
}
```

---

## Notes

1. **Icon Priority:** The frontend checks `icon` (file) first, falls back to `iconUrl`
2. **Bookmarks vs Apps:** Bookmarks have `type: "bookmark"` and no `section`
3. **Health Check:** Apps with `healthCheck: true` will be pinged for status
4. **Template Config:** Apps like Jellyfin can have a `config` JSON with API keys

---

*Last updated: January 2026*
