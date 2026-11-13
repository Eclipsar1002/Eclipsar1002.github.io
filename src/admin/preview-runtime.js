import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import remarkDisplayMath from '../config/remarkDisplayMath.mjs';
import { normalizeMathDelimiters } from '../config/remarkLatexDelimiters.mjs';

function previewReferences() {
  return (tree, file) => {
    const visit = node => {
      if (['code', 'inlineCode', 'link', 'image', 'html'].includes(node.type) || !node.children) return;
      node.children = node.children.flatMap(child => {
        if (child.type !== 'text') { visit(child); return child; }
        const result = []; let end = 0;
        for (const match of child.value.matchAll(/(?<!!)\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g)) {
          if (match.index > end) result.push({ type: 'text', value: child.value.slice(end, match.index) });
          const doc = file.data.documents.find(doc => doc.id === match[1] || doc.title === match[1]);
          result.push({ type: 'link', url: `/blog/${encodeURI(doc?.id || match[1]).replace(/[()]/g, encodeURIComponent)}/`,
            children: [{ type: 'text', value: match[2] || doc?.title || match[1] }] });
          end = match.index + match[0].length;
        }
        if (!result.length) return child;
        if (end < child.value.length) result.push({ type: 'text', value: child.value.slice(end) });
        return result;
      });
    };
    visit(tree);
  };
}
const processor = unified().use(remarkParse).use(remarkGfm).use(remarkMath)
  .use(remarkDisplayMath).use(previewReferences).use(remarkRehype)
  .use(rehypeKatex, { throwOnError: false, strict: 'ignore', trust: false })
  .use(rehypeStringify);

export function renderMarkdown(value, documents = [], getAsset) {
  const source = normalizeMathDelimiters(value || '');
  const html = String(processor.processSync({ value: source, data: { documents } }));
  // A detached DOM lets us replace pending uploads with the CMS blob previews.
  const container = document.createElement('div');
  container.innerHTML = html;
  if (getAsset) container.querySelectorAll('img').forEach(img => {
    const src = img.getAttribute('src');
    if (!src || !src.startsWith('/uploads/')) return;
    const asset = getAsset(src);
    if (asset?.toString) img.src = asset.toString();
  });
  return container.innerHTML;
}
