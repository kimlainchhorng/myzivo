# Yes, apply those fixes, but with these corrections:

1. MapSection compact mode

- Change compact mode from `flex-1 min-h-[200px]` to `absolute inset-0`

- Ensure the Google Map container itself also has `h-full w-full`

- Make sure the map instance triggers resize after layout so it fully fills the container

2. Collapsed bottom sheet height

- Reduce collapsed sheet max height from `38vh` to `32vh`

- Keep it compact enough to show only:

  - drag handle

  - pickup / destination summary

  - trip stats

  - primary CTA

3. Tighten internal spacing

- Reduce `pb-3` to `pb-2`

- Reduce `mb-2.5` to `mb-2`

- Keep safe-area-aware padding for the CTA section

4. Bottom nav / safe area spacing

- Ensure the sheet layout and CTA reserve enough space above the bottom navigation bar

- The CTA should not feel crowded by the bottom nav

- Respect `env(safe-area-inset-bottom)`

5. Zoom controls

- Do not use a fixed `bottom-[40%]`

- Position zoom controls relative to the collapsed sheet height so they always remain above the sheet on different mobile screen sizes

6. Keep structure unchanged

- No redesign

- No flow changes

- Only fix map fill, collapsed sheet height, spacing, and control positioning

Please implement these as layout fixes only.