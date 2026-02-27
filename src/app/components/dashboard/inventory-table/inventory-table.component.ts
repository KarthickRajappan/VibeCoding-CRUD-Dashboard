import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
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
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './inventory-table.component.html',
  styleUrl: './inventory-table.component.scss',
})
export class InventoryTableComponent implements OnChanges {
  @Input() items: InventoryItem[] = [];
  @Output() editItem = new EventEmitter<InventoryItem>();
  @Output() deleteItem = new EventEmitter<InventoryItem>();

  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['name', 'sku', 'category', 'price', 'quantity', 'actions'];
  dataSource = new MatTableDataSource<InventoryItem>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items']) {
      this.dataSource.data = this.items;
      if (this.sort) {
        this.dataSource.sort = this.sort;
      }
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  getRowClass(item: InventoryItem): string {
    if (item.quantity === OUT_OF_STOCK_THRESHOLD) {
      return 'out-of-stock-row';
    }
    if (item.quantity > OUT_OF_STOCK_THRESHOLD && item.quantity < LOW_STOCK_THRESHOLD) {
      return 'low-stock-row';
    }
    return '';
  }

  getStockBadge(item: InventoryItem): { label: string; class: string } | null {
    if (item.quantity === 0) {
      return { label: 'Out of Stock', class: 'badge-danger' };
    }
    if (item.quantity < LOW_STOCK_THRESHOLD) {
      return { label: 'Low Stock', class: 'badge-warning' };
    }
    return null;
  }

  onEdit(item: InventoryItem): void {
    this.editItem.emit(item);
  }

  onDelete(item: InventoryItem): void {
    this.deleteItem.emit(item);
  }
}
