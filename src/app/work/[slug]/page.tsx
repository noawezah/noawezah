import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { projects, email } from '@/lib/projects';
import { DeviceScene } from '@/components/device-scene';
export function generateStaticParams() { return projects.map(p => ({ slug: p.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = projects.find(project => project.slug === slug);
  return { title: p ? `${p.name} — Web design & development` : 'Project not found', description: p?.description };
}
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find(p => p.slug === slug);
  if (!project) notFound();
  const next = project.slug === 'pebble' ? projects[1] : projects[0];
  return <main className="standalone-project"><header className="standalone-header"><Link className="wordmark" href="/">noawezah<span>.</span></Link><Link href="/"><ArrowLeft size={18} aria-hidden /> Back to portfolio</Link></header><article><div className="project-intro"><div><span className="mono">{project.location}</span><h1 className="project-dialog-title">{project.name}</h1><p className="project-dialog-description">{project.title}<br />{project.subtitle}</p></div><div className="project-intro-aside"><span className="mono">WEB DESIGN<br />DEVELOPMENT</span><a href={project.url} target="_blank" rel="noopener noreferrer">Visit live website <ArrowUpRight size={18} aria-hidden /></a><span className="mono project-progress">{project.status}</span></div></div><DeviceScene project={project} eager /><div className="project-story"><p>{project.description}</p><div><span className="mono">THE FOCUS</span><ul>{project.focus.map(item => <li key={item}>{item}</li>)}</ul><a href={`mailto:${email}`}>A website for your place? <ArrowUpRight size={16} aria-hidden /></a></div></div></article><Link className="next-project" href={`/work/${next.slug}`}>Next project / {next.name}<ArrowUpRight size={30} aria-hidden /></Link></main>;
}
