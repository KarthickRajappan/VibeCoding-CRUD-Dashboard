import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CATEGORIES } from '../../../utils/constants';

export type StockFilter = '' | 'low' | 'out' | 'healthy';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
})
export class ToolbarComponent {
  @Input() canCreate = true;
  @Output() searchChange = new EventEmitter<string>();
  @Output() categoryChange = new EventEmitter<string>();
  @Output() stockFilterChange = new EventEmitter<StockFilter>();
  @Output() addItem = new EventEmitter<void>();

  searchTerm = '';
  selectedCategory = '';
  stockFilter: StockFilter = '';
  categories = CATEGORIES;

  onSearchChange(): void {
    this.searchChange.emit(this.searchTerm);
  }

  onCategoryChange(): void {
    this.categoryChange.emit(this.selectedCategory);
  }

  onStockFilterChange(filter: StockFilter): void {
    this.stockFilter = filter;
    this.stockFilterChange.emit(filter);
  }

  onAddItem(): void {
    this.addItem.emit();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.searchChange.emit('');
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.stockFilter = '';
    this.searchChange.emit('');
    this.categoryChange.emit('');
    this.stockFilterChange.emit('');
  }

  get hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.selectedCategory || this.stockFilter);
  }
}
