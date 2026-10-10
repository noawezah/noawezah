# noawezah

Ahad “noawezah” Zaidi’s English portfolio. Built with Next.js App Router, React, Tailwind CSS, GSAP/ScrollTrigger, and custom-styled shadcn/Radix dialog and button primitives.

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

- Project artwork: blank SVG placeholders labelled “Pebble logo” and “Urbanist logo”, as requested. Replace `public/images/pebble-logo.svg` and `public/images/urbanist-logo.svg` with final artwork or update the paths in `src/lib/projects.ts`. Venue photographs are not displayed.
- Pebble desktop/mobile captures: existing `pebble2/docs/previews` project assets, included locally.
- Urbanist devices: actual live website embeds, loaded near the scene. Replace `desktop` and `mobile` values in `src/lib/projects.ts` with local screenshots when available; the device component automatically uses them. Live embeds depend on the client deployment remaining frameable and available.
- Fonts: supplied Neue Machina Light, Regular, and Ultrabold OTF files, plus Satoshi variable WOFF2 from the local full-family archive. Satoshi licence retained in `public/fonts/Satoshi-FFL.txt`. Fixed navigation uses Neue Machina Ultrabold; copy and other controls use Satoshi. The earlier asset preparation script is not needed for these supplied fonts.

The concept and every major interaction are documented in `design.md`. Local verification notes are in `verification.md`. Public deployment and domain configuration can use the normal Vercel Next.js workflow; no project credentials are required for local preview.

Opt-in local performance logging: visit `/?measure=1` in a production build and read the `[local-vitals]` console records. These are local observations, not real-user field metrics.
