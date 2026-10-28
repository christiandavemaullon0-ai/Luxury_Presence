/**
 * Download the exact GoDaddy photos supplied for the assessment homepage.
 * Run: npm run assets:download
 * This script saves images in public/images and updates source references to
 * local /images/... URLs only for assets successfully downloaded.
 * Run it before deploying, so Vercel serves the locally saved copies.
 */
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(await readFile(path.join(root, 'original-image-manifest.json'), 'utf8'));
const targetDirectory = path.join(root, 'public', 'images');
await mkdir(targetDirectory, { recursive: true });
const sourceFiles = [path.join(root, 'index.html'), path.join(root, 'src', 'main.js')];
const updates = new Map();
let downloaded = 0;
let failed = 0;

for (const { filename, url } of manifest) {
  const target = path.join(targetDirectory, filename);
  let size = 0;
  try { size = (await stat(target)).size; } catch { /* missing file */ }
  if (size < 1024) {
    try {
      const response = await fetch(url, {
        headers: {
          'user-agent': 'Mozilla/5.0 (compatible; website-assessment-asset-downloader/1.0)',
          accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8'
        },
        signal: AbortSignal.timeout(25000)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.startsWith('image/')) throw new Error(`Unexpected content type: ${contentType}`);
      const bytes = new Uint8Array(await response.arrayBuffer());
      if (bytes.length < 1024) throw new Error('Unexpectedly short file');
      await writeFile(target, bytes);
      size = bytes.length;
      console.log(`✓ ${filename} (${Math.round(size/1024)} KB)`);
    } catch (error) {
      console.warn(`✗ ${filename}: ${error.message}. Kept the original URL as a fallback.`);
      failed++;
      continue;
    }
  } else {
    console.log(`✓ ${filename} (already downloaded)`);
  }
  downloaded++;
  updates.set(url, `/images/${filename}`);
}

// Update only URLs with a valid local download. The same images are shared
// between sections; all occurrences are changed automatically.
for (const file of sourceFiles) {
  let source = await readFile(file, 'utf8');
  for (const [remote, local] of updates) source = source.replaceAll(remote, local);
  await writeFile(file, source, 'utf8');
}

console.log(`\nDone: ${downloaded}/${manifest.length} original images available locally.`);
if (failed) {
  console.log(`${failed} URLs could not be fetched. Try again from another connection before submitting.`);
  process.exitCode = 1;
} else {
  console.log('Images and page references are ready for npm run build / Vercel.');
}
