import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { Subject, takeUntil } from 'rxjs';
import { ActivityService } from '../../services/activity.service';
import { ActivityLogEntry } from '../../models/activity-log.model';

@Component({
  selector: 'app-activity-panel',
  standalone: true,
  imports: [CommonModule, DatePipe, MatIconModule, MatButtonModule, MatDividerModule],
  templateUrl: './activity-panel.component.html',
  styleUrl: './activity-panel.component.scss',
})
export class ActivityPanelComponent implements OnInit, OnDestroy {
  isOpen = false;
  activities: ActivityLogEntry[] = [];
  private destroy$ = new Subject<void>();

  constructor(private activityService: ActivityService) {}

  ngOnInit(): void {
    this.activityService.log$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.activityService.getRecentActivity(10).subscribe((entries) => {
          this.activities = entries;
        });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  getActionIcon(action: string): string {
    switch (action) {
      case 'CREATED': return 'add_circle';
      case 'UPDATED': return 'edit';
      case 'DELETED': return 'delete';
      default: return 'info';
    }
  }

  getActionColor(action: string): string {
    switch (action) {
      case 'CREATED': return '#43A047';
      case 'UPDATED': return '#1565C0';
      case 'DELETED': return '#E53935';
      default: return '#666';
    }
  }
}
