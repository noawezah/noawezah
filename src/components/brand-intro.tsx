'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import './brand-intro.css';

const lines = [
  { text: 'web design.', delay: 180, duration: 360 },
  { text: 'development.', delay: 650, duration: 400 },
  { text: 'websites with character.', delay: 1160, duration: 650 },
] as const;

// The original outlined logo: the n and lime dot also form the site's favicon.
const letters = [
  { x: 593, path: 'M40 253C40 76 166 -10 325 -10C483 -10 609 76 609 253C609 429 483 515 325 515C166 515 40 429 40 253ZM200 253C200 337 249 375 325 375C400 375 449 337 449 253C449 168 400 130 325 130C249 130 200 168 200 253Z' },
  { x: 1157, path: 'M40 138C40 86 67 -10 224 -10C365 -10 414 61 433 145H473L448 85V75C448 27 475 0 523 0H634V140H561V282C561 448 439 515 300 515C159 515 50 440 50 312H200C200 358 236 385 300 385C369 385 401 360 401 319L242 297C92 276 40 225 40 138ZM200 168C200 197 224 204 272 211L401 229C401 167 343 130 255 130C228 130 200 139 200 168Z' },
  { x: 1706, path: 'M10 505 81 0H415L454 465H494L533 0H867L938 505H786L720 40H680L641 505H307L268 40H228L163 505Z' },
  { x: 2569, path: 'M40 259C40 116 129 -10 323 -10C498 -10 581 105 591 178H431C421 140 379 120 323 120C232 120 190 161 190 219H573V269C573 422 463 515 306 515C149 515 40 419 40 259ZM190 309C190 347 217 385 306 385C395 385 423 347 423 309Z' },
  { x: 3125, path: 'M40 0H537V140H170L80 110V150L537 235V505H40V365H407L497 395V355L40 270Z' },
  { x: 3627, path: 'M40 138C40 86 67 -10 224 -10C365 -10 414 61 433 145H473L448 85V75C448 27 475 0 523 0H634V140H561V282C561 448 439 515 300 515C159 515 50 440 50 312H200C200 358 236 385 300 385C369 385 401 360 401 319L242 297C92 276 40 225 40 138ZM200 168C200 197 224 204 272 211L401 229C401 167 343 130 255 130C228 130 200 139 200 168Z' },
  { x: 4206, path: 'M421 515C313 515 250 444 230 354H190L220 444V735H60V0H220V187C220 329 277 375 364 375C441 375 468 340 468 248V0H628V273C628 429 550 515 421 515Z' },
];

export function BrandIntro({ onReveal, onComplete }: { onReveal: () => void; onComplete: () => void }) {
  const overlay = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = overlay.current;
    if (!node) return;
    const content = document.getElementById('portfolio-content');
    const previousInert = content?.inert ?? false;
    if (content) content.inert = true;

    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let storedReduced = false;
    try { storedReduced = localStorage.getItem('noawezah-motion') === 'reduce'; } catch {}
    const reduced = preference.matches || storedReduced;
    node.dataset.motion = reduced ? 'reduced' : 'full';
    node.dataset.playing = 'true';

    // A finite brand sequence, independent of slow images or offscreen 3D assets.
    // CSS handles each typed character without rendering the portfolio again.
    const revealTimer = window.setTimeout(onReveal, reduced ? 1050 : 3440);
    const completeTimer = window.setTimeout(onComplete, reduced ? 1350 : 4000);
    return () => {
      window.clearTimeout(revealTimer);
      window.clearTimeout(completeTimer);
      if (content) content.inert = previousInert;
    };
  }, [onReveal, onComplete]);

  return <div ref={overlay} className="brand-intro" role="status" aria-live="polite" aria-label="Welcome to noawezah. Independent web design and development. Preparing the portfolio.">
    <div className="intro-stage" aria-hidden="true">
      <div className="intro-terminal">
        {lines.map(line => <div key={line.text} className="intro-command" style={{ '--characters': line.text.length, '--typing-delay': `${line.delay}ms`, '--typing-duration': `${line.duration}ms` } as CSSProperties}><span className="intro-prompt">&gt;</span><span className="intro-typed">{line.text}</span></div>)}
      </div>
      <div className="intro-logo">
        <svg viewBox="0 0 5059 745" fill="currentColor" focusable="false">
          <g transform="translate(-60 735) scale(1 -1)">
            <g className="intro-logo-n"><path d="M364 375C441 375 468 340 468 248V0H628V273C628 429 550 515 421 515C313 515 250 444 230 354H190L220 444V505H60V0H220V187C220 329 277 375 364 375Z" /></g>
            <g className="intro-logo-middle">{letters.map(letter => <path key={letter.x} transform={`translate(${letter.x} 0)`} d={letter.path} />)}</g>
            <g className="intro-logo-dot"><path transform="translate(4829 0)" d="M179 -10C245 -10 290 38 290 101C290 162 245 210 179 210C111 210 70 162 70 101C70 38 111 -10 179 -10Z" /></g>
          </g>
        </svg>
      </div>
    </div>
    <noscript><style>{'.brand-intro{display:none!important}html:has(.brand-intro){overflow:auto!important}'}</style></noscript>
  </div>;
}
