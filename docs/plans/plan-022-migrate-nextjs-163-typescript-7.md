# Plan: Migrate AgentStudio to Next.js 16.3 + TypeScript 7

## Goal

Upgrade the AgentStudio frontend from Next.js 16.2 to 16.3 and TypeScript from version 5 to version 7 (Go-based compiler) to achieve significant performance improvements: 90% less memory usage in dev, 5.5x faster builds, 10x faster type checking, and 22% more SSR throughput.

## Context

**Current State:**
- Next.js: 16.2.12
- TypeScript: ^5.0 (JavaScript-based compiler)
- React: 19.2.4
- Node.js: >=20.9.0 (per Next.js requirements)

**Key Files:**
- `package.json` - Dependencies and scripts
- `next.config.ts` - Empty configuration (no custom settings)
- `tsconfig.json` - Standard Next.js TypeScript configuration
- `app/globals.css` - Tailwind CSS with shadcn/ui theme tokens

**Target State:**
- Next.js: 16.3
- TypeScript: ^7.0 (Go-based compiler for 10x faster type checking)
- React: 19.2.4 (unchanged - already compatible)
- Node.js: >=20.9.0 (unchanged)

## Approach

### Phase 1: Pre-Migration Validation

1. **Run current build baseline**
   ```bash
   npm run build
   npm run dev
   ```
   - Record current build time
   - Document any existing warnings

2. **Verify lockfile is clean**
   ```bash
   npm install --package-lock-only
   ```

### Phase 2: TypeScript 7 Upgrade

**Critical Note:** TypeScript 7.0 is a Go-based rewrite (microsoft/typescript-go). The npm package `typescript@^7.0` is the new Go compiler, not the JavaScript-based one.

1. **Update package.json devDependencies**
   ```json
   "typescript": "^7.0"
   ```

2. **Update tsconfig.json for TS7 compatibility**
   - Remove deprecated options that are errors in TS7:
     - `module: "esnext"` → `module: "preserve"` (recommended for bundler mode)
     - `esModuleInterop: true` → remove (enabled by default in TS7)
     - `target: "ES2017"` → `target: "ESNext"` (recommended)
   - Keep valid options:
     - `moduleResolution: "bundler"` ✓
     - `strict: true` ✓
     - `noEmit: true` ✓
     - `isolatedModules: true` ✓
     - `jsx: "react-jsx"` ✓

3. **Verify tsconfig.json after changes**
   ```json
   {
     "compilerOptions": {
       "target": "ESNext",
       "lib": ["dom", "dom.iterable", "esnext"],
       "allowJs": true,
       "skipLibCheck": true,
       "strict": true,
       "noEmit": true,
       "module": "preserve",
       "moduleResolution": "bundler",
       "resolveJsonModule": true,
       "isolatedModules": true,
       "jsx": "react-jsx",
       "incremental": true,
       "plugins": [
         {
           "name": "next"
         }
       ],
       "paths": {
         "@/*": ["./*"]
       }
     },
     "include": [
       "next-env.d.ts",
       "**/*.ts",
       "**/*.tsx",
       ".next/types/**/*.ts",
       ".next/dev/types/**/*.ts",
       "**/*.mts"
     ],
     "exclude": ["node_modules"]
   }
   ```

### Phase 3: Next.js 16.3 Upgrade

1. **Update package.json dependencies**
   ```json
   "next": "16.3.x",
   "eslint-config-next": "16.3.x"
   ```

2. **Update next.config.ts for 16.3 features**
   ```typescript
   import type { NextConfig } from "next";

   const nextConfig: NextConfig = {
     // Turbopack file system cache for faster dev builds
     turbopackFileSystemCache: true,
     
     // Use TypeScript 7 for build-time type checking
     useTypeScriptCli: true,
   };

   export default nextConfig;
   ```

### Phase 4: Installation and Validation

1. **Clean install**
   ```bash
   rm -rf node_modules .next
   npm install
   ```

2. **Verify TypeScript compilation**
   ```bash
   npx tsc --version  # Should show 7.x.x
   npx tsc --noEmit   # Should pass with no errors
   ```

3. **Verify Next.js build**
   ```bash
   npm run build
   ```

4. **Verify dev server**
   ```bash
   npm run dev
   # Test in browser at http://localhost:3000
   ```

## Risks & Mitigations

### Risk 1: TypeScript 7 Breaking Changes
- **Impact:** High - could cause compilation errors
- **Mitigation:** 
  - TS7 removes deprecated options (module: "esnext", esModuleInterop, etc.)
  - Our tsconfig uses valid options, but must remove deprecated ones
  - Test type checking before and after

### Risk 2: Next.js 16.3 Config Changes
- **Impact:** Medium - could affect build behavior
- **Mitigation:**
  - 16.3 is a minor version, should be backward compatible
  - `next.config.ts` was empty, minimal risk
  - New features (turbopackFileSystemCache, useTypeScriptCli) are opt-in

### Risk 3: React Compatibility
- **Impact:** Low - React 19.2.4 is already compatible
- **Mitigation:**
  - React 19.2.4 is supported by both Next.js 16.2 and 16.3
  - No changes needed

### Risk 4: ESLint Config Compatibility
- **Impact:** Low - eslint-config-next follows Next.js version
- **Mitigation:**
  - Update eslint-config-next to match Next.js 16.3
  - Run `npm run lint` to verify

### Risk 5: TypeScript Go Compiler Performance
- **Impact:** Low - may have different performance characteristics
- **Mitigation:**
  - TS7 Go compiler is 10x faster per Microsoft benchmarks
  - Fallback: can pin to TypeScript 6.x if issues arise

## Verification

### Automated Checks
1. ✅ `npm run build` completes without errors
2. ✅ `npm run dev` starts without errors
3. ✅ `npx tsc --version` shows 7.x.x
4. ✅ `npm run lint` passes

### Manual Verification
1. ✅ Dev server starts at http://localhost:3000
2. ✅ Page renders correctly in browser
3. ✅ No console errors in browser dev tools
4. ✅ Hot reload works correctly

### Performance Validation
1. ✅ Build time is faster than baseline
2. ✅ Dev server startup is faster
3. ✅ Type checking (tsc --noEmit) completes faster
4. ✅ Memory usage in dev is reduced (per task goal)

## Files

### Modified Files
1. `package.json` - Update next, typescript, eslint-config-next versions
2. `next.config.ts` - Add turbopackFileSystemCache and useTypeScriptCli
3. `tsconfig.json` - Remove deprecated TS7 options

### Created Files
None.

### Lock Files
- `package-lock.json` - Will be regenerated automatically

## Next Steps

After implementation:
1. Run full test suite (if any tests exist)
2. Verify in CI/CD pipeline
3. Monitor build times and memory usage
4. Document any gotchas for future reference
