# Device model assets

The supplied laptop and phone FBX files are converted into web GLBs. Active assets are `/models/laptop/laptop-screen-fit.glb` and `/models/phone/phone.glb`; the earlier `/models/laptop/laptop.glb` is preserved. Preparation welds duplicate vertices, batches materials, and uses Meshopt compression. The phone retains every triangle of the selected handset. The laptop keeps its body, keyboard, lid, and screen geometry; only excessive speaker grille microdetail was simplified, with a bounded error below 0.15 pixels at a 900 px device width. The loader supports compressed GLB, OBJ, and FBX.

The phone source contains multiple handset copies. Its 1,111,196-byte web asset includes one complete front-facing handset: 69,617 triangles in 14 material batches, with no external textures. Its planar UV-mapped display is renamed `PhoneScreen`. The source OBJ referenced a missing MTL file, and the FBX imported without useful colours or textures, so the web model has an explicit neutral silver-and-black finish. The laptop keeps its textures and display named `LaptopScreen`; runtime material adjustments give its keys a diffuse graphite finish and soften metal so the keyboard remains readable under room lighting.

The corrected laptop asset isolates the main two-triangle display with full 0..1 UVs. The old UVs assigned the capture's upper 3.3458% to tiny webcam/bezel geometry, cropping it from the actual display. Those 94 triangles now use the original dark finish as `LaptopScreenBezel`. All 1,306,783 laptop triangles remain intact, with 29 material batches. Preparation and validation are recorded in `artifacts/model-work/fit-laptop-main-display.mjs` and `laptop-screen-fit-report.json`.

Outer scene ratios stay 16:10 on the portfolio, 16:9 in dialogs and project pages, and 1:1.05 at 600 px or less. Larger devices use a laptop canvas starting at 0.5% with 73% width, and a phone canvas starting at 69% with 30% width. Both canvases have 92% scene height and a 4% bottom offset. The actual device bodies have matching overall heights, common top/base levels, and space between their visible geometry. Loading/fallback previews use the same body-height constraints.

## Shared configuration

`portfolioDeviceModels` in `src/lib/device-models.ts` is shared by both projects. `scene.models` can override either device for a particular project. Prepared GLB entries use this shape:

```ts
export const portfolioDeviceModels: NonNullable<DeviceSceneLayout['models']> = {
  laptop: {
    src: '/models/laptop/laptop-screen-fit.glb',
    format: 'glb',
    screenName: 'LaptopScreen',
    screenFlipY: true,
    screenAspect: 1.6024755814,
    screenInsets: [0, 0, 0, 0],
    screenBackground: '#080a08',
    rotation: [0, 18, 0],
    lighting: {
      ambient: 1.1, key: 1.5, fill: .25,
      keyColor: '#fff3de', fillColor: '#c3c0dd', keyPosition: [-3, 5, 4],
      bodyTint: '#585c60', exposure: .95,
    },
  },
  phone: {
    src: '/models/phone/phone.glb',
    format: 'glb',
    screenName: 'PhoneScreen',
    screenFlipY: true,
    screenAspect: .462015622,
    screenInsets: [.065, .015, .015, .015],
    screenBackground: '#080a08',
    rotation: [0, -18, 0],
    lighting: { ambient: 1.1, key: 1.5, fill: .25, exposure: .95 },
  },
};
```

Both prepared models face +Z with +Y upright, then yaw inward by +18° / −18°. The model and camera have no X/Z tilt; pointer tilt is disabled for the shared template. Warm upper-left key light and restrained fill light illuminate the devices. Screen materials are unlit with tone mapping disabled, preserving the capture colours. `screenName` must exactly match an exported UV-mapped mesh or material name. Keep the display separate so a website capture does not replace the device body.

| Field | Meaning |
| --- | --- |
| `src` | Required public model URL. |
| `format` | Required `'glb'`, `'obj'`, or `'fbx'`. |
| `materials` | Optional public MTL URL for OBJ. |
| `resourcePath` | Optional external texture folder, including a trailing slash. Match paths referenced in the export. |
| `rotation` | Optional `[x, y, z]` orientation correction in degrees; defaults to zero. |
| `screenName` | Optional exact name of the UV-mapped screen mesh or material that receives a capture. |
| `screenImage` | Optional capture URL overriding the project's `desktop` or `mobile` value for this model. |
| `screenFlipY` | Optional boolean to correct a vertically inverted capture after checking the screen UVs. |
| `screenAspect` | Physical display width/height used to contain the complete capture without stretching. |
| `screenInsets` | Safe margins as `[top, right, bottom, left]` fractions of the display. |
| `screenBackground` | Display colour outside the contained capture; the shared models use dark `#080a08`. |
| `lighting` | Optional ambient/key/fill intensities, light colours and key position, body tint, and exposure. |

## Device framing and screen fit

The 28° perspective camera measures the complete model silhouette to match overall device heights. Lens shift aligns their bases without pitching the camera; equal body heights also align their top edges. CSS sets these height fractions of each device canvas:

| Scene | Overall device height |
| --- | --- |
| Portfolio, above 600 px | 0.675 |
| Project/dialog, above 600 px | 0.75 |
| All scenes, 600 px or less | 0.39 |

The fit guard backs the camera away if needed to keep the full keyboard and chassis inside a 2% margin rather than clipping them. The canvas host exposes `data-model-height`, `data-model-top`, `data-model-bottom`, `data-model-fit-clamped`, `data-model-clipped`, and screen measurements for verification. Fallback previews use the same overall-height and base alignment rules.

Captures are drawn into aspect-preserving contained `CanvasTexture` images. Physical display aspects are 1.6024755814 for the laptop and 0.462015622 for the phone. The laptop uses zero insets so its website fills the corrected display; phone margins remain 6.5% at the top and 1.5% elsewhere so the header clears the Dynamic Island. Unused display space is dark `#080a08`, avoiding pale artificial bands inside the bezel. Current v4 laptop captures have aspect 1.6025; unchanged v3 phone captures match the usable safe-area aspect at 0.487012987. Full captures remain visible without cropping or stretching. Fallback previews also use contain fitting.

## Replacement source files

For future static source models, prefer OBJ with its matching MTL and all referenced textures, or provide FBX with embedded/external textures. Export the laptop in its intended open pose; the scene displays that pose rather than playing model animations. Keep source filenames and texture paths consistent. Files under `public` use URLs beginning with `/models/`, without `public` in the URL.

Example OBJ entry, after adding the actual files:

```ts
laptop: {
  src: '/models/laptop/laptop.obj',
  format: 'obj',
  materials: '/models/laptop/laptop.mtl',
  resourcePath: '/models/laptop/textures/',
  rotation: [0, 0, 0],
  screenName: 'LaptopScreen',
}
```

For FBX, use the same fields without `materials`:

```ts
phone: {
  src: '/models/phone/phone.fbx',
  format: 'fbx',
  resourcePath: '/models/phone/textures/',
  rotation: [0, 0, 0],
  screenName: 'PhoneScreen',
}
```

The OBJ/FBX paths and screen names in these replacement examples must match the supplied export; they are not extra files shipped with the current GLBs.

## Project screens and photographs

The renderer uses each project's `desktop` capture for the laptop and `mobile` capture for the phone. Laptop heroes were refreshed from both updated live websites on 15 October 2026 as v4 assets. Phone heroes remain the v3 captures from 14 October; earlier assets are preserved.

| Project | Laptop v4 capture, 1282 × 800 | Phone v3 capture, 375 × 770 |
| --- | --- | --- |
| Urbanist | `/images/urbanist-laptop-hero-v4.webp` | `/images/urbanist-phone-hero-v3.webp` |
| Pebble | `/images/pebble-laptop-hero-v4.webp` | `/images/pebble-phone-hero-v3.webp` |

V4 laptop sources are `artifacts/2026-10-15/{project}-live-laptop-v4-clipped.jpg`. Direct client-area screenshots capture the complete 1282 × 800 website viewport without browser chrome, after fonts/images load at scroll position zero. The output keeps all 1,025,600 pixels: no image pixels are cropped or resized, every decoded RGB value is identical after lossless WebP encoding, and source JPEG hashes remain unchanged. Aspect 1.6025 differs from the physical display by only 0.001524%. `artifacts/model-work/prepare-live-laptop-v4.mjs` reproduces the conversion, with checks in `live-laptop-v4-report.json`.

The retained v3 phone preparation removes only the browser's 15 rightmost scrollbar columns from 390 × 770 source screenshots, with chrome starting at x375. Boundary evidence spans 31–35 rows per phone capture. Lossless WebP preserves all remaining RGB values and the full source height; usable aspect differs from its target by 0.023%. The original batch processor and report remain `artifacts/model-work/prepare-live-hero-v3.mjs` and `live-hero-v3-report.json`.

Screens currently show static images; screen animation is reserved for a later change. A live iframe cannot supply a model texture.

To override a capture for one project while keeping the shared phone geometry:

```ts
models: {
  ...portfolioDeviceModels,
  phone: {
    ...portfolioDeviceModels.phone!,
    screenImage: '/images/urbanist-phone-hero-v3.webp',
  },
},
```

Use `backgroundPosition` and optional `mobileBackgroundPosition` to crop each project's `venue` image within the existing scene. `backgroundBrightness` controls full-image brightness. The supplied two-model template uses shared larger left/right rendering areas; `composition` remains available for alternative scene layouts.

Urbanist's `/images/urbanist-location-20261014.webp` is a 2131 × 2057 crop derived by removing 269 px from the left of the preserved 2400 × 2057 HEIC conversion. Total left crop is approximately 22.3% of the original 4032 × 3024 image. The existing 94% brightness / 96% saturation grade is retained, with no upscaling or perspective warp. The laptop covers the large foreground ashtray used as its placement reference on desktop and mobile.

Urbanist uses `backgroundBrightness: 1` and `photoAnchored: true`, which disables group scroll movement to keep the devices fixed to the photographed surface. Its screens use the laptop v4 and phone v3 preparation described above. Pebble retains its logo placeholder until a venue photograph is supplied.

The preview stays visible until model resources and the first render succeed. Missing files, failed textures, an unmatched `screenName` when applying a capture, or unavailable WebGL retain the preview. Resources load near the viewport, with rendering on layout changes rather than a continuous animation loop.

