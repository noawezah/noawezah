'use client';
import Image from 'next/image';
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react';
import { DeviceModel } from '@/components/device-model';
import type { Project } from '@/lib/projects';

function readMotionPreference() {
  const system = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  try { return system || localStorage.getItem('noawezah-motion') === 'reduce'; } catch { return system; }
}
function subscribeMotionPreference(update: () => void) {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  media.addEventListener('change', update);
  window.addEventListener('storage', update);
  return () => { media.removeEventListener('change', update); window.removeEventListener('storage', update); };
}

function LiveScreen({ project, mobile }: { project: Project; mobile?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new ResizeObserver(() => node.style.setProperty('--screen-scale', String(node.clientWidth / (mobile ? 390 : 1280))));
    observer.observe(node);
    const visibility = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) { setVisible(true); visibility.disconnect(); } }, { rootMargin: '120px' });
    visibility.observe(node);
    return () => { observer.disconnect(); visibility.disconnect(); };
  }, [mobile]);
  return <div className={`live-screen ${mobile ? 'is-mobile' : ''}`} ref={ref}>{visible ? <iframe src={project.url} title={`${project.name} actual ${mobile ? 'mobile' : 'desktop'} website`} loading="lazy" tabIndex={-1} aria-hidden="true" sandbox="allow-scripts allow-same-origin" /> : null}</div>;
}

export function DeviceScene({ project, reduced = false, compact = false, eager = false }: { project: Project; reduced?: boolean; compact?: boolean; eager?: boolean }) {
  const scene = useRef<HTMLDivElement>(null);
  const preferenceReduced = useSyncExternalStore(subscribeMotionPreference, readMotionPreference, () => false);
  const motionReduced = reduced || preferenceReduced;
  const deviceAligned = Boolean(project.scene.models?.laptop && project.scene.models?.phone);
  const backgroundStyle = {
    '--venue-position': project.scene.backgroundPosition,
    '--venue-position-mobile': project.scene.mobileBackgroundPosition || project.scene.backgroundPosition,
    '--venue-brightness': project.scene.backgroundBrightness ?? .82,
  } as CSSProperties;
  const laptopPreview = <><div className="laptop-lid"><span className="laptop-camera" /><div className="laptop-screen">{project.desktop ? <Image src={project.desktop} alt={`${project.name} desktop website home page`} fill sizes="(max-width: 700px) 65vw, 55vw" loading={eager ? 'eager' : 'lazy'} /> : <LiveScreen project={project} />}</div></div><div className="laptop-base"><span /></div></>;
  const phonePreview = <><div className="phone-screen">{project.mobile ? <Image src={project.mobile} alt={`${project.name} mobile website home page`} fill sizes="(max-width: 700px) 20vw, 15vw" loading={eager ? 'eager' : 'lazy'} /> : <LiveScreen project={project} mobile />}</div><span className="phone-camera" /></>;
  useEffect(() => {
    const node = scene.current;
    if (!node || project.scene.photoAnchored || motionReduced || readMotionPreference() || window.matchMedia('(pointer: coarse)').matches) return;
    let disposed = false;
    let cleanup = () => {};
    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (disposed) return;
      gsap.registerPlugin(ScrollTrigger);
      const scrollRoot = node.closest<HTMLElement>('[data-project-scroll]');
      const context = gsap.context(() => {
        gsap.fromTo(node.querySelector('.device-mockups'), { yPercent: 9, scale: .94 }, {
          yPercent: -5, scale: 1.02, ease: 'none',
          scrollTrigger: { trigger: node, scroller: scrollRoot || undefined, start: 'top 85%', end: 'bottom 20%', scrub: .8, invalidateOnRefresh: true },
        });
      }, node);
      const observer = new ResizeObserver(() => ScrollTrigger.refresh());
      observer.observe(node);
      cleanup = () => { observer.disconnect(); context.revert(); };
    });
    return () => { disposed = true; cleanup(); };
  }, [project.slug, project.scene.photoAnchored, motionReduced]);
  function move(event: React.PointerEvent<HTMLDivElement>) {
    if (deviceAligned || project.scene.photoAnchored || motionReduced || event.pointerType !== 'mouse' || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - .5;
    const y = (event.clientY - bounds.top) / bounds.height - .5;
    event.currentTarget.style.setProperty('--tilt-x', `${-y * 4}deg`);
    event.currentTarget.style.setProperty('--tilt-y', `${x * 6}deg`);
  }
  function leave(event: React.PointerEvent<HTMLDivElement>) {
    event.currentTarget.style.setProperty('--tilt-x', '0deg');
    event.currentTarget.style.setProperty('--tilt-y', '0deg');
  }
  return <div ref={scene} className={`device-scene ${project.slug} ${compact ? 'compact-scene' : ''}`} style={backgroundStyle} data-composition={project.scene.composition} data-photo-anchored={project.scene.photoAnchored || undefined} data-device-aligned={deviceAligned || undefined} data-reduced={motionReduced} onPointerMove={move} onPointerLeave={leave}>
    <Image className="venue-image" src={project.venue} alt={project.venueAlt} fill sizes="(max-width: 800px) 100vw, 90vw" loading={eager ? 'eager' : 'lazy'} />
    <div className="scene-shade" />
    <div className="device-mockups"><div className="device-perspective">
      <div className="laptop">{project.scene.models?.laptop ? <DeviceModel key={`${project.slug}-laptop`} asset={project.scene.models.laptop} screenImage={project.desktop} modelFrame={deviceAligned ? { height: .75, bottom: .93 } : undefined} label={`${project.name} on a laptop`} fallback={laptopPreview} /> : laptopPreview}</div>
      <div className="phone">{project.scene.models?.phone ? <DeviceModel key={`${project.slug}-phone`} asset={project.scene.models.phone} screenImage={project.mobile} modelFrame={deviceAligned ? { height: .75, bottom: .93 } : undefined} label={`${project.name} on a phone`} fallback={phonePreview} /> : phonePreview}</div>
    </div></div>
    <div className="scene-caption"><span>{project.name} / IN ITS ELEMENT</span><span>Desktop + mobile</span></div>
  </div>;
}
