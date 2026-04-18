

## Diagnosis

Two opposite artifacts from the last pass:
1. **Jagged hand edges** — 1px erosion + removed Pass-2 blur = no antialiasing on the silhouette
2. **Blue hair halo** — MediaPipe Selfie Segmentation has inherently low confidence on fine hair strands; tight `0.50/0.58` ramp clips them, but background blur leaks through the residual semi-transparent zone

## Fix — `src/hooks/useVirtualBackground.ts`

Three balanced changes:

**1. Add tiny Pass-2 feather back (0.4px)** — just enough antialiasing to smooth the jagged hand edges without re-dilating the mask. 0.4px is sub-pixel — softens stair-step but doesn't expand silhouette measurably.

**2. Asymmetric vertical ramp for hair** — hair sits at top of head, fingers/body elsewhere. Apply a slightly looser ramp (`0.42/0.55`) only to the **top 25% of the frame** where hair lives, keep tighter `0.50/0.58` everywhere else. Done by sampling the y-coordinate in the alpha-ramp loop.

**3. Reduce erosion to horizontal-only ½px equivalent** — drop one of the two horizontal shifts (keep just `+1, 0` not `-1, 0`) so finger gaps stay open but the hand outline doesn't get double-eaten on both sides.

### Net diff
```text
Pass-2 blur: 0px → 0.4px (re-add light feather)
Alpha ramp:  flat 0.50/0.58
           → top 25%:  0.42/0.55  (hair zone)
             rest:     0.50/0.58  (body/hands)
Erosion:    +1,0 and -1,0
          → +1,0 only  (single-sided)
```

### Expected result
- Hand edges: smooth (Pass-2 0.4px feather)
- Finger gaps: still open (single-sided erosion enough)
- Hair detail: more strands captured (looser top-zone ramp)
- Blue halo above scalp: gone (lower LO threshold accepts low-confidence hair pixels as foreground)

One file. ~20 lines changed.

