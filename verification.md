# Verification — 10 October 2026

## Delivered experience

Next.js production build, Tailwind, custom-styled shadcn/Radix primitives, and GSAP/ScrollTrigger. Home, selected work, two shareable project routes, approach, and email-first contact. The local production preview runs at http://localhost:8766/.

## Checks completed

- Production build and its strict TypeScript validation passed. Home, project pages, metadata, robots, sitemap, and the 404 route were generated.
- Desktop, tablet, and mobile screenshots reviewed, including Home, Work, project overlays/device scenes, and contact. Tested browser widths 1280, 768, 390, and 320; observed document widths 1265, 753, 375, and 305 with scrollbars. No horizontal overflow at the inspected widths.
- Forward and reverse native scroll verified. During project reveal, the Work heading stayed at the same measured top position (185 px) before, during, and after reveal.
- Back to home stayed hidden during horizontal travel, then became visible and usable during the pinned pause. Project opacity progressed from `[0, 0]` to `[1, 0.8167]` to `[1, 1]`; reverse scroll returned to `[0.9965, 0.6215]` while the heading remained fixed.
- Final project actions work once their reveal starts; an Urbanist action was verified at opacity 0.9829 rather than requiring another scroll to activate it.
- Project open, next project, Escape, focus containment, and restoration to the original opener checked. Desktop and mobile device screens inspected. Urbanist's actual desktop and mobile pages loaded inside the devices.
- Contact required-field validation checked. A synthetic brief produced the correct encoded mailto draft. Copy email returned “Copied.” Contra's exact supplied URL and separate-tab attributes retained. No email was sent.
- Reduced-motion control checked: desktop pin removed, content stacked, and native navigation switched immediately. Device scenes also inherit the stored preference on shareable project routes and subscribe to system preference changes.
- Resize recovery and mobile stacking checked. Fine-pointer effects retain the native cursor; touch-sized controls and coarse-pointer fallbacks reviewed.
- No application console errors or warnings were returned during the final page inspections.

## Local performance observations

Before the Neue Machina/Satoshi typography update, one unthrottled local production review in the embedded Chromium browser, with a warm cache, reported:

| Metric | Observed value |
| --- | --- |
| LCP | 624 ms |
| FCP | 624 ms |
| TTFB | 33.5 ms |
| INP | Not returned reliably by the embedded-browser capture |
| CLS | Not returned reliably by the embedded-browser capture |

These measurements are a prior-font baseline, not measurements of the current typography build. They are individual local observations, not a Lighthouse score, a mobile-network simulation, or real-user field metrics. No INP/CLS threshold pass is claimed. Real-user metrics need a deployed site and field data.

## Remaining asset and device constraints

- Project artwork intentionally uses blank “Pebble logo” / “Urbanist logo” placeholders. Venue photos were removed from the portfolio assets at the user's request.
- Pebble uses existing desktop/mobile captures. Urbanist currently uses lazy live embeds; local screenshots can replace them through `src/lib/projects.ts` without changing the device composition.
- Viewport testing used the browser's size controls. Physical touch hardware and an OS-level reduced-motion toggle were not exercised; the in-site reduced-motion control and corresponding code paths were checked.

## Typography update

Supplied Neue Machina files and local Satoshi variable font installed. Fixed navigation uses Neue Machina 800; hero and section headings use 800; project titles request 600 and resolve to the nearest supplied 800 cut. Body and captions use Satoshi 400, other navigation and buttons 500. Layout widths checked after replacing the condensed type; production build passed.

## Layout and motion refinement

- Desktop hero tested at nominal 1870×965 and 1280×760: rotated ribbon remains inside the viewport, with the scroll cue above it and a tighter header-to-content gap. Browser dimensions can change with the app pane; measurements use the DOM viewport at each inspection.
- Chapter background interpolated through rgba(20,22,17,1) before settling at rgb(24,26,19). The fixed menu remained rgb(16,17,15). Ribbon opacity was zero at the settled Work landing; no lime side fragment remained.
- Work heading measured at top160px through title-only and project reveal states in the compact desktop layout. Rows progressed from opacity0 to Pebble0.7853/Urbanist0, then both1; Back to home remained enabled.
- Cursor n. is restricted to the Work chapter; the hero mark has its own restrained pointer translation. The native cursor remains.
- Process pin measurements corrected with priority/sort/refresh. A verified Approach scroll state showed process opacity1, 0.9724, 0.2212 respectively, with progressively offset vertical transforms and a visible low-contrast n. watermark.
- Keyword backgrounds verified transparent; word colors use olive/green. Copy uses MY INTEREST, Web design & development, could, and the requested MadeBy@noawezah.ro capitalization. AI and other tools are disclosed explicitly.
- Section index captions, separators, and the Selected work / 02 projects label removed. Mobile headings/menu checked at 390 and 320 widths without horizontal text overflow; tablet headings/menu checked at768.
- Final reduced-motion check: chapter track display:block/transform:none, cursor display:none, all process rows opacity1/transform:none. Restored full motion for the delivered preview. Final console inspection returned no warnings/errors. Approach copy stays accessible to assistive technology while opacity animates.
