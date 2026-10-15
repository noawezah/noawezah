# Independent signal

Selected by Ahad on 10 October 2026 after the three-direction board and interactive motion study. This document is the implementation contract. The attached general site prompt is background material; the direct conversation supplies the name, email, project URLs, selected direction, and scope.

## Visual rules

- Ink `#10110f`, chalk `#f4f3e9`, acid lime `#dfff65`. Lime marks active actions and emphasis; project imagery retains the clients' own colours.
- Neue Machina Ultrabold (800) for hero and section headings and fixed navigation. Project titles request 600 and resolve to the nearest supplied cut (800). Satoshi variable for body (400), other navigation/buttons (500), and captions (400–500). Host supplied fonts locally, use swap, and reserve image dimensions.
- Oversized left-aligned type, quiet Satoshi metadata, thin dividers, offset venue compositions. No portrait, fabricated testimonials, client results, awards, or trademark claims.
- Home → selected work → individual projects → approach → email. Work is the proof; the about section stays concise. Email is the primary conversion. Contra is a quiet footer link, opening a separate tab.
- Pebble is labelled nearing completion and keeps its logo placeholder until a venue photograph is provided. Urbanist now uses the supplied interior photograph. Website screens remain visible in the supplied laptop/mobile models.
- Fixed menu keeps its original ink background throughout the site. The chapter surface alone interpolates from ink to dark green during horizontal travel.
- Hero reserves the ribbon's rotated footprint inside the first viewport; the scroll cue sits above it. No trailing lime edge survives the Work landing.
- Section index captions and their separator lines are removed; project row dividers remain.
- Natural wheel, trackpad, keyboard, and touch scrolling. No smooth-scroll proxy. On mobile, horizontal scroll choreography becomes stacked sections.
- A short, mandatory opening sequence (15 October update): command-prompt typing → original noawezah. wordmark → n. mark → page reveal, in ink/chalk/lime. Keep the portfolio mounted and loading underneath; preserve offscreen 3D lazy loading. No skip controls, fake progress bar, autoplay video, or decorative particles. Reduced motion receives a brief static brand treatment.

## Interaction map

| Effect / location | Trigger and elements | Start → end | Timing / easing | Reverse and resize | Touch / mobile / reduced motion |
| --- | --- | --- | --- | --- | --- |
| Masked headline / home | First hydrated view; three text lines | Lines below masks with a little skew → fully readable | 680 ms per line, 110 ms stagger, power3.out; immediate readable SSR content | Run once; context cleanup prevents Strict Mode duplication. Resize preserves settled state | Same small finite reveal on touch; immediate content for reduced motion |
| Home → Work horizontal chapter | Native scroll through opening on desktop; GSAP ScrollTrigger moves a two-panel track, ghost n, and ribbon | Home at x=0 → Work at x=-viewport width; Work heading then remains frozen | Scrub 0.7, pin distance 2.3×viewport height. Horizontal travel occupies progress 0–0.56; pinned Work pause occupies 0.56–1 | Fully reversible; invalidate geometry on refresh; no wheel interception | Below 900 px / viewport shorter than 600 px / coarse pointer: stacked home and work, no pin. Reduced motion: stacked content |
| Progressive project opening / Work | Continued native scroll after the horizontal travel; two project rows and footer | Rows hidden during travel → Pebble fades/lifts in at 0.62–0.76, Urbanist at 0.70–0.84; footer at 0.84–0.92; final hold through 1 | Opacity and 28 px translation scrubbed with power2.out | Reverse fades rows back out while heading stays pinned. Hidden rows cannot receive clicks or keyboard focus; revealed rows are immediately actionable | Mobile reveals rows once on entry; reduced motion presents both immediately |
| Navigation transition | Work/Home links use the corresponding natural scroll destination | Work link lands at the end of horizontal travel, before project reveal. Back to home appears only after actual rendered progress reaches 0.56 | Native smooth scroll; reveal Back to home over 350 ms power3.out after horizontal travel settles | Keep Back to home visible through the pinned project opening and hold; hide only when reversing into horizontal travel. Return Home to start | Back to home stays visible in stacked mobile/reduced-motion content; instant reduced-motion scroll |
| Project row cursor guide | Fine pointer enters/moves over a project button; guide and small venue image | Visible static row → thin lime tether, restrained image shift, accent name | CSS 180–300 ms; pointer position via CSS properties, no React render per frame | Pointer leave resets; bounds re-read on movement | Clickable full row and permanent image on touch; no guide/parallax in reduced motion |
| Project overlay | Project row click / keyboard activation; shadcn Radix Dialog | Panel right of screen → immersive project scene | 600 ms enter / 450 ms exit; cubic-bezier(.22,.68,0,1) | Close button, outside interaction, Escape; dialog restores focus and locks background. Exit cannot hide a subsequently opened project | Full-screen vertical composition; touch-scrollable detail. Reduced motion opens/closes immediately |
| Project → screens / project scene | Native scroll within project view; laptop left and phone right over artwork or a supplied venue photograph | Standard scenes: devices slightly lower → foreground emphasis. Photo-anchored scenes: devices stay fixed to the photographed surface | GSAP scrub on standard scenes; disabled when `photoAnchored` is true. The shared model template disables pointer tilt | Standard scrub reverses; refresh on dialog resize. Model renderer updates on resize and preserves equal overall device heights and common top/base levels | Static devices and stacked details on mobile; no scrub or tilt in reduced motion |
| Next project / overlay | Next project button | Current copy and scene masked out → next project revealed | 250 ms out / 400 ms in, shared ease | Cancel old timelines on close or another selection; active project is the only source of truth | Same button action; instantaneous reduced motion |
| Approach text | Each heading/copy chunk enters at top 86% | Invisible, y=28 → visible, y=0; emphasis changes word color only | 850 ms power3.out | Reverse on leaving upward; no container movement | Readable without JS; immediate reduced motion |
| Process / white Approach | Three independent steps enter top 94% → top 58% | Invisible and y=72/84/96 → visible and y=0 | Native scroll scrub 0.55, linear | Fully reversible; geometry refreshed on resize | Vertical entry on mobile; immediate reduced motion |
| White Approach watermark | White section enters and leaves the viewport | Huge low-contrast Neue Machina n. stays fixed beneath the menu; clipped to the white section | Native CSS sticky anchor, no timeline or layout footprint | Identical position on forward/back scroll; bounds follow the section and viewport | Same native positioning on mobile and reduced motion |
| Hero n. pointer response | Fine mouse moves inside home; inner n. element | Rest → up to ±14 px horizontal / ±10 px vertical translation | CSS 650 ms shared ease | Pointer leave recenters; outer element retains scroll choreography | No mouse response on touch/reduced motion |
| Selected Work cursor signature | Fine mouse inside Work only | Hidden → small lime n. offset 20 px from native cursor | One RAF per frame, 180 ms CSS follow | Hidden on section leave, scroll, keyboard, blur, or open dialog; all listeners cleaned up | Absent on touch/reduced motion |
| Contact reveal | Section enters viewport | Small y offset → settled content | 500 ms power3.out; run once | Remains visible on reverse scroll | Readable without JS; immediate reduced motion |

## Content and navigation

- Identity: Ahad “noawezah” Zaidi. Independent web design and development for local businesses, based in Bucharest.
- Contact: `mailto:MadeBy@noawezah.ro`. No pretend submission endpoint. Contact brief form composes an email draft and explicitly says so.
- Project links: `https://pebble2.vercel.app/`, `https://urbanist2.vercel.app/`.
- Contra: exact supplied URL `https://contra.com/ahad_99df5l7h/work?r=ahad_99df5l7h`.
- Direct project routes remain accessible for sharing and no-JS navigation; interactive project views use dialogs on the portfolio page.

## Quality gates

Production build and TypeScript check; desktop/tablet/mobile review; forward/back scroll and resizing; project open/next/close; anchors and external destinations; keyboard dialog containment and focus return; contact draft validation; explicit reduced-motion preference; no console errors. Record local browser timings with their conditions. Field LCP/INP/CLS require real-user data.

## Approach content refinement

Heading: YOUR BUSINESS. MY INTEREST. The copy explicitly describes AI and other tools as part of design and development, with Ahad directing decisions, refining output, and checking the details. Keyword emphasis uses foreground olive/green on chalk, never a highlight background.

## Responsive spacing and navigation — 11 October 2026

Work rows share the available viewport height; its footer remains close to the next section after the pin releases. Section padding uses bounded viewport sizing, with 32 px on phones and 36–72 px on larger displays. Approach copy/process gaps and bottom padding are reduced. Project scenes are capped at 1600 px on wide screens.

Menu links measure the current header height (86 px desktop / 75 px phone) and align section backgrounds directly beneath it. Work still targets the title-only landing at progress 0.565; projects remain hidden until further scroll. Contact reserves the remaining viewport height using a measured footer height so its anchor can align even near the end of the page. Its content is distributed through that space, and the phone headline uses four larger lines.

AI copy explains that AI and other tools improve the workflow, accelerate time-consuming work, and support faster, efficient delivery, with Ahad directing and checking the result.

## Reusable laptop and phone template — updated 15 October 2026

Each project section presents a larger laptop on the left and phone on the right. Overall device heights match, with their top edges and bases on common levels. The visible devices must not overlap, including while loading or fallback previews are visible. Both displays face the viewer at inward Y rotations: laptop `[0, 18, 0]`, phone `[0, -18, 0]`. There is no camera/model X or Z tilt, and the shared template disables pointer tilt. Pebble keeps its logo placeholder; Urbanist uses the supplied interior photograph, with the laptop covering the large foreground ashtray used as its placement reference. Background crop positions remain configurable per project without warping the perspective.

Existing section sizing stays unchanged: portfolio scenes are 16:10, dialog and standalone project scenes are 16:9, and every scene becomes 1:1.05 at 600 px and below. The laptop canvas starts at 0.5% and spans 73%; the phone starts at 69% and spans 30%. Both canvases have 92% scene height and a 4% bottom offset. Actual model bounds determine visible size and separation; section padding, the 1600 px maximum portfolio scene width, and surrounding typography retain the existing sizing contract.

The shared `portfolioDeviceModels` configuration in `src/lib/device-models.ts` reuses the supplied FBX models as GLBs with Meshopt compression. The active laptop is `/models/laptop/laptop-screen-fit.glb`; its main two-triangle display has complete 0..1 UVs, recovering the formerly cropped upper 3.3458% of the website capture. The 94 bezel/camera triangles retain their geometry under a separate dark material. Laptop geometry remains 1,306,783 triangles in 29 batches; the phone retains one complete handset. Displays named `LaptopScreen` and `PhoneScreen` use `screenFlipY: true`. The phone has a neutral silver-and-black finish because its source lacked usable materials. The laptop keeps its textures, with diffuse graphite keys and softer metal. Warm upper-left room light uses ambient/key/fill intensities of 1.1 / 1.5 / 0.25 and exposure 0.95; unlit display materials preserve the website colours.

A 28° perspective camera measures the complete model silhouette and matches overall device heights, using lens shift for a common base level without tilting the devices. Device height is 67.5% of canvas height on the portfolio, 75% in project/dialog scenes, and 39% on phones. Fallback previews use the same body-height constraints. A fit guard preserves the full keyboard and chassis; host diagnostics expose model height, top/base positions, fit adjustment, and clipping.

Captures fit in contained canvas textures at the physical display aspects: laptop 1.6024755814 and phone 0.462015622. Laptop insets are zero, allowing the website to fill the corrected display. Phone margins remain 6.5% at the top and 1.5% elsewhere, keeping the header below the Dynamic Island. `screenBackground: '#080a08'` fills unused display space with a dark tone instead of artificial pale bands inside the bezel. All website content remains visible at its original aspect ratio, with matching contain styling in fallback previews.

Laptop heroes were refreshed from the updated live websites on 15 October: `/images/urbanist-laptop-hero-v4.webp` and `/images/pebble-laptop-hero-v4.webp`. Direct client-area screenshots contain the complete 1282 × 800 website viewport with no browser chrome, captured after fonts/images load at scroll position zero. Aspect 1.6025 closely matches the physical display. No image pixels are cropped or resized; every decoded RGB value is identical after lossless WebP encoding, and source JPEG hashes remain unchanged. Preparation and checks are in `artifacts/model-work/prepare-live-laptop-v4.mjs` and `live-laptop-v4-report.json`.

Phone screens remain `/images/urbanist-phone-hero-v3.webp` and `/images/pebble-phone-hero-v3.webp`, each 375 × 770. Their earlier v3 preparation removes only 15 browser scrollbar columns from 390 × 770 screenshots, preserving full height and every retained RGB value; boundary detection is supported by 31–35 rows per phone capture. Phone safe-area proportions and runtime placement remain unchanged. Earlier assets are preserved, and screens stay static until the later scrolling-animation change.

Urbanist uses `/images/urbanist-location-20261014.webp`, a 2131 × 2057 crop made by removing 269 px from the left of the preserved 2400 × 2057 grade. This corresponds to approximately 22.3% total left crop of the original 4032 × 3024 HEIC. Brightness remains 94% and saturation 96%, with no upscaling or perspective warp. Keep the timber, custom speakers, and violet mezzanine visible. `photoAnchored: true` disables group scroll movement, while `backgroundBrightness: 1` preserves the grade.

Keep the existing device preview visible while models load, until their geometry and resources render successfully. Retain it if assets fail or WebGL is unavailable. Preserve native page scrolling and existing touch/reduced-motion behavior. Model resources load near the viewport and the renderer updates on layout changes rather than running a continuous animation loop. Configuration examples and asset packaging guidance live in `public/models/README.md`.
