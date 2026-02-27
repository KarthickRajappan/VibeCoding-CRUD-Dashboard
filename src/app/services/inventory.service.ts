import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InventoryItem, InventoryStats } from '../models/inventory-item.model';
import { LOW_STOCK_THRESHOLD, OUT_OF_STOCK_THRESHOLD } from '../utils/constants';

export interface ItemQueryParams {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  category?: string;
  stockFilter?: '' | 'low' | 'out' | 'healthy';
}

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private items: InventoryItem[] = [];
  private itemsSubject = new BehaviorSubject<InventoryItem[]>([]);
  private statsSubject = new BehaviorSubject<InventoryStats>({
    totalItems: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
  });

  readonly items$ = this.itemsSubject.asObservable();
  readonly stats$ = this.statsSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadInitialData(): Observable<InventoryItem[]> {
    return this.http
      .get<InventoryItem[]>('assets/mock-data/inventory-items.json')
      .pipe(
        tap((items) => {
          this.items = [...items];
          this.emitItems();
        })
      );
  }

  getItems(params: ItemQueryParams = {}): Observable<{
    items: InventoryItem[];
    stats: InventoryStats;
  }> {
    let filtered = [...this.items];

    // Search filter
    if (params.search) {
      const term = params.search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          item.sku.toLowerCase().includes(term) ||
          item.category.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (params.category) {
      filtered = filtered.filter((item) => item.category === params.category);
    }

    // Stock status filter
    if (params.stockFilter) {
      switch (params.stockFilter) {
        case 'low':
          filtered = filtered.filter(
            (item) =>
              item.quantity > OUT_OF_STOCK_THRESHOLD &&
              item.quantity < LOW_STOCK_THRESHOLD
          );
          break;
        case 'out':
          filtered = filtered.filter(
            (item) => item.quantity === OUT_OF_STOCK_THRESHOLD
          );
          break;
        case 'healthy':
          filtered = filtered.filter(
            (item) => item.quantity >= LOW_STOCK_THRESHOLD
          );
          break;
      }
    }

    // Sort
    if (params.sortBy) {
      const order = params.sortOrder === 'desc' ? -1 : 1;
      filtered.sort((a, b) => {
        const aVal = (a as unknown as Record<string, unknown>)[params.sortBy!];
        const bVal = (b as unknown as Record<string, unknown>)[params.sortBy!];
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return aVal.localeCompare(bVal) * order;
        }
        return ((aVal as number) - (bVal as number)) * order;
      });
    }

    return of({
      items: filtered,
      stats: this.computeStats(),
    });
  }

  getItemById(id: string): Observable<InventoryItem | undefined> {
    return of(this.items.find((item) => item.id === id));
  }

  createItem(
    itemData: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>
  ): Observable<InventoryItem> {
    // Validate SKU uniqueness
    if (this.items.some((item) => item.sku === itemData.sku)) {
      return throwError(() => new Error(`SKU "${itemData.sku}" already exists`));
    }

    const now = new Date().toISOString();
    const newItem: InventoryItem = {
      ...itemData,
      id: this.generateUUID(),
      createdAt: now,
      updatedAt: now,
    };

    this.items.push(newItem);
    this.emitItems();
    return of(newItem);
  }

  updateItem(
    id: string,
    updates: Partial<InventoryItem>
  ): Observable<InventoryItem> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) {
      return throwError(() => new Error('Item not found'));
    }

    // Validate SKU uniqueness if SKU is being changed
    if (updates.sku && updates.sku !== this.items[index].sku) {
      if (this.items.some((item) => item.sku === updates.sku)) {
        return throwError(
          () => new Error(`SKU "${updates.sku}" already exists`)
        );
      }
    }

    this.items[index] = {
      ...this.items[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.emitItems();
    return of(this.items[index]);
  }

  deleteItem(id: string): Observable<boolean> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) {
      return throwError(() => new Error('Item not found'));
    }

    this.items.splice(index, 1);
    this.emitItems();
    return of(true);
  }

  bulkDelete(ids: string[]): Observable<number> {
    const initialLength = this.items.length;
    this.items = this.items.filter((item) => !ids.includes(item.id));
    const deletedCount = initialLength - this.items.length;
    this.emitItems();
    return of(deletedCount);
  }

  private computeStats(): InventoryStats {
    return {
      totalItems: this.items.length,
      lowStockItems: this.items.filter(
        (item) =>
          item.quantity > OUT_OF_STOCK_THRESHOLD &&
          item.quantity < LOW_STOCK_THRESHOLD
      ).length,
      outOfStockItems: this.items.filter(
        (item) => item.quantity === OUT_OF_STOCK_THRESHOLD
      ).length,
    };
  }

  private emitItems(): void {
    this.itemsSubject.next([...this.items]);
    this.statsSubject.next(this.computeStats());
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }
}
