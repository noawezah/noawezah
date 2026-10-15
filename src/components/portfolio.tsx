'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ArrowRight, ArrowLeft, X, Copy, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogClose, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DeviceScene } from '@/components/device-scene';
import { ContactForm } from '@/components/contact-form';
import { Vitals } from '@/components/vitals';
import { ApproachSection } from '@/components/approach-section';
import { CursorSignature } from '@/components/cursor-signature';
import { BrandIntro } from '@/components/brand-intro';
import { projects, email, contra, type Project } from '@/lib/projects';

export function Portfolio() {
  const root = useRef<HTMLDivElement>(null);
  const workScroll = useRef(0);
  const opener = useRef<HTMLButtonElement | null>(null);
  const dialogBody = useRef<HTMLDivElement>(null);
  const nextAnimation = useRef<gsap.core.Tween | null>(null);
  const pendingFocus = useRef<(() => void) | null>(null);
  const headlineAnimation = useRef<gsap.core.Tween | null>(null);
  const introRevealed = useRef(false);
  const [introPlaying, setIntroPlaying] = useState(true);
  const revealIntro = useCallback(() => { introRevealed.current = true; headlineAnimation.current?.play(); }, []);
  const completeIntro = useCallback(() => { introRevealed.current = true; headlineAnimation.current?.play(); setIntroPlaying(false); }, []);
  const [projectSlug, setProjectSlug] = useState<string>(projects[0].slug);
  const project = projects.find(item => item.slug === projectSlug) ?? projects[0];
  const [open, setOpen] = useState(false);
  const [manualReduced, setManualReduced] = useState(false);
  const [systemReduced, setSystemReduced] = useState(false);
  const [copied, setCopied] = useState(false);
  const reduced = manualReduced || systemReduced;
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setSystemReduced(preference.matches);
    update();
    try { setManualReduced(localStorage.getItem('noawezah-motion') === 'reduce'); } catch {}
    preference.addEventListener('change', update);
    const footer = root.current?.querySelector<HTMLElement>('.site-footer');
    const measureFooter = () => { if (footer) root.current?.style.setProperty('--footer-height', footer.getBoundingClientRect().height + 'px'); };
    const footerObserver = new ResizeObserver(measureFooter);
    if (footer) footerObserver.observe(footer);
    measureFooter();
    return () => { preference.removeEventListener('change', update); footerObserver.disconnect(); if (pendingFocus.current) window.removeEventListener('scrollend', pendingFocus.current); };
  }, []);
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const previousScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = reduced ? 'auto' : '';
    let disposed = false;
    let cleanup = () => {};
    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (disposed) return;
      gsap.registerPlugin(ScrollTrigger);
      const home = node.querySelector<HTMLElement>('.home-chapter')!;
      const work = node.querySelector<HTMLElement>('.work-chapter')!;
      const context = gsap.context(() => {
        if (!reduced && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          if (!introRevealed.current) headlineAnimation.current = gsap.from('.headline-line', { yPercent: 112, skewY: 4, duration: .68, stagger: .11, ease: 'power3.out', clearProps: 'transform', paused: true });
          gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach(el => gsap.from(el, { y: 24, opacity: .4, duration: .5, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } }));
          gsap.utils.toArray<HTMLElement>('[data-approach-reveal]').forEach(el => {
            gsap.from(el, { opacity: 0, y: 28, duration: .85, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 86%', toggleActions: 'play none none reverse' } });
          });
          gsap.utils.toArray<HTMLElement>('[data-process-step]').forEach((el, index) => {
            gsap.fromTo(el, { opacity: 0, y: 72 + index * 12 }, { opacity: 1, y: 0, ease: 'none', scrollTrigger: { trigger: el, start: 'top 94%', end: 'top 58%', scrub: .55 } });
          });
        }
      }, node);
      const media = gsap.matchMedia();
      media.add('(min-width: 900px) and (min-height: 600px) and (hover: hover) and (pointer: fine)', () => {
        if (reduced || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const track = node.querySelector('.chapter-track');
        const back = node.querySelector<HTMLButtonElement>('.back-home')!;
        const rows = [...node.querySelectorAll<HTMLButtonElement>('.project-index .project-row')];
        const cue = node.querySelector('.work-scroll-cue');
        let backVisible = false;
        let cueVisible = false;
        gsap.set(back, { autoAlpha: 0, y: 8 });
        gsap.set(cue, { autoAlpha: 0, y: 8 });
        back.disabled = true;
        rows.forEach(row => { row.disabled = true; });
        function hideBack() {
          showCue(false);
          if (!backVisible) return;
          backVisible = false;
          back.disabled = true;
          gsap.killTweensOf(back);
          gsap.set(back, { autoAlpha: 0, y: 8 });
        }
        function revealBack() {
          if (backVisible) return;
          backVisible = true;
          back.disabled = false;
          gsap.to(back, { autoAlpha: 1, y: 0, duration: .35, ease: 'power3.out' });
        }
        function showCue(show: boolean) {
          if (cueVisible === show) return;
          cueVisible = show;
          gsap.killTweensOf(cue);
          gsap.to(cue, { autoAlpha: show ? 1 : 0, y: show ? 0 : 8, duration: show ? .35 : .15, ease: 'power3.out' });
        }
        let active = -1;
        const timeline = gsap.timeline({ onUpdate: function(this: gsap.core.Timeline) {
          const progress = this.progress();
          if (progress >= .56 && (this.scrollTrigger?.progress || 0) >= .56) revealBack();
          else hideBack();
          showCue(progress >= .56 && progress < .84 && (this.scrollTrigger?.progress || 0) >= .56);
          rows.forEach((row, index) => { row.disabled = progress <= .62 + index * .08; });
        }, scrollTrigger: {
          trigger: '.chapter-shell', start: () => 'top top+=' + (node.querySelector('.site-nav')?.getBoundingClientRect().height || 86), end: () => '+=' + window.innerHeight * 2.3, pin: true, scrub: .7, invalidateOnRefresh: true, refreshPriority: 1,
          onRefresh: self => { workScroll.current = self.start + (self.end - self.start) * .565; },
          onUpdate: self => {
            if (self.progress < .56) hideBack();
            const chapter = self.progress >= .28 ? 1 : 0;
            if (chapter !== active) { active = chapter; home.inert = chapter === 1; work.inert = chapter === 0; home.setAttribute('aria-hidden', String(chapter === 1)); work.setAttribute('aria-hidden', String(chapter === 0)); }
          },
          onScrubComplete: self => { if (self.progress >= .56) revealBack(); },
        }});
        timeline.to(track, { x: () => -home.getBoundingClientRect().width, duration: .56, ease: 'none' }, 0)
          .to(node, { '--chapter-bg': '#181a13', duration: .54, ease: 'none' }, 0)
          .to('.ghost-mark', { x: -70, rotation: 2, duration: .56, ease: 'none' }, 0)
          .to('.signal-ribbon', { rotation: 0, autoAlpha: 0, duration: .16, ease: 'none' }, .36)
          .fromTo('.work-chapter h2', { autoAlpha: .15 }, { autoAlpha: 1, duration: .2, ease: 'none' }, .36)
          .fromTo(rows, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: .14, stagger: .08, ease: 'power2.out' }, .62)
          .fromTo('.work-bottom', { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: .08, ease: 'power2.out' }, .84)
          .to({}, { duration: .08 }, .92);
        const trigger = timeline.scrollTrigger;
        workScroll.current = trigger ? trigger.start + (trigger.end - trigger.start) * .565 : 0;
        work.inert = true;
        work.setAttribute('aria-hidden', 'true');
        return () => { gsap.killTweensOf([back, cue]); gsap.set(back, { clearProps: 'opacity,visibility,transform' }); gsap.set(cue, { clearProps: 'opacity,visibility,transform' }); back.disabled = false; rows.forEach(row => { row.disabled = false; }); home.inert = false; work.inert = false; home.removeAttribute('aria-hidden'); work.removeAttribute('aria-hidden'); workScroll.current = 0; };
      }, node);
      media.add('(max-width: 899px), (max-height: 599px), (pointer: coarse)', () => {
        if (reduced || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        gsap.from('.project-index .project-row', { opacity: 0, y: 24, duration: .5, stagger: .14, ease: 'power3.out', scrollTrigger: { trigger: work, start: 'top 78%', once: true } });
      }, node);
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      cleanup = () => { media.revert(); context.revert(); headlineAnimation.current = null; };
    });
    return () => { disposed = true; cleanup(); document.documentElement.style.scrollBehavior = previousScrollBehavior; };
  }, [reduced]);
  useEffect(() => {
    if (!open) { nextAnimation.current?.kill(); if (dialogBody.current) dialogBody.current.style.clipPath = ''; }
    return () => { nextAnimation.current?.kill(); };
  }, [open]);
  function navigate(destination: 'home' | 'work' | 'approach' | 'contact') {
    if (pendingFocus.current) { window.removeEventListener('scrollend', pendingFocus.current); pendingFocus.current = null; }
    const node = document.getElementById(destination);
    const navHeight = root.current?.querySelector('.site-nav')?.getBoundingClientRect().height || 86;
    const top = destination === 'home' ? 0 : destination === 'work' && workScroll.current ? workScroll.current : (node?.getBoundingClientRect().top || 0) + window.scrollY - navHeight;
    window.scrollTo({ top, behavior: reduced ? 'instant' : 'smooth' });
    if (destination !== 'home') {
      const focus = () => { pendingFocus.current = null; const heading = document.getElementById(destination + '-title'); const bounds = heading?.getBoundingClientRect(); if (bounds && bounds.top >= navHeight && bounds.top < window.innerHeight && (destination !== 'work' || Math.abs(bounds.left - window.innerWidth * .04) < 80)) heading?.focus({ preventScroll: true }); };
      if (reduced || Math.abs(window.scrollY - top) < 1) focus(); else { pendingFocus.current = focus; window.addEventListener('scrollend', focus, { once: true }); }
    }
  }
  function navigateSection(event: React.MouseEvent<HTMLAnchorElement>, destination: 'approach' | 'contact') {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    window.history.replaceState(null, '', '#' + destination);
    navigate(destination);
  }
  function openProject(selected: Project, button: HTMLButtonElement) {
    nextAnimation.current?.kill();
    opener.current = button;
    setProjectSlug(selected.slug);
    setOpen(true);
  }
  function moveRow(event: React.PointerEvent<HTMLButtonElement>) {
    if (reduced || event.pointerType !== 'mouse' || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - bounds.left, y = event.clientY - bounds.top;
    event.currentTarget.style.setProperty('--pointer-x', x + 'px');
    event.currentTarget.style.setProperty('--pointer-y', y + 'px');
    event.currentTarget.style.setProperty('--hover-x', (x / bounds.width - .5) * 16 + 'px');
    event.currentTarget.dataset.pointer = 'true';
  }
  function moveHero(event: React.PointerEvent<HTMLElement>) {
    if (reduced || event.pointerType !== 'mouse' || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--mark-x', ((event.clientX - bounds.left) / bounds.width - .5) * 28 + 'px');
    event.currentTarget.style.setProperty('--mark-y', ((event.clientY - bounds.top) / bounds.height - .5) * 20 + 'px');
  }
  async function nextProject() {
    const next = project.slug === 'pebble' ? projects[1] : projects[0];
    const body = dialogBody.current;
    if (!body || reduced) { setProjectSlug(next.slug); return; }
    const { gsap } = await import('gsap');
    nextAnimation.current?.kill();
    nextAnimation.current = gsap.to(body, { clipPath: 'inset(0 0 0 100%)', duration: .22, ease: 'power2.in', onComplete: () => {
      setProjectSlug(next.slug);
      body.closest<HTMLElement>('[data-project-scroll]')?.scrollTo({ top: 0, behavior: 'instant' });
      gsap.set(body, { clipPath: 'inset(0 100% 0 0)' });
      nextAnimation.current = gsap.to(body, { clipPath: 'inset(0 0 0 0)', duration: .4, ease: 'power3.out', clearProps: 'clipPath' });
    }});
  }
  async function copyEmail() {
    try { await navigator.clipboard.writeText(email); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch { setCopied(false); }
  }
  function toggleMotion() {
    const next = !manualReduced;
    setManualReduced(next);
    try { localStorage.setItem('noawezah-motion', next ? 'reduce' : 'full'); } catch {}
  }
  return <Dialog open={open} onOpenChange={setOpen}>
    {introPlaying ? <BrandIntro onReveal={revealIntro} onComplete={completeIntro} /> : null}
    <div ref={root} id="portfolio-content" className="portfolio" data-reduced={reduced}>
    <Vitals /><CursorSignature disabled={reduced || open || introPlaying} /><a href="#main" className="skip-link">Skip to content</a>
    <header className="site-nav"><button className="wordmark" onClick={() => navigate('home')} aria-label="Noawezah home">noawezah<span>.</span></button><span className="nav-meta">Independent web design<br />Ahad Zaidi / Bucharest</span><nav aria-label="Main navigation"><button onClick={() => navigate('work')}>Work <ArrowUpRight size={15} aria-hidden /></button><a href="#approach" onClick={event => navigateSection(event, 'approach')}>Approach</a><a href="#contact" className="nav-contact" onClick={event => navigateSection(event, 'contact')}>Let’s talk <ArrowUpRight size={16} aria-hidden /></a></nav></header>
    <main id="main">
      <div className="chapter-shell" id="home"><div className="chapter-track">
        <section className="home-chapter" aria-labelledby="home-title" onPointerMove={moveHero} onPointerLeave={event => { event.currentTarget.style.setProperty('--mark-x', '0px'); event.currentTarget.style.setProperty('--mark-y', '0px'); }}><div className="chapter-meta"><span>Small businesses. Strong identities.</span><span>Web design &amp; development</span></div><h1 id="home-title" aria-label="Local business. Uncommon websites."><span className="headline-mask"><span className="headline-line">LOCAL BUSINESS.</span></span><span className="headline-mask"><span className="headline-line accent">UNCOMMON</span></span><span className="headline-mask"><span className="headline-line">WEBSITES.</span></span></h1><div className="home-bottom"><p>Your place has character.<br />Your website could, too.</p><button className="work-cta" onClick={() => navigate('work')}>Explore selected work <span><ArrowUpRight size={28} aria-hidden /></span></button></div><div className="signal-ribbon" aria-hidden><span>REAL PLACES.</span><span>DIGITAL PRESENCE.</span><span>REAL PLACES.</span></div><span className="ghost-mark" aria-hidden><span>n.</span></span><span className="scroll-cue mono">Scroll to meet the work <ArrowRight size={15} aria-hidden /></span></section>
        <section className="work-chapter" id="work" aria-labelledby="work-title"><div className="chapter-meta"><button onClick={() => navigate('home')} className="back-home"><ArrowLeft size={16} aria-hidden /> Back to home</button></div><h2 id="work-title" tabIndex={-1}>BUILT FOR<br /><span className="accent">THEIR WORLD.</span></h2><div className="project-index">{projects.map((p: Project) => <button key={p.slug} className="project-row" onClick={event => openProject(p, event.currentTarget)} onPointerMove={moveRow} onPointerLeave={event => { delete event.currentTarget.dataset.pointer; event.currentTarget.style.setProperty('--hover-x', '0px'); }} aria-label={`Explore ${p.name} project`}><span className="project-number mono">{p.number} / {p.category}</span><span className="project-name">{p.name}</span><span className="project-thumb"><Image src={p.workThumbnail ?? p.venue} alt="" fill sizes="160px" /></span><span className="project-action">Explore <ArrowUpRight size={24} aria-hidden /></span><span className="cursor-tether" aria-hidden /><span className="cursor-cross" aria-hidden /></button>)}</div><span className="work-scroll-cue mono">Continue scrolling to reveal the projects <ArrowRight size={15} aria-hidden /></span><div className="work-bottom"><span>Websites that feel like the places behind them.</span><a href="#contact" onClick={event => navigateSection(event, 'contact')}>Have a place in mind? <ArrowUpRight size={16} aria-hidden /></a></div></section>
      </div></div>
      <section className="in-context section-pad" aria-labelledby="context-title"><div className="context-heading" data-reveal><h2 id="context-title">THE PLACE.<br /><span className="accent">THE PRESENCE.</span></h2><p>A website is another way<br />to step inside your business.<br />It could feel like it belongs.</p></div>{projects.map(p => <article className="project-feature" key={p.slug}><div className="feature-heading"><div><span className="mono">{p.number} / {p.category} / BUCHAREST</span><h3>{p.name}</h3></div><span className={`project-status ${p.slug === 'pebble' ? 'status-progress' : ''}`}>{p.status}</span></div><div className="scene-open"><DeviceScene project={p} reduced={reduced} /><button className="scene-open-label" onClick={event => openProject(p, event.currentTarget)} aria-label={`Explore ${p.name} project`}>Explore project <ArrowUpRight size={18} aria-hidden /></button></div><div className="feature-description"><p>{p.title}<br /><span>{p.subtitle}</span></p><Link href={`/work/${p.slug}`}>Project details <ArrowUpRight size={18} aria-hidden /></Link></div></article>)}</section>
      <ApproachSection />
      <section id="contact" className="contact section-pad" aria-labelledby="contact-title"><h2 id="contact-title" tabIndex={-1} data-reveal>LET’S MAKE<br /><span>YOUR PLACE</span><br />IMPOSSIBLE<span className="contact-last-line"> TO MISS.</span></h2><div className="contact-actions"><a className="contact-email" href={`mailto:${email}`}>{email}<ArrowUpRight size={30} aria-hidden /></a><button className="copy-email" onClick={copyEmail} aria-label={copied ? 'Email copied' : 'Copy email address'}>{copied ? <Check size={20} aria-hidden /> : <Copy size={20} aria-hidden />}</button><span role="status" className="copy-status">{copied ? 'Copied.' : ''}</span></div><p className="contact-note">Tell me about your business and what you have in mind.<br />A short email is a good place to start.</p><ContactForm /></section>
    </main><footer className="site-footer"><span>Ahad “noawezah” Zaidi<br /><span className="footer-location">Bucharest, Romania</span></span><button className="motion-toggle" onClick={toggleMotion} aria-pressed={reduced} disabled={systemReduced}>{systemReduced ? 'Motion reduced by your device' : reduced ? 'Motion reduced' : 'Reduce motion'}<span className="motion-dot" aria-hidden /></button><a href={contra} target="_blank" rel="noopener noreferrer">Also on Contra <ArrowUpRight size={15} aria-hidden /></a><button className="footer-top" onClick={() => navigate('home')}>Back to top <ArrowUpRight size={15} aria-hidden /></button></footer>
    <noscript><style>{'.chapter-track{display:block!important;width:100%!important}.home-chapter,.work-chapter{width:100%!important}.chapter-shell{height:auto!important}'}</style><p>Project details: <a href="/work/pebble">Pebble</a> · <a href="/work/urbanist">Urbanist</a>. Email: <a href={`mailto:${email}`}>{email}</a>.</p></noscript>
  </div>
  <DialogContent data-reduced={reduced} data-project-scroll onCloseAutoFocus={event => { event.preventDefault(); opener.current?.focus({ preventScroll: true }); }}>
    <div className="project-dialog-header"><span className="mono">{project.number} / {project.category} / BUCHAREST</span><DialogClose asChild><Button variant="ghost" className="close-project">Close project <X size={24} aria-hidden /></Button></DialogClose></div>
    <div className="project-body" ref={dialogBody}><div className="project-intro"><div><span className="mono">{project.location}</span><DialogTitle className="project-dialog-title">{project.name}</DialogTitle><DialogDescription className="project-dialog-description">{project.title}<br />{project.subtitle}</DialogDescription></div><div className="project-intro-aside"><span className="mono">WEB DESIGN<br />DEVELOPMENT</span><a href={project.url} target="_blank" rel="noopener noreferrer">Visit live website <ArrowUpRight size={18} aria-hidden /></a><span className="mono project-progress">{project.status}</span></div></div><DeviceScene project={project} reduced={reduced} /><div className="project-story"><p>{project.description}</p><div><span className="mono">THE FOCUS</span><ul>{project.focus.map(item => <li key={item}>{item}</li>)}</ul><Link href={`/work/${project.slug}`}>Open project page <ArrowUpRight size={16} aria-hidden /></Link></div></div></div>
    <button className="next-project" onClick={nextProject}>Next project / {project.slug === 'pebble' ? 'Urbanist' : 'Pebble'}<ArrowRight size={30} aria-hidden /></button>
  </DialogContent></Dialog>;
}
