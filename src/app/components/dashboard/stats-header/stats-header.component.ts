import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { InventoryStats } from '../../../models/inventory-item.model';

@Component({
  selector: 'app-stats-header',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './stats-header.component.html',
  styleUrl: './stats-header.component.scss',
})
export class StatsHeaderComponent {
  @Input() stats: InventoryStats = {
    totalItems: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
  };
}
