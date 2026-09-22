# heptley. — Enterprise Operations & B2B Client Management Portal

A modern, high-performance B2B Operations & Customer Management Portal designed for agile teams, sales executives, and delivery managers. Built with Next.js 15, React 19, TypeScript, and a bespoke design system.

---

## Key Highlights

- **Executive Operations Pulse**: High-level operational health dashboard showing real-time client account statistics, active delivery milestones, and operational roster.
- **Comprehensive Customer Dossiers**: Deep inspection view for client accounts featuring:
  - Account & Contact details (Primary contacts, verified domains, operating regions)
  - Active Deliverables & Milestones tracker
  - Scheduled Action Items & CRM Tasks
  - Chronological Contract & Lifecycle Milestone timeline
- **Client Projects & Deliverables Kanban**:
  - 5 delivery lifecycle stages: *Discovery & Scoping*, *In Execution*, *Quality Review*, *Client Approval*, and *Delivered & Live*.
  - Dual View Switcher: Interactive drag-like Kanban Board ⟷ Dense Milestone Tabular List.
  - Interactive progress bars, delivery velocity tracking, and priority tagging.
- **CRM Tasks & Agenda Tracker**: Categorized follow-up scheduling (calls, meetings, proposals) with real-time completion toggles and customer linking.
- **Global Spotlight Command Palette (`⌘K` / `Ctrl+K`)**: Fast keyboard-driven navigation across sections, quick account creation, CSV data downloads, and client lookup.
- **1-Click RFC 4180 CSV Data Export**: Audit-ready spreadsheet downloads for customers and project deliverables directly in the browser.
- **Light Theme Design System**: Curated corporate palette, frosted glass headers, pastel squircle avatars, and micro-animations without external UI library bloat.

---

## Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **UI Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: Vanilla CSS Design System with CSS variables and glassmorphism tokens
- **Icons**: [Lucide React](https://lucide.dev/)

---

## Getting Started

### 1. Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/Vansh-7454/heptleydash.git
cd heptleydash
npm install
```

### 3. Running Locally
To run both the Next.js frontend (port 3000) and Express API backend (port 5000) together:
```bash
npm run dev:all
```

Alternatively, you can run them in separate terminal tabs:
```bash
# Terminal 1: Frontend (Next.js)
npm run dev

# Terminal 2: Backend (Express API & MongoDB)
npm run dev:backend
```

Open [http://localhost:3000](http://localhost:3000) with your browser to explore the dashboard. Default credentials: `admin@heptley.com` / `admin123`.

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `⌘ + K` or `Ctrl + K` | Open Spotlight Command Palette |
| `Esc` | Close Command Palette / Active Modal |
| `↑` / `↓` | Navigate Command Palette search results |
| `Enter` | Select command or navigate to record |

---

## License
MIT License © 2026 heptley.
