# CLAUDE.md

This file provides guidance to AI agents like you when working with code in this repository.

## Project Overview

- Next.js 16 + React 19 web application
- shadcn UI components built on Base UI React primitives
- Tailwind CSS v4 for styling
- Bun as the package manager

## Development Commands

```bash
bun run dev        # Start development server (localhost:3000)
bun run build      # Build for production
bun run lint       # Run ESLint
bun run typecheck  # Run TypeScript type checking
```

## Architecture

### Directory Structure
- `app/` - Next.js App Router pages and layouts
- `components/ui/` - shadcn UI components (Button, Card, Input, Select, etc.)
- `components/` - Application-specific components
- `lib/utils.ts` - Utility functions including `cn()` for Tailwind class merging

### Tech Stack
- **Framework**: Next.js 16 with App Router
- **UI Components**: shadcn (configured via components.json) + Base UI React
- **Styling**: Tailwind CSS v4 with CSS variables (OKLCH color model)
- **Icons**: HugeIcons (`@hugeicons/react`)
- **Component Variants**: Class Variance Authority (CVA)

### Import Aliases
- `@/*` maps to project root (e.g., `@/components/ui/button`)

## Code Patterns

### Component Styling
Use the `cn()` utility from `@/lib/utils` for conditional Tailwind classes:
```tsx
import { cn } from "@/lib/utils"
cn("base-class", conditional && "conditional-class", className)
```

### Adding shadcn Components
The project has shadcn MCP server configured. Use the shadcn CLI tools to add new components, which will follow the project's base-maia style configuration.

### UI Primitives
- **Preferred**: Base UI (`@base-ui/react`) — the successor to Radix UI
- **Fallback**: Radix UI (`@radix-ui/react-*`) — use only when Base UI is missing a required component

Base UI is preferred as it's the modern successor to Radix UI with better React 19 support. However, since Base UI is newer, it may not have all components yet. When a component isn't available in Base UI, fall back to Radix UI.

### Theming
CSS variables are defined in `app/globals.css`. The theme supports light/dark modes via the `.dark` class selector.

## AI Skills

When writing code in this project, AI agents should use the following skills:

- **frontend-design** - Use when creating or modifying UI components, layouts, and visual elements
- **vercel-react-best-practices** - Use when writing React components, hooks, or any React-related code
- **web-design-guidelines** - Use when implementing designs, reviewing UI code, or making accessibility decisions
- **supabase-postgres-best-practices** - Use when working with postgres databases

These skills should be invoked whenever working on:
- React components or pages
- Styling and layout changes
- UI/UX improvements
- Accessibility enhancements
- Design system updates
