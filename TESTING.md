# Testing Infrastructure

## Overview

LightMyFire uses **Vitest** as its testing framework, providing fast, modern testing with TypeScript support and excellent Next.js compatibility.

## Setup

### Install Dependencies

```bash
npm install
```

### Run Tests

```bash
# Run all tests once
npm test

# Watch mode (re-run on file changes)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Test Structure

```
tests/
├── setup.ts              # Global test setup and environment configuration
├── mocks.ts              # Reusable mocks for Supabase, Stripe, etc.
├── api/                  # API route tests
│   └── create-payment-intent.test.ts
├── lib/                  # Library/utility tests
│   ├── logger.test.ts
│   └── constants.test.ts
└── components/           # Component tests (future)
```

## What's Tested

### ✅ Critical Business Logic (Current Coverage)

1. **Payment Processing** (`tests/api/create-payment-intent.test.ts`)
   - Payment intent creation
   - Pack size validation
   - Authentication requirements
   - Price calculations

2. **Logger System** (`tests/lib/logger.test.ts`)
   - Development vs production logging
   - Business event tracking
   - Error handling with stack traces
   - Performance metric logging

3. **Constants & Configuration** (`tests/lib/constants.test.ts`)
   - Pack pricing validation
   - Valid pack sizes
   - Price reasonability checks

## Testing Strategy

### Priority 1: Business-Critical Paths ✅
- Payment processing
- Order creation
- Webhook handling
- Authentication

### Priority 2: Utilities & Infrastructure ✅
- Logger
- Constants
- Type utilities

### Priority 3: Future Expansion
- Component tests
- Integration tests
- E2E tests with Playwright

## Mock Utilities

The `tests/mocks.ts` file provides reusable mocks:

- `createMockSupabaseClient()` - Mocked Supabase client
- `createMockStripe()` - Mocked Stripe SDK
- `createMockNextRequest()` - Mocked Next.js Request
- `createMockCookies()` - Mocked cookies

## Coverage Goals

- **Current**: ~40% of critical business logic
- **Target**: 75% overall coverage
- **Focus**: Payment processing, order handling, auth flows

## Best Practices

1. **Test Business Logic, Not Implementation**
   - Focus on inputs/outputs
   - Don't test internal implementation details

2. **Use Mocks Wisely**
   - Mock external services (Stripe, Supabase, APIs)
   - Don't mock application code

3. **Keep Tests Fast**
   - Unit tests should run in milliseconds
   - Use mocks to avoid network calls

4. **Write Descriptive Test Names**
   ```typescript
   it('should reject invalid pack sizes', ...)
   it('should create a payment intent successfully', ...)
   ```

## Running Specific Tests

```bash
# Run tests for a specific file
npx vitest run tests/lib/logger.test.ts

# Run tests matching a pattern
npx vitest run --grep "payment"

# Run in UI mode (interactive)
npx vitest --ui
```

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Main branch pushes
- Pre-deployment

## Troubleshooting

### "Module not found" errors
Ensure all dependencies are installed: `npm install`

### "Cannot find module '@/...'"
Check that `vitest.config.ts` has the correct path alias configuration.

### Tests timeout
Increase timeout in `vitest.config.ts`:
```typescript
test: {
  testTimeout: 10000, // 10 seconds
}
```

## Contributing

When adding new features:
1. Write tests for critical paths
2. Aim for >80% coverage of new code
3. Update this documentation

---

**Testing Status**: 🟢 Active
**Framework**: Vitest 1.0+
**Coverage**: Expanding (Target: 75%)
