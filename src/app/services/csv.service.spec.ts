import { CsvService } from './csv.service';

describe('CsvService', () => {
  let service: CsvService;

  beforeEach(() => {
    service = new CsvService();
  });

  // ---- parseFromCsv ----

  it('should parse valid CSV rows', () => {
    const csv = `Name,SKU,Category,Price,Quantity
"Wireless Mouse","ELEC-001",Electronics,29.99,45
"T-Shirt","CLTH-001",Clothing,19.99,100`;

    const result = service.parseFromCsv(csv);
    expect(result.length).toBe(2);
    expect(result[0].name).toBe('Wireless Mouse');
    expect(result[0].sku).toBe('ELEC-001');
    expect(result[0].price).toBe(29.99);
    expect(result[0].quantity).toBe(45);
  });

  it('should skip header row', () => {
    const csv = `Name,SKU,Category,Price,Quantity
"Item","SKU-01",Electronics,10.00,5`;
    const result = service.parseFromCsv(csv);
    expect(result.length).toBe(1);
  });

  it('should return empty array for header-only CSV', () => {
    const csv = `Name,SKU,Category,Price,Quantity`;
    const result = service.parseFromCsv(csv);
    expect(result.length).toBe(0);
  });

  it('should return empty array for empty input', () => {
    expect(service.parseFromCsv('').length).toBe(0);
  });

  it('should skip rows with missing name', () => {
    const csv = `Name,SKU,Category,Price,Quantity
"","ELEC-001",Electronics,29.99,45
"Valid","ELEC-002",Electronics,9.99,10`;
    const result = service.parseFromCsv(csv);
    expect(result.length).toBe(1);
    expect(result[0].sku).toBe('ELEC-002');
  });

  it('should skip rows with invalid price', () => {
    const csv = `Name,SKU,Category,Price,Quantity
"Item","SKU-01",Electronics,NOT_A_NUMBER,10`;
    expect(service.parseFromCsv(csv).length).toBe(0);
  });

  it('should skip rows with negative quantity', () => {
    const csv = `Name,SKU,Category,Price,Quantity
"Item","SKU-01",Electronics,9.99,-5`;
    expect(service.parseFromCsv(csv).length).toBe(0);
  });

  it('should handle escaped quotes in CSV', () => {
    const csv = `Name,SKU,Category,Price,Quantity
"Item ""Pro""","SKU-01",Electronics,9.99,5`;
    const result = service.parseFromCsv(csv);
    expect(result[0].name).toBe('Item "Pro"');
  });

  it('should round price to 2 decimal places', () => {
    const csv = `Name,SKU,Category,Price,Quantity
"Item","SKU-01",Electronics,9.999,5`;
    const result = service.parseFromCsv(csv);
    expect(result[0].price).toBe(10.00);
  });

  it('should floor quantity to integer', () => {
    const csv = `Name,SKU,Category,Price,Quantity
"Item","SKU-01",Electronics,9.99,5.9`;
    const result = service.parseFromCsv(csv);
    expect(result[0].quantity).toBe(5);
  });

  it('should default category to Uncategorized when whitespace-only', () => {
    // Whitespace-only passes the truthiness guard but trims to "" → "Uncategorized"
    const csv = `Name,SKU,Category,Price,Quantity
"Item","SKU-01"," ",9.99,5`;
    const result = service.parseFromCsv(csv);
    expect(result.length).toBe(1);
    expect(result[0].category).toBe('Uncategorized');
  });

  it('should set imageUrl to null', () => {
    const csv = `Name,SKU,Category,Price,Quantity
"Item","SKU-01",Electronics,9.99,5`;
    const result = service.parseFromCsv(csv);
    expect(result[0].imageUrl).toBeNull();
  });

  it('should accept zero price', () => {
    const csv = `Name,SKU,Category,Price,Quantity
"Free Item","SKU-01",Electronics,0,10`;
    const result = service.parseFromCsv(csv);
    expect(result.length).toBe(1);
    expect(result[0].price).toBe(0);
  });

  it('should accept zero quantity', () => {
    const csv = `Name,SKU,Category,Price,Quantity
"Out of Stock","SKU-01",Electronics,9.99,0`;
    const result = service.parseFromCsv(csv);
    expect(result.length).toBe(1);
    expect(result[0].quantity).toBe(0);
  });

  // ---- generateSampleCsv ----

  it('should generate sample CSV with header and data rows', () => {
    const csv = service.generateSampleCsv();
    const lines = csv.trim().split('\n');
    expect(lines[0]).toBe('Name,SKU,Category,Price,Quantity');
    expect(lines.length).toBeGreaterThan(1);
  });

  it('should generate valid CSV parseable by parseFromCsv', () => {
    const csv = service.generateSampleCsv();
    const items = service.parseFromCsv(csv);
    expect(items.length).toBeGreaterThan(0);
    items.forEach(item => {
      expect(item.name).toBeTruthy();
      expect(item.sku).toBeTruthy();
      expect(item.price).toBeGreaterThanOrEqual(0);
      expect(item.quantity).toBeGreaterThanOrEqual(0);
    });
  });

  // ---- exportToCsv ----

  it('should call exportToCsv without throwing', () => {
    // Stub DOM and URL methods so no actual download occurs
    const mockLink = { setAttribute: vi.fn(), style: { display: '' }, click: vi.fn() };
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    const items = [
      { id: '1', name: 'Mouse', sku: 'ELEC-001', category: 'Electronics', price: 29.99, quantity: 10, imageUrl: null, createdAt: '', updatedAt: '' },
    ];
    expect(() => service.exportToCsv(items)).not.toThrow();
    expect(mockLink.click).toHaveBeenCalled();

    vi.restoreAllMocks();
  });

  it('should export an empty items array without throwing', () => {
    const mockLink = { setAttribute: vi.fn(), style: { display: '' }, click: vi.fn() };
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    expect(() => service.exportToCsv([])).not.toThrow();
    vi.restoreAllMocks();
  });
});
