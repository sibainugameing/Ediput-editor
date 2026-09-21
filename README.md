# Ediput

**A browser-first Markdown editor with live preview and document export.**

Ediput is designed to run as a static web app, with GitHub Pages as the initial hosting target. A dedicated backend is not assumed. A desktop edition may be considered later.

## Current prototype

- Markdown editing with CodeMirror 6
- Live Markdown preview
- Edit / split / preview view controls
- Debounced localStorage autosave and restore in the same browser
- Import Markdown (`.md`, `.markdown`) and plain-text (`.txt`) files, replacing the current document after confirmation
- Export the current source as a `.md` file
- Export sanitized rendered content as a standalone HTML file
- Print dialog workflow for saving the preview as PDF
- Reset to the starter document (confirmation required)
- Responsive graphite interface with restrained cyan/teal accents
- DOMPurify sanitization of rendered Markdown before HTML injection/export
- Bidirectional proportional scroll synchronization between the editor and preview in split view

**PDF note:** PDF is currently produced through the browser's print dialog, not a dedicated PDF-generation engine. Choose “Save as PDF” in the print destination. Page size, margins, and pagination can vary by browser.

## Architecture

The application is intentionally split so the editor shell stays small and feature logic can evolve independently:

```text
src/
├── App.tsx
├── main.tsx
├── styles.css
├── components/
│   ├── AppHeader.tsx
│   ├── EditorPane.tsx
│   ├── PreviewPane.tsx
│   └── StatusBar.tsx
├── features/
│   └── markdown/
│       └── markdown.ts
└── hooks/
    ├── useAutosave.ts
    └── useScrollSync.ts
```

Responsibilities are separated as follows:

- `App.tsx`: application state and composition
- `components/`: presentational UI and editor/preview panes
- `features/markdown/`: Markdown rendering, sanitization, downloads, starter content, and document HTML generation
- `hooks/`: browser persistence and split-view behavior

The CSS remains centralized in `src/styles.css` because the current UI uses one shared visual system across all panes and responsive states.

## Planned capabilities

- Dedicated PDF export controls (page size, margins, page breaks)
- Image export (PNG, JPEG, WebP, SVG where technically appropriate)
- DOCX export
- Markdown features including math, syntax highlighting, and diagrams
- Multiple named documents
- Mobile-friendly editing and preview refinements

Planned items are not implemented unless explicitly listed under Current prototype.

## Architecture direction

- React + TypeScript + Vite for a static, browser-based application
- CodeMirror 6 for editing
- `marked` for Markdown rendering
- DOMPurify to sanitize rendered HTML before insertion
- Browser-side processing by default; no server dependency for core editing
- `localStorage` is browser-local and is not a cloud sync or backup system
- Tauri 2 may be evaluated for a future desktop wrapper, without making it a requirement for the web app

## Development

Requirements: Node.js 22+ and npm.

```sh
npm install
npm run dev
npm run build
npm run preview
```

## GitHub Pages

The Vite base path is configured for the project site `/Ediput-editor/`. GitHub Actions builds the app and deploys the `dist/` output. In repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**.

## Scope and constraints

- Web app is the primary product.
- GitHub Pages is available; a dedicated server is unconfirmed and must not be assumed.
- PDF output is a core requirement, not an optional afterthought.
- UI should prioritize readability and editing density; avoid excessive AI-style sparkle, glow, and decorative animation.
- Desktop support is a possible future extension, not a blocker for the web MVP.
