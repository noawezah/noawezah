const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');

async function main() {
  const root = path.resolve(__dirname, '..');
  const kit = path.join(root, 'noawezah-logo-kit');
  const app = path.join(root, 'src/app');
  const publicBrand = path.join(root, 'public/brand');
  await fs.mkdir(publicBrand, { recursive: true });
  const geometry = JSON.parse(await fs.readFile(path.join(kit, 'source/logo-geometry.json'), 'utf8'));
  const letter = geometry.glyphs.find(glyph => glyph.name === 'n');
  const dot = geometry.glyphs.find(glyph => glyph.name === 'period');
  if (!letter || !dot) throw new Error('The supplied logo geometry must contain n and period outlines.');

  // Preserve the package's original outlined glyphs and tracking.
  const dotOffset = geometry.glyphs[1].x;
  const scale = 0.066;
  const left = (64 - (dotOffset + dot.bounds[2] - letter.bounds[0]) * scale) / 2 - letter.bounds[0] * scale;
  const baseline = (64 - (letter.bounds[3] - dot.bounds[1]) * scale) / 2 + letter.bounds[3] * scale;
  const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#10110f"/><g transform="translate(${left.toFixed(4)} ${baseline.toFixed(4)}) scale(${scale} -${scale})"><path fill="#f4f3e9" d="${letter.path}"/><path fill="#dfff65" transform="translate(${dotOffset} 0)" d="${dot.path}"/></g></svg>`;
  await fs.writeFile(path.join(app, 'icon.svg'), icon + '\n');
  await Promise.all([180, 192, 512].map(async size => {
    const output = size === 180 ? path.join(app, 'apple-icon.png') : path.join(publicBrand, `icon-${size}.png`);
    await sharp(Buffer.from(icon)).resize(size, size).png().toFile(output);
  }));

  const sizes = [16, 32, 48];
  const pngs = await Promise.all(sizes.map(size => sharp(Buffer.from(icon)).resize(size, size).png().toBuffer()));
  const header = Buffer.alloc(6 + sizes.length * 16);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(sizes.length, 4);
  let offset = header.length;
  sizes.forEach((size, index) => {
    const entry = 6 + index * 16;
    header[entry] = size;
    header[entry + 1] = size;
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(pngs[index].length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += pngs[index].length;
  });
  await fs.writeFile(path.join(app, 'favicon.ico'), Buffer.concat([header, ...pngs]));
  await fs.writeFile(path.join(root, 'public/site.webmanifest'), JSON.stringify({
    name: 'noawezah.', short_name: 'noawezah.',
    icons: [192, 512].map(size => ({ src: `/brand/icon-${size}.png`, sizes: `${size}x${size}`, type: 'image/png' })),
    theme_color: '#10110f', background_color: '#10110f', display: 'standalone',
  }, null, 2) + '\n');

  const logo = await sharp(path.join(kit, 'svg/noawezah-for-dark-backgrounds.svg'))
    .resize({ width: 1000 }).png().toBuffer({ resolveWithObject: true });
  const socialPath = path.join(root, 'public/images/noawezah-social-v1.png');
  await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#10110f' } })
    .composite([{ input: logo.data, left: 100, top: Math.round((630 - logo.info.height) / 2) }])
    .png({ compressionLevel: 9 }).toFile(socialPath);
  console.log('Prepared n. icons and the full-wordmark 1200 × 630 social card.');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
