import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService, UserRole } from '../../services/auth.service';

@Component({
  selector: 'app-role-switcher',
  standalone: true,
  imports: [CommonModule, MatButtonToggleModule, MatIconModule, MatTooltipModule],
  templateUrl: './role-switcher.component.html',
  styleUrl: './role-switcher.component.scss',
})
export class RoleSwitcherComponent {
  constructor(public authService: AuthService) {}

  onRoleChange(role: UserRole): void {
    this.authService.switchRole(role);
  }
}
