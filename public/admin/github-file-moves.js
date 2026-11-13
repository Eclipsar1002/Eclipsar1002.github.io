// Decap 3.17's REST GitHub persistFiles omits hasSubfolders when calling
// updateTree. Its default then renames every file in the entry's directory.
// These collections share directories: an entry move must move one file only.
const installed = Symbol('atlas-file-moves');
export function protectFileMoves(api) {
  if (!api || typeof api.updateTree !== 'function') throw new Error('无法安全移动文章，请刷新后台后重试。');
  if (api[installed]) return;
  const updateTree = api.updateTree;
  api.updateTree = function (base, files, branch, moveDirectory) {
    return updateTree.call(this, base, files, branch,
      files.some(file => file.newPath) ? false : moveDirectory);
  };
  api[installed] = true;
}

export function registerSingleFileMoves(CMS) {
  const backend = CMS.getBackend('github')?.BackendClass;
  if (!backend) throw new Error('GitHub 后端未加载，无法启用单篇文章移动保护。');
  if (backend.prototype[installed]) return;
  const persistEntry = backend.prototype.persistEntry;
  backend.prototype.persistEntry = function (entry, options) {
    if (entry.dataFiles.some(file => file.newPath)) protectFileMoves(this.api);
    return persistEntry.call(this, entry, options);
  };
  backend.prototype[installed] = true;
}
