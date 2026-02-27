import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SelectionModel } from '@angular/cdk/collections';
import { InventoryItem } from '../../../models/inventory-item.model';
import { LOW_STOCK_THRESHOLD, OUT_OF_STOCK_THRESHOLD } from '../../../utils/constants';

@Component({
  selector: 'app-inventory-table',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    MatTableModule,
    MatSortModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './inventory-table.component.html',
  styleUrl: './inventory-table.component.scss',
})
export class InventoryTableComponent implements OnChanges, AfterViewInit {
  @Input() items: InventoryItem[] = [];
  @Input() canEdit = true;
  @Input() canDelete = true;
  @Output() editItem = new EventEmitter<InventoryItem>();
  @Output() deleteItem = new EventEmitter<InventoryItem>();
  @Output() bulkDeleteItems = new EventEmitter<string[]>();

  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['select', 'name', 'sku', 'category', 'price', 'quantity', 'actions'];
  dataSource = new MatTableDataSource<InventoryItem>();
  selection = new SelectionModel<InventoryItem>(true, []);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items']) {
      this.dataSource.data = this.items;
      this.selection.clear();
      if (this.sort) {
        this.dataSource.sort = this.sort;
      }
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  // --- Selection ---
  isAllSelected(): boolean {
    return this.selection.selected.length === this.dataSource.data.length && this.dataSource.data.length > 0;
  }

  toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.data.forEach((row) => this.selection.select(row));
    }
  }

  onBulkDelete(): void {
    const ids = this.selection.selected.map((item) => item.id);
    this.bulkDeleteItems.emit(ids);
    this.selection.clear();
  }

  // --- Row styling ---
  getRowClass(item: InventoryItem): string {
    if (item.quantity === OUT_OF_STOCK_THRESHOLD) return 'out-of-stock-row';
    if (item.quantity > OUT_OF_STOCK_THRESHOLD && item.quantity < LOW_STOCK_THRESHOLD) return 'low-stock-row';
    return '';
  }

  getStockBadge(item: InventoryItem): { label: string; cssClass: string } | null {
    if (item.quantity === 0) return { label: 'Out of Stock', cssClass: 'badge-danger' };
    if (item.quantity < LOW_STOCK_THRESHOLD) return { label: 'Low Stock', cssClass: 'badge-warning' };
    return null;
  }

  onEdit(item: InventoryItem): void { this.editItem.emit(item); }
  onDelete(item: InventoryItem): void { this.deleteItem.emit(item); }
}
