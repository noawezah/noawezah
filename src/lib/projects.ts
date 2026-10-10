export const email = 'madeby@noawezah.ro';
export const contra = 'https://contra.com/ahad_99df5l7h/work?r=ahad_99df5l7h';
export const projects = [
  {
    slug: 'pebble', number: '01', name: 'PEBBLE', category: 'CAFÉ', location: 'Bucharest / Café',
    title: 'A slower kind of morning.', subtitle: 'A warmer digital welcome.',
    description: 'A small café with a character of its own. The website brings its warm, unhurried atmosphere online and makes the essentials easy to find: the place, the coffee, and the way in.',
    focus: ['An atmosphere you can feel', 'A clear route to the café', 'A considered mobile experience'],
    venue: '/images/pebble-logo.svg', venueAlt: 'Pebble logo placeholder — final artwork pending',
    desktop: '/images/pebble-desktop.jpg', mobile: '/images/pebble-mobile.jpg',
    url: 'https://pebble2.vercel.app/', status: 'Nearing completion',
  },
  {
    slug: 'urbanist', number: '02', name: 'URBANIST', category: 'BAR', location: 'Bucharest / Sound house',
    title: 'Sound, culture, and late nights.', subtitle: 'An identity with a pulse.',
    description: 'A place in between coffee, culture, and after hours. The website gives its different scenes one shared home, with the menu, music, and location close at hand.',
    focus: ['An expressive visual identity', 'A menu made to explore', 'Sound, culture, and practical details'],
    venue: '/images/urbanist-logo.svg', venueAlt: 'Urbanist logo placeholder — final artwork pending',
    desktop: null, mobile: null,
    url: 'https://urbanist2.vercel.app/', status: 'Selected project',
  },
] as const;
export type Project = (typeof projects)[number];
