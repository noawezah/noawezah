# Independent signal

Selected by Ahad on 10 October 2026 after the three-direction board and interactive motion study. This document is the implementation contract. The attached general site prompt is background material; the direct conversation supplies the name, email, project URLs, selected direction, and scope.

## Visual rules

- Ink `#10110f`, chalk `#f4f3e9`, acid lime `#dfff65`. Lime marks active actions and emphasis; project imagery retains the clients' own colours.
- Neue Machina Ultrabold (800) for hero and section headings and fixed navigation. Project titles request 600 and resolve to the nearest supplied cut (800). Satoshi variable for body (400), other navigation/buttons (500), and captions (400–500). Host supplied fonts locally, use swap, and reserve image dimensions.
- Oversized left-aligned type, quiet Satoshi metadata, thin dividers, offset venue compositions. No portrait, fabricated testimonials, client results, awards, or trademark claims.
- Home → selected work → individual projects → approach → email. Work is the proof; the about section stays concise. Email is the primary conversion. Contra is a quiet footer link, opening a separate tab.
- Pebble is labelled nearing completion. User correction: venue photographs must be replaced by blank artwork labelled “Pebble logo” and “Urbanist logo” until final files are provided. Website screens remain visible in laptop/mobile compositions.
- Fixed menu keeps its original ink background throughout the site. The chapter surface alone interpolates from ink to dark green during horizontal travel.
- Hero reserves the ribbon's rotated footprint inside the first viewport; the scroll cue sits above it. No trailing lime edge survives the Work landing.
- Section index captions and their separator lines are removed; project row dividers remain.
- Natural wheel, trackpad, keyboard, and touch scrolling. No smooth-scroll proxy. On mobile, horizontal scroll choreography becomes stacked sections.
- No loading screen, fake progress bar, autoplay video, or decorative particles.

## Interaction map

| Effect / location | Trigger and elements | Start → end | Timing / easing | Reverse and resize | Touch / mobile / reduced motion |
| --- | --- | --- | --- | --- | --- |
| Masked headline / home | First hydrated view; three text lines | Lines below masks with a little skew → fully readable | 680 ms per line, 110 ms stagger, power3.out; immediate readable SSR content | Run once; context cleanup prevents Strict Mode duplication. Resize preserves settled state | Same small finite reveal on touch; immediate content for reduced motion |
| Home → Work horizontal chapter | Native scroll through opening on desktop; GSAP ScrollTrigger moves a two-panel track, ghost n, and ribbon | Home at x=0 → Work at x=-viewport width; Work heading then remains frozen | Scrub 0.7, pin distance 2.3×viewport height. Horizontal travel occupies progress 0–0.56; pinned Work pause occupies 0.56–1 | Fully reversible; invalidate geometry on refresh; no wheel interception | Below 900 px / viewport shorter than 600 px / coarse pointer: stacked home and work, no pin. Reduced motion: stacked content |
| Progressive project opening / Work | Continued native scroll after the horizontal travel; two project rows and footer | Rows hidden during travel → Pebble fades/lifts in at 0.62–0.76, Urbanist at 0.70–0.84; footer at 0.84–0.92; final hold through 1 | Opacity and 28 px translation scrubbed with power2.out | Reverse fades rows back out while heading stays pinned. Hidden rows cannot receive clicks or keyboard focus; revealed rows are immediately actionable | Mobile reveals rows once on entry; reduced motion presents both immediately |
| Navigation transition | Work/Home links use the corresponding natural scroll destination | Work link lands at the end of horizontal travel, before project reveal. Back to home appears only after actual rendered progress reaches 0.56 | Native smooth scroll; reveal Back to home over 350 ms power3.out after horizontal travel settles | Keep Back to home visible through the pinned project opening and hold; hide only when reversing into horizontal travel. Return Home to start | Back to home stays visible in stacked mobile/reduced-motion content; instant reduced-motion scroll |
| Project row cursor guide | Fine pointer enters/moves over a project button; guide and small venue image | Visible static row → thin lime tether, restrained image shift, accent name | CSS 180–300 ms; pointer position via CSS properties, no React render per frame | Pointer leave resets; bounds re-read on movement | Clickable full row and permanent image on touch; no guide/parallax in reduced motion |
| Project overlay | Project row click / keyboard activation; shadcn Radix Dialog | Panel right of screen → immersive project scene | 600 ms enter / 450 ms exit; cubic-bezier(.22,.68,0,1) | Close button, outside interaction, Escape; dialog restores focus and locks background. Exit cannot hide a subsequently opened project | Full-screen vertical composition; touch-scrollable detail. Reduced motion opens/closes immediately |
| Project → screens / project scene | Native scroll within project view; laptop and phone move over the neutral artwork placeholder | Devices slightly lower → clear foreground emphasis | GSAP scrub across scene, transforms only; pointer tilt max 3° on fine pointer | Scrub reverses; refresh on dialog resize. No scene measurement before the dialog is open | Static devices and stacked details on mobile; no scrub or tilt in reduced motion |
| Next project / overlay | Next project button | Current copy and scene masked out → next project revealed | 250 ms out / 400 ms in, shared ease | Cancel old timelines on close or another selection; active project is the only source of truth | Same button action; instantaneous reduced motion |
| Approach text | Each heading/copy chunk enters at top 86% | Invisible, y=28 → visible, y=0; emphasis changes word color only | 850 ms power3.out | Reverse on leaving upward; no container movement | Readable without JS; immediate reduced motion |
| Process / white Approach | Three independent steps enter top 94% → top 58% | Invisible and y=72/84/96 → visible and y=0 | Native scroll scrub 0.55, linear | Fully reversible; geometry refreshed on resize | Vertical entry on mobile; immediate reduced motion |
| White Approach watermark | Scroll across Approach | Huge low-contrast Neue Machina n. moves yPercent 9 → -9 | Scrub 0.8, linear | Reverses on upward scroll | Same restrained scroll on touch; static reduced motion |
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
