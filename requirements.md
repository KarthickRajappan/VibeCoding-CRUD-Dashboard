# Requirements — Intelligent Inventory Hub

Extracted and refined from `projectbrief.md`.

---

## Functional Requirements

### FR-1: Dashboard View
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1.1 | Display header stats: Total Unique Items, Items Low on Stock (qty < 10), Items Out of Stock (qty = 0) | Must Have |
| FR-1.2 | Display a sortable inventory table with columns: Name, SKU, Category, Price, Quantity | Must Have |
| FR-1.3 | Real-time search bar filtering table by Name, SKU, or Category | Must Have |
| FR-1.4 | Category dropdown filter | Must Have |
| FR-1.5 | Stock status toggle filter: All / In Stock / Low Stock / Out of Stock | Should Have |

### FR-2: CRUD Operations
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-2.1 | Create item via modal form with fields: Name, SKU (unique), Category, Price, Quantity | Must Have |
| FR-2.2 | Edit item via pre-filled modal; SKU field disabled on edit | Must Have |
| FR-2.3 | Delete item with confirmation dialog showing item name | Must Have |
| FR-2.4 | Bulk delete — select multiple rows via checkboxes, single delete action | Should Have |

### FR-3: Low Stock Alerts
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-3.1 | Highlight low-stock rows (qty 1–9) with amber/yellow background | Must Have |
| FR-3.2 | Highlight out-of-stock rows (qty = 0) with red background | Must Have |
| FR-3.3 | Dismissable banner alerting manager when low/out-of-stock items exist | Should Have |

### FR-4: Data Visualization (Stretch)
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-4.1 | Bar chart: total quantity by category | Nice to Have |
| FR-4.2 | Pie chart: item count distribution by category | Nice to Have |
| FR-4.3 | Charts update reactively on CRUD operations | Nice to Have |

### FR-5: Bulk Import / Export (Stretch)
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-5.1 | Export all items to CSV download | Should Have |
| FR-5.2 | Import items from CSV file (validates fields, skips invalid rows) | Should Have |
| FR-5.3 | Download CSV template with example rows | Should Have |

### FR-6: Activity Log (Stretch)
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-6.1 | Fixed activity panel showing last 10 CRUD actions | Should Have |
| FR-6.2 | Each entry shows action type (CREATED / UPDATED / DELETED), item name, SKU, timestamp | Should Have |
| FR-6.3 | Panel is collapsible | Nice to Have |

### FR-7: Role-Based Access (Stretch)
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-7.1 | Admin role: full CRUD + CSV import/export access | Should Have |
| FR-7.2 | Viewer role: read-only — no create/edit/delete/import buttons | Should Have |
| FR-7.3 | Role switcher in header (Admin / Viewer toggle) | Should Have |

---

## Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-1 | Single-page application — no backend server required |
| NFR-2 | Data persisted in-memory (loaded from mock JSON, reset on page refresh) |
| NFR-3 | Built with Angular 17+ standalone components + Angular Material |
| NFR-4 | Professional blue (#1565C0, #0D47A1) + white design with gradient accents |
| NFR-5 | Responsive layout — table usable on mobile screens |
| NFR-6 | Real-time search with 300ms debounce to avoid excessive re-renders |
| NFR-7 | Unit test coverage ≥ 90% for all service layer code |

---

## Data Model Requirements

### InventoryItem
| Field | Type | Constraints |
|-------|------|-------------|
| id | string | UUID, auto-generated |
| name | string | Required, max 200 chars |
| sku | string | Required, unique, max 50 chars |
| category | string | Required, from CATEGORIES constant |
| price | number | Required, ≥ 0, 2 decimal places |
| quantity | number | Required, ≥ 0, integer |
| imageUrl | string? | Optional |
| createdAt | string | ISO 8601, auto-generated |
| updatedAt | string | ISO 8601, auto-updated on every change |

### Stock Thresholds
| State | Quantity |
|-------|----------|
| Out of Stock | qty = 0 |
| Low Stock | qty 1–9 |
| Healthy | qty ≥ 10 |

### Categories
Electronics, Clothing, Food & Beverage, Home & Garden, Sports & Outdoors, Books & Stationery, Health & Beauty, Toys & Games, Automotive, Uncategorized

---

## Validation Rules

| Field | Rule |
|-------|------|
| Name | Required, maxLength 200 |
| SKU | Required, maxLength 50, unique across all items |
| Category | Required, must be in CATEGORIES list |
| Price | Required, ≥ 0 |
| Quantity | Required, ≥ 0, integer only |

---

## Acceptance Criteria (MVP Done When)

- [ ] Dashboard loads with mock data (≥ 20 items across all stock states)
- [ ] Stats header shows correct totals (total, low, out-of-stock)
- [ ] Search filters table in real-time (debounced 300ms)
- [ ] Column sort works for all columns (asc/desc)
- [ ] Add Item → form validates → new row appears in table
- [ ] Edit Item → form pre-filled → updated row reflects changes
- [ ] Delete Item → confirmation dialog → row removed from table
- [ ] Low-stock rows visually highlighted (amber/red)
- [ ] Bulk delete checkbox + action bar works
- [ ] CSV export downloads valid file
- [ ] CSV import reads file, inserts rows, reports errors
- [ ] Analytics charts render and update on CRUD
- [ ] Activity log shows last 10 actions with timestamps
- [ ] Role switcher toggles Admin/Viewer access correctly
- [ ] Unit tests: 90%+ coverage on service layer
