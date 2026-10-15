# noawezah

Ahad “noawezah” Zaidi’s English portfolio. Built with Next.js App Router, React, Tailwind CSS, GSAP/ScrollTrigger, Three.js device rendering, and custom-styled shadcn/Radix dialog and button primitives.

## Run

```sh
npm install
npm run dev
```

Open http://localhost:3000. Production: `npm run build` followed by `npm start`. TypeScript: `npm run typecheck`.

## Experience

Native desktop scrolling moves from Home to Work through a pinned horizontal chapter. Mobile, touch, and reduced motion use stacked content. Project dialogs slide in, contain focus, close with Escape, restore the opener, and include a next-project transition. Shareable routes are `/work/pebble` and `/work/urbanist`.

Contact is email-first. The brief form prepares a local `mailto:` draft; it does not submit to a backend or send email. Contra is a separate-tab footer link. No analytics or visitor data storage is added. A local preference remembers reduced motion.

## Assets

- Project backgrounds: Urbanist uses `public/images/urbanist-location-20261014.webp`, a 2131 × 2057 crop derived from the preserved HEIC conversion and moderate grade. No upscaling or perspective distortion is applied. The laptop covers the large foreground ashtray used as its placement reference. Pebble keeps its SVG logo placeholder until its venue photograph arrives. Configure `venue`, `venueAlt`, and crop positions in `src/lib/projects.ts`.
- Work-list thumbnail: Urbanist uses the separate `public/images/urbanist-thumbnail-retouched-v2.webp`. A local manual retouch removes the large foreground ashtray and its shadow, rebuilding the grid, tabletop, and bench edge from nearby pixels. The original scene photograph stays unchanged. Configure optional `workThumbnail` per project; otherwise the row uses `venue`.
- Pebble and Urbanist desktop/mobile captures: refreshed from both live sites on 14 October 2026 at the top of each home page. The versioned `{project}-laptop-hero-v3.webp` images are 1267 × 791, and `{project}-phone-hero-v3.webp` images are 375 × 770. These proportions match the usable displays; only the 15 px browser scrollbar is removed, with every retained website pixel and the full capture height preserved. Original captures remain available. Screens stay static until the later animation change. Projects without capture files retain the deferred live iframe preview, which depends on the client deployment remaining frameable and available.
- Supplied laptop and phone models: the FBX files are prepared once as compressed web GLBs under `public/models/laptop` and `public/models/phone`. Device shapes, keyboard, and screens are preserved; excessive laptop speaker grille microdetail is simplified. OBJ and FBX remain supported for future replacements. See [public/models/README.md](public/models/README.md) for model preparation and screen mapping.
- Fonts: supplied Neue Machina Light, Regular, and Ultrabold OTF files, plus Satoshi variable WOFF2 from the local full-family archive. Satoshi licence retained in `public/fonts/Satoshi-FFL.txt`. Fixed navigation uses Neue Machina Ultrabold; copy and other controls use Satoshi. The earlier asset preparation script is not needed for these supplied fonts.

## Reusable device scenes

Every project uses the same laptop-and-phone template on the portfolio, in its dialog, and on its `/work/[slug]` page. Backgrounds use `object-fit: cover`, leaving the existing scene sizing intact: 16:10 on the portfolio, 16:9 in dialogs and project pages, and 1:1.05 at widths of 600 px or less. Larger devices occupy a 73% laptop canvas starting at 0.5% and a 30% phone canvas starting at 69%; both canvases are 92% of scene height with a 4% bottom offset. The visible device bodies share the same overall height, top edge, and base level, with space between them.

`portfolioDeviceModels` in `src/lib/device-models.ts` reuses the supplied models across projects; `scene.models` can override either device per project. Laptop and phone rotate inward by +18° and −18° around Y, with no camera or model X/Z tilt and no pointer tilt. A 28° perspective camera matches overall device heights and uses lens shift for their common vertical placement; fallback previews follow the same body-height rules. The active laptop asset is `/models/laptop/laptop-screen-fit.glb`, whose corrected main display UVs recover the capture's previously cropped upper 3.3458%. The phone uses one complete handset with a neutral silver/black finish; the laptop keeps its geometry and textures, with diffuse graphite keys and softer metal under warm room lighting.

The existing preview stays visible until model geometry, materials, textures, and the first render succeed, and remains the fallback if loading or WebGL fails. A UV-mapped screen mesh or material receives the project's `desktop` / `mobile` capture through `screenName`, or an explicit `screenImage`. Captures are fitted with their full aspect ratio using contained canvas textures and matching fallback styling. The laptop uses its entire display, while the phone's safe top margin keeps the header below the Dynamic Island. Dark display padding avoids bright strips around the website. No website content is cropped or stretched.

Urbanist uses `photoAnchored: true` to keep the devices fixed to the photographed surface, with no group scroll movement. Its graded photograph uses `backgroundBrightness: 1`; the scene does not darken the whole image a second time. Model rendering is deferred until the scene approaches the viewport and updates on resize instead of running a continuous animation loop. A fit guard preserves the complete keyboard and chassis, with model-height, fit, and clipping diagnostics available on the canvas host. Section ratios and surrounding spacing remain the sizing contract. Screen scrolling is reserved for a later change after this static template is functional.

The concept and every major interaction are documented in `design.md`. Local verification notes are in `verification.md`. Public deployment and domain configuration can use the normal Vercel Next.js workflow; no project credentials are required for local preview.

Opt-in local performance logging: visit `/?measure=1` in a production build and read the `[local-vitals]` console records. These are local observations, not real-user field metrics.

## Browser icon and sharing preview

The browser icon uses the outlined `n.` from the supplied logo geometry, with a chalk letter and lime dot on ink. SVG, multi-size ICO, Apple touch icon, and 192/512 px manifest icons are generated by `node scripts/prepare-brand-assets.cjs`. The source logo kit is preserved.

The full-wordmark social card is `public/images/noawezah-social-v1.png` (1200×630). Root Open Graph and Twitter metadata explicitly select it, including on shared project URLs. `metadataBase` resolves its URL to `https://noawezah.ro/images/noawezah-social-v1.png`. These source changes must be deployed for the public domain to serve them.
