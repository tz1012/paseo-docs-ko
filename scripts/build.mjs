import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join, relative, dirname } from 'node:path';
import { rewriteInternalLink, relativePageLink } from './markdown.mjs';

const contentDir = 'content/ko';
const outputDir = 'dist';
const escape = (text) => text.replace(/[&<>\"]/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' })[c]);

async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => entry.isDirectory() ? files(join(dir, entry.name)) : [join(dir, entry.name)]))).flat();
}
function frontmatter(markdown) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)---\r?\n([\s\S]*)$/);
  const data = Object.fromEntries((match?.[1] || '').split(/\r?\n/).map((line) => { const i = line.indexOf(':'); return i < 0 ? [] : [line.slice(0, i).trim(), line.slice(i + 1).trim()]; }).filter(Boolean));
  return { data, body: match ? match[2] : markdown };
}
function inline(text) {
  let html = escape(text);
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/\[([^\]]+)\]\(([^\s)]+)(?:\s+[^)]*)?\)/g, (_, label, href) => `<a href="${rewriteInternalLink(href)}">${label}</a>`);
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  return html;
}
function render(markdown) {
  const lines = markdown.split(/\r?\n/); let html = ''; let code = false; let list = false;
  const closeList = () => { if (list) { html += '</ul>'; list = false; } };
  for (const line of lines) {
    if (line.startsWith('```')) { closeList(); html += code ? '</code></pre>' : `<pre><code class="language-${line.slice(3)}">`; code = !code; continue; }
    if (code) { html += `${escape(line)}\n`; continue; }
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    const item = line.match(/^[-*]\s+(.+)$/);
    if (heading) { closeList(); const level = heading[1].length; const id = heading[2].toLowerCase().replace(/[^\w가-힣]+/g, '-'); html += `<h${level} id="${id}">${inline(heading[2])}</h${level}>`; }
    else if (item) { if (!list) { html += '<ul>'; list = true; } html += `<li>${inline(item[1])}</li>`; }
    else if (!line.trim()) { closeList(); }
    else { closeList(); html += `<p>${inline(line)}</p>`; }
  }
  closeList(); return html;
}
const docs = (await files(contentDir)).filter((file) => file.endsWith('.md'));
const pages = [];
for (const file of docs) { const parsed = frontmatter(await readFile(file, 'utf8')); const label = parsed.body.match(/^#\s+(.+)$/m)?.[1] || parsed.data.nav || parsed.data.title; pages.push({ file, slug: relative(contentDir, file).replace(/\\/g, '/').replace(/\.md$/, '').replace(/\/index$/, '/index'), label, ...parsed }); }
pages.sort((a, b) => (a.data.category || '').localeCompare(b.data.category || '') || Number(a.data.order || 999) - Number(b.data.order || 999));
const categoryLabels = { Browser:'브라우저', Configuration:'설정', 'Getting started':'시작하기', Hub:'허브', Orchestration:'오케스트레이션', Providers:'프로바이더', Schedules:'일정', Troubleshooting:'문제 해결', 'TypeScript SDK':'TypeScript SDK', Workspaces:'작업공간' };
const labelOverrides = { 'hub/triggers/discord':'Discord 트리거', 'hub/self-hosting/discord-app':'Hub용 Discord', 'hub/triggers/slack':'Slack 트리거', 'hub/self-hosting/slack-app':'Hub용 Slack', 'hub/triggers/github':'GitHub 트리거', 'hub/self-hosting/github-app':'Hub용 GitHub' };
const groups = new Map(); for (const page of pages) { const category = page.data.category || '문서'; groups.set(category, [...(groups.get(category) || []), page]); }
const navFor = (current) => [...groups].map(([category, group]) => `<section><h2>${escape(categoryLabels[category] || category)}</h2>${group.map((page) => `<a href="${relativePageLink(current.slug, page.slug)}">${escape(labelOverrides[page.slug] || page.label || page.slug)}</a>`).join('')}</section>`).join('');
const style = `:root{--bg:#0c1015;--panel:#121923;--text:#e7edf6;--muted:#9ba8ba;--line:#263346;--accent:#82d6ae}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:16px/1.75 ui-sans-serif,system-ui,sans-serif}a{color:var(--accent);text-decoration:none}header{height:64px;border-bottom:1px solid var(--line);display:flex;align-items:center;padding:0 28px;font-size:20px;font-weight:700}header span{color:var(--muted);font-size:13px;margin-left:12px;font-weight:400}.layout{display:grid;grid-template-columns:270px minmax(0,780px);gap:56px;max-width:1200px;margin:auto;padding:32px 24px}nav{position:sticky;top:18px;height:calc(100vh - 100px);overflow:auto}nav section{margin-bottom:23px}nav h2{font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin:0 0 6px}nav a{display:block;color:#c7d2df;padding:3px 0;font-size:14px}main{min-width:0}.notice{padding:14px 16px;background:#13271f;border:1px solid #28583f;border-radius:8px;color:#d5f4e0;font-size:14px}h1{font-size:38px;line-height:1.2;margin:28px 0 18px}h2{margin-top:38px;line-height:1.3}h3{margin-top:28px}p{margin:14px 0}pre{overflow:auto;padding:16px;background:#101722;border:1px solid var(--line);border-radius:8px}code{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;background:#17202b;padding:2px 5px;border-radius:4px}pre code{background:none;padding:0}li{margin:4px 0}@media(max-width:760px){.layout{display:block;padding:20px}nav{position:static;height:auto;margin-bottom:30px}h1{font-size:30px}}`;
await rm(outputDir, { recursive: true, force: true });
for (const page of pages) {
  const out = join(outputDir, `${page.slug}.html`); await mkdir(dirname(out), { recursive: true });
  const original = `https://paseo.sh/docs${page.slug === 'index' ? '' : `/${page.slug.replace(/\/index$/, '')}`}`;
  const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(page.label || 'Paseo 문서')} | Paseo 한국어 문서</title><style>${style}</style></head><body><header><a href="${relativePageLink(page.slug, 'index')}">Paseo</a><span>비공식 한국어 문서</span></header><div class="layout"><nav>${navFor(page)}</nav><main><div class="notice">이 문서는 Paseo 공식 문서의 비공식 한국어 번역입니다. 내용이 다를 경우 <a href="${original}">원문</a>이 우선합니다.</div>${render(page.body)}</main></div></body></html>`;
  await writeFile(out, html, 'utf8');
}
