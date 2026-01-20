# SH-Nexus App Architecture Standards

> **Reference Implementation**: [Textbook App](file:///c:/sh-nexus/apps/textbook) and [Media Tracker App](file:///c:/sh-nexus/apps/media-tracker)

All applications in the SH-Nexus workspace must follow these architectural standards for consistency, maintainability, and scalability.

---

## 1. Styling Framework

### ✅ Required: Tailwind CSS + SH-Skin Component Library

All apps must use **Tailwind CSS** as the base framework with the **SH-Skin Component Library** for shared UI components.

---

### SH-Skin Component Library

A portable, themeable CSS component system scoped under `.sh-skin` class.

**File Structure:**
```
src/css/
├── main.css                    # Entry point (imports all components)
└── components/
    ├── _variables.css          # Design tokens (colors, shadows, spacing)
    ├── _buttons.css            # Button variants
    ├── _containers.css         # Cards, panels, grids
    ├── _modals.css             # Dialogs, overlays
    ├── _tabs.css               # Tab navigation
    ├── _alerts.css             # Notifications, toasts
    ├── _labels.css             # Badges, tags, status
    └── _forms.css              # Inputs, selects, toggles
```

**Installation:**
1. Copy `/src/css/` folder to your app
2. Add import to `styles.css` (before Tailwind directives):
   ```css
   @import './css/main.css';
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```
3. Add `sh-skin` class to `<body>` in `index.html`:
   ```html
   <body class="sh-skin bg-[#0f0f0f] ...">
   ```

---

### Design Tokens (_variables.css)

Each app customizes the color palette by overriding these variables:

| Variable | Hub (Blue) | Textbook (Purple) |
|----------|------------|-------------------|
| `--sh-primary` | `#359EFF` | `#9c33ff` |
| `--sh-bg` | `#1c1c1e` | `#121212` |
| `--sh-bg-elevated` | `#2c2c2e` | `#09090b` |

**Example customization** ([textbook/_variables.css](file:///c:/sh-nexus/apps/textbook/src/css/components/_variables.css)):
```css
.sh-skin {
  --sh-primary: #9c33ff;           /* Purple accent */
  --sh-primary-hover: #b05bff;
  --sh-bg-base: #000000;
  --sh-bg-card: #121212;
}
```

---

### Component Classes

**Buttons:**
```html
<button class="sh-btn sh-btn-primary">Primary</button>
<button class="sh-btn sh-btn-secondary">Secondary</button>
<button class="sh-btn sh-btn-ghost">Ghost</button>
<button class="sh-btn sh-btn-danger">Danger</button>
<button class="sh-btn sh-btn-sm">Small</button>
<button class="sh-btn sh-btn-lg">Large</button>
```

**Cards & Containers:**
```html
<div class="sh-card">
  <div class="sh-card-header">
    <h3 class="sh-card-title">Title</h3>
  </div>
  <div class="sh-card-body">Content</div>
  <div class="sh-card-footer">Actions</div>
</div>

<div class="sh-glass">Glassmorphism panel</div>
<div class="sh-elevated">Elevated panel with shadow</div>
```

**Modals:**
```html
<div class="sh-modal-overlay">
  <div class="sh-modal sh-modal-lg">
    <div class="sh-modal-header">
      <h2 class="sh-modal-title">Title</h2>
      <button class="sh-modal-close">×</button>
    </div>
    <div class="sh-modal-body">Content</div>
    <div class="sh-modal-footer">Actions</div>
  </div>
</div>
```

**Forms:**
```html
<input class="sh-input" placeholder="Text input">
<select class="sh-input sh-select">...</select>
<textarea class="sh-input sh-textarea">...</textarea>

<label class="sh-toggle">
  <input type="checkbox">
  <span class="sh-toggle-slider"></span>
</label>
```

**Labels & Badges:**
```html
<span class="sh-badge sh-badge-primary">Primary</span>
<span class="sh-badge sh-badge-success">Success</span>
<span class="sh-status-dot online">Online</span>
<span class="sh-tag">Tag <button class="sh-tag-remove">×</button></span>
```

**Alerts:**
```html
<div class="sh-alert sh-alert-info">Info message</div>
<div class="sh-alert sh-alert-success">Success message</div>
<div class="sh-alert sh-alert-warning">Warning message</div>
<div class="sh-alert sh-alert-error">Error message</div>
```

**Tabs:**
```html
<div class="sh-tabs">
  <div class="sh-tab-list">
    <button class="sh-tab active">Tab 1</button>
    <button class="sh-tab">Tab 2</button>
  </div>
  <div class="sh-tab-content">
    <div class="sh-tab-panel active">Content 1</div>
  </div>
</div>
```

---

### Tailwind Configuration

**package.json:**
```json
{
  "devDependencies": {
    "tailwindcss": "4.1.18",
    "autoprefixer": "10.4.23",
    "postcss": "8.5.6"
  }
}
```

❌ **Do NOT use**: Bootstrap, Material UI, or any component library with pre-built CSS classes.

---

## 2. Service Architecture

### ✅ Required: Modular Service-Per-Feature Pattern

Each domain/feature must have its own dedicated service.

**Structure:**
```
src/app/services/
├── pocketbase.service.ts    # Singleton PocketBase client
├── notes.service.ts          # Notes management
├── tasks.service.ts          # Tasks/todo management
├── planner.service.ts        # Planner items
├── books.service.ts          # Books management
└── [feature].service.ts      # One service per feature
```

**PocketBase Service** ([textbook example](file:///c:/sh-nexus/apps/textbook/src/app/services/pocketbase.service.ts)):
```typescript
@Injectable({ providedIn: 'root' })
export class PocketbaseService {
  private pb: PocketBase;
  
  constructor() {
    this.pb = new PocketBase('https://app.sh-nexus.com');
  }
  
  get client(): PocketBase {
    return this.pb;
  }
}
```

**Feature Services** inject `PocketbaseService`:
```typescript
@Injectable({ providedIn: 'root' })
export class NotesService {
  constructor(private pbService: PocketbaseService) {}
  
  async getAll(): Promise<Note[]> {
    return await this.pbService.client
      .collection('notes')
      .getFullList<Note>({ sort: '-updated' });
  }
}
```

❌ **Do NOT use**: Single monolithic `api.service.ts` with all methods.

---

## 3. Component Structure

### Required Folder Organization

All applications must organize components into the following structure:

```
src/app/components/
├── layout/
│   ├── main-layout/        # Main application layout wrapper
│   ├── header/             # Top navigation/header
│   ├── sidebar/            # Side navigation
├── modals/
│   ├── edit-*-modal/       # Edit modals for entities
│   └── settings-modal/     # Application settings
│── welcome/                # First-time setup screen
└── [feature-components]/   # Feature-specific components (dashboard, books, etc.)
```

### Standard Layout Pattern

**All apps must use this exact layout structure:**

```html
<div class="app-container">
    <ng-container>
        <app-sidebar></app-sidebar>
        <div class="content-wrapper">
            <app-header></app-header>
            <main class="main-content">
                <!-- Welcome Screen (first-time setup) -->
                <app-welcome *ngIf="showWelcome" (setupComplete)="onSetupComplete()"></app-welcome>
                <!-- Router Outlet for pages -->
                <router-outlet *ngIf="!showWelcome"></router-outlet>
            </main>
        </div>
    </ng-container>
</div>
```

**Required CSS for layout:**

```css
.app-container {
  display: flex;
  width: 100%;
  height: 100vh;
  background-color: #0f0f0f;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.main-content {
  flex: 1;
  overflow-y: auto;
}
```

**AppComponent must simply render main-layout:**

```typescript
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MainLayoutComponent],
  template: `<app-main-layout></app-main-layout>`,
})
export class AppComponent {}
```

---

## 4. Type Definitions

### ✅ Required: Central types.ts File

All TypeScript interfaces and types must be defined in `models/types.ts`.

**Location:** `src/app/models/types.ts`

**Structure** ([textbook example](file:///c:/sh-nexus/apps/textbook/src/app/models/types.ts)):
```typescript
export interface BaseModel {
  id: string;
  created: string;
  updated: string;
}

export interface Note extends BaseModel {
  title: string;
  content: string;
  is_favorite: boolean;
  label?: string;
}

export interface PlannerItem extends BaseModel {
  title: string;
  status: 'blocked' | 'pending' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
}
```

**Usage in services:**
```typescript
import { Note, PlannerItem } from '../models/types';

async getAll(): Promise<Note[]> { ... }
```

❌ **Do NOT**: Define interfaces inline in service files or component files.

---

## 5. Backend & Database

### ✅ Required: Latest PocketBase

Use the **latest stable version** of PocketBase.

**Current Standard:** `pocketbase@^0.26.5` (or latest)

**Package.json:**
```json
{
  "dependencies": {
    "pocketbase": "^0.26.5"
  }
}
```

**Schema:** Store PocketBase schema in `pb_schema.json` at project root.

---

## 6. Notifications

### ✅ Required: ngx-toastr

Use **ngx-toastr** for toast notifications.

**Installation:**
```json
{
  "dependencies": {
    "ngx-toastr": "^19.1.0"
  }
}
```

**Configuration** in `angular.json`:
```json
{
  "styles": [
    "src/styles.css",
    "node_modules/ngx-toastr/toastr.css"
  ]
}
```

**Usage:**
```typescript
import { ToastrService } from 'ngx-toastr';

constructor(private toastr: ToastrService) {}

showSuccess() {
  this.toastr.success('Item saved successfully!');
}
```

---

## 7. Docker Configuration

### ✅ Required: Multi-Stage Build with PocketBase Runtime

All apps must use the same Docker configuration pattern.

**Dockerfile Structure** ([reference](file:///c:/sh-nexus/apps/textbook/Dockerfile)):

```dockerfile
# Stage 1: Build Angular app
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx ng build --configuration production

# Stage 2: PocketBase runtime
FROM alpine:latest
WORKDIR /pb

RUN apk add --no-cache ca-certificates unzip curl

ADD https://github.com/pocketbase/pocketbase/releases/download/v0.22.21/pocketbase_0.22.21_linux_amd64.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d /pb/ && \
    rm /tmp/pb.zip && \
    chmod +x /pb/pocketbase

COPY --from=builder /app/dist/*/browser /pb/pb_public/
COPY --from=builder /app/pb_schema.json /pb/pb_schema.json
COPY --from=builder /app/init-pb.sh /pb/init-pb.sh

RUN sed -i 's/\r$//' /pb/init-pb.sh && chmod +x /pb/init-pb.sh

EXPOSE 8080

CMD ["/pb/init-pb.sh"]
```

**Required Files:**
- `Dockerfile` - Multi-stage build
- `pb_schema.json` - PocketBase collections schema
- `init-pb.sh` - PocketBase initialization script

---

## 8. Angular Configuration

### Project Settings

**angular.json standards:**

```json
{
  "projects": {
    "frontend": {
      "architect": {
        "build": {
          "configurations": {
            "production": {
              "budgets": [
                {
                  "type": "initial",
                  "maximumWarning": "500kB",
                  "maximumError": "1MB"
                },
                {
                  "type": "anyComponentStyle",
                  "maximumWarning": "10kB",
                  "maximumError": "20kB"
                }
              ]
            }
          }
        }
      }
    }
  }
}
```

---

## Standards Compliance Checklist

Use this checklist when creating new apps or refactoring existing ones:

- [ ] Tailwind CSS configured (no Bootstrap/Material UI)
- [ ] SH-Skin Component Library installed (`src/css/` folder)
- [ ] `.sh-skin` class added to `<body>` in index.html
- [ ] `_variables.css` customized with app's color palette
- [ ] Modular services (pocketbase.service.ts + feature services)
- [ ] Layout components in `components/layout/` folder
- [ ] All types defined in `models/types.ts`
- [ ] Latest PocketBase version (`^0.26.5`)
- [ ] ngx-toastr installed and configured
- [ ] Docker multi-stage build configured
- [ ] `pb_schema.json` and `init-pb.sh` present
- [ ] Standalone components (Angular 14+)
- [ ] TypeScript strict mode enabled

---

## Reference Apps

✅ **Compliant Apps:**
- [Textbook App](file:///c:/sh-nexus/apps/textbook) - Purple accent (`--sh-primary: #9c33ff`)
- [Hub App](file:///c:/sh-nexus/apps/hub) - Blue accent (`--sh-primary: #359EFF`)
- [Media Tracker App](file:///c:/sh-nexus/apps/media-tracker)

---

## Creating a New App

1. Start with the standard Angular CLI or clone an existing app
2. Copy `/src/css/` folder from Hub or Textbook
3. Configure `styles.css` to import SH-Skin before Tailwind
4. Add `sh-skin` class to `<body>` in index.html
5. Customize `_variables.css` with your app's color palette
6. Create service structure (pocketbase.service.ts + feature services)
7. Create layout components (main-layout, sidebar, header)
8. Define types in `models/types.ts`
9. Configure Docker with PocketBase runtime
