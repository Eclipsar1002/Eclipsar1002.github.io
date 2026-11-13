import { renderMarkdown } from './generated/preview-runtime.js';

// Only the preview pane changes. Controls, uploads and draft storage stay native.
export function registerMathPreview(CMS) {
  const h = CMS.React.createElement;
  const fields = {
    blog: [['title', '标题'], ['description', '摘要'], ['pubDate', '发布时间'], ['updatedDate', '最后修改时间'], ['tags', '标签'], ['cover', '封面'], ['attachments', 'PDF 附件'], ['body', '正文']],
    projects: [['title', '标题'], ['description', '简介'], ['date', '日期'], ['lang', '语言'], ['role', '角色或类别'], ['tags', '标签'], ['featured', '首页精选'], ['url', '项目网址'], ['repo', '源码仓库'], ['attachments', 'PDF 附件'], ['body', '正文']],
    moments: [['pubDate', '发布时间'], ['title', '标题'], ['body', '碎碎念'], ['images', '照片'], ['tags', '标签']],
  };
  CMS.registerPreviewStyle('/admin/generated/katex.min.css');
  CMS.registerPreviewStyle(`
    .atlas-math-preview { padding: 1rem; overflow-wrap: anywhere; }
    .atlas-math-preview section { margin-block: 0 1.5rem; }
    .atlas-math-preview .field-label { font-size: .8rem; opacity: .65; margin-bottom: .5rem; }
    .atlas-math-preview img { max-width: 100%; height: auto; }
    .atlas-math-preview .katex-display { overflow-x: auto; overflow-y: hidden; padding-block: .5rem; }
    .atlas-math-preview table { border-collapse: collapse; }
    .atlas-math-preview th, .atlas-math-preview td { border: 1px solid #8886; padding: .4rem .7rem; }
    .atlas-math-preview pre { overflow-x: auto; }
  `, { raw: true });
  for (const [collection, definitions] of Object.entries(fields)) {
    CMS.registerPreviewTemplate(collection, ({ entry, widgetFor, getAsset }) =>
      h('article', { className: 'atlas-math-preview' }, ...definitions.map(([name, label]) =>
        h('section', { key: name, 'data-key-path': name, tabIndex: 0 },
          h('div', { className: 'field-label' }, label),
          name === 'body'
            ? h('div', { dangerouslySetInnerHTML: { __html: renderMarkdown(entry.getIn(['data', name]), [], getAsset) } })
            : widgetFor(name)))));
  }
}
