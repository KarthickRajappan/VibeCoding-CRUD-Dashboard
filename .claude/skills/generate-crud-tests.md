# Skill: generate-crud-tests

Generate a complete Vitest spec file for an Angular service using direct instantiation (no TestBed required).

## Instructions

When the user invokes `/generate-crud-tests`, ask them for the service name (e.g., `InventoryService`), then:

1. Read the service file at `src/app/services/<service-name>.service.ts`
2. Identify the constructor dependencies (e.g., `HttpClient`, other services)
3. Generate a spec file following the pattern below

## Generated Spec Pattern

```typescript
import '@angular/compiler'; // Required before any @angular/common imports
import { of } from 'rxjs';
import { <ServiceName> } from './<service-name>.service';
// Import relevant model types

describe('<ServiceName>', () => {
  let service: <ServiceName>;
  // Declare mock dependencies

  beforeEach(() => {
    // Create vi.fn() mocks for each injected dependency
    const mockHttp = { get: vi.fn().mockReturnValue(of(SEED_DATA)) };
    service = new <ServiceName>(mockHttp as any);
  });

  // Happy path tests:
  // - loadInitialData / initial state
  // - primary read operations
  // - create with valid data
  // - update with valid data
  // - delete existing item

  // Error / edge case tests:
  // - create with duplicate key (if applicable)
  // - update non-existent item
  // - delete non-existent item
  // - empty input handling

  // Reactive stream tests:
  // - BehaviorSubject emits correct values after mutations
  // - stats / computed values update correctly
});
```

## Rules

- Always add `import '@angular/compiler'` as the FIRST line when the service imports from `@angular/common` or `@angular/common/http`
- Use `vi.fn()` (Vitest globals) — no `jasmine.createSpy`
- All observables from mock deps should use `of()` for synchronous testing
- No `done()` callbacks — `of()` is synchronous
- Target 90%+ branch coverage by testing both happy paths and error paths
- Use `toBe()` not `toBeTrue()/toBeFalse()` for boolean assertions
- Verify error cases with `.subscribe({ error: (e) => { error = e; } })` pattern

## Example

```
/generate-crud-tests ProductService
```

Reads `src/app/services/product.service.ts`, generates `src/app/services/product.service.spec.ts`
covering all CRUD methods with mocked HttpClient and full branch coverage.
