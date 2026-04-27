I checked the live preview, performance profile, console, network, and the mobile home screen code. The app is loading, but it feels stuck/unsmooth because several things are competing at startup: too many script/module loads, service-worker update behavior, third-party trackers, heavy home-screen animations/images, and repeated React ref warnings.

Plan:

1. Stop the “stuck after Install / module failed” loop
   - Harden the PWA service-worker update flow so it does not auto-reload while the user is interacting.
   - Make chunk-load recovery use one shared retry/reload key instead of separate reload keys that can fight each other.
   - Improve the error boundary retry for “Importing a module script failed” so Try Again does a safe hard refresh when needed.

2. Make the mobile home screen smoother
   - Reduce expensive 3D/framer-motion effects on the main home screen, especially on mobile.
   - Remove layout animation from the top service tabs and keep simple tap feedback.
   - Disable/limit ambient orb animations and blur-heavy effects that caused layout shifts.
   - Keep the same look, but make it lighter and less jumpy.

3. Reduce startup work on `/index`
   - Delay below-fold home widgets until after initial render/idle time instead of mounting many lazy widgets immediately.
   - Do not fetch heavy flight deal/destination price data before the visible content is stable.
   - Keep visible essentials first: tabs, search, business card, shortcuts, and bottom nav.

4. Stop third-party scripts from affecting smoothness
   - Move the flight partner tracker (`emrld.ltd`) off the home route so it loads only on actual flight/hotel/car pages where it is needed.
   - Keep Meta/Google analytics delayed, but make them less likely to compete with the first interactive render.

5. Fix noisy React warnings
   - Investigate and fix the “Function components cannot be given refs” warning source in the app wrapper/provider tree.
   - This warning is not the only performance issue, but cleaning it reduces console noise and helps catch real errors.

6. Keep PWA install banner from interrupting the app
   - Make the install banner show only when an install prompt is actually available, or after a safer delay.
   - Prevent it from causing a large bottom layout shift or overlapping active mobile UI.

7. Verify after changes
   - Re-run the preview performance profile.
   - Confirm the home page appears instead of a blank/stuck screen.
   - Confirm scrolling feels smoother on a mobile-sized viewport.
   - Check console/network for remaining module-load errors and major warnings.

Technical details:

```text
Main targets:
- src/hooks/usePWAUpdate.ts
- src/components/shared/PWAUpdatePrompt.tsx
- src/lib/lazyWithRetry.ts
- src/lib/lazyRetry.ts
- src/components/shared/ErrorBoundary.tsx
- src/pages/app/AppHome.tsx
- index.html
- src/App.tsx / provider wrapper area if needed
```

The goal is not to redesign the app, just to make the current screen stop feeling frozen and reduce the heavy startup/scroll work.