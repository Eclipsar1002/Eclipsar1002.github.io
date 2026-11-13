// Decap remounts a widget after applying restored fields. Keep staged previews
// alive across those remounts; a full navigation releases the browser's blobs.
const imagePreviewCache = new Map();
// Keep Decap's editor, authentication, asset staging and publication flow.
export function registerPasteImages(CMS) {
  const markdown = CMS.getWidget('markdown');
  const pending = new Set();
  const extensions = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif' };

  class PasteImageControl extends markdown.control {
    constructor(props) { super(props); this.imagePreviews = imagePreviewCache; }
    componentDidMount() {
      super.componentDidMount?.();
      this.alive = true;
      this.previewObserver = new MutationObserver(() => this.refreshImagePreviews());
      if (this.pasteRoot) this.previewObserver.observe(this.pasteRoot, {
        subtree: true, childList: true, attributes: true, attributeFilter: ['src'],
      });
    }
    componentWillUnmount() {
      this.alive = false;
      this.previewObserver?.disconnect();
      super.componentWillUnmount?.();
    }
    refreshImagePreviews = () => {
      this.pasteRoot?.querySelectorAll('img').forEach(image => {
        const preview = this.imagePreviews?.get(image.getAttribute('src'));
        if (preview) image.src = preview;
      });
    };
    handleBodyChange = value => {
      let inserted = false;
      for (const [marker, markdown] of this.imageMarkers || []) {
        if (!value.includes(marker)) continue;
        value = value.replace(marker, markdown);
        this.imageMarkers.delete(marker);
        inserted = true;
      }
      this.props.onChange(value);
      this.setState(state => ({ editorValue: value,
        pasteRevision: (state.pasteRevision || 0) + (inserted ? 1 : 0) }));
    };
    focus() { super.focus(); }

    handleImagePaste = event => {
      if (this.props.isDisabled) return;
      const target = event.target.closest?.('[contenteditable="true"], textarea');
      if (!target || !this.pasteRoot?.contains(target)) return;
      const clipboard = event.clipboardData;
      const files = Array.from(clipboard?.items || [])
        .filter(item => item.kind === 'file' && item.type.startsWith('image/'))
        .map(item => item.getAsFile()).filter(Boolean);
      if (!files.length) files.push(...Array.from(clipboard?.files || []).filter(file => file.type.startsWith('image/')));
      if (!files.length) return; // Ordinary text and rich-text paste remain native.
      event.preventDefault();
      event.stopPropagation();
      if (this.uploading) return;
      if (files.some(file => !extensions[file.type] || file.size > 10 * 1024 * 1024)) {
        this.setState({ pasteMessage: '请粘贴 PNG、JPEG、WebP 或 GIF 图片，单张不超过 10 MB。' });
        return;
      }
      const selection = window.getSelection();
      const range = !(target instanceof HTMLTextAreaElement) && selection?.rangeCount ? selection.getRangeAt(0).cloneRange() : null;
      const caret = target instanceof HTMLTextAreaElement ? [target.selectionStart, target.selectionEnd] : null;
      const job = { files, target, range, caret, uploaded: [] };
      this.uploadImages(job);
    };

    uploadImages = async job => {
      if (this.uploading) return;
      this.uploading = true;
      pending.add(this);
      this.setState({ pasteFailed: null, pasteMessage: '正在准备截图…' });
      try {
        for (let i = job.uploaded.length; i < job.files.length; i++) {
          const source = job.files[i];
          const name = `screenshot-${Date.now()}-${crypto.randomUUID()}.${extensions[source.type]}`;
          const file = new File([source], name, { type: source.type });
          if (this.alive) this.setState({ pasteMessage: `正在添加截图 ${i + 1} / ${job.files.length}…` });
          // Decap stages the file in the active entry and commits it on publish.
          // onAddAsset only updates its preview cache; onPersistMedia also adds
          // the file to the entry's pending media list.
          const result = await this.props.onPersistMedia(file, { field: this.props.field });
          const media = result?.payload?.path ? result.payload : result?.payload?.file;
          if (!media?.path) throw new Error('截图添加失败，请检查网络或重新登录后重试。');
          const folder = this.props.config?.public_folder || '/uploads';
          const url = `${folder.replace(/\/$/, '')}/${media.path.split('/').pop()}`;
          this.imagePreviews ||= new Map();
          if (media.displayURL || media.url) this.imagePreviews.set(url, media.displayURL || media.url);
          await this.onPastedMedia?.({ file, url });
          job.uploaded.push(url);
        }
        if (!this.alive) return;
        const { target, range, caret } = job;
        if (!target.isConnected || (range && !target.contains(range.startContainer))) {
          throw new Error('正文编辑位置已变化，请点击重试插入，或重新粘贴截图。');
        }
        this.uploading = false;
        // Let the original paste event finish and React commit the media update
        // before forwarding a normal paste to the native Markdown editor.
        await new Promise(resolve => setTimeout(resolve, 0));
        target.focus({ preventScroll: true });
        if (caret) target.setSelectionRange(...caret);
        else if (range) {
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
        }
        const data = new DataTransfer();
        const markdown = job.uploaded.map(url => `![截图](${url})`).join('\n\n');
        // Let the editor locate the caret with a plain marker, then replace it
        // in its Markdown output. Rich-text serializers otherwise escape ![...].
        const marker = `PASTEIMAGE${crypto.randomUUID().replaceAll('-', '')}`;
        this.imageMarkers ||= new Map();
        this.imageMarkers.set(marker, markdown);
        data.setData('text/plain', marker);
        target.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: data }));
        this.setState({ pasteMessage: '截图已插入正文，点击发布后会与文章一起上传到 GitHub。', pasteFailed: null });
      } catch (error) {
        if (this.alive) this.setState({ pasteMessage: error.message || '截图上传失败，请重试。', pasteFailed: job });
      } finally {
        this.uploading = false;
        pending.delete(this);
      }
    };

    render() {
      const blocked = event => {
        if (this.uploading) { event.preventDefault(); event.stopPropagation(); }
      };
      // Reuse the stock control with a wrapped value callback, preserving its
      // toolbar, preview, asset resolver and Markdown parser.
      const editorContext = Object.create(this);
      editorContext.props = { ...this.props,
        value: this.state.editorValue ?? this.props.value,
        onChange: this.handleBodyChange };
      const editor = super.render.call(editorContext);
      return window.h('div', {
        ref: element => { this.pasteRoot = element; },
        onPasteCapture: this.handleImagePaste,
        onKeyDownCapture: blocked,
        onBeforeInputCapture: blocked,
        onDropCapture: blocked,
      }, window.h('div', {
        key: this.state.pasteRevision || 0,
        onClickCapture: blocked,
        style: { pointerEvents: this.uploading ? 'none' : undefined, opacity: this.uploading ? .65 : 1 },
      }, editor), window.h('div', {
        role: 'status', 'aria-live': 'polite', style: { padding: '8px 0', color: '#6b7280', fontSize: '13px' },
      }, this.state.pasteMessage || '支持截图后在正文中 Ctrl+V（Mac：⌘V），发布时图片会与正文一起上传。',
      this.state.pasteFailed && window.h('button', {
        type: 'button', onClick: () => this.uploadImages(this.state.pasteFailed), style: { marginLeft: '10px', cursor: 'pointer' },
      }, '重试插入')));
    }
  }

  CMS.registerWidget('markdown', PasteImageControl, markdown.preview, markdown.schema);
  CMS.registerEventListener({ name: 'preSave', handler: ({ entry }) => {
    if (pending.size) throw new Error('截图仍在上传，请等待上传完成后再发布。');
    return entry;
  } });
}
