# Plan.md — Intelligent Inventory Hub: Phased Build Plan

> **Mission 3 deliverable** — Quartermaster's Runbook
> Each task has a "Done Means" check so progress is objectively verifiable.

## Design Directives

- **Gradients** everywhere possible (toolbar, stat cards, buttons, dialog headers, table header)
- **Blue + White** primary palette: #1565C0, #0D47A1, #1976D2, #FFFFFF, #F5F5F5
- **Professional**: Roboto typography, generous whitespace, consistent spacing, subtle card shadows
- **Accent colors**: Amber (#FBC02D) for low-stock warnings, Red (#E53935) for out-of-stock danger

---

## Phase 1: Project Scaffolding & Foundation

**Goal**: Angular CLI project + Angular Material + custom blue/white gradient theme

| # | Task | Done Means |
|---|------|------------|
| 1.1 | Scaffold Angular 17+ project with Angular CLI (`ng new`) — standalone components, SCSS | `ng serve` runs on port 4200, no errors |
| 1.2 | Install Angular Material + CDK + Animations | `@angular/material` in `package.json`, Material modules importable |
| 1.3 | Create custom Angular Material theme — blue primary (#1565C0 → #0D47A1), white background | `styles.scss` has custom theme; app renders with blue toolbar |
| 1.4 | Add global gradient CSS utilities (`.gradient-bg`, `.gradient-card`, `.gradient-btn`) | Gradient classes available; gradient visibly renders |
| 1.5 | Create folder structure: `models/`, `services/`, `components/`, `utils/`, `assets/mock-data/` | All folders exist under `src/app/` and `src/assets/` |

---

## Phase 2: Data Models & Mock JSON Seed Data

**Goal**: TypeScript interfaces + realistic mock JSON data files

| # | Task | Done Means |
|---|------|------------|
| 2.1 | Create `InventoryItem` interface (`models/inventory-item.model.ts`) — id, name, sku, category, price, quantity, imageUrl?, createdAt, updatedAt | File exists and compiles |
| 2.2 | Create `InventoryStats` interface in same file — totalItems, lowStockItems, outOfStockItems | Interface exported and importable |
| 2.3 | Create `ActivityLogEntry` interface (`models/activity-log.model.ts`) — id, action, itemName, itemSku, details?, timestamp | File exists and compiles |
| 2.4 | Create `utils/constants.ts` — LOW_STOCK_THRESHOLD, CATEGORIES array, TOAST_DURATION, SEARCH_DEBOUNCE_MS | Constants importable |
| 2.5 | Create `src/assets/mock-data/inventory-items.json` — 15–20 items across categories (3+ out-of-stock, 4+ low-stock, 10+ healthy) | Valid JSON; all stock states represented |
| 2.6 | Create `src/assets/mock-data/activity-log.json` — 5–10 seed activity entries | Valid JSON; parsable |

---

## Phase 3: Service Layer (Mock API)

**Goal**: InventoryService + ActivityService with in-memory CRUD backed by mock JSON

| # | Task | Done Means |
|---|------|------------|
| 3.1 | `InventoryService.loadInitialData()` — fetch `inventory-items.json` via HttpClient, populate BehaviorSubject | `items$` emits loaded items on subscription |
| 3.2 | `getItems(params)` — search (name/SKU/category), sort (all columns), filter (category, stock status) | Search/sort/filter return correct subsets |
| 3.3 | `getItemById(id)` — find single item | Returns correct item or undefined |
| 3.4 | `createItem(item)` — generate UUID, set timestamps, validate SKU uniqueness, push to array, re-emit | New item in `items$`; stats update; duplicate SKU rejected |
| 3.5 | `updateItem(id, updates)` — merge updates, set updatedAt, re-emit | Updated fields reflected; stats recalculated |
| 3.6 | `deleteItem(id)` — remove from array, re-emit | Item gone from `items$`; stats update |
| 3.7 | `computeStats()` — totalItems, lowStockItems (qty 1–9), outOfStockItems (qty 0), from full unfiltered list | Stats correct after any mutation |
| 3.8 | `bulkDelete(ids)` *(stretch)* — delete multiple items by ID array | Multiple items removed in single call |
| 3.9 | `ActivityService` *(stretch)* — loadInitialData, getRecentActivity, logAction | Activity entries logged after CRUD operations |

---

## Phase 4: Dashboard UI Components

**Goal**: Full dashboard with blue/white gradient theme, all MVP components wired to services

| # | Task | Done Means |
|---|------|------------|
| 4.1 | `AppComponent` shell — mat-toolbar with blue gradient, "Inventory Hub" title, activity log toggle | Blue gradient header renders |
| 4.2 | `DashboardComponent` — layout container for stats → toolbar → table | Dashboard is the main page |
| 4.3 | `StatsHeaderComponent` — 3 gradient mat-cards (Total=blue, Low Stock=amber, Out of Stock=red) | Correct counts from `stats$`; gradient styling |
| 4.4 | `ToolbarComponent` — search input (debounced), category dropdown, gradient "Add Item" button | Real-time filtering works; Add button opens dialog |
| 4.5 | `InventoryTableComponent` — mat-table + mat-sort (Name, SKU, Category, Price, Quantity, Actions) | All items display; column sorting works |
| 4.6 | Row highlighting — `.low-stock-row` (yellow tint), `.out-of-stock-row` (red tint) | Visual distinction for qty < 10 and qty = 0 |
| 4.7 | Actions column — Edit + Delete icon buttons per row | Edit opens form dialog; Delete opens confirm dialog |
| 4.8 | Apply gradient styling to buttons, cards, header, table header row | Professional blue/white gradient throughout |

---

## Phase 5: CRUD Dialogs & Validation

**Goal**: Create/Edit form dialog + Delete confirmation, fully validated with error messages

| # | Task | Done Means |
|---|------|------------|
| 5.1 | `ItemFormDialogComponent` — MatDialog with Reactive Form (name, sku, category, price, quantity) | Opens in create mode and edit mode |
| 5.2 | Form validators — required fields, maxLength, min(0), integer for quantity | Invalid form blocked; mat-error messages visible |
| 5.3 | Create flow — Add Item → dialog create mode → `createItem()` → snackbar → table updates | New item appears in table |
| 5.4 | Edit flow — Edit button → dialog edit mode (pre-filled) → `updateItem()` → snackbar → table updates | Item updated; SKU disabled in edit |
| 5.5 | `DeleteConfirmDialogComponent` — MatDialog with item name/SKU, Cancel + Delete buttons | Shows correct item info |
| 5.6 | Delete flow — Delete button → confirm → `deleteItem()` → snackbar → table updates | Item removed; stats update |
| 5.7 | SKU uniqueness validation on create | Duplicate SKU shows error |
| 5.8 | Style dialogs — gradient dialog header, white body, blue action buttons | Matches blue/white professional theme |

---

## Phase 6: Stretch Goals & Enhancements

**Goal**: Standout features for creativity points

| # | Task | Done Means |
|---|------|------------|
| 6.1 | Charts — `ng2-charts` + `chart.js`, bar chart (qty by category), pie chart (item distribution) | Charts render; update on CRUD |
| 6.2 | Bulk delete — checkbox column, Select All, bulk toolbar, "Delete Selected" | Multi-select + delete works |
| 6.3 | Activity log — wire ActivityService, `ActivityPanelComponent` (mat-sidenav), last 10 actions | Panel shows recent activity |
| 6.4 | CSV export — download all items as `.csv` file | CSV downloads correctly |
| 6.5 | Empty state — message/illustration when no items exist | Displays instead of empty table |
| 6.6 | Responsive layout — table horizontal scroll on mobile | Usable on narrow screens |
| 6.7 | Final polish — loading spinners, transitions, consistent gradients, typography | Professional end-to-end |

---

## Execution Order

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6
 scaffold    models    services    UI        CRUD      stretch
             + data               components dialogs   + polish
```

Each phase is a checkpoint. Verify all "Done Means" before moving to the next phase.
