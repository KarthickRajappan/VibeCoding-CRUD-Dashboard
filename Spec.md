# Spec.md — Intelligent Inventory Hub: Full Specification Blueprint

## 1. Tech Stack

### Frontend (Angular)
- **Angular 17+** (standalone components, signals where appropriate)
- **Angular CLI** — scaffolding, dev server, build
- **Angular Material** — UI component library (tables, dialogs, form fields, cards, icons, snackbar)
- **Angular HttpClient** — API service layer (backed by mock JSON in dev)
- **Chart.js + ng2-charts** — stretch goal charting (bar/pie)
- **TypeScript** — strict mode enabled

### Data Layer (Mock JSON — No Backend Server)
- **No Express/Node backend** — all data is served from mock JSON files within the Angular project
- **Mock JSON files** in `src/assets/mock-data/` contain seed data
- **Angular services** simulate API operations (CRUD) against in-memory data loaded from mock JSON
- Data persists in memory during a session; resets on refresh (or optionally use `localStorage` for persistence across reloads)

### Dev Tooling
- **Angular CLI**: `ng serve` (port 4200), `ng build`, `ng test`, `ng generate`
- **Karma + Jasmine** — unit testing (Angular default)

---

## 2. Project Structure

```
project-root/
├── src/
│   ├── app/
│   │   ├── app.component.ts/html/css      # Root component
│   │   ├── app.config.ts                   # App configuration (providers)
│   │   ├── app.routes.ts                   # Route definitions
│   │   ├── models/
│   │   │   ├── inventory-item.model.ts     # InventoryItem interface
│   │   │   └── activity-log.model.ts       # ActivityLog interface (stretch)
│   │   ├── services/
│   │   │   ├── inventory.service.ts        # CRUD operations against in-memory data
│   │   │   └── activity.service.ts         # Activity log tracking (stretch)
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   │   ├── dashboard.component.ts/html/css
│   │   │   │   ├── stats-header/
│   │   │   │   │   └── stats-header.component.ts/html/css
│   │   │   │   ├── inventory-table/
│   │   │   │   │   └── inventory-table.component.ts/html/css
│   │   │   │   └── toolbar/
│   │   │   │       └── toolbar.component.ts/html/css
│   │   │   ├── item-form-dialog/
│   │   │   │   └── item-form-dialog.component.ts/html/css
│   │   │   ├── delete-confirm-dialog/
│   │   │   │   └── delete-confirm-dialog.component.ts/html/css
│   │   │   ├── charts/                     # stretch
│   │   │   │   └── category-chart.component.ts/html/css
│   │   │   └── activity-log/               # stretch
│   │   │       └── activity-panel.component.ts/html/css
│   │   └── utils/
│   │       └── constants.ts                # Thresholds, categories, config
│   ├── assets/
│   │   └── mock-data/
│   │       ├── inventory-items.json        # Seed data (15-20 items)
│   │       └── activity-log.json           # Seed activity entries (stretch)
│   ├── styles.css                          # Global styles (Angular Material theme)
│   ├── index.html
│   └── main.ts
├── angular.json
├── tsconfig.json
├── package.json
├── Spec.md
├── Plan.md
├── prompts.md
├── CLAUDE.md
└── projectbrief.md
```

---

## 3. Data Model

### 3.1 Primary Entity: `InventoryItem`

```typescript
// models/inventory-item.model.ts

export interface InventoryItem {
  id: string;               // UUID string
  name: string;             // Product name, max 200 chars
  sku: string;              // Stock Keeping Unit, unique
  category: string;         // From CATEGORIES list
  price: number;            // Unit price >= 0
  quantity: number;         // Stock count >= 0, integer
  imageUrl?: string | null; // Product image path (stretch)
  createdAt: string;        // ISO 8601 timestamp
  updatedAt: string;        // ISO 8601 timestamp
}

export interface InventoryStats {
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
}
```

### 3.2 Category Presets

```typescript
// utils/constants.ts

export const CATEGORIES: string[] = [
  'Electronics',
  'Clothing',
  'Food & Beverage',
  'Home & Garden',
  'Sports & Outdoors',
  'Books & Stationery',
  'Health & Beauty',
  'Toys & Games',
  'Automotive',
  'Uncategorized'
];
```

### 3.3 Stretch: `ActivityLogEntry`

```typescript
// models/activity-log.model.ts

export interface ActivityLogEntry {
  id: number;
  action: 'CREATED' | 'UPDATED' | 'DELETED';
  itemName: string;
  itemSku: string;
  details?: string | null;  // JSON string of changed fields
  timestamp: string;        // ISO 8601
}
```

### 3.4 Mock JSON Seed Data

**`src/assets/mock-data/inventory-items.json`** — 15–20 realistic items across multiple categories:
- Several items with quantity = 0 (out of stock)
- Several items with quantity 1–9 (low stock)
- Remaining items with healthy stock (>= 10)

This ensures all dashboard states (healthy, warning, danger) are visible from first run.

**`src/assets/mock-data/activity-log.json`** — 5–10 seed activity entries (stretch).

---

## 4. Service Layer (Mock API)

Since there is no backend server, Angular services load mock JSON on init, hold data in memory, and expose Observable-based methods that mirror a real REST API.

### 4.1 `InventoryService`

```typescript
// services/inventory.service.ts

@Injectable({ providedIn: 'root' })
export class InventoryService {

  private items: InventoryItem[] = [];

  constructor(private http: HttpClient) {
    // Load seed data from mock JSON on first access
  }

  /** Load initial data from mock JSON file */
  loadInitialData(): Observable<InventoryItem[]>
  // GET src/assets/mock-data/inventory-items.json → populate in-memory array

  /** Get all items with optional search, sort, filter */
  getItems(params: {
    search?: string;
    sortBy?: string;       // 'name' | 'sku' | 'category' | 'price' | 'quantity' | 'createdAt'
    sortOrder?: 'asc' | 'desc';
    category?: string;
    stockFilter?: '' | 'low' | 'out' | 'healthy';
  }): Observable<{ items: InventoryItem[]; stats: InventoryStats }>
  // Filters/sorts the in-memory array, computes stats from FULL array

  /** Get single item by ID */
  getItemById(id: string): Observable<InventoryItem | undefined>

  /** Create new item */
  createItem(item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Observable<InventoryItem>
  // Generates UUID, sets timestamps, pushes to array

  /** Update existing item */
  updateItem(id: string, updates: Partial<InventoryItem>): Observable<InventoryItem>
  // Finds by ID, merges updates, sets updatedAt

  /** Delete single item */
  deleteItem(id: string): Observable<boolean>

  /** Bulk delete (stretch) */
  bulkDelete(ids: string[]): Observable<number>  // returns deleted count

  /** Compute stats from full item list */
  private computeStats(): InventoryStats
}
```

**Key behaviors:**
- Stats (`totalItems`, `lowStockItems`, `outOfStockItems`) are always computed from the **full unfiltered list**
- Search filters by name, SKU, or category (case-insensitive substring match)
- Sort supports all table columns, ascending or descending
- `stockFilter`: 'low' = quantity 1–9, 'out' = quantity 0, 'healthy' = quantity >= 10
- SKU uniqueness is validated on create/update
- All methods return Observables (using `of()` for synchronous in-memory ops) to match Angular patterns

### 4.2 `ActivityService` (Stretch)

```typescript
// services/activity.service.ts

@Injectable({ providedIn: 'root' })
export class ActivityService {

  private log: ActivityLogEntry[] = [];

  /** Load seed activity from mock JSON */
  loadInitialData(): Observable<ActivityLogEntry[]>

  /** Get recent activity entries */
  getRecentActivity(limit?: number): Observable<ActivityLogEntry[]>
  // Default limit: 10, returns most recent first

  /** Log a new action */
  logAction(action: 'CREATED' | 'UPDATED' | 'DELETED', item: InventoryItem, details?: string): void
  // Inserts at beginning of array with auto-increment ID and current timestamp
}
```

---

## 5. UI Structure

### 5.1 Page Layout

```
+---------------------------------------------------------------+
|  HEADER BAR (mat-toolbar)                                      |
|  [Logo: "Inventory Hub"]                    [Activity Log btn] |
+---------------------------------------------------------------+
|                                                                |
|  STATS CARDS ROW (mat-card ×3)                                 |
|  +------------------+ +------------------+ +------------------+|
|  | Total Items      | | Low Stock        | | Out of Stock     ||
|  |       42         | |     7 (warn)     | |     3 (danger)   ||
|  +------------------+ +------------------+ +------------------+|
|                                                                |
|  TOOLBAR ROW                                                   |
|  [Search (mat-form-field)] [Category ▼] [+ Add Item]          |
|  [■ Bulk Delete (when checked)]                                |
|                                                                |
|  INVENTORY TABLE (mat-table, mat-sort)                         |
|  +---+------+--------+----------+--------+-----+----------+   |
|  |[✓]| Name▲| SKU    | Category | Price  | Qty | Actions  |   |
|  +---+------+--------+----------+--------+-----+----------+   |
|  |[ ]| Wire | ELEC01 | Electr.  | $29.99 |  5  | [✎] [🗑] |  ← warn-row (low stock)
|  |[ ]| T-Sh | CLTH01 | Clothing | $19.99 | 45  | [✎] [🗑] |
|  |[ ]| Batt | ELEC02 | Electr.  | $12.00 |  0  | [✎] [🗑] |  ← danger-row (out of stock)
|  +---+------+--------+----------+--------+-----+----------+   |
|  Showing 42 items                                              |
|                                                                |
|  CHARTS SECTION (stretch, collapsible)                         |
|  +---------------------------+ +---------------------------+   |
|  | Bar Chart: Qty by Cat.    | | Pie Chart: Distribution   |   |
|  +---------------------------+ +---------------------------+   |
+---------------------------------------------------------------+
```

### 5.2 Component Hierarchy

```
AppComponent
├── Header (mat-toolbar)
│   ├── App title / logo
│   └── Activity Log toggle button (stretch)
├── DashboardComponent
│   ├── StatsHeaderComponent
│   │   └── StatCard (×3: total, low stock, out of stock) — mat-card
│   ├── ToolbarComponent
│   │   ├── Search input (mat-form-field with mat-icon)
│   │   ├── Category filter (mat-select dropdown)
│   │   ├── Stock filter (mat-button-toggle-group)
│   │   ├── Add Item button (mat-raised-button)
│   │   └── Bulk Delete button (stretch, conditional)
│   ├── InventoryTableComponent
│   │   └── mat-table with mat-sort
│   │       ├── Checkbox column (mat-checkbox, stretch)
│   │       ├── Data columns: Name, SKU, Category, Price, Quantity
│   │       └── Actions column: Edit button, Delete button (mat-icon-button)
│   └── ChartsSectionComponent (stretch)
│       ├── Bar chart (ng2-charts)
│       └── Pie chart (ng2-charts)
├── ItemFormDialogComponent (mat-dialog, shared for Create + Edit)
│   ├── Reactive form (FormGroup) with mat-form-field inputs
│   └── Dialog actions: [Cancel] [Save]
├── DeleteConfirmDialogComponent (mat-dialog)
│   ├── Confirm message with item name/SKU
│   └── Dialog actions: [Cancel] [Delete]
├── ActivityPanelComponent (stretch, mat-sidenav or overlay panel)
│   └── Activity entry list
└── Snackbar notifications (mat-snackbar for success/error)
```

### 5.3 Dialog Designs

**ItemFormDialogComponent (Create / Edit):**
- Opens via `MatDialog.open()` with data injection (`{ mode: 'create' | 'edit', item?: InventoryItem }`)
- Reactive Form with validators:
  - Product Name: `Validators.required, Validators.maxLength(200)`
  - SKU: `Validators.required, Validators.maxLength(50)` — disabled when editing
  - Category: `Validators.required` — mat-select from CATEGORIES
  - Price: `Validators.required, Validators.min(0)`
  - Quantity: `Validators.required, Validators.min(0)` — integer only
- mat-error messages shown inline below each field
- Closes on Cancel or successful Save

**DeleteConfirmDialogComponent:**
- Data: `{ item: InventoryItem }`
- Body: "Are you sure you want to delete **{item.name}** (SKU: {item.sku})? This action cannot be undone."
- Actions: [Cancel] [Delete] (color="warn")

### 5.4 Visual Styling Rules

| Condition | Row CSS Class | Card Accent Color |
|---|---|---|
| Quantity = 0 (Out of Stock) | `.out-of-stock-row` — red-tinted background, red left border | Red |
| Quantity 1–9 (Low Stock) | `.low-stock-row` — yellow-tinted background, yellow left border | Amber/Yellow |
| Quantity >= 10 (Healthy) | Default | Blue/Primary |

```css
/* Custom row styles applied via mat-table rowClass */
.low-stock-row {
  background-color: #fffde7;      /* yellow-50 */
  border-left: 4px solid #fbc02d; /* yellow-700 */
}
.out-of-stock-row {
  background-color: #ffebee;      /* red-50 */
  border-left: 4px solid #e53935; /* red-600 */
}
```

- Angular Material theme: **Indigo-Pink** or custom theme with primary=indigo, accent=amber, warn=red
- Snackbar notifications: success (default), error (panelClass: 'error-snackbar')

---

## 6. State Management

### 6.1 Approach: Services + RxJS BehaviorSubjects

Angular's dependency injection + RxJS provides built-in state management. No need for NgRx or other state libraries for this scope.

### 6.2 State in InventoryService

```typescript
// Inside InventoryService

private itemsSubject = new BehaviorSubject<InventoryItem[]>([]);
private statsSubject = new BehaviorSubject<InventoryStats>({ totalItems: 0, lowStockItems: 0, outOfStockItems: 0 });

readonly items$ = this.itemsSubject.asObservable();
readonly stats$ = this.statsSubject.asObservable();
```

### 6.3 Data Flow

1. **On app init**: Service loads `inventory-items.json` via HttpClient, populates in-memory array, emits to BehaviorSubjects
2. **Search/Sort/Filter**: Component passes params → service filters/sorts in-memory array → emits filtered results (stats always from full list)
3. **Create/Edit/Delete**: Component calls service method → service mutates in-memory array → re-emits updated data
4. **Components subscribe** to `items$` and `stats$` observables using `async` pipe in templates

---

## 7. Stretch Goal Specifications

### 7.1 Data Visualization
- Bar chart: total quantity per category (ng2-charts `BarChart`)
- Pie chart: item count distribution by category (ng2-charts `PieChart`)
- Data derived from items array in service/component via `reduce()`
- Collapsible section toggled by "Show Analytics" button

### 7.2 Image Uploads
- Since no backend, use browser FileReader API to convert to base64 data URL
- Store base64 string in `imageUrl` field (in-memory only)
- Display 40×40px thumbnail in table, full preview in dialog
- Accepted: JPEG, PNG, WebP. Max 2MB

### 7.3 Bulk Operations
- mat-checkbox column (first column), "Select All" in header
- Bulk toolbar appears when items selected: "X items selected [Delete Selected]"
- Calls `bulkDelete()` on InventoryService
- Confirmation dialog before bulk delete

### 7.4 Activity Log
- ActivityService tracks all create/update/delete in an in-memory array
- Slide-out panel (mat-sidenav) from header icon, shows last 10 actions
- Format: Icon + "Created **Wireless Mouse** (ELEC-001)" + relative timestamp
- Seed data loaded from `activity-log.json`

### 7.5 CSV Export/Import
- Export: generate CSV string from items array, trigger browser download via Blob/URL.createObjectURL
- Import: file input accepting `.csv`, parse in service, validate rows, add to in-memory array

### 7.6 Additional Enhancements
- Dark mode toggle (Angular Material theming, `prefers-color-scheme` support, localStorage)
- Keyboard shortcuts: Ctrl+N (new item), Escape (close dialog)
- Empty state illustration when no items exist
- Responsive: mat-table with horizontal scroll on mobile, or card layout via breakpoint observer

---

## 8. Key Constants

```typescript
// utils/constants.ts

export const LOW_STOCK_THRESHOLD = 10;
export const OUT_OF_STOCK_THRESHOLD = 0;
export const TOAST_DURATION = 3000;        // Snackbar duration in ms
export const SEARCH_DEBOUNCE_MS = 300;
export const ACTIVITY_LOG_LIMIT = 10;
export const MAX_IMAGE_SIZE = 2 * 1024 * 1024;  // 2MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const CATEGORIES: string[] = [
  'Electronics',
  'Clothing',
  'Food & Beverage',
  'Home & Garden',
  'Sports & Outdoors',
  'Books & Stationery',
  'Health & Beauty',
  'Toys & Games',
  'Automotive',
  'Uncategorized'
];
```

---

## 9. Build & Dev Commands

```bash
# Install dependencies
npm install

# Start dev server (port 4200)
ng serve

# Run unit tests
ng test

# Build for production
ng build

# Generate a new component
ng generate component components/my-component
```
