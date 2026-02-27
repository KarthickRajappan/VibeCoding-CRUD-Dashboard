import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ActivityLogEntry } from '../models/activity-log.model';
import { InventoryItem } from '../models/inventory-item.model';
import { ACTIVITY_LOG_LIMIT } from '../utils/constants';

@Injectable({ providedIn: 'root' })
export class ActivityService {
  private log: ActivityLogEntry[] = [];
  private logSubject = new BehaviorSubject<ActivityLogEntry[]>([]);
  private nextId = 1;

  readonly log$ = this.logSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadInitialData(): Observable<ActivityLogEntry[]> {
    return this.http
      .get<ActivityLogEntry[]>('assets/mock-data/activity-log.json')
      .pipe(
        tap((entries) => {
          this.log = [...entries];
          this.nextId =
            entries.length > 0
              ? Math.max(...entries.map((e) => e.id)) + 1
              : 1;
          this.logSubject.next([...this.log]);
        })
      );
  }

  getRecentActivity(limit: number = ACTIVITY_LOG_LIMIT): Observable<ActivityLogEntry[]> {
    const sorted = [...this.log].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return of(sorted.slice(0, limit));
  }

  logAction(
    action: 'CREATED' | 'UPDATED' | 'DELETED',
    item: InventoryItem,
    details?: string
  ): void {
    const entry: ActivityLogEntry = {
      id: this.nextId++,
      action,
      itemName: item.name,
      itemSku: item.sku,
      details: details ?? null,
      timestamp: new Date().toISOString(),
    };

    this.log.unshift(entry);
    this.logSubject.next([...this.log]);
  }
}
