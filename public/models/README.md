# Device model assets

The supplied laptop and phone FBX files are converted once into web GLBs at `/models/laptop/laptop.glb` and `/models/phone/phone.glb`. Preparation welds duplicate vertices, batches materials, and uses Meshopt compression. The phone retains every triangle of the selected handset. The laptop keeps its body, keyboard, lid, and screen geometry; only excessive speaker grille microdetail is simplified, with a bounded error below 0.15 pixels at a 900 px device width. The loader supports compressed GLB, OBJ, and FBX.

The phone source contains multiple handset copies. Its 1,111,196-byte web asset includes one complete front-facing handset: 69,617 triangles in 14 material batches, with no external textures. Its planar UV-mapped display is renamed `PhoneScreen`. The source OBJ referenced a missing MTL file, and the FBX imported without useful colours or textures, so the web model has an explicit neutral silver-and-black finish. The laptop retains its supplied materials and texture appearance, with its display named `LaptopScreen`.

Model geometry fits within the device areas. Outer scene ratios stay 16:10 on the portfolio, 16:9 in dialogs and project pages, and 1:1.05 at 600 px or less. Larger standard scenes use 66% laptop / 19% phone widths; photo-anchored Urbanist uses 60% / 19%. At 600 px or less, devices use 62% / 25%. Placement reserves a gap between devices and their loading/fallback previews while keeping both displays facing the viewer.

## Shared configuration

`portfolioDeviceModels` in `src/lib/device-models.ts` is shared by both projects. `scene.models` can override either device for a particular project. Prepared GLB entries use this shape:

```ts
export const portfolioDeviceModels: NonNullable<DeviceSceneLayout['models']> = {
  laptop: {
    src: '/models/laptop/laptop.glb',
    format: 'glb',
    screenName: 'LaptopScreen',
    screenFlipY: true,
    rotation: [25, -6, 0],
  },
  phone: {
    src: '/models/phone/phone.glb',
    format: 'glb',
    screenName: 'PhoneScreen',
    screenFlipY: true,
    rotation: [0, -10, 0],
  },
};
```

Both prepared models face +Z with +Y upright. The phone's configured rotation adds a slight presentation angle. `screenName` must exactly match an exported UV-mapped mesh or material name. Keep the display separate so a website capture does not replace the device body.

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

The renderer uses each project's `desktop` capture for the laptop and `mobile` capture for the phone. Pebble has its supplied JPG captures; Urbanist has local WebP captures. Screens currently show static images; screen animation is reserved for a later change. A live iframe cannot supply a model texture.

To override a capture for one project while keeping the shared phone geometry:

```ts
models: {
  ...portfolioDeviceModels,
  phone: {
    ...portfolioDeviceModels.phone!,
    screenImage: '/images/urbanist-mobile.webp',
  },
},
```

Set `composition` to `'left'` or `'right'` per project. Use `backgroundPosition` and optional `mobileBackgroundPosition` to crop its `venue` image within the existing scene. `backgroundBrightness` controls the full-image brightness. Urbanist's supplied 4032 × 3024 HEIC photograph is cropped by 12.5% from the left, graded to 94% brightness and 96% saturation, and reduced to 2400 × 2057 at `/images/urbanist-location.webp`. There is no upscaling or perspective warp. The large ashtray near the center foreground is the confirmed laptop placement reference.

Urbanist uses `backgroundBrightness: 1` and `photoAnchored: true`, which disables group scroll movement and pointer tilt to keep the devices fixed to the photographed surface. Its desktop and mobile captures are `/images/urbanist-desktop.webp` and `/images/urbanist-mobile.webp`. Both displays currently show static captures; screen-scrolling animation is reserved for a later change after the template is functional. Pebble retains its logo placeholder until a venue photograph is supplied.

The preview stays visible until model resources and the first render succeed. Missing files, failed textures, an unmatched `screenName` when applying a capture, or unavailable WebGL retain the preview. Resources load near the viewport, with rendering on layout changes rather than a continuous animation loop.

