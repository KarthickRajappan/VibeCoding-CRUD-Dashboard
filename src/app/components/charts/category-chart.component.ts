import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { InventoryItem } from '../../models/inventory-item.model';
import { CATEGORIES } from '../../utils/constants';

@Component({
  selector: 'app-category-chart',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, BaseChartDirective],
  templateUrl: './category-chart.component.html',
  styleUrl: './category-chart.component.scss',
})
export class CategoryChartComponent implements OnChanges {
  @Input() items: InventoryItem[] = [];

  showCharts = false;

  // Bar chart
  barChartType: ChartType = 'bar';
  barChartData: ChartConfiguration['data'] = { labels: [], datasets: [] };
  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Total Quantity by Category', font: { size: 14 } },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Quantity' } },
    },
  };

  // Pie chart
  pieChartType: ChartType = 'pie';
  pieChartData: ChartConfiguration['data'] = { labels: [], datasets: [] };
  pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: { display: true, text: 'Items by Category', font: { size: 14 } },
    },
  };

  private chartColors = [
    '#1565C0', '#0D47A1', '#42A5F5', '#1976D2', '#1E88E5',
    '#FBC02D', '#F57F17', '#E53935', '#43A047', '#7B1FA2',
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items']) {
      this.updateCharts();
    }
  }

  toggleCharts(): void {
    this.showCharts = !this.showCharts;
  }

  private updateCharts(): void {
    const categoryMap = new Map<string, { totalQty: number; itemCount: number }>();

    for (const cat of CATEGORIES) {
      categoryMap.set(cat, { totalQty: 0, itemCount: 0 });
    }

    for (const item of this.items) {
      const entry = categoryMap.get(item.category);
      if (entry) {
        entry.totalQty += item.quantity;
        entry.itemCount++;
      }
    }

    // Filter out empty categories
    const activeCategories = [...categoryMap.entries()].filter(
      ([, v]) => v.itemCount > 0
    );

    const labels = activeCategories.map(([k]) => k);
    const quantities = activeCategories.map(([, v]) => v.totalQty);
    const counts = activeCategories.map(([, v]) => v.itemCount);
    const colors = activeCategories.map((_, i) => this.chartColors[i % this.chartColors.length]);

    this.barChartData = {
      labels,
      datasets: [
        {
          data: quantities,
          backgroundColor: colors.map((c) => c + 'CC'),
          borderColor: colors,
          borderWidth: 1,
        },
      ],
    };

    this.pieChartData = {
      labels,
      datasets: [
        {
          data: counts,
          backgroundColor: colors.map((c) => c + 'CC'),
          borderColor: '#fff',
          borderWidth: 2,
        },
      ],
    };
  }
}
