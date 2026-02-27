import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CsvService } from '../../services/csv.service';
import { InventoryItem } from '../../models/inventory-item.model';

@Component({
  selector: 'app-csv-toolbar',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './csv-toolbar.component.html',
  styleUrl: './csv-toolbar.component.scss',
})
export class CsvToolbarComponent {
  @Input() items: InventoryItem[] = [];
  @Output() importItems = new EventEmitter<
    Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>[]
  >();
  @Output() importError = new EventEmitter<string>();

  constructor(private csvService: CsvService) {}

  onExport(): void {
    this.csvService.exportToCsv(this.items);
  }

  onFileSelected(event: Event, fileInput: HTMLInputElement): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      this.importError.emit('Please select a valid .csv file');
      fileInput.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      try {
        const parsed = this.csvService.parseFromCsv(text);
        if (parsed.length === 0) {
          this.importError.emit(
            'No valid rows found in CSV. Check the format and try again.'
          );
        } else {
          this.importItems.emit(parsed);
        }
      } catch {
        this.importError.emit(
          'Failed to parse CSV file. Please check the format.'
        );
      }
      fileInput.value = '';
    };
    reader.readAsText(file);
  }

  onDownloadTemplate(): void {
    const sample = this.csvService.generateSampleCsv();
    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'inventory-import-template.csv';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
