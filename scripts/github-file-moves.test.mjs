import test from 'node:test';
import assert from 'node:assert/strict';
import { protectFileMoves, registerSingleFileMoves } from '../public/admin/github-file-moves.js';

test('entry moves explicitly disable directory moves, preserving all other API arguments', async () => {
  const calls = [];
  const api = { updateTree(...args) { calls.push({ self: this, args }); return Promise.resolve('saved'); } };
  protectFileMoves(api);
  protectFileMoves(api);
  const files = [{ path: 'blog/a.md', newPath: 'blog/math/a.md', sha: 'edited' }, { path: 'uploads/new.png', sha: 'image' }];
  assert.equal(await api.updateTree('base', files, 'main', true), 'saved');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].self, api);
  assert.deepEqual(calls[0].args, ['base', files, 'main', false]);
  await api.updateTree('base', [{ path: 'blog/b.md', sha: 'edit' }], 'main', true);
  assert.equal(calls[1].args[3], true);
});

test('protects actual backend entry saves without changing credentials or publication options', async () => {
  const options = { collectionName: 'blog', hasSubfolders: false };
  const calls = [];
  class Backend {
    constructor() { this.api = { updateTree(...args) { calls.push(args); return 'saved'; } }; }
    persistEntry(entry, given) { assert.equal(given, options); return this.api.updateTree('base', entry.dataFiles, 'main'); }
  }
  const CMS = { getBackend: name => { assert.equal(name, 'github'); return { BackendClass: Backend }; } };
  registerSingleFileMoves(CMS); registerSingleFileMoves(CMS);
  const backend = new Backend();
  assert.equal(await backend.persistEntry({ dataFiles: [{ path: 'blog/a.md', newPath: 'blog/math/a.md' }] }, options), 'saved');
  assert.equal(calls.length, 1);
  assert.equal(calls[0][3], false);
  assert.throws(() => protectFileMoves({}), /无法安全移动/);
});
