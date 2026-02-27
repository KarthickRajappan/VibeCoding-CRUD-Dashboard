import '@angular/compiler'; // Required before any @angular/common imports for JIT-declared injectables
import { of } from 'rxjs';
import { InventoryService } from './inventory.service';
import { InventoryItem } from '../models/inventory-item.model';

const MOCK_ITEMS: InventoryItem[] = [
  { id: '1', name: 'Wireless Mouse', sku: 'ELEC-001', category: 'Electronics', price: 29.99, quantity: 45, imageUrl: null, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: '2', name: 'USB Cable', sku: 'ELEC-002', category: 'Electronics', price: 9.99, quantity: 0, imageUrl: null, createdAt: '2026-01-02T00:00:00Z', updatedAt: '2026-01-02T00:00:00Z' },
  { id: '3', name: 'T-Shirt', sku: 'CLTH-001', category: 'Clothing', price: 19.99, quantity: 7, imageUrl: null, createdAt: '2026-01-03T00:00:00Z', updatedAt: '2026-01-03T00:00:00Z' },
  { id: '4', name: 'Green Tea', sku: 'FOOD-001', category: 'Food & Beverage', price: 8.49, quantity: 100, imageUrl: null, createdAt: '2026-01-04T00:00:00Z', updatedAt: '2026-01-04T00:00:00Z' },
  { id: '5', name: 'Yoga Mat', sku: 'SPRT-001', category: 'Sports & Outdoors', price: 39.99, quantity: 1, imageUrl: null, createdAt: '2026-01-05T00:00:00Z', updatedAt: '2026-01-05T00:00:00Z' },
];

describe('InventoryService', () => {
  let service: InventoryService;
  let mockHttp: { get: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockHttp = { get: vi.fn().mockReturnValue(of(MOCK_ITEMS)) };
    service = new InventoryService(mockHttp as any);
    service.loadInitialData().subscribe();
  });

  // ---- loadInitialData ----

  it('should load initial data from mock JSON', () => {
    const freshHttp = { get: vi.fn().mockReturnValue(of(MOCK_ITEMS)) };
    const freshService = new InventoryService(freshHttp as any);
    let loaded: InventoryItem[] = [];
    freshService.loadInitialData().subscribe(items => { loaded = items; });
    expect(loaded.length).toBe(5);
    expect(loaded[0].sku).toBe('ELEC-001');
  });

  it('should emit items$ after loading', () => {
    let emitted: InventoryItem[] = [];
    service.items$.subscribe(items => { emitted = items; });
    expect(emitted.length).toBe(5);
  });

  it('should emit stats$ after loading', () => {
    let stats: any;
    service.stats$.subscribe(s => { stats = s; });
    expect(stats.totalItems).toBe(5);
    expect(stats.outOfStockItems).toBe(1); // USB Cable qty=0
    expect(stats.lowStockItems).toBe(2);   // T-Shirt qty=7, Yoga Mat qty=1
  });

  // ---- getItems — search ----

  it('should return all items with no params', () => {
    let result: any;
    service.getItems().subscribe(r => { result = r; });
    expect(result.items.length).toBe(5);
  });

  it('should filter by name (case-insensitive)', () => {
    let result: any;
    service.getItems({ search: 'wireless' }).subscribe(r => { result = r; });
    expect(result.items.length).toBe(1);
    expect(result.items[0].sku).toBe('ELEC-001');
  });

  it('should filter by SKU', () => {
    let result: any;
    service.getItems({ search: 'CLTH' }).subscribe(r => { result = r; });
    expect(result.items.length).toBe(1);
    expect(result.items[0].category).toBe('Clothing');
  });

  it('should return empty for no match', () => {
    let result: any;
    service.getItems({ search: 'ZZZNOTFOUND' }).subscribe(r => { result = r; });
    expect(result.items.length).toBe(0);
  });

  it('should filter by category', () => {
    let result: any;
    service.getItems({ category: 'Electronics' }).subscribe(r => { result = r; });
    expect(result.items.length).toBe(2);
    result.items.forEach((item: InventoryItem) => expect(item.category).toBe('Electronics'));
  });

  // ---- getItems — stock filters ----

  it('should filter out-of-stock items (qty=0)', () => {
    let result: any;
    service.getItems({ stockFilter: 'out' }).subscribe(r => { result = r; });
    expect(result.items.length).toBe(1);
    expect(result.items[0].quantity).toBe(0);
  });

  it('should filter low-stock items (qty 1-9)', () => {
    let result: any;
    service.getItems({ stockFilter: 'low' }).subscribe(r => { result = r; });
    result.items.forEach((item: InventoryItem) => {
      expect(item.quantity).toBeGreaterThan(0);
      expect(item.quantity).toBeLessThan(10);
    });
    expect(result.items.length).toBe(2);
  });

  it('should filter healthy-stock items (qty >= 10)', () => {
    let result: any;
    service.getItems({ stockFilter: 'healthy' }).subscribe(r => { result = r; });
    result.items.forEach((item: InventoryItem) => expect(item.quantity).toBeGreaterThanOrEqual(10));
    expect(result.items.length).toBe(2);
  });

  // ---- getItems — sort ----

  it('should sort by price ascending', () => {
    let result: any;
    service.getItems({ sortBy: 'price', sortOrder: 'asc' }).subscribe(r => { result = r; });
    for (let i = 1; i < result.items.length; i++) {
      expect(result.items[i].price).toBeGreaterThanOrEqual(result.items[i - 1].price);
    }
  });

  it('should sort by name descending', () => {
    let result: any;
    service.getItems({ sortBy: 'name', sortOrder: 'desc' }).subscribe(r => { result = r; });
    for (let i = 1; i < result.items.length; i++) {
      expect(result.items[i].name.localeCompare(result.items[i - 1].name)).toBeLessThanOrEqual(0);
    }
  });

  // ---- getItemById ----

  it('should return item by ID', () => {
    let found: any;
    service.getItemById('1').subscribe(item => { found = item; });
    expect(found?.sku).toBe('ELEC-001');
  });

  it('should return undefined for unknown ID', () => {
    let found: any = 'sentinel';
    service.getItemById('UNKNOWN').subscribe(item => { found = item; });
    expect(found).toBeUndefined();
  });

  // ---- createItem ----

  it('should create a new item with generated ID and timestamps', () => {
    let created: any;
    service.createItem({ name: 'New Product', sku: 'NEW-001', category: 'Electronics', price: 49.99, quantity: 20, imageUrl: null }).subscribe(item => { created = item; });
    expect(created.id).toBeTruthy();
    expect(created.name).toBe('New Product');
    expect(created.createdAt).toBeTruthy();
    expect(created.updatedAt).toBeTruthy();
  });

  it('should reject duplicate SKU on create', () => {
    let error: any;
    service.createItem({ name: 'Dup', sku: 'ELEC-001', category: 'Electronics', price: 10, quantity: 5, imageUrl: null })
      .subscribe({ error: (e) => { error = e; } });
    expect(error).toBeTruthy();
    expect(error.message).toContain('ELEC-001');
  });

  it('should update stats after creating item', () => {
    service.createItem({ name: 'Extra', sku: 'NEW-002', category: 'Electronics', price: 5, quantity: 50, imageUrl: null }).subscribe();
    let stats: any;
    service.stats$.subscribe(s => { stats = s; });
    expect(stats.totalItems).toBe(6);
  });

  // ---- updateItem ----

  it('should update an existing item', () => {
    let updated: any;
    service.updateItem('1', { price: 99.99 }).subscribe(item => { updated = item; });
    expect(updated.price).toBe(99.99);
    expect(updated.name).toBe('Wireless Mouse'); // unchanged
  });

  it('should set updatedAt when updating', () => {
    const before = Date.now();
    let updated: any;
    service.updateItem('1', { quantity: 100 }).subscribe(item => { updated = item; });
    expect(new Date(updated.updatedAt).getTime()).toBeGreaterThanOrEqual(before);
  });

  it('should error when updating non-existent item', () => {
    let error: any;
    service.updateItem('GHOST', { price: 1 }).subscribe({ error: (e) => { error = e; } });
    expect(error).toBeTruthy();
    expect(error.message).toContain('not found');
  });

  // ---- deleteItem ----

  it('should delete an item by ID', () => {
    let result: any;
    service.deleteItem('1').subscribe(r => { result = r; });
    expect(result).toBe(true);
    let items: any[] = [];
    service.getItems().subscribe(r => { items = r.items; });
    expect(items.find((i: InventoryItem) => i.id === '1')).toBeUndefined();
  });

  it('should update stats after deletion', () => {
    service.deleteItem('1').subscribe();
    let stats: any;
    service.stats$.subscribe(s => { stats = s; });
    expect(stats.totalItems).toBe(4);
  });

  // ---- bulkDelete ----

  it('should bulk-delete multiple items', () => {
    let count = 0;
    service.bulkDelete(['1', '2', '3']).subscribe(n => { count = n; });
    expect(count).toBe(3);
    let items: any[] = [];
    service.getItems().subscribe(r => { items = r.items; });
    expect(items.length).toBe(2);
  });

  it('should return 0 when bulk-deleting non-existent IDs', () => {
    let count = -1;
    service.bulkDelete(['GHOST1', 'GHOST2']).subscribe(n => { count = n; });
    expect(count).toBe(0);
  });

  it('should stats always reflect full unfiltered list', () => {
    let result: any;
    service.getItems({ stockFilter: 'healthy' }).subscribe(r => { result = r; });
    expect(result.stats.totalItems).toBe(5);
  });

  it('should error when deleting non-existent item', () => {
    let error: any;
    service.deleteItem('NONEXISTENT').subscribe({ error: (e) => { error = e; } });
    expect(error).toBeTruthy();
    expect(error.message).toContain('not found');
  });

  it('should reject duplicate SKU when updating an item', () => {
    // Try to change id-1's SKU to id-2's existing SKU
    let error: any;
    service.updateItem('1', { sku: 'ELEC-002' }).subscribe({ error: (e) => { error = e; } });
    expect(error).toBeTruthy();
    expect(error.message).toContain('ELEC-002');
  });
});
