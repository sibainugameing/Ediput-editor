# Ediput

**A browser-first Markdown editor with live preview and document export.**

Ediput is designed to run as a static web app, with GitHub Pages as the initial hosting target. A dedicated backend is not assumed. A desktop edition may be considered later.

## Current prototype

- Markdown editing with CodeMirror 6
- Live Markdown preview
- Edit / split / preview view controls
- Export rendered content as a standalone HTML file
- Responsive graphite interface with restrained cyan/teal accents

## Planned capabilities

- PDF export with page-size, margin, and page-break controls
- Image export (PNG, JPEG, WebP, SVG where technically appropriate)
- DOCX export
- Markdown features including tables, math, syntax highlighting, and diagrams
- Local document persistence and import/export
- Mobile-friendly editing and preview

Planned items are not implemented unless explicitly listed under Current prototype.

## Architecture direction

- React + TypeScript + Vite for a static, browser-based application
- CodeMirror 6 for editing
- `marked` for initial Markdown rendering
- A shared document/rendering layer should become the source for preview and export, avoiding separate inconsistent renderers
- Browser-side processing by default; no server dependency for core editing
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
