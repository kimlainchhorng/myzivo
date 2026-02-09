

# Multi-Brand Support — Implementation Plan

## Overview
Add automatic branding adaptation based on domain detection. When the app is accessed from different domains, it automatically loads the corresponding brand configuration (logo, colors, app name) and applies the brand theme to headers, buttons, and primary elements.

## Current State Analysis

### Existing Infrastructure
| Component | Status | Purpose |
|-----------|--------|---------|
| `brands` table | Exists | Stores brand configurations with domain mapping |
| `tenants` table | Exists | Multi-tenant with logo_url, primary_color, settings |
| `index.css` | Exists | CSS custom properties for theming |
| `ZivoLogo` component | Exists | Hardcoded ZIVO branding |
| `TenantContext` | Exists | Multi-tenant state for admin users |

### Database Schema (brands table)
| Column | Type | Purpose |
|--------|------|---------|
| `id` | uuid | Primary key |
| `name` | text | Brand display name (e.g., "ZIVO", "Partner A") |
| `logo_url` | text | URL to brand logo image |
| `primary_color` | text | Primary brand color (hex/hsl) |
| `domain` | text | Domain mapping (e.g., "hizovo.com", "partner.com") |

### Current Theming (index.css)
CSS custom properties defined in `:root`:
- `--primary` — Primary brand color (blue)
- `--primary-foreground` — Text on primary
- `--background`, `--foreground`, etc.

---

## Implementation Plan

### 1) Create Brand Context

**File to Create:** `src/contexts/BrandContext.tsx`

**Purpose:** Provide brand configuration based on current domain.

**Implementation:**
```text
interface BrandConfig {
  id: string;
  name: string;
  logoUrl: string | null;
  primaryColor: string | null;
  domain: string | null;
}

interface BrandContextValue {
  brand: BrandConfig;
  isLoading: boolean;
  isCustomBrand: boolean;
}

Detection logic:
1. Get current domain: window.location.hostname
2. Query brands table: WHERE domain = hostname
3. If found → use brand config
4. If not found → use default ZIVO config

Caching:
- staleTime: 5 minutes (brand rarely changes)
- Store in sessionStorage for instant reload
```

### 2) Create Brand Hook

**File to Create:** `src/hooks/useBrand.ts`

**Purpose:** Lightweight hook to access brand configuration.

**Implementation:**
```text
export function useBrand() {
  const context = useContext(BrandContext);
  if (!context) {
    // Return default ZIVO brand if outside provider
    return {
      brand: DEFAULT_BRAND,
      isLoading: false,
      isCustomBrand: false,
    };
  }
  return context;
}
```

### 3) Create CSS Theme Applicator

**File to Create:** `src/lib/brandTheme.ts`

**Purpose:** Apply brand colors to CSS custom properties at runtime.

**Implementation:**
```text
export function applyBrandTheme(primaryColor: string | null) {
  if (!primaryColor) return;
  
  const root = document.documentElement;
  
  // Parse color (supports hex: #3B82F6 or hsl: 221 83% 53%)
  const hsl = parseToHSL(primaryColor);
  
  // Apply to CSS custom properties
  root.style.setProperty('--primary', hsl);
  root.style.setProperty('--ring', hsl);
  root.style.setProperty('--sidebar-primary', hsl);
  
  // Generate lighter/darker variants
  root.style.setProperty('--primary-light', lighten(hsl, 30));
}

export function resetBrandTheme() {
  // Remove custom properties to restore defaults
  const root = document.documentElement;
  root.style.removeProperty('--primary');
  root.style.removeProperty('--ring');
  // etc.
}
```

### 4) Create Dynamic Brand Logo Component

**File to Create:** `src/components/shared/BrandLogo.tsx`

**Purpose:** Display brand logo dynamically based on brand config.

**Implementation:**
```text
interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

export function BrandLogo({ size = "md", showText = true, className }: BrandLogoProps) {
  const { brand, isLoading } = useBrand();
  
  // If custom logo exists, show image
  if (brand.logoUrl) {
    return (
      <div className={cn("flex items-center gap-2", sizeClasses[size].container, className)}>
        <img 
          src={brand.logoUrl} 
          alt={brand.name}
          className={cn("object-contain", sizeClasses[size].icon)}
        />
        {showText && (
          <span className={cn("font-bold", sizeClasses[size].text)}>
            {brand.name}
          </span>
        )}
      </div>
    );
  }
  
  // Fall back to default ZIVO logo
  return <ZivoLogo size={size} showText={showText} className={className} />;
}
```

### 5) Integrate Brand Provider in App

**File to Modify:** `src/App.tsx`

**Changes:**
- Wrap app with `BrandProvider`
- Apply theme on brand load

**Pattern:**
```text
function App() {
  return (
    <BrandProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {/* existing providers */}
          <BrandThemeApplicator />
          <Routes>...</Routes>
        </AuthProvider>
      </QueryClientProvider>
    </BrandProvider>
  );
}

// Component that applies theme when brand changes
function BrandThemeApplicator() {
  const { brand } = useBrand();
  
  useEffect(() => {
    if (brand.primaryColor) {
      applyBrandTheme(brand.primaryColor);
    } else {
      resetBrandTheme();
    }
  }, [brand.primaryColor]);
  
  return null;
}
```

### 6) Update Header Components to Use Brand Logo

**Files to Modify:**
- `src/components/app/AppHeader.tsx`
- `src/components/app/ZivoSuperAppLayout.tsx`
- `src/components/app/HizovoAppHeader.tsx`

**Changes:**
Replace `<ZivoLogo />` with `<BrandLogo />`:

```text
// Before
import ZivoLogo from "@/components/ZivoLogo";
<ZivoLogo size="sm" />

// After
import { BrandLogo } from "@/components/shared/BrandLogo";
<BrandLogo size="sm" />
```

### 7) Update Page Title with Brand Name

**File to Create:** `src/components/shared/BrandHead.tsx`

**Purpose:** Dynamically set page title with brand name.

**Implementation:**
```text
import { useEffect } from "react";
import { useBrand } from "@/hooks/useBrand";

export function BrandHead({ title }: { title?: string }) {
  const { brand } = useBrand();
  
  useEffect(() => {
    document.title = title 
      ? `${title} | ${brand.name}`
      : brand.name;
  }, [title, brand.name]);
  
  return null;
}
```

---

## File Summary

### New Files (5)
| File | Purpose |
|------|---------|
| `src/contexts/BrandContext.tsx` | Brand configuration provider with domain detection |
| `src/hooks/useBrand.ts` | Lightweight hook to access brand config |
| `src/lib/brandTheme.ts` | CSS custom property applicator |
| `src/components/shared/BrandLogo.tsx` | Dynamic brand logo component |
| `src/components/shared/BrandHead.tsx` | Dynamic page title component |

### Modified Files (4)
| File | Changes |
|------|---------|
| `src/App.tsx` | Add BrandProvider wrapper + theme applicator |
| `src/components/app/AppHeader.tsx` | Use BrandLogo instead of ZivoLogo |
| `src/components/app/ZivoSuperAppLayout.tsx` | Use BrandLogo instead of ZivoLogo |
| `src/components/app/HizovoAppHeader.tsx` | Use BrandLogo instead of ZivoLogo |

---

## Domain Detection Logic

```text
┌─────────────────────────────────────────────────────────────────┐
│                     Domain Detection Flow                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. App loads → Get hostname: window.location.hostname          │
│                                                                 │
│  2. Query brands table:                                         │
│     SELECT * FROM brands WHERE domain = 'hostname'              │
│                                                                 │
│  3. If brand found:                                             │
│     ├─ Apply brand.primaryColor to CSS variables                │
│     ├─ Use brand.logoUrl in BrandLogo component                 │
│     └─ Use brand.name in page titles                            │
│                                                                 │
│  4. If no brand found:                                          │
│     └─ Use default ZIVO configuration                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Domain Matching Examples
| Hostname | Brand Matched | Theme Applied |
|----------|---------------|---------------|
| `hizovo.com` | ZIVO (default) | Blue (#3B82F6) |
| `partner-a.com` | Partner A | Green (#10B981) |
| `partner-b.com` | Partner B | Purple (#8B5CF6) |
| `localhost` | ZIVO (default) | Blue (#3B82F6) |

---

## CSS Variables Affected

When a custom brand color is applied:

| Variable | Default (ZIVO) | Custom Brand |
|----------|----------------|--------------|
| `--primary` | 221 83% 53% | Brand primary |
| `--ring` | 221 83% 53% | Brand primary |
| `--sidebar-primary` | 221 83% 53% | Brand primary |
| `--chart-1` | 221 83% 53% | Brand primary |

### Elements Automatically Themed
- Primary buttons (`bg-primary`)
- Focus rings (`ring-primary`)
- Links and accents
- Header logo background
- Progress indicators
- Active states

---

## Default Brand Configuration

```text
const DEFAULT_BRAND: BrandConfig = {
  id: "default",
  name: "ZIVO",
  logoUrl: null, // Uses ZivoLogo component
  primaryColor: null, // Uses CSS defaults
  domain: null,
};
```

---

## Caching Strategy

| Layer | Duration | Purpose |
|-------|----------|---------|
| TanStack Query | 5 minutes staleTime | Prevent redundant DB calls |
| sessionStorage | Session lifetime | Instant theme on page reload |
| CSS Variables | Runtime | Applied once per session |

---

## Technical Details

### Color Parsing (brandTheme.ts)
```text
function parseToHSL(color: string): string {
  // Handle hex: #3B82F6
  if (color.startsWith("#")) {
    const rgb = hexToRgb(color);
    return rgbToHsl(rgb);
  }
  
  // Handle HSL: 221 83% 53% or hsl(221, 83%, 53%)
  if (color.includes("%")) {
    return color.replace(/hsl\(|\)/g, "").trim();
  }
  
  return color;
}
```

### Theme Application
```text
function applyBrandTheme(primaryColor: string) {
  const hsl = parseToHSL(primaryColor);
  const root = document.documentElement;
  
  // Core primary color
  root.style.setProperty("--primary", hsl);
  root.style.setProperty("--ring", hsl);
  
  // Sidebar
  root.style.setProperty("--sidebar-primary", hsl);
  root.style.setProperty("--sidebar-ring", hsl);
  
  // Charts
  root.style.setProperty("--chart-1", hsl);
}
```

---

## Admin Setup

To configure a new brand, admins add a row to the `brands` table:

| Column | Example Value |
|--------|---------------|
| `name` | Partner Airways |
| `logo_url` | https://storage.../partner-logo.png |
| `primary_color` | #10B981 |
| `domain` | partner-airways.com |

Once added, any user visiting `partner-airways.com` will see the Partner Airways branding automatically.

---

## Summary

This implementation provides:

1. **Brand Context** — Domain-based brand detection with database lookup
2. **Dynamic Theming** — CSS custom properties updated at runtime
3. **Brand Logo** — Automatic logo switching based on brand config
4. **Page Titles** — Dynamic titles with brand name
5. **Header Integration** — All headers use dynamic branding
6. **Default Fallback** — ZIVO branding when no custom brand matches
7. **Caching** — Efficient query caching + sessionStorage for fast reloads

The system automatically adapts the entire UI to match the brand associated with the current domain, requiring no code changes to add new white-label partners.

