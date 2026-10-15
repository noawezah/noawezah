# Verification — 10 October 2026

## Supplied 3D device template — 12 October 2026

- Production build and its TypeScript validation passed after the final placement changes. The temporary model-check route and its fixtures were removed before the build.
- Supplied FBX sources were prepared as reusable GLBs: laptop 12,189,568 bytes, phone 1,111,196 bytes. Phone geometry retains one complete handset (69,617 triangles, 14 material batches). Laptop body, keyboard, lid, and display geometry remain intact; only excessive speaker grille microdetail is simplified (1,306,783 final triangles, 28 material batches).
- Independent asset round trips verified the screen names, screen UVs, geometry bounds, and compressed decoding. Laptop screen UVs were restored after optimization, and its display glass was made clearer. Both websites were visually confirmed on the supplied models in the browser.
- The Urbanist HEIC was converted through the installed image converter. The web photo is 2400×2057, cropped only at the left edge with mild brightness/saturation adjustment. No upscaling or perspective warp was used. The confirmed large foreground ashtray guides laptop placement; photo-anchored scenes disable device scroll and pointer movement.
- Checked effective browser viewports of 1200×750, 390×844, and 320×780. The laptop/phone slot gaps were about 59 px, 19 px, and 15 px respectively; both models reached ready state and inspected mobile layouts had no horizontal overflow. Loading/fallback base clearance was also checked on mobile.
- Portfolio scenes retained 16:10 on desktop; the shareable project scene retained 16:9. Mobile portfolio, shareable route, and project dialog retained 1:1.05. Both models loaded in the project dialog, which closed with Escape.
- A temporary OBJ/MTL fixture verified model loading, material textures, screen replacement, and missing-file fallback. GPU resources and image bitmaps are disposed on unmount; rendering is static and updates on resize rather than running a continuous frame loop.
- Static Urbanist desktop/mobile screen captures are in place. Screen scrolling animation remains deferred as requested. Local review screenshot: `artifacts/urbanist-template-desktop.webp`.

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

## Responsive spacing and anchor alignment — 11 October 2026

- Production build and TypeScript passed after the changes; final console inspection returned no warnings/errors.
- Reviewed nominal 1440×900, 1280×640, 768×1024, 390×844, and 320×780 layouts. Inspected headline, navigation, project-title, and copy widths did not exceed their containers.
- Approach landed at top85.94 px beneath the 86 px desktop menu; tablet at86.27 px. Contact landed at86.15 px on desktop,75.04 px on the 390 px phone, and74.85 px on the narrow phone, matching the header within subpixel rounding.
- Work landed on the title-only view with both project rows at opacity0 and Back to home visible. Compact desktop rows expanded to135.98 px each, using the available height rather than leaving a blank block below them. The footer ended near the chapter edge.
- White watermark anchor stayed at86 px before and after scrolling the section from top85.94 px to-626.06 px; the glyph bounds stayed unchanged. It is clipped to the white section and takes no space in the content layout.
- Contact footer sizing removed the previous-section strip on tall displays; the enlarged four-line phone headline and distributed content avoid an empty bottom area. AI disclosure now explains faster, efficient delivery.
- Final reduced-motion smoke check: all process steps opacity1, watermark anchor still native sticky, and full motion restored afterward.

## Brand icon and social preview — 11 October 2026

- Generated the n. monogram from the supplied vector glyph outlines; the package's older generic n-only favicon was not reused. Inspected the 512 px icon and the full-wordmark 1200×630 social card visually.
- Production build passed. Crawled /, /work/pebble and /work/urbanist with facebookexternalhit/1.1: each returned200, the full brand OG/Twitter image URL, dimensions1200×630, large-image card metadata, and the expected SVG/ICO/Apple icon links. No Pebble placeholder appeared in sharing metadata.
- SVG, ICO, Apple PNG, social PNG, manifest, and 192/512 icons all returned200 with matching MIME types. Social card is19,806bytes.
- Verified locally; no public deployment or messages to social platforms were sent in this update.

## Device composition and screen refresh — 14 October 2026

- Story verified: project configuration selects the supplied GLB devices and local website captures; the shared scene loads those assets near the viewport, maps each capture to its named display, and renders the same template in portfolio sections, the project dialog, and standalone project routes.
- Production build and TypeScript passed. A fresh portfolio browser review returned no warnings or errors. The updated venue image and both models rendered successfully; no environment variables or external rendering service are required.
- Laptop remains on the wider left side of the 61.8% golden split, with the phone on the right. Models yaw inward by +18° / −18° with no X/Z tilt or parent pointer tilt. Perspective lens shift positions them without pitching the camera.
- Actual display geometry measured equal heights: 361.440 px for both at the 1536 px standalone review; 263.952 px in both 1280 px portfolio scenes; 300.480 px in the project dialog. Both fit guards reported no clipping or size clamping. Standalone device bounds reserved an 89.49 px gap; portfolio device bases aligned within 1 px after the final offset adjustment.
- At nominal 390 and 320 px mobile widths, both displays measured 88.230 and 71.910 px respectively. No clipping, fit clamping, device overlap, or document overflow was found. The narrow view reserved a 50.18 px gap. Loading/fallback displays use the same height rule and measured within 1 px of one another in the desktop dialog.
- Existing outer sizing remains 16:10 for portfolio sections, 16:9 for project/dialog views, and 1:1.05 at 600 px or less. Project-dialog opening, Escape dismissal, and focus restoration to the Urbanist opener passed. Temporary browser size overrides were reset and the Urbanist preview was retained.
- Desktop and mobile Urbanist hero captures were refreshed from the current live site and stored as versioned WebP assets. Warm upper-left room lighting, a diffuse graphite keyboard, and softened metal improve device readability; unlit display materials preserve the website colours.
- The photograph retains its existing moderate grade. A further 269 px left crop of the preserved 2400 × 2057 WebP produces the 2131 × 2057 version, without upscaling or perspective distortion. Final laptop placement covers the large reference ashtray on desktop and mobile, so no AI retouching was used.
- Saved visual evidence: `artifacts/2026-10-14/urbanist-composition-desktop.jpg`, `urbanist-composition-mobile.jpg`, and `urbanist-composition-portfolio.jpg`. Display scrolling remains deferred as requested.

## Larger devices and complete screen images — 14 October 2026

- The user clarified that equal size means matching overall device height. This supersedes the earlier equal-display-height arrangement. Both devices now share the same actual silhouette height, top level, and base level; the phone display is naturally taller inside its body.
- Exact projected geometry verified both devices at 590.250 px overall height in the 1536 px standalone and dialog views, and 518.400 px in the portfolio scene. Both top and bottom coordinates matched. At actual 390 px mobile width, heights were 141.960 / 141.970 px, with identical bases and a 20.68 px gap. A 325 px narrow review also passed. Fit guards reported no clipping or clamping, and mobile pages had no horizontal overflow.
- Device canvases are enlarged to 73% laptop / 30% phone widths, with common 92% scene height. Existing scene aspect ratios and surrounding sizing remain unchanged. The project dialog opened with both models ready and dismissed with Escape. Pebble and Urbanist both rendered with the shared framing.
- Fixed the laptop's missing header: the old main display used only 96.6542% of the screen material's UV height, with the remaining part assigned to camera/bezel geometry. The versioned `laptop-screen-fit.glb` gives the actual display complete UV coverage and preserves all 94 bezel triangles under a dark material. Total geometry remains 1,306,783 triangles; preparation and invariant checks are recorded in `artifacts/model-work/laptop-screen-fit-report.json`.
- Website captures are fitted proportionally in full on display canvases with safe margins, without stretching or cutting website content. The phone's 6.5% top margin clears the Dynamic Island. Pebble's wider desktop capture also retains its complete width through letterboxing.
- Urbanist screen-fit captures remove only the 15 browser-scrollbar columns from each previous image. All website content pixels and full source height are preserved exactly after lossless decoding; original images remain unchanged. Final dimensions are 1506 × 951 desktop and 360 × 812 mobile.
- Production build and TypeScript passed after the final implementation. A fresh standalone Pebble render returned no browser warnings or errors. Saved final proof in `artifacts/2026-10-14/urbanist-overall-fit-desktop.jpg` and `urbanist-overall-fit-mobile.jpg`. Temporary preview tabs were closed and viewport overrides reset. Display scrolling remains deferred.

## Correct website proportions and scrollbar removal — 14 October 2026

- Refreshed all four screenshots from the live home pages at scroll position zero, after the hero fonts and images loaded. Pebble now shows its current hero on the phone, replacing the old footer view. Laptop screenshots use the display's proportions instead of the previous wide Pebble capture.
- Each laptop image is 1267 × 791, and each phone image is 375 × 770. The processor removes only the actual 15-column browser scrollbar, confirmed by 31–36 independent boundary rows. Lossless decode matches every retained RGB value; source hashes remain unchanged. Aspect differences from the usable display are below 0.05%. Evidence is in `artifacts/model-work/live-hero-v3-report.json`.
- The laptop fills its whole corrected display without artificial safe margins. Phone camera margins remain unchanged. Dark display padding removes the bright edge bands that resembled scrollbars, while contained textures preserve each full capture without stretching.
- Both standalone routes were checked at 1536 × 960 and 390 × 844 browser viewports. Desktop device heights remained 590.250 px each with matching top and base coordinates. Mobile heights were 141.180 / 141.190 px, with identical base coordinates and no document overflow. Neither device reported clipping or fit clamping. Saved visual checks are `artifacts/2026-10-14/{project}-screens-v3-desktop.jpg` and `{project}-screens-v3-mobile.jpg`.
- Above-the-fold fallback captures now inherit the scene's eager loading setting. Lower portfolio previews remain lazy. Display scrolling remains deferred.

## Urbanist work thumbnail retouch — 14 October 2026

- The user chose a local manual retouch after skipping Figma and Adobe. No AI or external image editor was used. A separate `urbanist-thumbnail-retouched-v2.webp` removes the large ashtray and its shadow from the foreground bench in the work-list photograph.
- Repairs use nearby pixels for the background grid, chair/tabletop, striped table edge, and sloping bench rim. Checked at full size and the small work-row crop; the removal reads cleanly at the intended thumbnail size. Source dimensions and perspective remain unchanged. All other ashtrays stay protected, and pixels outside the feathered repair area remain identical after lossless encoding.
- Optional `Project.workThumbnail` selects the retouched row image without changing the device-scene `venue` photograph. Original source hashes remain unchanged; the report and before/after comparisons are in `artifacts/2026-10-14/urbanist-retouch-report.json` and `urbanist-retouch-thumbnail-comparison-v2.png`.
- Final production build and its TypeScript validation passed. The homepage loaded the v2 thumbnail through the image optimizer; both project routes rendered the refreshed device screens. Final homepage proof is `artifacts/2026-10-14/work-thumbnail-retouched-final.jpg`. Full-resolution texture joins remain, so this retouch is intended for the small work-list image.

## Current laptop preview and project data — 15 October 2026

- The user's open Urbanist dialog still referenced the earlier `urbanist-desktop-screen-fit.webp` and `urbanist-mobile-screen-fit.webp` assets. Refreshed the existing browser tab and reopened the same project; the laptop now loads `urbanist-laptop-hero-v3.webp` with the current display settings.
- Project selection now stores only its slug and derives the displayed object from current project data. A temporary status change appeared in the already-open dialog without reopening it, then reverted correctly. The temporary value was removed before the production build.
- Independent GLTFLoader validation confirmed the laptop screen's two triangles use complete 0..1 UVs with matching linear mappings, orthogonal physical axes, and aspect 1.60247558. There is no UV shear or missing image region. Existing contained screen fitting, device positions, and body sizing remain unchanged.
- Both devices rendered ready in the user's 560 × 479 preview and the 1536 × 960 standalone view, with no clipping or fit clamping. The existing homepage hero remains selected; the supplied culture screenshot is a proportion reference. A later hero redesign will require a fresh capture when ready.
- Production build and TypeScript passed. Final visual evidence: `artifacts/2026-10-15/laptop-preview-corrected.jpg` and `laptop-scaling-desktop.jpg`.

## Updated Vercel laptop interfaces — 15 October 2026

- Checked the current `pebble2.vercel.app` and `urbanist2.vercel.app` home pages after the user's aspect-ratio deployments. Captured both at scroll position zero with loaded fonts and hero images. Urbanist's updated hero now occupies the available viewport height.
- Laptop previews now use `pebble-laptop-hero-v4.webp` and `urbanist-laptop-hero-v4.webp`. Both are direct 1282 × 800 browser-content clips, excluding browser chrome at capture time. Their aspect 1.6025 differs from the physical display by only 0.001524%. No screenshot pixels were cropped, stretched, or resized afterward; every decoded RGB value and both original JPEG hashes were preserved. Validation is recorded in `artifacts/model-work/live-laptop-v4-report.json`.
- The shared project configuration updates laptop displays in portfolio sections, project dialogs, and standalone routes. Phone images, device geometry, placement, equal body heights, lighting, and venue photographs retain their previous settings.
- Production build and TypeScript passed after the v4 paths were configured. Final visual checks are `artifacts/2026-10-15/urbanist-laptop-v4-desktop.jpg` and `pebble-laptop-v4-desktop.jpg`.
