import './approach-section.css';

const process = [
  {
    number: '01',
    title: 'Understand',
    emphasis: 'the place',
    description: 'The people, the atmosphere, and what visitors need to find. Every decision starts with your business.',
  },
  {
    number: '02',
    title: 'Give it a',
    emphasis: 'digital identity',
    description: 'A visual direction and an experience shaped around your business. A presence that feels like yours.',
  },
  {
    number: '03',
    title: 'Build it',
    emphasis: 'to work',
    description: 'Responsive development, considered motion, and the details checked before launch. Made to feel right and work well.',
  },
] as const;

export function ApproachSection() {
  return (
    <section id="approach" className="approach approach-section section-pad" aria-labelledby="approach-title">
      <div className="approach-watermark" aria-hidden="true"><span>n.</span></div>

      <div className="approach-layout">
        <h2 id="approach-title" className="approach-reveal" data-approach-reveal>
          YOUR BUSINESS.<br /><span>MY INTEREST.</span>
        </h2>

        <div className="approach-copy">
          <p className="large-copy approach-reveal" data-approach-reveal>
            I’m Ahad. I design and build <mark>websites</mark> for businesses with a <mark>world of their own.</mark>
          </p>
          <p className="approach-reveal" data-approach-reveal>
            So far, that has meant a café and a bar. The next place might be yours. I’m interested in what makes <mark>your business different,</mark> then turning that into a website that feels right and works well.
          </p>
          <p className="approach-tools approach-reveal" data-approach-reveal>
            I work with <mark>AI and other tools</mark> throughout the design and development process. I direct the decisions, refine the output, and check the details myself.
          </p>
          <span className="signature approach-reveal" data-approach-reveal>Ahad “noawezah” Zaidi</span>
        </div>
      </div>

      <ol className="process-list" aria-label="My process">
        {process.map(step => (
          <li className="process-row" data-process-step key={step.number}>
            <span className="process-number" aria-hidden="true">{step.number}<span>.</span></span>
            <h3>{step.title}<br /><span>{step.emphasis}</span></h3>
            <p>{step.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
