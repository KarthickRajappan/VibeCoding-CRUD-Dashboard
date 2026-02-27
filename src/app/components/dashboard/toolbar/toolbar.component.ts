import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CATEGORIES } from '../../../utils/constants';

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
    MatIconModule,
  ],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
})
export class ToolbarComponent {
  @Output() searchChange = new EventEmitter<string>();
  @Output() categoryChange = new EventEmitter<string>();
  @Output() addItem = new EventEmitter<void>();

  searchTerm = '';
  selectedCategory = '';
  categories = CATEGORIES;

  onSearchChange(): void {
    this.searchChange.emit(this.searchTerm);
  }

  onCategoryChange(): void {
    this.categoryChange.emit(this.selectedCategory);
  }

  onAddItem(): void {
    this.addItem.emit();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.searchChange.emit('');
  }
}
