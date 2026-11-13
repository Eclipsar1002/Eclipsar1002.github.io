import { renderMarkdown } from './generated/preview-runtime.js';
import { initializeDrafts, currentDraftKey, listDrafts, getDraft, saveCurrentDraft,
  saveDraftMedia, subscribeDrafts, restoreDraft, createReferenceDraft, deleteDraft, setDraftFolderReader } from './drafts.js';

const commands = [
  { id: 'h2', label: '二级标题', text: '\n\n## 标题\n\n' },
  { id: 'h3', label: '三级标题', text: '\n\n### 标题\n\n' },
  { id: 'line', label: '分割线', text: '\n\n---\n\n' },
  { id: 'table', label: '表格', text: '\n\n| 项目 | 说明 |\n| --- | --- |\n| 内容 | 内容 |\n| 内容 | 内容 |\n\n' },
  { id: 'math', label: '公式', text: '\n\n$$\nx = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}\n$$\n\n' },
  { id: 'quote', label: '引用块', text: '\n\n> 引用内容\n\n' },
  { id: 'code', label: '代码块', text: '\n\n```text\n代码\n```\n\n' },
  { id: 'image', label: '图片' }, { id: 'pdf', label: 'PDF 附件' },
  { id: 'reference', label: '文档引用' },
];
export function getOutline(markdown) {
  let fence = null; let offset = 0; const headings = [];
  for (const line of markdown.split('\n')) {
    const marker = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (marker) { if (!fence) fence = marker[1]; else if (marker[1][0] === fence[0] && marker[1].length >= fence.length) fence = null; }
    if (!fence) {
      const match = line.match(/^(#{1,6})\s+(.+?)(?:\s+#+)?\s*$/);
      if (match) headings.push({ depth: match[1].length, text: match[2], offset });
    }
    offset += line.length + 1;
  }
  return headings;
}

export function registerWritingEditor(CMS) {
  initializeDrafts(CMS);
  const base = CMS.getWidget('markdown');
  const h = window.h;
  class WritingControl extends base.control {
    constructor(props) {
      super(props);
      this.state = { ...this.state, documents: [], drafts: [], active: 0 };
    }
    componentDidMount() {
      super.componentDidMount();
      setDraftFolderReader(() => (this.props.getEntry?.() || this.props.entry)?.getIn?.(['meta', 'path']));
      this.refreshDrafts = async () => {
        try {
          const drafts = (await listDrafts()).sort((a, b) => b.updatedAt - a.updatedAt);
          if (this.alive) this.setState({ drafts, draftMessage: '草稿自动保存在此浏览器（包括粘贴图片），发布后清理。' });
        } catch (error) { if (this.alive) this.setState({ draftMessage: error.message }); }
      };
      this.unsubscribeDrafts = subscribeDrafts(this.refreshDrafts);
      this.refreshDrafts();
      getDraft(currentDraftKey()).then(draft => {
        if (this.alive && draft) this.setState({ recoverable: draft });
      }).catch(error => this.setState({ draftMessage: error.message }));
      fetch('/admin/documents.json', { cache: 'no-store' }).then(response => {
        if (!response.ok) throw new Error('文档索引暂时不可用，可稍后重试。');
        return response.json();
      }).then(documents => { if (this.alive) this.setState({ documents }); })
        .catch(error => { if (this.alive) this.setState({ referenceError: error.message }); });
      this.draftError = event => this.setState({ draftMessage: event.detail });
      window.addEventListener('atlas:draft-error', this.draftError);
      const pending = sessionStorage.getItem('atlas.restore-draft');
      if (pending) {
        sessionStorage.removeItem('atlas.restore-draft');
        getDraft(pending).then(draft => draft && this.restore(draft)).catch(error => this.setState({ draftMessage: error.message }));
      }
    }
    componentDidUpdate(previous) {
      if (previous.value !== this.props.value && this.props.value !== this.state.editorValue)
        this.setState({ editorValue: this.props.value || '' });
    }
    componentWillUnmount() {
      this.unsubscribeDrafts?.();
      setDraftFolderReader(null);
      window.removeEventListener('atlas:draft-error', this.draftError);
      super.componentWillUnmount();
    }
    onPastedMedia = async media => {
      try { await saveDraftMedia(media.file, media.url); }
      catch (error) { this.setState({ draftMessage: error.message }); }
    };
    value = () => this.state.editorValue ?? this.props.value ?? '';
    focus() { super.focus(); }
    change = value => {
      this.handleBodyChange(value);
    };
    rememberCaret = () => {
      const target = this.editorTarget();
      const selection = window.getSelection();
      if (target instanceof HTMLTextAreaElement && document.activeElement === target)
        this.caret = { target, start: target.selectionStart, end: target.selectionEnd };
      else if (target && selection?.rangeCount && target.contains(selection.anchorNode))
        this.caret = { target, range: selection.getRangeAt(0).cloneRange() };
    };
    insert = text => {
      const caret = this.caret;
      const target = caret?.target;
      if (target?.isConnected) {
        target.focus({ preventScroll: true });
        if (target instanceof HTMLTextAreaElement) {
          const start = caret.start - (this.queryLength || 0);
          this.change(target.value.slice(0, start) + text + target.value.slice(caret.end));
        } else if (caret.range && target.contains(caret.range.startContainer)) {
          const range = caret.range.cloneRange();
          if (this.queryLength) {
            const prefix = range.cloneRange(); prefix.selectNodeContents(target);
            prefix.setEnd(range.endContainer, range.endOffset);
            let offset = (prefix.cloneContents().textContent || '').length - this.queryLength;
            const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
            let node;
            while ((node = walker.nextNode())) {
              if (offset <= node.length) { range.setStart(node, Math.max(0, offset)); break; }
              offset -= node.length;
            }
          }
          const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
          const marker = `PASTEIMAGE${crypto.randomUUID().replaceAll('-', '')}`;
          this.imageMarkers ||= new Map(); this.imageMarkers.set(marker, text);
          const clipboardData = new DataTransfer(); clipboardData.setData('text/plain', marker);
          target.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData }));
        }
      } else {
        // No caret yet (for example an empty document): use the native value
        // update and remount once so Slate reads the external insertion.
        this.change(this.value() + text);
        this.setState(state => ({ pasteRevision: (state.pasteRevision || 0) + 1 }));
      }
      this.queryLength = 0;
      this.setState({ menu: null, query: '', active: 0 });
    };
    editorTarget = () => this.pasteRoot?.querySelector('textarea, [contenteditable="true"]');
    detectMenu = () => {
      const input = this.editorTarget();
      if (!input) return;
      this.rememberCaret();
      let before;
      if (input instanceof HTMLTextAreaElement) before = input.value.slice(0, input.selectionStart);
      else {
        const range = this.caret?.range;
        if (!range || !input.contains(range.startContainer)) return;
        const prefix = range.cloneRange(); prefix.selectNodeContents(input); prefix.setEnd(range.endContainer, range.endOffset);
        before = prefix.toString();
      }
      const reference = before.match(/\[\[([^\]\n]{0,100})$/);
      const slash = before.match(/(?:^|\n)\/([^\n]{0,30})$/);
      const match = reference || slash;
      if (!match) { this.queryLength = 0; return; }
      const length = reference ? match[0].length : match[1].length + 1;
      this.queryLength = length;
      this.setState({ menu: reference ? 'reference' : 'slash', query: match[1], active: 0 });
    };
    allDocuments = () => {
      const saved = this.state.documents;
      const drafts = this.state.drafts.filter(draft => draft.collection === 'blog' && draft.plannedId)
        .map(draft => ({ id: draft.plannedId, title: draft.data.title, folder: draft.folder, draft: true, key: draft.key }));
      return [...saved, ...drafts.filter(draft => !saved.some(doc => doc.id === draft.id))];
    };
    matching = () => {
      const query = (this.state.query || '').toLowerCase().trim();
      return this.state.menu === 'slash' ? commands.filter(command => command.label.includes(query) || command.id.includes(query))
        : this.allDocuments().filter(doc => `${doc.title} ${doc.id}`.toLowerCase().includes(query)).slice(0, 15);
    };
    run = command => {
      if (command.id === 'reference') { this.setState({ menu: 'reference', query: '', active: 0 }); return; }
      if (command.id === 'image' || command.id === 'pdf') {
        if (this.queryLength) this.insert('');
        this.fileKind = command.id;
        this.fileInput.accept = command.id === 'pdf' ? 'application/pdf' : 'image/png,image/jpeg,image/webp,image/gif';
        this.fileInput.click(); return;
      }
      this.insert(command.text);
    };
    select = item => {
      if (this.state.menu === 'slash') this.run(item);
      else this.insert(`[[${item.id}|${item.title.replace(/[\[\]|]/g, '')}]]`);
    };
    createReference = async () => {
      try {
        const title = this.state.query?.trim();
        if (!title) throw new Error('先输入新文章的标题。');
        const draft = await createReferenceDraft(title, this.state.referenceFolder || '', this.state.documents);
        this.insert(`[[${draft.plannedId}|${title.replace(/[\[\]|]/g, '')}]]`);
        this.setState({ draftMessage: '已创建本地文档草稿。到“草稿箱”打开并发布后，引用才会对访客生效。' });
      } catch (error) { this.setState({ referenceError: error.message }); }
    };
    restore = async draft => {
      try {
        await restoreDraft(draft, this);
      } catch (error) { this.setState({ draftMessage: error.message }); }
    };
    openDraft = async draft => {
      try {
        await saveCurrentDraft();
        const current = CMS.editor.getCurrentEntry();
        if (draft.collection === current.collection && (draft.newRecord && current.newRecord || draft.key === currentDraftKey(current))) {
          await this.restore(draft);
        } else {
          sessionStorage.setItem('atlas.restore-draft', draft.key);
          location.hash = `/collections/${draft.collection}/${draft.newRecord ? 'new' : `entries/${encodeURIComponent(draft.slug)}`}`;
        }
      } catch (error) { this.setState({ draftMessage: error.message }); }
    };
    fileSelected = async event => {
      const file = event.target.files[0];
      event.target.value = '';
      if (!file) return;
      if (this.fileKind === 'image') {
        const target = this.editorTarget();
        const range = target?.isContentEditable ? this.caret?.range?.cloneRange() : null;
        const caret = target instanceof HTMLTextAreaElement ? [this.caret?.start || 0, this.caret?.end || 0] : null;
        return this.uploadImages({ files: [file], target, range, caret, uploaded: [] });
      }
      try {
        if (file.type !== 'application/pdf' || file.size > 10 * 1024 * 1024) throw new Error('请选择不超过 10 MB 的 PDF。');
        const renamed = new File([file], `document-${crypto.randomUUID()}.pdf`, { type: 'application/pdf' });
        const result = await this.props.onPersistMedia(renamed, { field: this.props.field });
        const media = result?.payload?.path ? result.payload : result?.payload?.file;
        if (!media?.path) throw new Error('PDF 添加失败，请重试。');
        const url = `/uploads/${media.path.split('/').pop()}`;
        await saveDraftMedia(renamed, url);
        this.insert(`\n\n[${file.name.replace(/[\[\]]/g, '')}](${url})\n\n`);
      } catch (error) { this.setState({ pasteMessage: error.message }); }
    };
    jumpToHeading = heading => {
      const target = this.editorTarget();
      if (!target) return;
      const headings = [...target.querySelectorAll('h1, h2, h3, h4, h5, h6')];
      let element = headings.find(node => node.textContent.trim() === heading.text);
      if (!element) element = [...target.querySelectorAll('[data-slate-node="element"]')]
        .find(node => node.textContent.replace(/^#{1,6}\s+/, '').trim() === heading.text);
      if (element) {
        element.scrollIntoView({ block: 'center', behavior: 'smooth' });
        target.focus({ preventScroll: true });
        const range = document.createRange(); range.selectNodeContents(element); range.collapse(true);
        const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
      }
    };
    render() {
      const value = this.value();
      const headings = getOutline(value);
      const results = this.state.menu ? this.matching() : [];
      const button = (label, action, props = {}) => h('button', { type: 'button', className: 'writing-action', onMouseDown: event => { this.rememberCaret(); event.preventDefault(); }, onClick: action, ...props }, label);
      return h('section', { className: 'writing-editor', ref: element => { this.pasteRoot = element; },
        onPasteCapture: this.handleImagePaste,
        onMouseUpCapture: () => this.rememberCaret(),
        onKeyUpCapture: event => { if (event.target.closest?.('[contenteditable="true"], textarea') && !['Escape', 'Enter', 'ArrowDown', 'ArrowUp', 'Shift'].includes(event.key)) this.detectMenu(); },
        onKeyDownCapture: event => {
          if (this.state.menu && event.key === 'Escape') { event.preventDefault(); this.queryLength = 0; this.setState({ menu: null }); }
          else if (this.state.menu && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
            const count = Math.max(results.length, 1);
            event.preventDefault(); this.setState({ active: (this.state.active + (event.key === 'ArrowDown' ? 1 : -1) + count) % count });
          } else if (this.state.menu && event.key === 'Enter' && results.length) { event.preventDefault(); this.select(results[this.state.active]); }
          else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); saveCurrentDraft().catch(error => this.setState({ draftMessage: error.message })); }
        } },
        h('div', { className: 'writing-tools', role: 'toolbar', 'aria-label': '写作工具' },
          button('插入', () => { this.queryLength = 0; this.setState({ menu: 'slash', query: '', active: 0 }); }),
          button('文档引用', () => { this.queryLength = 0; this.setState({ menu: 'reference', query: '', active: 0 }); }),
          button('草稿箱', () => this.setState({ draftsOpen: !this.state.draftsOpen })),
          h('input', { type: 'file', hidden: true, ref: element => { this.fileInput = element; }, onChange: this.fileSelected })),
        this.state.recoverable && h('div', { className: 'writing-notice' },
          '发现未发布草稿（', new Date(this.state.recoverable.updatedAt).toLocaleString(), '）。',
          button('恢复草稿', () => this.restore(this.state.recoverable)),
          button('暂不恢复', () => this.setState({ recoverable: null }))),
        this.state.draftsOpen && h('div', { className: 'writing-drafts' },
          h('strong', null, '当前浏览器的草稿箱'), h('p', null, '只在此设备保存，不会自动公开。切换前会保存当前文档。'),
          ...this.state.drafts.map(draft => h('div', { key: draft.key },
            button(`${draft.data.title || '未命名'} · ${draft.collection}${draft.folder ? ` / ${draft.folder}` : ''}`, () => this.openDraft(draft)),
            button('删除本地草稿', () => { if (confirm('只删除这份本地草稿？已发布文档不受影响。')) deleteDraft(draft.key).catch(error => this.setState({ draftMessage: error.message })); })))),
        this.state.menu && h('div', { className: 'writing-menu', role: 'dialog', 'aria-label': this.state.menu === 'slash' ? '快捷插入' : '引用搜索' },
          h('div', { className: 'writing-menu-search' },
            h('input', { autoFocus: true, 'aria-label': this.state.menu === 'slash' ? '搜索插入项' : '搜索引用文档', placeholder: '搜索…', value: this.state.query || '',
              onChange: event => this.setState({ query: event.target.value, active: 0 }) }),
            button('关闭', () => { this.queryLength = 0; this.setState({ menu: null }); })),
          ...results.map((item, index) => button(this.state.menu === 'slash' ? item.label : `${item.title} · ${item.id}${item.draft ? '（待发布草稿）' : ''}`,
            () => this.select(item), { key: item.id, className: index === this.state.active ? 'is-active' : '' })),
          this.state.menu === 'reference' && h('div', { className: 'writing-reference-create' },
            h('input', { 'aria-label': '新引用文档的文件夹', placeholder: '文件夹，例如：学习/数学（可留空）', value: this.state.referenceFolder || '', onChange: event => this.setState({ referenceFolder: event.target.value }) }),
            button(`新建“${this.state.query || '输入标题'}”文档草稿并引用`, this.createReference),
            h('p', null, this.state.referenceError || '引用目标发布后，网站上的链接才可访问。')),
          this.state.menu === 'slash' && !results.length && h('p', null, '没有匹配的插入项。')),
        h('div', { className: 'writing-native-layout' },
          h('div', { className: 'writing-native-control' }, super.render()),
          headings.length > 0 && h('nav', { className: 'writing-outline', 'aria-label': '文档目录' }, h('strong', null, '目录'),
            ...headings.map((heading, i) => button(heading.text, () => this.jumpToHeading(heading),
              { key: i, style: { paddingLeft: `${Math.max(0, heading.depth - 2) * 8}px` } })))),
        h('div', { className: 'writing-status', role: 'status', 'aria-live': 'polite' },
          this.state.pasteMessage || this.state.draftMessage || '',
          this.state.pasteFailed && button('重试插入', () => this.uploadImages(this.state.pasteFailed))),
        this.state.menu && h('div', { className: 'writing-menu', role: 'dialog', 'aria-label': this.state.menu === 'slash' ? '快捷插入' : '引用搜索',
          onKeyDown: event => { if (event.key === 'Escape') { event.preventDefault(); this.setState({ menu: null }); } } },
          h('div', { className: 'writing-menu-search' },
            h('input', { autoFocus: true, 'aria-label': this.state.menu === 'slash' ? '搜索插入项' : '搜索引用文档', placeholder: '搜索…', value: this.state.query || '',
              onChange: event => this.setState({ query: event.target.value, active: 0 }) }),
            button('关闭', () => { this.queryLength = 0; this.setState({ menu: null }); })),
          ...results.map((item, index) => button(this.state.menu === 'slash' ? item.label : `${item.title} · ${item.id}${item.draft ? '（待发布草稿）' : ''}`,
            () => this.select(item), { key: item.id, className: index === this.state.active ? 'is-active' : '' })),
          this.state.menu === 'reference' && h('div', { className: 'writing-reference-create' },
            h('input', { 'aria-label': '新引用文档的文件夹', placeholder: '文件夹，例如：学习/数学（可留空）', value: this.state.referenceFolder || '', onChange: event => this.setState({ referenceFolder: event.target.value }) }),
            button(`新建“${this.state.query || '输入标题'}”文档草稿并引用`, this.createReference),
            h('p', null, this.state.referenceError || '引用目标发布后，网站上的链接才可访问。')),
          this.state.menu === 'slash' && !results.length && h('p', null, '没有匹配的插入项。')),
        );
    }
  }
  // The right-hand Decap preview uses the same renderer as our writing panel.
  const Preview = props => h('div', { className: 'writing-native-preview', dangerouslySetInnerHTML: {
    __html: renderMarkdown(props.value, [], path => props.getAsset?.(path)) } });
  CMS.registerWidget('markdown', WritingControl, Preview, base.schema);
  CMS.registerPreviewStyle('/admin/writing-editor.css');
  CMS.registerPreviewStyle('/admin/generated/katex.min.css');
}
