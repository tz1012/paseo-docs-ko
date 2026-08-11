import test from 'node:test';
import assert from 'node:assert/strict';
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
