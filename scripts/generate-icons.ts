/**
 * Rode: npx tsx scripts/generate-icons.ts
 * Requer: npm install -D sharp
 */
import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join } from 'path';

const iconsDir = join(__dirname, '..', 'public', 'icons');

async function generate() {
  for (const size of [192, 512]) {
    const svg = readFileSync(join(iconsDir, `icon-${size}.svg`));
    await sharp(svg).png().toFile(join(iconsDir, `icon-${size}.png`));
    console.log(`✓ icon-${size}.png gerado`);
  }
}

generate();
