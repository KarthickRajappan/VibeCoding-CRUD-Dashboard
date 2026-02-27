# prompts.md — Intelligent Inventory Hub
## Complete Prompt Log — All Missions

---

## Mission 1: Camp Setup

### Prompt 1 — Initialize project
```
/init
```
**Intent**: Run the built-in `/init` skill to analyze the repository and scaffold `CLAUDE.md` with project structure, build commands, and architecture overview.

**Technique used**: Skill invocation (built-in `init` skill), instruction-context-cue prompt pattern.

**Result**: `CLAUDE.md` created with Angular tech stack, build commands (`ng serve`, `ng test`, `ng build`), mission workflow, and judging criteria.

---

## Mission 2: Cartographer's Recon (Plan Mode)

### Prompt 2 — Enter Plan Mode + Blueprint
```
Enter Plan Mode. Read projectbrief.md and translate it into a full technical blueprint covering:
- CRUD entities and data models (TypeScript interfaces)
- UI structure and component hierarchy
- Service layer design (mock API backed by JSON)
- Angular Material component choices
Design directive: Use gradients wherever possible. Professional blue and white as primary colours.
```
**Technique**: Instruction + Context (projectbrief.md) + Cue (design directive)
**Result**: `Spec.md` created with full Angular architecture, component tree, data models, service layer design.

---

## Mission 3: Quartermaster's Runbook

### Prompt 3 — Create Plan.md
```
Create Plan.md with phased tasks + per-task "done means" checks — covering entity creation,
API routes, dashboard UI, and validation logic. Create API routes. While fetching the data
it should take it from mock data. Use gradient wherever possible. It should be professional.
Use blue and white as colours.
```
**Technique**: Instruction + Context (Spec.md) + Example (table format with "Done Means" column) + Cue (gradient + blue/white)

**Result**: `Plan.md` with 6 phases, 38 numbered tasks, each with measurable "Done Means" criteria.

---

## Mission 4: Forge of Many Hands — Build Execution

### Prompt 4 — Phase 1: Project Scaffolding
```
Execute Phase 1 of Plan.md: scaffold Angular project, install Angular Material,
apply custom blue/white gradient theme to styles.scss. Wire up app.config.ts
with provideHttpClient and provideAnimationsAsync.
```
**Result**: Angular 21 project created, Material installed, custom theme applied.

### Prompt 5 — Phase 2: Data Models + Mock JSON
```
Execute Phase 2: create TypeScript interfaces (InventoryItem, InventoryStats,
ActivityLogEntry), utils/constants.ts, and mock JSON seed files in
src/assets/mock-data/ with at least 20 items covering all stock states
(out-of-stock, low-stock, healthy).
```
**Result**: Models, constants, and 20-item mock JSON created.

### Prompt 6 — Phase 3: Service Layer
```
Execute Phase 3: create InventoryService with BehaviorSubject in-memory CRUD
(loadInitialData, getItems with search/sort/filter, createItem, updateItem,
deleteItem, bulkDelete, computeStats) and ActivityService with logAction.
All backed by HttpClient.get() to load mock JSON.
```
**Result**: Full service layer with reactive streams.

### Prompt 7 — Phase 4 & 5: Dashboard UI + CRUD Dialogs (Parallel Subagents)
```
Execute Phases 4 and 5 using parallel subagents:
- Subagent A: Build StatsHeaderComponent, ToolbarComponent, InventoryTableComponent
  with mat-table, mat-sort, gradient cards, row highlighting
- Subagent B: Build ItemFormDialogComponent (reactive form, all validators)
  and DeleteConfirmDialogComponent
Wire DashboardComponent to orchestrate all sub-components via InventoryService.
Apply blue/white gradient theme throughout.
```
**Result**: Full dashboard with CRUD dialogs, gradient styling.

### Prompt 8 — Phase 6: Stretch Goals (Subagents)
```
Execute Phase 6 stretch goals using parallel subagents:
- Subagent A: Install ng2-charts + chart.js; create CategoryChartComponent
  with bar chart (qty by category) and pie chart (item distribution)
- Subagent B: Create ActivityPanelComponent — fixed bottom-right panel,
  collapsible, showing last 10 actions with CREATED/UPDATED/DELETED icons
Register Chart.js globally in main.ts.
```
**Result**: Analytics charts and activity log panel implemented.

---

## Mission 5: Wizard's Encore — Standout Enhancements

### Prompt 9 — Full feature build + data fix + spec files + tests
```
Build incrementally feature-by-feature — mock backend CRUD endpoints first,
then the dashboard UI, then data bindings. Then unleash Subagents via /agents:
create or use specialist agents (e.g., Explorer, Developer, Tester, Doc-scribe,
Security Scout) so tasks run in parallel with isolated context. Create Spec files.
Data is not loading in the UI. Create MOCK data so that I can see the data in the UI.
Mock all required data for all possible scenarios. Test cases should cover 90%.
Add one or two standout enhancements — e.g., low-stock alerts, bulk import/export,
inventory analytics charts, role-based access, or search and filter functionality.
```
**Technique**: Multi-instruction prompt with explicit feature list, subagent delegation, quality metric (90% coverage)

**Actions taken**:
1. Fixed `angular.json` assets config (root cause of missing data)
2. Expanded mock data to 35 items covering all stock states
3. Created `AuthService` with Angular Signals for role-based access
4. Created `CsvService` for import/export
5. Created `LowStockBannerComponent`, `RoleSwitcherComponent`, `CsvToolbarComponent`
6. Enhanced `ToolbarComponent` with stock filter toggle group
7. Enhanced `InventoryTableComponent` with bulk delete (SelectionModel)
8. Updated `DashboardComponent` to wire all new features
9. Created `API-Spec.md` and `Component-Spec.md` documentation
10. Created 4 unit test spec files with 71 tests at 99.4% coverage

---

## Mission 6: Artificer's Arsenal — Plugin, Hook, Skill

### Prompt 10 — Configure Plugin (MCP)
```
Configure an MCP plugin for local filesystem access. Add it to mcp-config.json.
```
**Result**: `mcp-config.json` created with filesystem MCP server config.

### Prompt 11 — Wire Hook (auto-test on file save)
```
Define a Claude Code hook that runs vitest unit tests automatically after
any service file is modified. Add it to .claude/settings.json.
```
**Result**: `.claude/settings.json` with PostToolUse hook on file edits.

### Prompt 12 — Create Skill (CRUD test generator)
```
Create a skill named 'generate-crud-tests' that, given a service name,
generates a complete Vitest spec file using direct instantiation pattern
(no TestBed). Add it to .claude/skills/generate-crud-tests.md.
```
**Result**: `.claude/skills/generate-crud-tests.md` skill file created.

---

## Plugins / Hooks / Skills Documentation

### Plugin: Filesystem MCP Server

**File**: `mcp-config.json`

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "./src"],
      "description": "Read/write access to src/ for code generation and review"
    }
  }
}
```

**Usage**: Allows Claude to navigate and read project files during agentic tasks without repeatedly calling Read tool — speeds up exploration tasks.

**Triggered by**: Any session working with this project via `claude --mcp-config mcp-config.json`

---

### Hook: Auto-Test on Service Edit

**File**: `.claude/settings.json`

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "npm run test:unit -- --reporter=dot 2>&1 | tail -5",
            "blocking": false
          }
        ]
      }
    ]
  }
}
```

**Usage**: After every file edit/write, runs the unit test suite in non-blocking mode and shows a compact summary. Catches regressions immediately during development.

**Triggered by**: Any `Edit` or `Write` tool call — fires automatically in background.

---

### Skill: generate-crud-tests

**File**: `.claude/skills/generate-crud-tests.md`

**Invocation**: `/generate-crud-tests`

**Purpose**: Given a service class name and its dependencies, generate a complete Vitest spec file using the direct-instantiation pattern (no Angular TestBed required).

**Template produced**:
- Imports `@angular/compiler` first (required for JIT)
- Creates mock dependencies using `vi.fn()`
- Instantiates service with `new ServiceClass(mockDeps)`
- Generates `describe` blocks covering: happy path, error cases, edge cases, reactive streams
- Targets 90%+ coverage

**Example invocation**:
```
/generate-crud-tests InventoryService
```

---

## Prompt Engineering Techniques Used

| Technique | Example |
|-----------|---------|
| **Instruction** | "Create Plan.md with phased tasks + per-task 'done means' checks" |
| **Context** | "Read projectbrief.md and translate it into a blueprint" |
| **Example** | "Table format with Done Means column, 6 phases numbered 1.1–6.7" |
| **Cue** | "Use gradient wherever possible. Professional. Blue and white." |
| **Model Tiering** | Claude Opus 4.6 for main architectural decisions; Haiku-class for subagents doing parallel file writing |
| **Parallel Subagents** | Phase 4+5 built in parallel; Phase 6 charts+activity log in parallel |
| **Plan Mode** | Used for Mission 2 (blueprint) and Mission 3 (runbook) before any code written |
| **Extended Context** | Used `/compact` when context grew; resumed with session summary |

---

## Claude Features Utilized

| Feature | How Used |
|---------|----------|
| **Plan Mode** | Explored codebase in read-only mode before writing code |
| **Subagents** | Parallel execution of independent build tasks (charts vs activity log, tests vs CSV) |
| **Angular Signals** | AuthService uses `signal<User>()` for reactive role switching without Zone.js |
| **MCP Plugin** | Filesystem MCP for rapid file navigation during agentic sessions |
| **Hooks** | PostToolUse hook auto-runs tests after every code change |
| **Custom Skill** | `/generate-crud-tests` skill for reusable test generation pattern |
| **Memory Files** | Persistent `MEMORY.md` to carry project state across context resets |
