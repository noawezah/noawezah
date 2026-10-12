import { portfolioDeviceModels, type DeviceSceneLayout } from '@/lib/device-models';

export type Project = {
  slug: string;
  number: string;
  name: string;
  category: string;
  location: string;
  title: string;
  subtitle: string;
  description: string;
  focus: readonly string[];
  venue: string;
  venueAlt: string;
  desktop: string | null;
  mobile: string | null;
  url: string;
  status: string;
  scene: DeviceSceneLayout;
};

export const email = 'MadeBy@noawezah.ro';
export const contra = 'https://contra.com/ahad_99df5l7h/work?r=ahad_99df5l7h';
export const projects = [
  {
    slug: 'pebble', number: '01', name: 'PEBBLE', category: 'CAFÉ', location: 'Bucharest / Café',
    title: 'A slower kind of morning.', subtitle: 'A warmer digital welcome.',
    description: 'A small café with a character of its own. The website brings its warm, unhurried atmosphere online and makes the essentials easy to find: the place, the coffee, and the way in.',
    focus: ['An atmosphere you can feel', 'A clear route to the café', 'A considered mobile experience'],
    venue: '/images/pebble-logo.svg', venueAlt: 'Pebble logo placeholder — final artwork pending',
    desktop: '/images/pebble-desktop.jpg', mobile: '/images/pebble-mobile.jpg',
    scene: { composition: 'left', backgroundPosition: '62% 50%', mobileBackgroundPosition: '60% 40%', models: portfolioDeviceModels },
    url: 'https://pebble2.vercel.app/', status: 'Nearing completion',
  },
  {
    slug: 'urbanist', number: '02', name: 'URBANIST', category: 'BAR', location: 'Bucharest / Sound house',
    title: 'Sound, culture, and late nights.', subtitle: 'An identity with a pulse.',
    description: 'A place in between coffee, culture, and after hours. The website gives its different scenes one shared home, with the menu, music, and location close at hand.',
    focus: ['An expressive visual identity', 'A menu made to explore', 'Sound, culture, and practical details'],
    venue: '/images/urbanist-location.webp', venueAlt: 'The Urbanist interior with timber tables, custom speakers, and the violet mezzanine',
    desktop: '/images/urbanist-desktop.webp', mobile: '/images/urbanist-mobile.webp',
    scene: { composition: 'right', backgroundPosition: '50% 50%', mobileBackgroundPosition: '77% 50%', photoAnchored: true, backgroundBrightness: 1, models: portfolioDeviceModels },
    url: 'https://urbanist2.vercel.app/', status: 'Selected project',
  },
] as const satisfies readonly Project[];
