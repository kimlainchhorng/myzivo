

## Diagnosis
The face area looks washed out and the head has a thick halo because:
1. **0.4px Pass-2 feather is being applied to the WHOLE silhouette** — it softens the face perimeter, letting background blur bleed inward
2. **Hair-zone ramp (0.42 LO)** is too loose — captures background pixels above the head as semi-foreground → grey halo
3. **No edge-only feather** — antialiasing should only apply to the silhouette boundary, not the interior

## Smart AI Upgrade — `src/hooks/useVirtualBackground.ts`

**1. Mask sharpening via threshold curve** — replace linear ramp with an S-curve (smoothstep). Pixels near the middle of the ramp get pushed harder toward 0 or 255, producing a crisper edge with the same LO/HI bounds. This is what "smart" segmenters do.

**2. Tighten hair zone** — `LO 0.42 → 0.46`, `HI 0.55 → 0.58`. Still looser than body but no longer accepts low-confidence background pixels as hair.

**3. Edge-only Pass-2 feather** — instead of blurring the whole mask in destination-in, generate a thin edge-band (mask minus eroded mask) and feather only that band. Interior stays 100% opaque, only the silhouette gets antialiased. Done by:
   - Draw mask normally (sharp interior)
   - Then blur(0.6px) only at edge composite step using a smaller offset trick

   Practical implementation: skip Pass-2 blur entirely on interior, apply blur ONLY when drawing maskHi the second time with `globalAlpha=0.5` for sub-pixel edge smoothing. Net effect = crisp face, smooth edges.

**4. Background re-clip** — after compositing person over background, paint a 2px feathered alpha gradient at the silhouette boundary using the eroded mask as a "core" and the original mask as "edge". Removes the residual halo entirely.

### Net diff
```text
Ramp curve: linear → smoothstep S-curve (sharper midtones)
Hair zone:  0.42/0.55 → 0.46/0.58
Pass-2:     full-mask 0.4px blur → edge-only 0.6px (interior stays crisp)
NEW:        2-step composite — eroded core (sharp) + feathered edge band
```

### Expected result
- Face: crisp, no veil/wash
- Head halo: gone (tighter hair ramp + edge-only feather)
- Hand edges: still smooth (edge feather is now bigger, 0.6px)
- Finger gaps: preserved (single-sided erosion untouched)

One file. ~25 lines changed.

