import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { InventoryStats } from '../../models/inventory-item.model';

@Component({
  selector: 'app-low-stock-banner',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './low-stock-banner.component.html',
  styleUrl: './low-stock-banner.component.scss',
})
export class LowStockBannerComponent {
  @Input() stats: InventoryStats = {
    totalItems: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
  };

  dismissed = false;

  get showBanner(): boolean {
    return (
      !this.dismissed &&
      (this.stats.outOfStockItems > 0 || this.stats.lowStockItems > 0)
    );
  }

  get bannerType(): 'danger' | 'warning' {
    return this.stats.outOfStockItems > 0 ? 'danger' : 'warning';
  }

  get bannerMessage(): string {
    const parts: string[] = [];
    if (this.stats.outOfStockItems > 0) {
      parts.push(
        `${this.stats.outOfStockItems} item${this.stats.outOfStockItems > 1 ? 's' : ''} out of stock`
      );
    }
    if (this.stats.lowStockItems > 0) {
      parts.push(
        `${this.stats.lowStockItems} item${this.stats.lowStockItems > 1 ? 's' : ''} running low`
      );
    }
    return parts.join(' · ');
  }

  dismiss(): void {
    this.dismissed = true;
  }
}
