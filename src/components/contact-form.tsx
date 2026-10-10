'use client';
import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { email } from '@/lib/projects';
export function ContactForm() {
  const [draft, setDraft] = useState('');
  function compose(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get('name') || '').trim();
    const message = String(data.get('message') || '').trim();
    const website = String(data.get('website') || '').trim();
    if (!name || message.length < 10) {
      const control = event.currentTarget.elements.namedItem(!name ? 'name' : 'message') as HTMLInputElement | HTMLTextAreaElement;
      control.setCustomValidity(!name ? 'Please enter your name.' : 'Please tell me a little more about your project.');
      control.reportValidity();
      return;
    }
    const body = `Hi Ahad,\n\n${message}\n\n${website ? `Current website: ${website}\n` : ''}From,\n${name}`;
    setDraft(`mailto:${email}?subject=${encodeURIComponent('Let’s build a website — ' + name)}&body=${encodeURIComponent(body)}`);
  }
  return <details className="brief-form"><summary>Tell me a little about your project <ArrowUpRight size={20} aria-hidden /></summary><form onSubmit={compose} onChange={event => { setDraft(''); const control = event.target; if (control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement) control.setCustomValidity(''); }}>
    <p>This creates a draft in your email app. Nothing is sent from this form.</p>
    <div className="form-grid"><label>Your name<input name="name" autoComplete="name" required maxLength={100} placeholder="How should I address you?" /></label><label>Current website <span>(optional)</span><input name="website" type="url" autoComplete="url" placeholder="https://" /></label></div>
    <label>Your place. Your plans.<textarea name="message" required minLength={10} maxLength={3000} rows={4} placeholder="What do you do, and what would you like your website to do for you?" /></label>
    <Button type="submit" variant="outline">Create email draft <ArrowUpRight size={18} aria-hidden /></Button>
    {draft ? <div className="draft-ready" role="status"><span>Your draft is ready.</span><a href={draft}>Open email app <ArrowUpRight size={18} aria-hidden /></a></div> : null}
  </form></details>;
}
