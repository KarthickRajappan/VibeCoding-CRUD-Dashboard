import '@angular/compiler'; // Required before any @angular/common imports for JIT-declared injectables
import { of } from 'rxjs';
import { ActivityService } from './activity.service';
import { ActivityLogEntry } from '../models/activity-log.model';
import { InventoryItem } from '../models/inventory-item.model';

const MOCK_ACTIVITY: ActivityLogEntry[] = [
  { id: 1, action: 'CREATED', itemName: 'Wireless Mouse', itemSku: 'ELEC-001', details: null, timestamp: '2026-02-26T16:00:00Z' },
  { id: 2, action: 'UPDATED', itemName: 'T-Shirt', itemSku: 'CLTH-001', details: '{"quantity":"100->120"}', timestamp: '2026-02-25T10:00:00Z' },
  { id: 3, action: 'DELETED', itemName: 'Old Item', itemSku: 'OLD-001', details: null, timestamp: '2026-02-24T08:00:00Z' },
];

const MOCK_ITEM: InventoryItem = {
  id: 'abc', name: 'Test Item', sku: 'TEST-001', category: 'Electronics',
  price: 29.99, quantity: 10, imageUrl: null,
  createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
};

describe('ActivityService', () => {
  let service: ActivityService;
  let mockHttp: { get: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockHttp = { get: vi.fn().mockReturnValue(of(MOCK_ACTIVITY)) };
    service = new ActivityService(mockHttp as any);
  });

  it('should load initial activity log', () => {
    let loaded: ActivityLogEntry[] = [];
    service.loadInitialData().subscribe(entries => { loaded = entries; });
    expect(loaded.length).toBe(3);
  });

  it('should emit log$ after loading', () => {
    service.loadInitialData().subscribe();
    let emitted: ActivityLogEntry[] = [];
    service.log$.subscribe(entries => { emitted = entries; });
    expect(emitted.length).toBe(3);
  });

  it('should return recent activity sorted by timestamp desc', () => {
    service.loadInitialData().subscribe();
    let result: ActivityLogEntry[] = [];
    service.getRecentActivity(10).subscribe(entries => { result = entries; });
    for (let i = 1; i < result.length; i++) {
      expect(result[i].timestamp <= result[i - 1].timestamp).toBe(true);
    }
  });

  it('should respect the limit parameter', () => {
    service.loadInitialData().subscribe();
    let result: ActivityLogEntry[] = [];
    service.getRecentActivity(2).subscribe(entries => { result = entries; });
    expect(result.length).toBeLessThanOrEqual(2);
    expect(result.length).toBe(2);
  });

  it('should log a CREATED action', () => {
    mockHttp.get.mockReturnValue(of([]));
    service.loadInitialData().subscribe();
    service.logAction('CREATED', MOCK_ITEM);
    let log: ActivityLogEntry[] = [];
    service.log$.subscribe(entries => { log = entries; });
    expect(log.length).toBe(1);
    expect(log[0].action).toBe('CREATED');
    expect(log[0].itemName).toBe('Test Item');
    expect(log[0].itemSku).toBe('TEST-001');
  });

  it('should log an UPDATED action with details', () => {
    mockHttp.get.mockReturnValue(of([]));
    service.loadInitialData().subscribe();
    service.logAction('UPDATED', MOCK_ITEM, '{"price":"20->30"}');
    let log: ActivityLogEntry[] = [];
    service.log$.subscribe(entries => { log = entries; });
    expect(log[0].action).toBe('UPDATED');
    expect(log[0].details).toBe('{"price":"20->30"}');
  });

  it('should log a DELETED action', () => {
    mockHttp.get.mockReturnValue(of([]));
    service.loadInitialData().subscribe();
    service.logAction('DELETED', MOCK_ITEM);
    let log: ActivityLogEntry[] = [];
    service.log$.subscribe(entries => { log = entries; });
    expect(log[0].action).toBe('DELETED');
  });

  it('should prepend new entries (most recent first)', () => {
    service.loadInitialData().subscribe();
    service.logAction('CREATED', MOCK_ITEM);
    let log: ActivityLogEntry[] = [];
    service.log$.subscribe(entries => { log = entries; });
    expect(log.length).toBe(MOCK_ACTIVITY.length + 1);
    expect(log[0].action).toBe('CREATED');
    expect(log[0].itemSku).toBe('TEST-001');
  });

  it('should auto-increment ID for new entries', () => {
    service.loadInitialData().subscribe();
    service.logAction('CREATED', MOCK_ITEM);
    service.logAction('UPDATED', MOCK_ITEM);
    let log: ActivityLogEntry[] = [];
    service.log$.subscribe(entries => { log = entries; });
    const ids = log.map(e => e.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should default nextId to 1 when log is empty', () => {
    mockHttp.get.mockReturnValue(of([]));
    service.loadInitialData().subscribe();
    service.logAction('CREATED', MOCK_ITEM);
    let log: ActivityLogEntry[] = [];
    service.log$.subscribe(entries => { log = entries; });
    expect(log[0].id).toBe(1);
  });
});
