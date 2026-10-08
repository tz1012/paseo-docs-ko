export function protectMarkdown(markdown) {
  const tokens = [];
  const protect = (value) => {
    const marker = `@@TOKEN_${tokens.length}@@`;
    tokens.push(value);
    return marker;
  };
  let text = markdown.replace(/```[\s\S]*?```/g, protect);
  text = text.replace(/`[^`\n]+`/g, protect);
  text = text.replace(/https?:\/\/[^\s)\]]+/g, protect);
  return { text, tokens };
}

export function restoreMarkdown(text, tokens) {
  return text.replace(/@@TOKEN_(\d+)@@/g, (_, index) => tokens[Number(index)]);
}

export function sourceHeadingIds(markdown) {
  const counts = new Map();
  const prose = markdown.replace(/^(```|~~~)[^\r\n]*\r?\n[\s\S]*?^\1\s*$/gm, '');
  return [...prose.matchAll(/^#{1,6}\s+(.+?)\s*#*\s*$/gm)].map((match) => {
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

export function rewriteInternalLink(href, fromSlug = 'index', pageSlugs) {
  const match = href.match(/^(?:https:\/\/paseo\.sh)?\/docs(?:\/([^?#]*?))?\/?([?#].*)?$/);
  if (match) {
    const path = (match[1] || 'index').replace(/\/$/, '') || 'index';
    const target = pageSlugs?.has(`${path}/index`) && !pageSlugs.has(path) ? `${path}/index` : path;
    return `${relativePageLink(fromSlug, target)}${match[2] || ''}`;
  }

  const relativeMatch = href.match(/^([^?#]+)([?#].*)?$/);
  if (!relativeMatch || relativeMatch[1].startsWith('/') || /^[a-z][a-z+.-]*:/i.test(relativeMatch[1])) return href;
  const targetParts = fromSlug.split('/');
  targetParts.pop();
  for (const part of relativeMatch[1].replace(/\.md$/, '').split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') targetParts.pop();
    else targetParts.push(part);
  }
  let target = targetParts.join('/');
  if (pageSlugs?.has(`${target}/index`) && !pageSlugs.has(target)) target = `${target}/index`;
  if (pageSlugs && !pageSlugs.has(target)) return href;
  if (!pageSlugs) return href;
  return `${relativePageLink(fromSlug, target)}${relativeMatch[2] || ''}`;
}

export function relativePageLink(fromSlug, toSlug) {
  const fromParts = fromSlug.split('/');
  fromParts.pop();
  const toParts = toSlug.split('/');
  let common = 0;
  while (common < fromParts.length && common < toParts.length && fromParts[common] === toParts[common]) common++;
  const up = fromParts.slice(common).map(() => '..');
  const path = [...up, ...toParts.slice(common)].join('/') + '.html';
  return path.startsWith('.') ? path : `./${path}`;
}

export function normalizeProductNames(text) {
  return text
    .replaceAll('파세오', 'Paseo')
    .replaceAll('상담원이', '에이전트가')
    .replaceAll('상담원을', '에이전트를')
    .replaceAll('상담원은', '에이전트는')
    .replaceAll('상담원', '에이전트')
    .replaceAll('상담사', '에이전트')
    .replaceAll('심장박동을', '하트비트를')
    .replaceAll('심장박동', '하트비트')
    .replaceAll('연결성을', '연결을')
    .replaceAll('연결성', '연결');
}

const navigationCategories = ['Getting started', 'Workspaces', 'Providers', 'Schedules', 'Orchestration', 'Browser', 'Configuration', 'TypeScript SDK', 'Hub', 'Troubleshooting'];

export function orderNavigationCategories(categories) {
  return [...categories].sort((left, right) => {
    const leftIndex = navigationCategories.indexOf(left);
    const rightIndex = navigationCategories.indexOf(right);
    return (leftIndex < 0 ? Number.MAX_SAFE_INTEGER : leftIndex) - (rightIndex < 0 ? Number.MAX_SAFE_INTEGER : rightIndex);
  });
}
