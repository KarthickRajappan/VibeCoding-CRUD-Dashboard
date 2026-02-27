# Component Specification — Intelligent Inventory Hub

## Component Tree

```
App (app.component)
├── mat-toolbar (gradient blue header)
│   ├── Brand (logo + title)
│   ├── RoleSwitcherComponent
│   └── CsvToolbarComponent (admin only — shown in dashboard)
├── DashboardComponent
│   ├── LowStockBannerComponent
│   ├── StatsHeaderComponent
│   ├── ToolbarComponent
│   ├── [CsvToolbarComponent] (conditional — admin only)
│   ├── InventoryTableComponent
│   └── CategoryChartComponent
├── ItemFormDialogComponent (MatDialog overlay)
├── DeleteConfirmDialogComponent (MatDialog overlay)
└── ActivityPanelComponent (fixed bottom-right)
```

---

## Component Specifications

### `AppComponent`
**Selector**: `app-root`
**Role**: Shell. Renders the sticky gradient header, main content area, and the floating activity panel.
**Inputs**: none
**Key bindings**: Injects `RoleSwitcherComponent` into header

---

### `DashboardComponent`
**Selector**: `app-dashboard`
**Role**: Orchestrator. Loads data, manages all state, opens dialogs, handles CRUD outcomes.
**Services**: `InventoryService`, `ActivityService`, `AuthService`, `CsvService`, `MatDialog`, `MatSnackBar`

| Event | Handler | Result |
|-------|---------|--------|
| searchChange | `onSearchChange(term)` | Debounced → getItems({search}) |
| categoryChange | `onCategoryChange(cat)` | getItems({category}) |
| stockFilterChange | `onStockFilterChange(f)` | getItems({stockFilter}) |
| addItem | `onAddItem()` | Opens ItemFormDialog (create mode) |
| editItem | `onEditItem(item)` | Opens ItemFormDialog (edit mode) |
| deleteItem | `onDeleteItem(item)` | Opens DeleteConfirmDialog |
| bulkDeleteItems | `onBulkDelete(ids)` | Calls bulkDelete(), then refreshes |
| importItems | `onImportItems(rows)` | Sequential createItem() for each row |

---

### `StatsHeaderComponent`
**Selector**: `app-stats-header`
**Inputs**: `stats: InventoryStats`
**UI**: 3 gradient mat-cards in a responsive grid
- Blue gradient → Total Items
- Amber gradient → Low Stock count
- Red gradient → Out of Stock count

---

### `LowStockBannerComponent`
**Selector**: `app-low-stock-banner`
**Inputs**: `stats: InventoryStats`
**Behavior**: Appears when `lowStockItems > 0` OR `outOfStockItems > 0`. Animated slide-in. Dismissable. Shows red banner for out-of-stock, amber for low-only.

---

### `ToolbarComponent`
**Selector**: `app-toolbar`
**Inputs**: `canCreate: boolean`
**Outputs**: `searchChange`, `categoryChange`, `stockFilterChange`, `addItem`
**UI**:
- Row 1: Search field (300ms debounce), Category dropdown, Clear button (conditional), Add Item button
- Row 2: Stock filter toggle group (All / In Stock / Low Stock / Out of Stock)
- "Add Item" button hidden when `canCreate = false` (Viewer role)

---

### `InventoryTableComponent`
**Selector**: `app-inventory-table`
**Inputs**: `items`, `canEdit`, `canDelete`
**Outputs**: `editItem`, `deleteItem`, `bulkDeleteItems`
**UI**:
- Checkbox column for multi-select (bulk delete)
- Sortable columns: Name, SKU, Category, Price, Quantity, Actions
- Row classes: `.low-stock-row` (qty 1–9), `.out-of-stock-row` (qty 0)
- Quantity badges: "Low Stock" (amber), "Out of Stock" (red)
- Actions: Edit / Delete buttons hidden when role is Viewer; shows "View Only" text instead
- Bulk action bar appears when ≥1 items selected
- Empty state when no items match filters

---

### `ItemFormDialogComponent`
**Selector**: `app-item-form-dialog`
**Data**: `{ mode: 'create' | 'edit', item?: InventoryItem }`
**Returns**: form values on Save, `null` on Cancel
**Form fields**:

| Field | Validators | Notes |
|-------|-----------|-------|
| Name | required, maxLength(200) | |
| SKU | required, maxLength(50) | Disabled in edit mode |
| Category | required | mat-select from CATEGORIES |
| Price | required, min(0) | Number input, step 0.01 |
| Quantity | required, min(0), pattern `^[0-9]*$` | Integer only |

**UI**: Gradient blue dialog header, white body, gradient Save button

---

### `DeleteConfirmDialogComponent`
**Selector**: `app-delete-confirm-dialog`
**Data**: `{ item: InventoryItem, isBulk?: boolean }`
**Returns**: `true` on confirm, `false` on cancel
**UI**: Red gradient header with warning icon, item name in body, Cancel + Delete buttons

---

### `CategoryChartComponent`
**Selector**: `app-category-chart`
**Inputs**: `items: InventoryItem[]`
**UI**: "Show Analytics" toggle button → reveals 2-column chart grid:
- Bar chart: Total quantity by category (ng2-charts BarChart)
- Pie chart: Item count distribution by category (ng2-charts PieChart)
- Updates reactively when `items` input changes

---

### `ActivityPanelComponent`
**Selector**: `app-activity-panel`
**Position**: Fixed, bottom-right corner, 380px wide
**UI**: Collapsible panel with gradient header. Slide-open reveals list of last 10 actions with icons:
- Green circle → CREATED
- Blue edit → UPDATED
- Red delete → DELETED

---

### `RoleSwitcherComponent`
**Selector**: `app-role-switcher`
**UI**: Toggle group in the header toolbar — Admin / Viewer
**Behavior**: Calls `AuthService.switchRole()`. Immediately affects all role-gated UI elements reactively via Angular Signals.

---

### `CsvToolbarComponent`
**Selector**: `app-csv-toolbar`
**Inputs**: `items: InventoryItem[]`
**Outputs**: `importItems`, `importError`
**UI**: Export / Import / Template buttons (styled for white-on-blue toolbar)
**Import flow**: FileReader → CsvService.parseFromCsv() → emits valid rows or error

---

## Role-Gated Features

| Feature | Admin | Viewer |
|---------|-------|--------|
| Add Item button | ✅ Shown | ❌ Hidden |
| Edit button per row | ✅ Shown | ❌ Hidden |
| Delete button per row | ✅ Shown | ❌ Hidden |
| Bulk delete checkbox + bar | ✅ Shown | ❌ Hidden |
| CSV Export / Import toolbar | ✅ Shown | ❌ Hidden |
| View table | ✅ | ✅ |
| Search / Filter | ✅ | ✅ |
| Analytics charts | ✅ | ✅ |
| Activity log | ✅ | ✅ |

---

## Styling & Design System

| Token | Value |
|-------|-------|
| Primary blue | `#1565C0` |
| Dark blue | `#0D47A1` |
| Accent blue | `#1976D2` |
| Background | `#F5F7FA` |
| Main gradient | `135deg, #1565C0 → #0D47A1` |
| Body gradient | `180deg, #E3F2FD 0% → #FAFAFA 100%` |
| Low stock row | `#FFF8E1` + left border `#FBC02D` |
| Out of stock row | `#FFEBEE` + left border `#E53935` |
| Card border-radius | `12–16px` |
| Transition | `all 0.2s ease` |

---

## Visual Stock Indicators

| State | Quantity | Row Background | Badge |
|-------|----------|----------------|-------|
| Healthy | ≥ 10 | Default white | None |
| Low Stock | 1–9 | Yellow `#FFF8E1` | Amber "Low Stock" |
| Out of Stock | 0 | Red `#FFEBEE` | Red "Out of Stock" |
