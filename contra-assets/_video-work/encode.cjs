#!/usr/bin/env node
'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const { spawn } = require('node:child_process');

const FFMPEG = 'C:/Users/HP/.cache/codex-video-tools/ffmpeg.exe';
const FPS = 25;
const CROSSFADE = 0.35;
const number = value => Number(value.toFixed(6)).toString();

function resolveFile(value, manifestPath, field) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${manifestPath}: missing ${field} file path`);
  }
  return path.isAbsolute(value) ? value : path.resolve(path.dirname(manifestPath), value);
}

function makeFilter(clips) {
  const filters = [];
  clips.forEach((clip, i) => {
    filters.push(`[${i}:v]setpts=PTS-STARTPTS,fps=${FPS},scale=1600:1200:flags=lanczos,setsar=1,format=yuv420p,settb=AVTB[clip${i}]`);
  });
  let current = 'clip0';
  let duration = clips[0].duration;
  for (let i = 1; i < clips.length; i += 1) {
    const next = `join${i}`;
    filters.push(`[${current}][clip${i}]xfade=transition=fade:duration=${CROSSFADE}:offset=${number(duration - CROSSFADE)}[${next}]`);
    duration += clips[i].duration - CROSSFADE;
    current = next;
  }
  filters.push(`[${current}]fade=t=in:st=0:d=0.25,fade=t=out:st=${number(Math.max(0, duration - 0.45))}:d=0.45,format=yuv420p,setsar=1[out]`);
  return { filter: filters.join(';'), duration };
}

async function runFfmpeg(args) {
  await new Promise((resolve, reject) => {
    const child = spawn(FFMPEG, args, { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
    let diagnostics = '';
    child.stderr.on('data', chunk => {
      const message = chunk.toString();
      diagnostics = (diagnostics + message).slice(-18000);
      process.stderr.write(message);
    });
    child.once('error', reject);
    child.once('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with code ${code}.\n${diagnostics}`));
    });
  });
}

// Read the MP4 movie header to report its actual duration without requiring ffprobe.
async function mp4Duration(filePath) {
  const handle = await fs.open(filePath, 'r');
  try {
    const { size } = await handle.stat();
    async function findBox(start, end, wanted) {
      let offset = start;
      while (offset + 8 <= end) {
        const header = Buffer.alloc(16);
        const { bytesRead } = await handle.read(header, 0, Math.min(16, end - offset), offset);
        if (bytesRead < 8) break;
        let boxSize = header.readUInt32BE(0);
        const type = header.toString('ascii', 4, 8);
        let headerSize = 8;
        if (boxSize === 1) {
          if (bytesRead < 16) break;
          boxSize = Number(header.readBigUInt64BE(8));
          headerSize = 16;
        } else if (boxSize === 0) {
          boxSize = end - offset;
        }
        if (boxSize < headerSize || offset + boxSize > end) break;
        if (type === wanted) return { start: offset + headerSize, end: offset + boxSize };
        offset += boxSize;
      }
      return null;
    }
    const moov = await findBox(0, size, 'moov');
    if (!moov) throw new Error('Encoded MP4 has no movie header');
    const mvhd = await findBox(moov.start, moov.end, 'mvhd');
    if (!mvhd) throw new Error('Encoded MP4 has no duration header');
    const data = Buffer.alloc(Math.min(40, mvhd.end - mvhd.start));
    await handle.read(data, 0, data.length, mvhd.start);
    const version = data[0];
    const timescale = data.readUInt32BE(version === 1 ? 20 : 12);
    const ticks = version === 1 ? Number(data.readBigUInt64BE(24)) : data.readUInt32BE(16);
    if (!timescale) throw new Error('Encoded MP4 has an invalid duration timescale');
    return ticks / timescale;
  } finally {
    await handle.close();
  }
}

async function encode(manifestArgument) {
  const manifestPath = path.resolve(manifestArgument);
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const rawPath = resolveFile(manifest.rawPath ?? manifest.raw ?? manifest.input, manifestPath, 'raw');
  const outputPath = resolveFile(manifest.outputPath ?? manifest.output ?? manifest.mp4, manifestPath, 'output');
  if (path.extname(outputPath).toLowerCase() !== '.mp4') {
    throw new Error(`${manifestPath}: output must have an .mp4 extension`);
  }
  if (path.resolve(rawPath) === path.resolve(outputPath)) {
    throw new Error(`${manifestPath}: source and output paths must differ`);
  }
  if (!Array.isArray(manifest.clips) || !manifest.clips.length) {
    throw new Error(`${manifestPath}: clips must be a nonempty array`);
  }
  const clips = manifest.clips.map((clip, i) => {
    const start = Number(clip.start);
    const duration = Number(clip.duration);
    if (!Number.isFinite(start) || start < 0 || !Number.isFinite(duration) || duration <= CROSSFADE) {
      throw new Error(`${manifestPath}: clip ${i + 1} needs a nonnegative start and duration greater than ${CROSSFADE} seconds`);
    }
    return { start, duration, label: clip.label ?? `Clip ${i + 1}` };
  });
  await fs.access(rawPath);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  const { filter, duration: expectedDuration } = makeFilter(clips);
  const slug = manifest.slug ?? path.basename(outputPath, '.mp4');
  console.log(`Encoding ${slug}: ${clips.length} clips, approximately ${number(expectedDuration)} seconds`);
  const inputs = clips.flatMap(clip => [
    '-threads', '4', '-ss', number(clip.start), '-t', number(clip.duration), '-i', rawPath,
  ]);
  await runFfmpeg([
    '-hide_banner', '-loglevel', 'warning', '-nostats', '-nostdin', '-y', '-filter_complex_threads', '2', ...inputs,
    '-filter_complex', filter, '-map', '[out]', '-an',
    '-c:v', 'libx264', '-threads', '4', '-preset', 'medium', '-crf', '18',
    '-pix_fmt', 'yuv420p', '-r', String(FPS), '-movflags', '+faststart',
    outputPath,
  ]);
  const duration = await mp4Duration(outputPath);
  const { size: fileBytes } = await fs.stat(outputPath);
  const summary = {
    slug,
    manifestPath,
    rawPath,
    outputPath,
    duration,
    expectedDuration,
    fileBytes,
    width: 1600,
    height: 1200,
    aspectRatio: '4:3',
    fps: FPS,
    codec: 'H264',
    crossfadeSeconds: CROSSFADE,
    clips,
  };
  const summaryPath = manifest.summaryPath
    ? resolveFile(manifest.summaryPath, manifestPath, 'summary')
    : outputPath.replace(/\.mp4$/i, '.summary.json');
  await fs.mkdir(path.dirname(summaryPath), { recursive: true });
  await fs.writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);
  console.log(JSON.stringify({ slug, outputPath, summaryPath, duration, fileBytes }));
}

async function main() {
  const manifests = process.argv.slice(2);
  if (!manifests.length) {
    throw new Error('Usage: node encode.cjs manifest.json [another-manifest.json ...]');
  }
  for (const manifest of manifests) await encode(manifest);
}

main().catch(error => {
  console.error(error.stack ?? error.message);
  process.exitCode = 1;
});
