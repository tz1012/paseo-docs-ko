import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join, relative, dirname } from 'node:path';
import { protectMarkdown, restoreMarkdown } from './markdown.mjs';

const source = process.env.PASEO_DOCS_SOURCE || '.upstream/public-docs';
const target = 'content/ko';

async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => entry.isDirectory() ? files(join(dir, entry.name)) : [join(dir, entry.name)]));
  return nested.flat();
}

async function translate(text) {
  if (!/[A-Za-z]{3}/.test(text)) return text;
  const query = new URLSearchParams({ client: 'gtx', sl: 'en', tl: 'ko', dt: 't', q: text });
  const response = await fetch(`https://translate.googleapis.com/translate_a/single?${query}`);
  if (!response.ok) throw new Error(`Translation failed: ${response.status}`);
  const body = await response.json();
  return body[0].map((part) => part[0]).join('');
}

async function translateMarkdown(markdown) {
  const { text, tokens } = protectMarkdown(markdown);
  const parts = text.split(/(\n\s*\n)/);
  const translated = [...parts];
  const batches = [];
  let batch = []; let length = 0;
  for (let index = 0; index < parts.length; index++) {
    const part = parts[index];
    if (!part.trim() || /^\s*---[\s\S]*---\s*$/.test(part)) continue;
    if (length + part.length > 1500 && batch.length) { batches.push(batch); batch = []; length = 0; }
    batch.push(index); length += part.length;
  }
  if (batch.length) batches.push(batch);
  for (const group of batches) {
    const marker = '\n\n@@PARAGRAPH@@\n\n';
    const result = await translate(group.map((index) => parts[index]).join(marker));
    const values = result.split(/\s*@@PARAGRAPH@@\s*/);
    if (values.length !== group.length) throw new Error('Translation altered paragraph markers');
    group.forEach((index, offset) => { translated[index] = values[offset]; });
  }
  return restoreMarkdown(translated.join(''), tokens);
}

await rm(target, { recursive: true, force: true });
const queue = (await files(source)).filter((file) => file.endsWith('.md'));
for (const file of queue) {
  const output = join(target, relative(source, file));
  const markdown = await readFile(file, 'utf8');
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, await translateMarkdown(markdown), 'utf8');
  process.stdout.write(`translated ${relative(source, file)}\n`);
}
