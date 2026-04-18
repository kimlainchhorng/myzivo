
## Diagnosis

The white vertical strips between fingers and the hair halo are caused by **mask dilation**, not bleed-through:

1. **Pass 1 blur (1px)** on the upscaled mask + **bilinear upscale** of a low-res confidence mask → thin negative spaces (between fingers, around hair strands) get filled in as opaque foreground. Background blur shows through them.
2. **Pass 2 blur (0.8px)** in `destination-in` further softens, then re-expands edges.
3. **Wide-ish ramp `LO=0.45 / HI=0.60`** still treats fingertip/hair edges as semi-confident, leaving a translucent halo.
4. No **mask erosion** step → the mask is always slightly larger than the actual silhouette.

## Fix (4 surgical changes in `src/hooks/useVirtualBackground.ts`)

1. **Tighter ramp:** `LO=0.55, HI=0.62` — pushes fingertip/hair edges firmly into "background" unless model is highly confident, eliminating the white halo.

2. **Erode mask by 1px** before upscale — composite the mask onto itself shifted by ±1px in `destination-in` mode so any edge pixel that has a transparent neighbor becomes transparent. This recovers the gaps between fingers.

3. **Reduce Pass 1 blur 1px → 0.5px** and **remove Pass 2 blur entirely** (`filter: "none"` on the destination-in step). With erosion handling the gap-recovery, we no longer need blur to hide jaggies — keeps edge crisp without re-dilating.

4. **Skip temporal blend on motion >18** (already there, keep) but also **skip temporal blend entirely when the previous mask had heavy dilation** — already covered by snap logic, no change needed.

### Net diff
```text
LO: 0.45 → 0.55
HI: 0.60 → 0.62
Pass-1 blur: 1px → 0.5px
NEW: erode pass (4-direction 1px shift, destination-in)
Pass-2 blur: 0.8px → 0px
```

### Expected result
- Vertical white strips between fingers → gone (erosion opens the gaps)
- Hair halo → gone (tighter ramp + no Pass-2 dilation)
- Edges stay clean (0.5px blur is enough antialiasing at typical 720p)
- Hand motion still snaps (existing motion-aware blend untouched)

One file edit. ~15 lines changed.
