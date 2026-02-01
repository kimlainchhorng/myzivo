
# Performance & Core Web Vitals Optimization for ZIVO

## Current State Analysis

### What Already Works Well
1. **Route-level code splitting** - 80+ pages use `React.lazy()` for dynamic imports
2. **Native lazy loading** - Most images use `loading="lazy"` attribute
3. **PWA with service worker caching** - Mapbox, fonts, and static assets cached
4. **LazyLoadSection component** - IntersectionObserver-based section loading
5. **Skeleton loaders** - Basic skeletons exist for cards and lists

### Critical Performance Issues Identified
1. **No responsive images** - Missing `srcset`/`sizes` attributes (0 matches found)
2. **No image preloading** - Hero images not preloaded (0 matches found)
3. **No explicit dimensions** - Images lack `width`/`height` causing CLS
4. **JPG format only** - No WebP conversion (32 JPG files in assets)
5. **No blur placeholders** - Images pop in without smooth transitions
6. **Unsplash images lack optimization** - Using default quality (q=80)
7. **Hero images loaded lazily** - Should be `loading="eager"` with preload

---

## Implementation Plan

### Phase 1: Enhanced OptimizedImage Component

**File: `src/components/shared/OptimizedImage.tsx`**

Add responsive image support with srcset, explicit dimensions, and blur placeholder:

```text
New Props:
- width: number (required for CLS prevention)
- height: number (required for CLS prevention)
- sizes?: string (responsive sizes attribute)
- srcSet?: { src: string; width: number }[] (responsive sources)
- blurDataURL?: string (optional blur placeholder)
- quality?: number (for Unsplash URL optimization)

Features to add:
- Generate srcset automatically for Unsplash URLs
- Add width/height to prevent layout shift
- Implement blur-up placeholder effect
- Support WebP format detection
```

### Phase 2: Create PerformantHeroImage Component

**File: `src/components/shared/PerformantHeroImage.tsx`**

Specialized hero image component with:
- Always `loading="eager"`
- Preload link injection via `useEffect`
- Fixed dimensions (16:9 aspect ratio)
- Critical-path optimization
- Blur placeholder while loading

### Phase 3: Create useImagePreload Hook

**File: `src/hooks/useImagePreload.ts`**

Custom hook that:
- Injects `<link rel="preload" as="image">` into document head
- Supports responsive preload with `imagesrcset`
- Cleans up on unmount
- Only preloads above-fold images

### Phase 4: Update Photo Configuration

**File: `src/config/photos.ts`**

Add optimization metadata:

```text
Changes:
- Add width/height for each image
- Add srcset configurations for responsive sizes
- Optimize Unsplash URLs with q=75 instead of q=80
- Add smaller breakpoints: 320, 640, 1024, 1440
- Include blur placeholder data URLs
```

### Phase 5: Update Hero Components

**Files to modify:**
- `src/components/home/HeroSection.tsx`
- `src/components/shared/ImageHero.tsx`
- `src/components/shared/ServiceHero.tsx`

Changes:
- Add explicit width/height (1920x1080)
- Add preload for hero image
- Ensure `loading="eager"`
- Add fetchpriority="high" attribute

### Phase 6: Optimize ServicesGrid

**File: `src/components/home/ServicesGrid.tsx`**

Changes:
- Add width/height to service card images (400x300)
- Use srcset for responsive loading
- Keep `loading="lazy"` for below-fold cards
- Add skeleton placeholder with matching aspect ratio

### Phase 7: Optimize DestinationCardsGrid

**File: `src/components/shared/DestinationCardsGrid.tsx`**

Changes:
- Update Unsplash URLs to use optimized quality (q=75)
- Add srcset for responsive 1:1 images
- Add explicit dimensions (400x400)
- Reduce initial grid to 4 items, "Load more" for rest

### Phase 8: Add Image Skeleton Components

**File: `src/components/shared/SkeletonLoaders.tsx`**

Add new skeleton types:
- `SkeletonHeroImage` - Full-width hero placeholder
- `SkeletonServiceCard` - 4:3 card with shimmer
- `SkeletonDestinationTile` - 1:1 tile placeholder

### Phase 9: Vite Build Optimization

**File: `vite.config.ts`**

Add optimizations:

```text
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-react': ['react', 'react-dom', 'react-router-dom'],
        'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-popover', ...],
        'vendor-charts': ['recharts'],
        'vendor-forms': ['react-hook-form', 'zod', '@hookform/resolvers'],
        'vendor-map': ['mapbox-gl'],
      },
    },
  },
  cssCodeSplit: true,
  sourcemap: false,
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: true,
      drop_debugger: true,
    },
  },
},
```

### Phase 10: PWA Cache Optimization

**File: `vite.config.ts` (workbox config)**

Add image caching strategy:

```text
runtimeCaching: [
  // Existing entries...
  {
    urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
    handler: "CacheFirst",
    options: {
      cacheName: "unsplash-images",
      expiration: {
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
      },
      cacheableResponse: {
        statuses: [0, 200],
      },
    },
  },
  {
    urlPattern: /\.(jpg|jpeg|png|webp|avif)$/i,
    handler: "CacheFirst",
    options: {
      cacheName: "local-images",
      expiration: {
        maxEntries: 60,
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
      },
    },
  },
],
```

### Phase 11: Defer Non-Critical Scripts

**File: `index.html`**

Changes:
- Move Travelpayouts script to bottom of body
- Add `defer` attribute to non-critical scripts
- Remove render-blocking resources

### Phase 12: Add Performance Monitoring Utilities

**File: `src/lib/performance.ts`**

Create utilities for:
- Web Vitals tracking (LCP, CLS, INP)
- Image load timing measurement
- Performance entry observer

---

## Technical Implementation Details

### Responsive Image srcset Strategy

For heroes (16:9):
```text
srcset="
  /image.jpg?w=320 320w,
  /image.jpg?w=640 640w,
  /image.jpg?w=1024 1024w,
  /image.jpg?w=1440 1440w,
  /image.jpg?w=1920 1920w
"
sizes="100vw"
```

For cards (4:3):
```text
srcset="
  /image.jpg?w=200 200w,
  /image.jpg?w=400 400w,
  /image.jpg?w=600 600w
"
sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
```

### Unsplash URL Optimization

Current: `?w=400&h=400&fit=crop&q=80`
Optimized: `?w=400&h=400&fit=crop&q=75&fm=webp&auto=format`

The `fm=webp&auto=format` parameters tell Unsplash to:
- Serve WebP if browser supports it
- Fall back to JPEG otherwise

### CLS Prevention Pattern

All images must have:
```html
<img 
  src="..."
  width="1920"
  height="1080"
  alt="..."
  style="aspect-ratio: 16/9"
/>
```

This ensures the browser reserves space before image loads.

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/shared/PerformantHeroImage.tsx` | Optimized hero image with preload |
| `src/hooks/useImagePreload.ts` | Preload link injection hook |
| `src/lib/performance.ts` | Web Vitals tracking utilities |

## Files to Modify

| File | Key Changes |
|------|-------------|
| `src/components/shared/OptimizedImage.tsx` | Add srcset, dimensions, blur placeholder |
| `src/components/shared/SkeletonLoaders.tsx` | Add image-specific skeletons |
| `src/components/home/HeroSection.tsx` | Add preload, dimensions, fetchpriority |
| `src/components/shared/ImageHero.tsx` | Add preload, dimensions |
| `src/components/shared/ServiceHero.tsx` | Add preload, dimensions |
| `src/components/home/ServicesGrid.tsx` | Add dimensions to card images |
| `src/components/shared/DestinationCardsGrid.tsx` | Optimize Unsplash URLs, add dimensions |
| `src/config/photos.ts` | Add dimensions and srcset configs |
| `vite.config.ts` | Add build optimizations and image caching |
| `index.html` | Defer scripts, add preconnect hints |

---

## Performance Targets

| Metric | Current (Estimated) | Target |
|--------|---------------------|--------|
| LCP | > 3.5s | < 2.5s |
| CLS | > 0.15 | < 0.1 |
| INP | Unknown | < 200ms |
| FCP | > 2s | < 1.8s |
| TTI | > 5s | < 3.8s |

---

## Expected Outcomes

After implementation:
- Hero images preloaded and render instantly
- All images have explicit dimensions (zero CLS from images)
- Responsive srcset serves appropriate sizes for device
- WebP format auto-served via Unsplash
- Unsplash images cached for 30 days via service worker
- Local assets cached for 1 year
- Bundle split into logical chunks (vendor, charts, map)
- Console logs stripped in production
- Non-critical scripts deferred
- Skeleton loaders match final image dimensions
- Mobile 3G/4G experience significantly improved
