let dbPromise;
let cms;
let timer;
let saving = Promise.resolve();
let paused = false;
let folderReader;
export function setDraftFolderReader(reader) { folderReader = reader; }
const listeners = new Set();
const newKey = collection => `atlas.new-draft.${collection}`;
export function currentDraftKey(entry = cms?.editor.getCurrentEntry()) {
  if (!entry) return null;
  if (!entry.newRecord) return `${entry.collection}:${entry.path || entry.slug}`;
  let key = sessionStorage.getItem(newKey(entry.collection));
  if (!key) {
    key = `${entry.collection}:new:${crypto.randomUUID()}`;
    sessionStorage.setItem(newKey(entry.collection), key);
  }
  return key;
}
function database() {
  return dbPromise ||= new Promise((resolve, reject) => {
    const request = indexedDB.open('atlas-writing-drafts', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('drafts', { keyPath: 'key' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('浏览器未允许保存草稿，请检查存储设置。'));
  });
}
async function transaction(mode, action) {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('drafts', mode);
    const request = action(tx.objectStore('drafts'));
    tx.oncomplete = () => resolve(request?.result);
    tx.onerror = () => reject(tx.error || new Error('草稿保存失败，浏览器空间可能不足。'));
    tx.onabort = () => reject(tx.error || new Error('草稿保存中断。'));
  });
}
export const listDrafts = () => transaction('readonly', store => store.getAll());
export const getDraft = key => transaction('readonly', store => store.get(key));
export async function putDraft(draft) {
  await transaction('readwrite', store => store.put(draft));
  listeners.forEach(listener => listener());
  return draft;
}
export async function deleteDraft(key) {
  await transaction('readwrite', store => store.delete(key));
  listeners.forEach(listener => listener());
}
export function subscribeDrafts(listener) { listeners.add(listener); return () => listeners.delete(listener); }
export async function saveCurrentDraft(entry = cms?.editor.getCurrentEntry()) {
  if (!entry || paused || !['blog', 'projects', 'moments'].includes(entry.collection)) return;
  const key = currentDraftKey(entry);
  const folder = folderReader?.() ?? undefined;
  // Serialize writes: media added during an autosave must not be overwritten.
  saving = saving.catch(() => {}).then(async () => {
    const previous = await getDraft(key);
    await putDraft({ ...previous, key, collection: entry.collection, slug: entry.slug,
      path: entry.path, newRecord: entry.newRecord, data: entry.data,
      ...(folder !== undefined ? { folder } : {}), updatedAt: Date.now(), media: previous?.media || [] });
  });
  return saving;
}
export async function saveDraftMedia(file, url) {
  const entry = cms.editor.getCurrentEntry();
  await saveCurrentDraft(entry);
  const key = currentDraftKey(entry);
  saving = saving.catch(() => {}).then(async () => {
    const draft = await getDraft(key);
    if (!draft) return;
    draft.media = [...(draft.media || []).filter(media => media.url !== url), { file, url }];
    await putDraft(draft);
  });
  return saving;
}
export function initializeDrafts(CMS) {
  cms = CMS;
  CMS.editor.onEditorChange(entry => {
    if (paused || !entry?.hasChanged) return;
    clearTimeout(timer);
    timer = setTimeout(() => saveCurrentDraft(entry).catch(error => {
      window.dispatchEvent(new CustomEvent('atlas:draft-error', { detail: error.message }));
    }), 600);
  });
  CMS.registerEventListener({ name: 'postSave', handler: async ({ entry }) => {
    clearTimeout(timer);
    await saving.catch(() => {});
    const collection = entry.get('collection');
    const key = entry.get('newRecord') ? sessionStorage.getItem(newKey(collection))
      : `${collection}:${entry.get('path') || entry.get('slug')}`;
    if (key) await deleteDraft(key);
    sessionStorage.removeItem(newKey(collection));
  } });
}
export async function restoreDraft(draft, control) {
  paused = true;
  clearTimeout(timer);
  try {
    if (draft.newRecord) sessionStorage.setItem(newKey(draft.collection), draft.key);
    for (const media of draft.media || []) {
      const result = await control.props.onPersistMedia(media.file, { field: control.props.field });
      const file = result?.payload?.path ? result.payload : result?.payload?.file;
      if (!file?.path) throw new Error('草稿图片恢复失败，请重试。');
      control.imagePreviews ||= new Map();
      const preview = URL.createObjectURL(media.file);
      (control.restoredBlobURLs ||= []).push(preview);
      control.imagePreviews.set(media.url, preview);
    }
    const fields = CMSFields();
    const patches = Object.entries(draft.data).filter(([key]) => fields.has(key)).map(([path, value]) => ({ path, value }));
    if (draft.folder !== undefined && fields.has('path')) patches.push({ path: 'path', value: draft.folder || '/' });
    const result = cms.editor.applyFieldPatch(patches);
    if (result.rejected.length) throw new Error('有字段未能恢复，请保留草稿并检查字段。');
    control.setState(state => ({ editorValue: draft.data.body || '', pasteRevision: (state.pasteRevision || 0) + 1,
      draftMessage: '草稿已恢复，尚未发布。', recoverable: null }));
  } finally { paused = false; }
}
function CMSFields() { return new Set(cms.editor.getCurrentEntry()?.fields.map(field => field.name)); }

export async function createReferenceDraft(title, folder = '', documents = []) {
  const slug = value => value.toLowerCase().trim().replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/\s/g, '-');
  const parts = folder.split('/').filter(Boolean).map(slug);
  const basename = slug(title);
  if (!basename || parts.some(part => !part || part === '.' || part === '..')) throw new Error('请输入有效的文章标题和文件夹名称。');
  const id = [...parts, basename].join('/');
  if (documents.some(doc => doc.id === id)) throw new Error('同路径文章已经存在，请从搜索结果选择。');
  const drafts = await listDrafts();
  const existing = drafts.find(draft => draft.plannedId === id);
  if (existing) return existing;
  return putDraft({ key: `blog:new:${crypto.randomUUID()}`, collection: 'blog', newRecord: true,
    plannedId: id, folder: parts.join('/'), updatedAt: Date.now(), media: [],
    data: { title, description: '', pubDate: new Date().toISOString(), updatedDate: '', tags: [], cover: '', attachments: [], body: '' } });
}
