import test from 'node:test';
import assert from 'node:assert/strict';
import { protectMarkdown, restoreMarkdown, rewriteInternalLink, relativePageLink } from '../scripts/markdown.mjs';

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

test('rewrites only Paseo documentation links to mirror paths', () => {
  assert.equal(rewriteInternalLink('/docs/workspaces'), './workspaces.html');
  assert.equal(rewriteInternalLink('https://paseo.sh/docs/hub/quickstart'), './hub/quickstart.html');
  assert.equal(rewriteInternalLink('https://github.com/getpaseo/paseo'), 'https://github.com/getpaseo/paseo');
});
