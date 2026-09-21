import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { protectMarkdown, restoreMarkdown, rewriteInternalLink, relativePageLink, normalizeProductNames, orderNavigationCategories } from '../scripts/markdown.mjs';
import { renderMarkdown } from '../scripts/build.mjs';

test('protects fenced code and inline code while translating prose', () => {
  const source = 'Install `paseo` now.\n\n```bash\nnpm install -g @getpaseo/cli\n```';
  const { text, tokens } = protectMarkdown(source);
  assert.equal(text.includes('npm install'), false);
  assert.equal(restoreMarkdown('지금 설치하세요 ' + text.match(/@@TOKEN_1@@/)[0], tokens).includes('`paseo`'), true);
});

test('creates valid relative links from nested documentation pages', () => {
  assert.equal(relativePageLink('hub/quickstart', 'browser'), '../browser.html');
  assert.equal(relativePageLink('hub/quickstart', 'hub/security'), './security.html');
});

test('keeps the Paseo product name in its original spelling', () => {
  assert.equal(normalizeProductNames('파세오와 파세오 데스크톱 앱'), 'Paseo와 Paseo 데스크톱 앱');
  assert.equal(normalizeProductNames('상담원이 상담원을 기다립니다.'), '에이전트가 에이전트를 기다립니다.');
  assert.equal(normalizeProductNames('심장박동을 만듭니다.'), '하트비트를 만듭니다.');
  assert.equal(normalizeProductNames('연결성을 확인합니다.'), '연결을 확인합니다.');
});

test('keeps navigation categories in the source documentation order', () => {
  assert.deepEqual(orderNavigationCategories(['Browser', 'Hub', 'Getting started', 'Workspaces']), ['Getting started', 'Workspaces', 'Browser', 'Hub']);
});

test('renders Markdown pipe tables as semantic HTML tables', () => {
  const markdown = '| 이름 | 값 |\n| --- | --- |\n| `mode` | 활성 |';
  const html = renderMarkdown(markdown);
  assert.match(html, /<table>/);
  assert.match(html, /<th>이름<\/th>/);
  assert.match(html, /<td><code>mode<\/code><\/td>/);
});

test('rewrites only Paseo documentation links to mirror paths', () => {
  assert.equal(rewriteInternalLink('/docs/workspaces'), './workspaces.html');
  assert.equal(rewriteInternalLink('https://paseo.sh/docs/hub/quickstart'), './hub/quickstart.html');
  assert.equal(rewriteInternalLink('https://github.com/getpaseo/paseo'), 'https://github.com/getpaseo/paseo');
});

test('rewrites documentation links relative to nested pages and preserves fragments', () => {
  assert.equal(
    rewriteInternalLink('/docs/plugins/reference#workspace-panels', 'plugins/index'),
    './reference.html#workspace-panels',
  );
  assert.equal(
    rewriteInternalLink('https://paseo.sh/docs/sdk/reference?tab=events#subscribe', 'plugins/index'),
    '../sdk/reference.html?tab=events#subscribe',
  );
  assert.match(
    renderMarkdown('[작업공간 패널](/docs/plugins/reference#workspace-panels)', 'plugins/index'),
    /href="\.\/reference\.html#workspace-panels"/,
  );
});

test('rewrites documentation section routes to their generated index pages', () => {
  const pageSlugs = new Set(['hub/configuration/index', 'hub/configuration/hub-yml']);
  assert.equal(
    rewriteInternalLink('/docs/hub/configuration', 'cli', pageSlugs),
    './hub/configuration/index.html',
  );
  assert.match(
    renderMarkdown('[Hub 구성](/docs/hub/configuration)', 'hub/configuration/hub-yml', pageSlugs),
    /href="\.\/index\.html"/,
  );
});

test('rewrites relative Markdown links to generated HTML pages', () => {
  const pageSlugs = new Set(['plugins/migration', 'plugins/reference', 'sdk/events']);
  assert.equal(
    rewriteInternalLink('./reference.md#button-descriptor', 'plugins/migration', pageSlugs),
    './reference.html#button-descriptor',
  );
  assert.equal(
    rewriteInternalLink('../../sdk/events.md', 'plugins/reference', pageSlugs),
    '../sdk/events.html',
  );
});

test('rewrites extensionless relative documentation links', () => {
  const pageSlugs = new Set(['plugins/migration', 'plugins/reference']);
  assert.equal(
    rewriteInternalLink('reference#settings-screens', 'plugins/migration', pageSlugs),
    './reference.html#settings-screens',
  );
  assert.equal(rewriteInternalLink('migration', 'plugins/reference', pageSlugs), './migration.html');
});

test('renders source heading IDs and Markdown headings through level six', () => {
  const html = renderMarkdown('## 작업공간 패널\n\n#### ExternalLink 속성', 'plugins/reference', undefined, [
    'workspace-panels',
    'externallink-props',
  ]);
  assert.match(html, /<h2 id="workspace-panels">작업공간 패널<\/h2>/);
  assert.match(html, /<h4 id="externallink-props">ExternalLink 속성<\/h4>/);
});

test('all generated relative links resolve to files and fragments', () => {
  const root = resolve('dist');
  const files = [];
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const file = join(directory, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (entry.name.endsWith('.html')) files.push(file);
    }
  };
  walk(root);
  const failures = [];
  for (const file of files) {
    const html = readFileSync(file, 'utf8');
    for (const match of html.matchAll(/href="([^"]+)"/g)) {
      const href = match[1];
      if (!/^(?:\.\.\/|\.\/|#)/.test(href)) continue;
      const [pathWithQuery, fragment] = href.split('#', 2);
      const relativePath = pathWithQuery.split('?', 1)[0];
      const target = relativePath ? resolve(dirname(file), relativePath) : file;
      if (!existsSync(target)) {
        failures.push(`${file}: missing ${href}`);
        continue;
      }
      if (fragment) {
        const targetHtml = readFileSync(target, 'utf8');
        const ids = new Set([...targetHtml.matchAll(/ id="([^"]+)"/g)].map((id) => id[1]));
        if (!ids.has(decodeURIComponent(fragment))) failures.push(`${file}: missing fragment ${href}`);
      }
    }
  }
  assert.deepEqual(failures, []);
});
