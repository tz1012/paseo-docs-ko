import { readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const sourceDir = process.env.PASEO_DOCS_SOURCE || '.upstream/public-docs';
const output = join(dirname(fileURLToPath(import.meta.url)), 'source-heading-ids.json');

async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => entry.isDirectory()
    ? files(join(directory, entry.name))
    : [join(directory, entry.name)]))).flat();
}

function headingIds(markdown) {
  const counts = new Map();
  return [...markdown.matchAll(/^#{1,6}\s+(.+?)\s*#*\s*$/gm)].map((match) => {
    const base = match[1]
      .replace(/!?\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/<[^>]*>/g, '')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, '')
      .trim()
      .replace(/\s+/g, '-');
    const count = counts.get(base) || 0;
    counts.set(base, count + 1);
    return count ? `${base}-${count}` : base;
  });
}

const ids = {};
for (const file of (await files(sourceDir)).filter((file) => file.endsWith('.md')).sort()) {
  const slug = relative(sourceDir, file).replace(/\\/g, '/').replace(/\.md$/, '');
  ids[slug] = headingIds(await readFile(file, 'utf8'));
}
await writeFile(output, `${JSON.stringify(ids, null, 2)}\n`, 'utf8');
console.log(`wrote ${Object.keys(ids).length} document heading maps to ${output}`);
