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

export function rewriteInternalLink(href) {
  const match = href.match(/^(?:https:\/\/paseo\.sh)?\/docs(?:\/(.*))?\/?$/);
  if (!match) return href;
  const path = match[1] || 'index';
  return `./${path}.html`;
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
    .replaceAll('상담사', '에이전트');
}

const navigationCategories = ['Getting started', 'Workspaces', 'Providers', 'Schedules', 'Orchestration', 'Browser', 'Configuration', 'TypeScript SDK', 'Hub', 'Troubleshooting'];

export function orderNavigationCategories(categories) {
  return [...categories].sort((left, right) => {
    const leftIndex = navigationCategories.indexOf(left);
    const rightIndex = navigationCategories.indexOf(right);
    return (leftIndex < 0 ? Number.MAX_SAFE_INTEGER : leftIndex) - (rightIndex < 0 ? Number.MAX_SAFE_INTEGER : rightIndex);
  });
}
