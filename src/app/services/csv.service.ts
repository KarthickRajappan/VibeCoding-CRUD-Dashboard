import { Injectable } from '@angular/core';
import { InventoryItem } from '../models/inventory-item.model';

@Injectable({ providedIn: 'root' })
export class CsvService {

  exportToCsv(items: InventoryItem[]): void {
    const headers = ['Name', 'SKU', 'Category', 'Price', 'Quantity'];
    const rows = items.map((item) => [
      `"${item.name.replace(/"/g, '""')}"`,
      `"${item.sku}"`,
      `"${item.category}"`,
      item.price.toString(),
      item.quantity.toString(),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  parseFromCsv(
    csvText: string
  ): Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>[] {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    const dataLines = lines.slice(1); // skip header row
    const items: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>[] = [];

    for (const line of dataLines) {
      const cols = this.parseCsvLine(line.trim());
      if (cols.length < 5) continue;

      const price = parseFloat(cols[3]);
      const quantity = parseInt(cols[4], 10);

      if (!cols[0] || !cols[1] || !cols[2]) continue;
      if (isNaN(price) || isNaN(quantity)) continue;
      if (price < 0 || quantity < 0) continue;

      items.push({
        name: cols[0].trim(),
        sku: cols[1].trim(),
        category: cols[2].trim() || 'Uncategorized',
        price: Math.round(price * 100) / 100,
        quantity: Math.floor(quantity),
        imageUrl: null,
      });
    }

    return items;
  }

  generateSampleCsv(): string {
    return [
      'Name,SKU,Category,Price,Quantity',
      '"Wireless Mouse","ELEC-SAMPLE-01",Electronics,29.99,50',
      '"Cotton T-Shirt","CLTH-SAMPLE-01",Clothing,19.99,100',
      '"Green Tea Box","FOOD-SAMPLE-01",Food & Beverage,8.49,200',
    ].join('\n');
  }

  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  }
}
