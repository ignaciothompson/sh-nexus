# SH-Nexus Styling Guide

A comprehensive guide for styling SH-Nexus applications with the new glassmorphism design system.

---

## Color Palette

### Background Colors
```css
--bg-base: #0f0f0f;          /* Main page background */
--bg-elevated: #161618;       /* Sidebar, panels */
--bg-card: #1c1c1e;          /* Cards, modals */
--bg-card-hover: #2a2a2c;    /* Card hover state */
```

### Accent Colors
```css
--primary: #359EFF;           /* Primary blue */
--primary-hover: #2b8ae6;     /* Primary hover */
--purple: #a855f7;
--green: #22c55e;
--red: #ef4444;
--yellow: #facc15;
--orange: #f97316;
--cyan: #60a5fa;
```

### Text Colors
```css
--text-primary: #ffffff;
--text-secondary: #d1d5db;
--text-muted: #9ca3af;
--text-subtle: #6b7280;
--text-faint: #4b5563;
```

### Border Colors
```css
--border-default: rgba(255, 255, 255, 0.1);
--border-hover: rgba(255, 255, 255, 0.2);
--border-active: #359EFF;
```

---

## Typography

### Font Family
```css
font-family: 'Manrope', system-ui, sans-serif;
```

### Font Sizes
```css
--text-xs: 0.625rem;    /* 10px - hints, timestamps */
--text-sm: 0.75rem;     /* 12px - labels, captions */
--text-base: 0.875rem;  /* 14px - body text */
--text-lg: 1rem;        /* 16px - section headers */
--text-xl: 1.125rem;    /* 18px - modal titles */
--text-2xl: 1.25rem;    /* 20px - page titles */
--text-3xl: 1.5rem;     /* 24px - large headers */
```

### Font Weights
```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

---

## Spacing

Use consistent spacing based on 0.25rem (4px) increments:

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
```

---

## Border Radius

```css
--radius-sm: 0.25rem;   /* 4px - small elements */
--radius-md: 0.5rem;    /* 8px - buttons, inputs */
--radius-lg: 0.75rem;   /* 12px - cards */
--radius-xl: 1rem;      /* 16px - modals */
--radius-full: 9999px;  /* Circular elements */
```

---

## Glassmorphism Effects

### Glass Panel
```css
.glass-panel {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 0.75rem;
}
```

### Glass Pill (Status Cards)
```css
.glass-pill {
    background: rgba(28, 28, 30, 0.8);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 0.75rem;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
}
```

---

## Icons

Use **Material Symbols Outlined** with consistent sizing.

### CDN Import
```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
```

### Icon Sizes
```css
.icon-sm { font-size: 1rem; }      /* 16px */
.icon-md { font-size: 1.25rem; }   /* 20px */
.icon-lg { font-size: 1.5rem; }    /* 24px */
.icon-xl { font-size: 2rem; }      /* 32px */
```

### Filled Icons (Active State)
```css
.icon-filled {
    font-variation-settings: 'FILL' 1;
}
```

---

## Buttons

### Primary Button
```css
.btn-primary {
    background: #359EFF;
    color: white;
    padding: 0.625rem 1.25rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    border: none;
    cursor: pointer;
    transition: background 0.2s ease;
}

.btn-primary:hover {
    background: #2b8ae6;
}
```

### Secondary Button
```css
.btn-secondary {
    background: transparent;
    color: #9ca3af;
    padding: 0.625rem 1.25rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    border: 1px solid rgba(255, 255, 255, 0.15);
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-secondary:hover {
    background: rgba(255, 255, 255, 0.05);
    color: white;
}
```

### Icon Button
```css
.btn-icon {
    width: 2rem;
    height: 2rem;
    background: transparent;
    border: none;
    border-radius: 0.375rem;
    color: #6b7280;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.btn-icon:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
}
```

---

## Form Inputs

```css
.input-field {
    width: 100%;
    padding: 0.75rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 0.5rem;
    color: white;
    font-size: 0.875rem;
    outline: none;
    transition: all 0.2s ease;
}

.input-field:focus {
    border-color: #359EFF;
    background: rgba(53, 158, 255, 0.05);
}

.input-field::placeholder {
    color: #6b7280;
}
```

---

## Cards

### Standard Card
```css
.card {
    background: #1c1c1e;
    border-radius: 0.5rem;
    padding: 1rem;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}
```

### Add Card (Dashed Border)
```css
.card-add {
    border: 1px dashed rgba(255, 255, 255, 0.15);
    background: transparent;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.card-add:hover {
    border-color: rgba(53, 158, 255, 0.5);
    background: rgba(53, 158, 255, 0.05);
}
```

---

## Modals

```css
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal {
    background: #1c1c1e;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 1rem;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    animation: modalSlideUp 0.3s ease-out;
}

@keyframes modalSlideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
```

---

## Sidebar Navigation

```css
.sidebar {
    width: 80px;  /* Collapsed */
    background: #161618;
    border-right: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    flex-direction: column;
}

@media (min-width: 1024px) {
    .sidebar { width: 256px; }  /* Expanded */
}

.nav-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    color: #9ca3af;
    transition: all 0.2s ease;
}

.nav-item:hover {
    background: rgba(255, 255, 255, 0.05);
    color: white;
}

.nav-item.active {
    background: rgba(53, 158, 255, 0.15);
    color: #359EFF;
}
```

---

## Transitions

Use consistent transition timing:

```css
--transition-fast: 0.15s ease;
--transition-base: 0.2s ease;
--transition-slow: 0.3s ease;
```

---

## Shadows

```css
--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
--shadow-lg: 0 10px 30px rgba(0, 0, 0, 0.5);
--shadow-xl: 0 20px 60px rgba(0, 0, 0, 0.6);
```

---

## Status Indicators

```css
.status-online {
    background: #22c55e;
    box-shadow: 0 0 8px rgba(34, 197, 94, 0.4);
}

.status-offline {
    background: #ef4444;
}

.status-warning {
    background: #facc15;
}
```

---

## Z-Index Scale

```css
--z-dropdown: 100;
--z-sticky: 200;
--z-modal-backdrop: 900;
--z-modal: 1000;
--z-popover: 1100;
--z-tooltip: 1200;
```

---

## Responsive Breakpoints

```css
/* Mobile first approach */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

---

## Best Practices

1. **Use CSS variables** for colors, spacing, and other reusable values
2. **Keep transitions consistent** at 0.2s ease for most interactions
3. **Use flexbox/grid** for layouts, avoid fixed widths
4. **Prefer rgba** for semi-transparent backgrounds
5. **Add hover states** to all interactive elements
6. **Use Material Symbols** for all icons (not Bootstrap Icons)
7. **Match the dark theme** - no bright backgrounds
8. **Include backdrop-filter** for glassmorphism effects

---

## Required CDN Links

Include these in your `index.html`:

```html
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com"></script>

<!-- Material Symbols -->
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />

<!-- Manrope Font -->
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">
```
