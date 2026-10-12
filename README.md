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

- Project backgrounds: Urbanist uses the supplied HEIC interior photograph, cropped and moderately graded into `public/images/urbanist-location.webp` without upscaling or perspective distortion. The large ashtray near the center foreground marks the laptop's placement. Pebble keeps its SVG logo placeholder until its venue photograph arrives. Configure `venue`, `venueAlt`, and crop positions in `src/lib/projects.ts`.
- Pebble desktop/mobile captures: existing `pebble2/docs/previews` project assets, included locally.
- Urbanist desktop/mobile captures: local WebP screenshots in `public/images/urbanist-desktop.webp` and `public/images/urbanist-mobile.webp`. Screens currently show static captures; screen animation is reserved for a later change. Projects without capture files retain the deferred live iframe preview, which depends on the client deployment remaining frameable and available.
- Supplied laptop and phone models: the FBX files are prepared once as compressed web GLBs under `public/models/laptop` and `public/models/phone`. Device shapes, keyboard, and screens are preserved; excessive laptop speaker grille microdetail is simplified. OBJ and FBX remain supported for future replacements. See [public/models/README.md](public/models/README.md) for model preparation and screen mapping.
- Fonts: supplied Neue Machina Light, Regular, and Ultrabold OTF files, plus Satoshi variable WOFF2 from the local full-family archive. Satoshi licence retained in `public/fonts/Satoshi-FFL.txt`. Fixed navigation uses Neue Machina Ultrabold; copy and other controls use Satoshi. The earlier asset preparation script is not needed for these supplied fonts.

## Reusable device scenes

Every project uses the same laptop-and-phone template on the portfolio, in its dialog, and on its `/work/[slug]` page. `src/lib/projects.ts` selects a left or right composition and separate desktop/mobile background crop positions. Backgrounds use `object-fit: cover`, leaving the existing scene sizing intact: 16:10 on the portfolio, 16:9 in dialogs and project pages, and 1:1.05 at widths of 600 px or less. Device placement reserves a gap between the laptop and phone, including the loading previews. Larger standard scenes use 66% laptop / 19% phone widths; photo-anchored Urbanist uses 60% / 19%. At 600 px or less the devices use 62% / 25%. Both displays face the viewer and remain readable.

`portfolioDeviceModels` in `src/lib/device-models.ts` reuses the supplied models across projects; `scene.models` can override either device per project. The phone source contained several device copies; its web file contains one complete front-facing handset. Its silver/black finish was added because the supplied OBJ lacked its MTL file and the FBX imported with neutral placeholder materials and no textures. The laptop uses its supplied material appearance and a full display mapping for the website capture.

The existing preview stays visible until model geometry, materials, textures, and the first render succeed, and remains the fallback if loading or WebGL fails. A UV-mapped screen mesh or material receives the project's `desktop` / `mobile` capture through `screenName`, or an explicit `screenImage`. Static captures keep the screens legible without live iframe texture rendering.

Urbanist uses `photoAnchored: true` to keep the devices fixed to the photographed surface, with no group scroll movement or pointer tilt. Its graded photograph uses `backgroundBrightness: 1`; the scene does not darken the whole image a second time. Model rendering is deferred until the scene approaches the viewport and updates on resize instead of running a continuous animation loop. Section ratios and surrounding spacing remain the sizing contract; device placement accommodates the supplied models and their separation. Screen scrolling is reserved for a later change after this static template is functional.

The concept and every major interaction are documented in `design.md`. Local verification notes are in `verification.md`. Public deployment and domain configuration can use the normal Vercel Next.js workflow; no project credentials are required for local preview.

Opt-in local performance logging: visit `/?measure=1` in a production build and read the `[local-vitals]` console records. These are local observations, not real-user field metrics.

## Browser icon and sharing preview

The browser icon uses the outlined `n.` from the supplied logo geometry, with a chalk letter and lime dot on ink. SVG, multi-size ICO, Apple touch icon, and 192/512 px manifest icons are generated by `node scripts/prepare-brand-assets.cjs`. The source logo kit is preserved.

The full-wordmark social card is `public/images/noawezah-social-v1.png` (1200×630). Root Open Graph and Twitter metadata explicitly select it, including on shared project URLs. `metadataBase` resolves its URL to `https://noawezah.ro/images/noawezah-social-v1.png`. These source changes must be deployed for the public domain to serve them.
