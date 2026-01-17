# SH-Nexus Styling Guide

This document defines the **NexusOS Design System** used across all SH-Nexus applications. Following this guide ensures consistency and a premium, modern look across Hub, Notes, Planner, and MediaTracker.

---

## Table of Contents

1. [Design Tokens (CSS Variables)](#design-tokens)
2. [Typography](#typography)
3. [Color System](#color-system)
4. [Layout Patterns](#layout-patterns)
5. [Component Library](#component-library)
6. [Animations](#animations)
7. [Responsive Design](#responsive-design)
8. [Best Practices](#best-practices)

---

## Design Tokens

All apps share a common set of CSS variables defined in `:root`. These tokens create consistency across the suite.

### Core Variables

```css
:root {
  /* Primary Colors - App-specific accent */
  --primary: #135bec;          /* Hub: Blue */
  /* --primary: #10b981;       /* Notes/Planner: Green */
  --primary-light: rgba(19, 91, 236, 0.2);
  --primary-glow: rgba(19, 91, 236, 0.5);
  --primary-hover: #1d6af5;

  /* Background Colors - Dark Navy Theme */
  --bg-dark: #101622;          /* Darkest - page background */
  --bg: #1a1d24;               /* Default card/surface */
  --bg-light: #232833;         /* Hover states */
  --bg-elevated: #232f48;      /* Elevated surfaces */

  /* Text Colors */
  --text: #ffffff;             /* Primary text */
  --text-secondary: #e2e8f0;   /* Secondary text */
  --text-muted: #94a3b8;       /* Muted/placeholder text */

  /* Border Colors */
  --border: #232f48;           /* Standard border */
  --border-muted: rgba(35, 47, 72, 0.5);  /* Subtle border */

  /* Status Colors */
  --success: #10b981;          /* Green */
  --warning: #f59e0b;          /* Amber */
  --danger: #ef4444;           /* Red */
  --info: #3b82f6;             /* Blue */
}
```

### App-Specific Primary Colors

| App | Primary Color | Hex Code |
|-----|--------------|----------|
| Hub | Blue | `#135bec` |
| Notes | Green | `#10b981` |
| Planner | Green | `#10b981` |
| MediaTracker | Purple | `#a855f7` |

---

## Typography

### Font Stack

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

Import Google Fonts at the top of your global stylesheet:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
```

### Font Weights

| Weight | Usage |
|--------|-------|
| 300 | Light text (rarely used) |
| 400 | Body text |
| 500 | Labels, nav items |
| 600 | Subheadings, card titles |
| 700 | Headings, time display |

### Type Scale

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Time Display | `clamp(4rem, 12vw, 7rem)` | 700 | `--text` |
| Page Heading | `1.5rem` | 700 | `--text` |
| Section Title | `1rem` | 700 | `--text` |
| Card Title | `1.0625rem` | 600 | `--text` |
| Body Text | `0.9375rem` | 400 | `--text-secondary` |
| Label | `0.875rem` | 500 | `--text-secondary` |
| Small/Meta | `0.75rem` | 400 | `--text-muted` |

### Global Text Styles

```css
body {
  line-height: 1.6;
  color: var(--text);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

::selection {
  background: var(--primary);
  color: white;
}
```

---

## Color System

### Background Hierarchy

```
┌─────────────────────────────────────────────┐
│  Page Background: --bg-dark (#101622)       │
│  ┌─────────────────────────────────────┐    │
│  │  Card/Surface: --bg (#1a1d24)       │    │
│  │  ┌─────────────────────────────┐    │    │
│  │  │  Elevated: --bg-elevated    │    │    │
│  │  │  (#232f48)                  │    │    │
│  │  └─────────────────────────────┘    │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

### Status Color Usage

```css
.status-icon.success { color: var(--success); }  /* Connected, online, complete */
.status-icon.warning { color: var(--warning); }  /* Important, starred, pending */
.status-icon.danger  { color: var(--danger); }   /* Error, delete, offline */
.status-icon.info    { color: var(--info); }     /* Information, help */
.status-icon.primary { color: var(--primary); }  /* Active, selected */
```

---

## Layout Patterns

### Page Structure

```html
<div class="app-container">
  <header class="top-nav">...</header>
  <main class="main-content">
    <section class="content-section">...</section>
  </main>
</div>
```

### Sticky Navigation Bar

```css
.top-nav {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: rgba(16, 22, 34, 0.9);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-muted);
}
```

### Responsive Grid System

**Auto-fill Grid (recommended for cards):**

```css
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.25rem;
}
```

**Fixed Column Grid:**

```css
.fast-access-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

@media (max-width: 768px) {
  .fast-access-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

---

## Component Library

### Buttons

#### Primary Button (CTA)

```css
.btn-primary, .nav-btn-primary {
  background: var(--primary);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px var(--primary-glow);
}

.btn-primary:hover {
  background: var(--primary-hover);
  box-shadow: 0 4px 12px var(--primary-glow);
  transform: translateY(-1px);
}
```

#### Secondary Button

```css
.btn-secondary, .nav-btn-secondary {
  background: rgba(35, 47, 72, 0.8);
  color: var(--text-secondary);
  border: 1px solid var(--border);
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: rgba(55, 67, 92, 0.9);
  color: var(--text);
}
```

#### Icon Button (Circular)

```css
.btn-icon, .nav-btn-icon {
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(35, 47, 72, 0.8);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}
```

#### Danger Button

```css
.btn-danger {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.btn-danger:hover {
  background: #ef4444;
  border-color: #ef4444;
  color: white;
}
```

---

### Cards

#### Standard Card

```css
.card {
  position: relative;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 1.25rem;
  transition: all 0.3s ease;
}

.card:hover {
  border-color: var(--primary-glow);
  box-shadow: 0 0 25px var(--primary-light);
  transform: translateY(-2px);
}
```

#### Glassmorphism Card

```css
.glass-card {
  background: rgba(16, 22, 34, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--border-muted);
  border-radius: 1rem;
}
```

---

### Forms

#### Input/Select Fields

```css
.form-control,
.form-select {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--bg-dark);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  color: var(--text);
  font-size: 0.9375rem;
  transition: all 0.2s ease;
}

.form-control:focus,
.form-select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-light);
}

.form-control::placeholder {
  color: var(--text-muted);
}
```

#### Form Labels

```css
.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}
```

#### Toggle Switch

```css
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: var(--bg-dark);
  border: 1px solid var(--border);
  border-radius: 24px;
  transition: all 0.3s ease;
}

.toggle-slider:before {
  content: "";
  position: absolute;
  height: 18px;
  width: 18px;
  left: 2px;
  bottom: 2px;
  background: var(--text-muted);
  border-radius: 50%;
  transition: all 0.3s ease;
}

.toggle-switch input:checked + .toggle-slider {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border-color: #22c55e;
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(20px);
  background: white;
}
```

---

### Modals

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 1rem;
  width: 90%;
  max-width: 550px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border);
}
```

---

### Scrollbars

```css
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-dark);
}

::-webkit-scrollbar-thumb {
  background: var(--bg-elevated);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #34425e;
}
```

---

## Animations

### Fade In Down

```css
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-down {
  animation: fadeInDown 0.5s ease-out;
}
```

### Transition Presets

```css
/* Default transition */
transition: all 0.2s ease;

/* Smooth hover effect */
transition: all 0.3s ease;

/* Drag and drop */
transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
```

### Hover Effects

**Lift on Hover:**
```css
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 25px var(--primary-light);
}
```

**Scale on Hover:**
```css
.icon-wrapper:hover {
  transform: scale(1.1);
}
```

**Glow on Hover:**
```css
.btn-primary:hover {
  box-shadow: 0 4px 16px var(--primary-glow);
}
```

---

## Responsive Design

### Breakpoints

| Breakpoint | Target |
|------------|--------|
| `768px` | Tablet |
| `640px` | Mobile |
| `1024px` | Small Desktop |

### Mobile Patterns

```css
@media (max-width: 768px) {
  .top-nav {
    padding: 0.75rem 1rem;
  }

  .nav-links {
    display: none; /* Hide in mobile, use hamburger */
  }

  .cards-grid {
    grid-template-columns: 1fr;
  }

  .fab {
    display: flex; /* Show floating action button on mobile */
  }
}
```

---

## Best Practices

### 1. Always Use CSS Variables

```css
/* ✅ Correct */
background: var(--bg);
color: var(--text-muted);

/* ❌ Avoid */
background: #1a1d24;
color: #94a3b8;
```

### 2. Consistent Border Radius

| Element | Radius |
|---------|--------|
| Small (buttons, inputs) | `0.5rem` |
| Medium (cards) | `0.75rem` |
| Large (modals) | `1rem` |
| Round (avatars, FAB) | `9999px` |

### 3. Spacing Scale

Use multiples of `0.25rem`:
- `0.25rem`, `0.5rem`, `0.75rem`, `1rem`, `1.25rem`, `1.5rem`, `2rem`

### 4. Import Bootstrap Icons

```css
@import url('https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css');
```

Usage:
```html
<i class="bi bi-gear-fill"></i>
<i class="bi bi-plus-lg"></i>
<i class="bi bi-trash"></i>
```

### 5. Component Scoping

Use `:host` in Angular component CSS to scope variables:

```css
:host {
  --primary: #10b981; /* Override for this component */
  display: block;
  min-height: 100vh;
  background: var(--bg-dark);
}
```

---

## Quick Reference: Copy-Paste Starter

```css
/* ================================
   [COMPONENT NAME] - NEXUSOS DESIGN SYSTEM
   ================================ */

/* CSS Variables */
:host {
  --primary: #10b981;
  --primary-light: rgba(16, 185, 129, 0.2);
  --primary-glow: rgba(16, 185, 129, 0.5);
  --primary-hover: #059669;

  --bg-dark: #101622;
  --bg: #1a1d24;
  --bg-light: #232833;
  --bg-elevated: #232f48;

  --text: #ffffff;
  --text-secondary: #e2e8f0;
  --text-muted: #94a3b8;

  --border: #232f48;
  --border-muted: rgba(35, 47, 72, 0.5);

  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  --info: #3b82f6;

  display: block;
  min-height: 100vh;
  background: var(--bg-dark);
}
```

---

*Last updated: January 2026*
