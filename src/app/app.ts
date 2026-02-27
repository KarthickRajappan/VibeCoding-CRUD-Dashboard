import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ActivityPanelComponent } from './components/activity-log/activity-panel.component';
import { RoleSwitcherComponent } from './components/role-switcher/role-switcher.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    DashboardComponent,
    ActivityPanelComponent,
    RoleSwitcherComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
