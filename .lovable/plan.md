

## Real Smart AI Upgrade — Guided Edge Refinement

Add a **color-guided mask refinement** pass. Instead of trusting MediaPipe's blurry edge, we sample the actual video pixels in a narrow band around the silhouette and reclassify each edge pixel as foreground/background based on **color similarity to nearby confirmed-foreground pixels**.

### Algorithm (per frame, edge band only — fast)

1. **Identify edge band** — pixels where mask alpha is between 30 and 220 (the uncertain zone)
2. **Sample reference colors** — for each edge pixel, look at a 5px-inward neighbor (confirmed foreground) and a 5px-outward neighbor (confirmed background)
3. **Color distance test** — compute YCbCr distance from the edge pixel to both references. Closer to FG → set alpha 255, closer to BG → set alpha 0
4. **Result** — hair strands that are visually distinct from the background get correctly classified; halo pixels (which match background color) get culled

### Why this kills the halo
The orange/warm halo around your head right now is background-blur pixels showing through the semi-transparent edge. Color-guided refinement looks at those pixels, sees they match the background (orange) not the foreground (skin/hair), and zeros their alpha. Halo gone.

### Implementation
- Operate on a downsampled (¼ resolution) edge band → ~5ms overhead
- Use simple Euclidean distance in YCbCr space (perceptually weighted)
- Apply ONCE after the existing smoothstep + erosion, before Pass-2 feather
- Keep all current logic intact (motion blend, hair zone, single-sided erosion)

### Net change
```text
NEW pass between mask build and Pass-2 clip:
  - Read video ImageData (downsampled)
  - Read mask ImageData
  - For each pixel with alpha ∈ [30,220]:
      sample FG-ref (5px toward mask interior)
      sample BG-ref (5px toward mask exterior)
      classify by YCbCr distance
      write back hard 0 or 255
  - Putback to mask
```

One file. ~40 lines added.

### Expected
- Halo around head: gone (background-colored edge pixels culled)
- Face: stays crisp (interior alpha already 255, untouched)
- Hair strands: preserved if visually distinct from background
- Performance: +3-5ms/frame on 720p (still 30fps headroom)

