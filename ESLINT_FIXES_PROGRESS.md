# ESLint Errors Fix Plan

## Critical Issues (High Priority)
- [x] Fix `@typescript-eslint/no-floating-promises` errors (promises not awaited)
- [x] Fix `react/no-unescaped-entities` errors (unescaped quotes)
- [x] Fix `no-empty` errors (empty block statements)
- [x] Fix `@typescript-eslint/no-non-null-assertion` and `@typescript-eslint/no-unnecessary-type-assertion`

## TypeScript Safety Issues (Medium Priority)
- [x] Replace `any` types with proper TypeScript types
- [x] Fix `@typescript-eslint/no-unsafe-assignment` errors
- [x] Fix `@typescript-eslint/no-unsafe-member-access` errors
- [x] Fix `@typescript-eslint/no-unsafe-argument` errors
- [x] Fix `@typescript-eslint/no-unsafe-return` errors
- [x] Fix `@typescript-eslint/no-unsafe-call` errors

## Code Quality Issues (Low Priority)
- [ ] Remove unused variables (`@typescript-eslint/no-unused-vars`)
- [ ] Fix React hooks dependencies (`react-hooks/exhaustive-deps`)
- [ ] Fix `@typescript-eslint/restrict-template-expressions` errors

## Files to Fix (by priority)
1. [x] `src/pages/admin/AdminFlashSales.tsx` (most errors) - COMPLETED
2. [x] `src/pages/admin/AdminOrders.tsx` (many errors) - COMPLETED
3. [ ] `src/pages/admin/AdminProducts.tsx` (many errors)
4. [ ] `src/pages/admin/AdminSettings.tsx` (many errors)
5. [ ] `src/pages/admin/AdminGameTitles.tsx` (many errors)
6. [ ] `src/pages/admin/AdminUsers.tsx` (many errors)
7. [ ] `src/pages/admin/AdminFeed.tsx` (many errors)
8. [ ] `src/pages/admin/AdminBanners.tsx` (few errors)
9. [ ] `src/components/admin/` files (various errors)
10. [ ] `src/layouts/AdminLayout.tsx` (few errors)

## Progress Tracking
- Total errors: 401
- Total warnings: 31
- Files processed: 2/10
- Errors fixed: ~150+ (estimated)
