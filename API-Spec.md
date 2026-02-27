# API Spec — Intelligent Inventory Hub

> All "API calls" are Angular service methods backed by in-memory data loaded from mock JSON. They return `Observable<T>` using `of()` for synchronous ops and `HttpClient.get()` for initial data load.

---

## Base URL / Data Source

| Resource | Source |
|----------|--------|
| Inventory items | `src/assets/mock-data/inventory-items.json` |
| Activity log | `src/assets/mock-data/activity-log.json` |

---

## InventoryService API

### `loadInitialData() → Observable<InventoryItem[]>`
Fetches seed data from mock JSON and populates the in-memory store.

**Triggers**: App init via `DashboardComponent.ngOnInit()`
**Side-effect**: Emits on `items$` and `stats$` BehaviorSubjects

---

### `getItems(params?) → Observable<{ items, stats }>`
Returns filtered, sorted items **plus** stats computed from the **full** unfiltered list.

| Param | Type | Description |
|-------|------|-------------|
| `search` | `string` | Case-insensitive match against name, SKU, or category |
| `category` | `string` | Exact category match |
| `stockFilter` | `'' \| 'low' \| 'out' \| 'healthy'` | Low = qty 1–9, Out = qty 0, Healthy = qty ≥ 10 |
| `sortBy` | `string` | Column key: name, sku, category, price, quantity, createdAt |
| `sortOrder` | `'asc' \| 'desc'` | Default: ascending |

**Response shape:**
```typescript
{
  items: InventoryItem[];   // filtered + sorted
  stats: InventoryStats;    // always from full unfiltered list
}
```

---

### `getItemById(id) → Observable<InventoryItem | undefined>`
Finds single item by UUID.

---

### `createItem(data) → Observable<InventoryItem>`
Creates a new item.

| Field | Validation |
|-------|------------|
| `name` | Required, max 200 chars |
| `sku` | Required, max 50 chars, **must be unique** |
| `category` | Required, must be in CATEGORIES list |
| `price` | Required, `>= 0` |
| `quantity` | Required, `>= 0`, integer |

**Auto-generates**: UUID `id`, ISO `createdAt`, ISO `updatedAt`
**Error**: Throws if SKU already exists

---

### `updateItem(id, updates) → Observable<InventoryItem>`
Merges partial updates onto existing item.

- Sets `updatedAt` to current ISO timestamp
- `id`, `createdAt` are immutable
- `sku` is editable but must remain unique
- **Error**: Throws if item not found

---

### `deleteItem(id) → Observable<boolean>`
Removes item from in-memory store.
- **Error**: Throws if item not found

---

### `bulkDelete(ids[]) → Observable<number>`
Removes multiple items. Returns count of items actually deleted.

---

### `items$` / `stats$` (BehaviorSubjects)
Reactive streams — components subscribe via `async` pipe or `subscribe()`.

| Stream | Type | Description |
|--------|------|-------------|
| `items$` | `BehaviorSubject<InventoryItem[]>` | Full unfiltered item list |
| `stats$` | `BehaviorSubject<InventoryStats>` | Computed totals (totalItems, lowStockItems, outOfStockItems) |

---

## ActivityService API

### `loadInitialData() → Observable<ActivityLogEntry[]>`
Fetches seed activity log.

### `getRecentActivity(limit?) → Observable<ActivityLogEntry[]>`
Returns last N entries sorted by timestamp (most recent first). Default limit: 10.

### `logAction(action, item, details?) → void`
Synchronously prepends a new entry to the log. Emits on `log$`.

| Param | Type |
|-------|------|
| `action` | `'CREATED' \| 'UPDATED' \| 'DELETED'` |
| `item` | `InventoryItem` |
| `details` | `string?` — JSON string of changed fields |

---

## AuthService API

### `currentUser` (Angular Signal)
Reactive signal holding the current user. Use in templates with `authService.currentUser()`.

### `switchRole(role) → void`
Switches between `'admin'` and `'viewer'` roles.

### Permission Methods
| Method | Admin | Viewer |
|--------|-------|--------|
| `canCreate()` | ✅ | ❌ |
| `canEdit()` | ✅ | ❌ |
| `canDelete()` | ✅ | ❌ |
| `canImport()` | ✅ | ❌ |
| `canExport()` | ✅ | ❌ |

---

## CsvService API

### `exportToCsv(items) → void`
Generates and downloads a CSV file. Columns: Name, SKU, Category, Price, Quantity.

### `parseFromCsv(csvText) → Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>[]`
Parses CSV string. Validates: non-empty name/SKU/category, valid price (≥0), valid quantity (≥0, integer).

### `generateSampleCsv() → string`
Returns a template CSV string with example data.

---

## Data Models

### InventoryItem
```typescript
{
  id: string;          // UUID
  name: string;        // max 200 chars
  sku: string;         // unique, max 50 chars
  category: string;    // from CATEGORIES constant
  price: number;       // >= 0, 2 decimal places
  quantity: number;    // >= 0, integer
  imageUrl?: string | null;
  createdAt: string;   // ISO 8601
  updatedAt: string;   // ISO 8601
}
```

### InventoryStats
```typescript
{
  totalItems: number;
  lowStockItems: number;    // qty 1–9
  outOfStockItems: number;  // qty = 0
}
```

### ActivityLogEntry
```typescript
{
  id: number;
  action: 'CREATED' | 'UPDATED' | 'DELETED';
  itemName: string;
  itemSku: string;
  details?: string | null;  // JSON string
  timestamp: string;        // ISO 8601
}
```

---

## Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `LOW_STOCK_THRESHOLD` | 10 | qty < 10 → low stock alert |
| `OUT_OF_STOCK_THRESHOLD` | 0 | qty = 0 → out of stock |
| `TOAST_DURATION` | 3000ms | Snackbar display duration |
| `SEARCH_DEBOUNCE_MS` | 300ms | Debounce for search input |
| `ACTIVITY_LOG_LIMIT` | 10 | Default activity panel size |
