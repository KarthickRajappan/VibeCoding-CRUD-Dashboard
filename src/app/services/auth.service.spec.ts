import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    service = new AuthService();
  });

  it('should default to admin role', () => {
    expect(service.currentUser().role).toBe('admin');
  });

  it('should allow admin to create', () => {
    service.switchRole('admin');
    expect(service.canCreate()).toBe(true);
  });

  it('should allow admin to edit', () => {
    service.switchRole('admin');
    expect(service.canEdit()).toBe(true);
  });

  it('should allow admin to delete', () => {
    service.switchRole('admin');
    expect(service.canDelete()).toBe(true);
  });

  it('should allow admin to import', () => {
    service.switchRole('admin');
    expect(service.canImport()).toBe(true);
  });

  it('should allow admin to export', () => {
    service.switchRole('admin');
    expect(service.canExport()).toBe(true);
  });

  it('should deny viewer from creating', () => {
    service.switchRole('viewer');
    expect(service.canCreate()).toBe(false);
  });

  it('should deny viewer from editing', () => {
    service.switchRole('viewer');
    expect(service.canEdit()).toBe(false);
  });

  it('should deny viewer from deleting', () => {
    service.switchRole('viewer');
    expect(service.canDelete()).toBe(false);
  });

  it('should deny viewer from importing', () => {
    service.switchRole('viewer');
    expect(service.canImport()).toBe(false);
  });

  it('should deny viewer from exporting', () => {
    service.switchRole('viewer');
    expect(service.canExport()).toBe(false);
  });

  it('should switch role reactively via signal', () => {
    service.switchRole('viewer');
    expect(service.currentUser().name).toBe('View Only');
    service.switchRole('admin');
    expect(service.currentUser().name).toBe('Admin User');
  });

  it('should not change role for unknown role string', () => {
    service.switchRole('admin');
    service.switchRole('superadmin' as never);
    expect(service.currentUser().role).toBe('admin');
  });

  it('should have avatar for admin user', () => {
    service.switchRole('admin');
    expect(service.currentUser().avatar).toBe('A');
  });

  it('should have avatar for viewer user', () => {
    service.switchRole('viewer');
    expect(service.currentUser().avatar).toBe('V');
  });
});
