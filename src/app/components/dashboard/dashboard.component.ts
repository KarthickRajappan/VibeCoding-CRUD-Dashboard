import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { InventoryService, ItemQueryParams } from '../../services/inventory.service';
import { ActivityService } from '../../services/activity.service';
import { AuthService } from '../../services/auth.service';
import { CsvService } from '../../services/csv.service';
import { InventoryItem, InventoryStats } from '../../models/inventory-item.model';
import { StatsHeaderComponent } from './stats-header/stats-header.component';
import { ToolbarComponent, StockFilter } from './toolbar/toolbar.component';
import { InventoryTableComponent } from './inventory-table/inventory-table.component';
import { LowStockBannerComponent } from '../low-stock-banner/low-stock-banner.component';
import { CategoryChartComponent } from '../charts/category-chart.component';
import { CsvToolbarComponent } from '../csv-toolbar/csv-toolbar.component';
import { ItemFormDialogComponent } from '../item-form-dialog/item-form-dialog.component';
import { DeleteConfirmDialogComponent } from '../delete-confirm-dialog/delete-confirm-dialog.component';
import { TOAST_DURATION, SEARCH_DEBOUNCE_MS } from '../../utils/constants';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatSnackBarModule,
    StatsHeaderComponent,
    ToolbarComponent,
    InventoryTableComponent,
    LowStockBannerComponent,
    CategoryChartComponent,
    CsvToolbarComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  items: InventoryItem[] = [];
  allItems: InventoryItem[] = []; // for CSV export
  stats: InventoryStats = { totalItems: 0, lowStockItems: 0, outOfStockItems: 0 };

  private queryParams: ItemQueryParams = {};
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    public authService: AuthService,
    private inventoryService: InventoryService,
    private activityService: ActivityService,
    private csvService: CsvService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.inventoryService.loadInitialData().subscribe(() => {
      this.refreshItems();
    });
    this.activityService.loadInitialData().subscribe();

    this.inventoryService.stats$
      .pipe(takeUntil(this.destroy$))
      .subscribe((stats) => (this.stats = stats));

    this.inventoryService.items$
      .pipe(takeUntil(this.destroy$))
      .subscribe((items) => (this.allItems = items));

    this.searchSubject
      .pipe(debounceTime(SEARCH_DEBOUNCE_MS), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((term) => {
        this.queryParams.search = term;
        this.refreshItems();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(term: string): void {
    this.searchSubject.next(term);
  }

  onCategoryChange(category: string): void {
    this.queryParams.category = category;
    this.refreshItems();
  }

  onStockFilterChange(filter: StockFilter): void {
    this.queryParams.stockFilter = filter;
    this.refreshItems();
  }

  onAddItem(): void {
    const dialogRef = this.dialog.open(ItemFormDialogComponent, {
      width: '520px',
      data: { mode: 'create' },
      panelClass: 'custom-dialog',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.inventoryService.createItem(result).subscribe({
          next: (newItem) => {
            this.activityService.logAction('CREATED', newItem);
            this.showSuccess(`"${newItem.name}" added successfully`);
            this.refreshItems();
          },
          error: (err) => this.showError(err.message),
        });
      }
    });
  }

  onEditItem(item: InventoryItem): void {
    const dialogRef = this.dialog.open(ItemFormDialogComponent, {
      width: '520px',
      data: { mode: 'edit', item },
      panelClass: 'custom-dialog',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.inventoryService.updateItem(item.id, result).subscribe({
          next: (updated) => {
            this.activityService.logAction('UPDATED', updated);
            this.showSuccess(`"${updated.name}" updated successfully`);
            this.refreshItems();
          },
          error: (err) => this.showError(err.message),
        });
      }
    });
  }

  onDeleteItem(item: InventoryItem): void {
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      width: '420px',
      data: { item },
    });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.inventoryService.deleteItem(item.id).subscribe({
          next: () => {
            this.activityService.logAction('DELETED', item);
            this.showSuccess(`"${item.name}" deleted`);
            this.refreshItems();
          },
          error: (err) => this.showError(err.message),
        });
      }
    });
  }

  onBulkDelete(ids: string[]): void {
    if (ids.length === 0) return;
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      width: '420px',
      data: {
        item: { name: `${ids.length} selected items`, sku: '' } as InventoryItem,
        isBulk: true,
      },
    });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.inventoryService.bulkDelete(ids).subscribe({
          next: (count) => {
            this.showSuccess(`${count} item(s) deleted`);
            this.refreshItems();
          },
          error: (err) => this.showError(err.message),
        });
      }
    });
  }

  onImportItems(
    rows: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>[]
  ): void {
    let imported = 0;
    let failed = 0;

    const processNext = (index: number) => {
      if (index >= rows.length) {
        this.showSuccess(
          `Import complete: ${imported} added, ${failed} skipped (duplicate SKU)`
        );
        this.refreshItems();
        return;
      }
      this.inventoryService.createItem(rows[index]).subscribe({
        next: (item) => {
          this.activityService.logAction('CREATED', item, 'Bulk import');
          imported++;
          processNext(index + 1);
        },
        error: () => {
          failed++;
          processNext(index + 1);
        },
      });
    };

    processNext(0);
  }

  onImportError(message: string): void {
    this.showError(message);
  }

  private refreshItems(): void {
    this.inventoryService.getItems(this.queryParams).subscribe(({ items }) => {
      this.items = items;
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', { duration: TOAST_DURATION });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: TOAST_DURATION,
      panelClass: 'error-snackbar',
    });
  }
}
