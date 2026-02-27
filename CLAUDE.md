# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Intelligent Inventory Hub** — a CRUD Dashboard for managing inventory items. A single-page web application where store managers can track, update, and manage stock items, view inventory levels, and ensure operational efficiency. Built for the DISRUPT! Claude-A-Thon hackathon.

## Project Specification

The full requirements live in `projectbrief.md` (do NOT modify this file). Key points:

### MVP Requirements
- **Dashboard view**: Header stats (Total Items, Low Stock, Out of Stock), sortable inventory table (Name, SKU, Category, Price, Quantity), real-time search/filter
- **CRUD**: Create via form/modal, Edit button per row, Delete with confirmation dialog
- **Low stock alerts**: Visual highlighting (yellow/red) for items below 10 units

### Stretch Goals (Creativity points)
- Data visualization (bar/pie chart by category)
- Product image uploads
- Bulk import/export, batch delete via checkboxes
- Activity log (last 5-10 actions)
- Inventory analytics charts
- Role-based access
- Search and filter functionality

## Tech Stack

- **Frontend**: Angular 17+ (standalone components) + Angular Material + TypeScript
- **Data layer**: Mock JSON files in `src/assets/mock-data/` — no backend server
- **Services**: Angular services with RxJS BehaviorSubjects simulate API, hold data in memory
- **Charts** (stretch): Chart.js + ng2-charts
- Full specification in `Spec.md`

## Build & Dev Commands

```bash
npm install          # Install dependencies
ng serve             # Dev server on port 4200
ng test              # Run unit tests (Karma + Jasmine)
ng build             # Production build
ng generate component components/my-component  # Scaffold component
```

## Build Approach

Build **incrementally**, feature-by-feature:
1. Data models + mock JSON seed data first
2. Angular services (InventoryService with in-memory CRUD) second
3. Dashboard UI components third
4. Wire components to services fourth
5. Enhancements and stretch goals last

## Judging Criteria (110 Points Total)

| Category | Points | What's Assessed |
|---|---|---|
| **Feature Implementation, Code Quality + Agentic Architecture** | 50 | End-to-end CRUD working, well-structured & secure code, disciplined use of Plan Mode, incremental builds, agents, subagents, checkpointing |
| **Prompt Engineering + Claude Feature Utilisation** | 30 | Quality of prompts (Instruction, Context, Example, Cue) in `prompts.md`, using right Claude capabilities (model tiering, tool use, MCP, extended thinking) |
| **Plugins, Hooks & Skills Utilisation** | 10 | At least one Plugin configured, one Hook defined & triggered, one Skill created — all documented in `prompts.md` |
| **Creativity and Additional Features** | 20 | Innovative use of Claude's autonomous capabilities, unexpected features, standout engineering decisions |

## Required Deliverables

The submission folder must contain ALL of these:
- `projectbrief.md` — original brief (provided, do not modify)
- `CLAUDE.md` — this file (project-level Claude Code instructions)
- `requirements.md` — extracted and refined requirements
- `Plan.md` — phased build plan with per-task "done means" checks
- `prompts.md` — complete log of all prompts across all missions, including a dedicated Plugins/Hooks/Skills section
- Plugin configuration file
- Hook definition file
- Skill file
- Project source code — all application files
- App must run locally without errors

## Mission Workflow

| Phase | Task |
|---|---|
| **Mission 1**: Camp Setup | `/init`, establish CLAUDE.md, set session model with `/model` |
| **Mission 2**: Cartographer's Recon | Enter Plan Mode (read-only). Translate `projectbrief.md` into blueprint covering CRUD entities, data models, UI structure |
| **Mission 3**: Quartermaster's Runbook | Create `Plan.md` with phased tasks + per-task "done means" checks. Use `/compact` if context grows |
| **Mission 4**: Forge of Many Hands | Exit Plan Mode, execute. Build incrementally. Use `/rewind` (or Esc Esc) for checkpointing. Use subagents (`/agents`) for parallel tasks |
| **Mission 5**: Wizard's Encore | Add 1-2 standout enhancements. Spawn innovation subagent to brainstorm without polluting main thread |
| **Mission 6**: Artificer's Arsenal | Configure a Plugin (e.g., MCP data source), wire a Hook (e.g., auto-lint/test), create a Skill (e.g., "generate CRUD test suite"). Document all in `prompts.md` |

## Folder Naming Convention

`CRUDDashboard-[teamname]-[empid1]-[empid2]-[empid3]`
