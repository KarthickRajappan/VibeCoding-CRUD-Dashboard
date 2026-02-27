import { Injectable, signal } from '@angular/core';

export type UserRole = 'admin' | 'viewer';

export interface User {
  name: string;
  role: UserRole;
  avatar: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly USERS: User[] = [
    { name: 'Admin User', role: 'admin', avatar: 'A' },
    { name: 'View Only', role: 'viewer', avatar: 'V' },
  ];

  currentUser = signal<User>(this.USERS[0]);

  switchRole(role: UserRole): void {
    const user = this.USERS.find((u) => u.role === role);
    if (user) {
      this.currentUser.set(user);
    }
  }

  isAdmin(): boolean {
    return this.currentUser().role === 'admin';
  }

  canCreate(): boolean { return this.isAdmin(); }
  canEdit(): boolean   { return this.isAdmin(); }
  canDelete(): boolean { return this.isAdmin(); }
  canImport(): boolean { return this.isAdmin(); }
  canExport(): boolean { return this.isAdmin(); }
}
