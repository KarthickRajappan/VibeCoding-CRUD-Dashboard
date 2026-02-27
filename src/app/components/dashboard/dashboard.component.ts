import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { InventoryService, ItemQueryParams } from '../../services/inventory.service';
import { ActivityService } from '../../services/activity.service';
import { InventoryItem, InventoryStats } from '../../models/inventory-item.model';
import { StatsHeaderComponent } from './stats-header/stats-header.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { InventoryTableComponent } from './inventory-table/inventory-table.component';
import { ItemFormDialogComponent } from '../item-form-dialog/item-form-dialog.component';
import { DeleteConfirmDialogComponent } from '../delete-confirm-dialog/delete-confirm-dialog.component';
import { CategoryChartComponent } from '../charts/category-chart.component';
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
    CategoryChartComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  items: InventoryItem[] = [];
  stats: InventoryStats = { totalItems: 0, lowStockItems: 0, outOfStockItems: 0 };

  private queryParams: ItemQueryParams = {};
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private inventoryService: InventoryService,
    private activityService: ActivityService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Load initial data
    this.inventoryService.loadInitialData().subscribe(() => {
      this.refreshItems();
    });
    this.activityService.loadInitialData().subscribe();

    // Subscribe to stats
    this.inventoryService.stats$
      .pipe(takeUntil(this.destroy$))
      .subscribe((stats) => (this.stats = stats));

    // Debounced search
    this.searchSubject
      .pipe(
        debounceTime(SEARCH_DEBOUNCE_MS),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
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

  onAddItem(): void {
    const dialogRef = this.dialog.open(ItemFormDialogComponent, {
      width: '500px',
      data: { mode: 'create' },
      panelClass: 'custom-dialog',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.inventoryService.createItem(result).subscribe({
          next: (newItem) => {
            this.activityService.logAction('CREATED', newItem);
            this.snackBar.open(`"${newItem.name}" added successfully`, 'Close', {
              duration: TOAST_DURATION,
            });
            this.refreshItems();
          },
          error: (err) => {
            this.snackBar.open(err.message, 'Close', {
              duration: TOAST_DURATION,
              panelClass: 'error-snackbar',
            });
          },
        });
      }
    });
  }

  onEditItem(item: InventoryItem): void {
    const dialogRef = this.dialog.open(ItemFormDialogComponent, {
      width: '500px',
      data: { mode: 'edit', item },
      panelClass: 'custom-dialog',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.inventoryService.updateItem(item.id, result).subscribe({
          next: (updatedItem) => {
            this.activityService.logAction('UPDATED', updatedItem);
            this.snackBar.open(`"${updatedItem.name}" updated successfully`, 'Close', {
              duration: TOAST_DURATION,
            });
            this.refreshItems();
          },
          error: (err) => {
            this.snackBar.open(err.message, 'Close', {
              duration: TOAST_DURATION,
              panelClass: 'error-snackbar',
            });
          },
        });
      }
    });
  }

  onDeleteItem(item: InventoryItem): void {
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      width: '400px',
      data: { item },
      panelClass: 'custom-dialog',
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.inventoryService.deleteItem(item.id).subscribe({
          next: () => {
            this.activityService.logAction('DELETED', item);
            this.snackBar.open(`"${item.name}" deleted`, 'Close', {
              duration: TOAST_DURATION,
            });
            this.refreshItems();
          },
          error: (err) => {
            this.snackBar.open(err.message, 'Close', {
              duration: TOAST_DURATION,
              panelClass: 'error-snackbar',
            });
          },
        });
      }
    });
  }

  private refreshItems(): void {
    this.inventoryService.getItems(this.queryParams).subscribe(({ items }) => {
      this.items = items;
    });
  }
}
