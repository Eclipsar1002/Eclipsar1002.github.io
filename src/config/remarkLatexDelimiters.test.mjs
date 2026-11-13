import test from 'node:test';
import assert from 'node:assert/strict';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import remarkLatexDelimiters, { normalizeMathDelimiters } from './remarkLatexDelimiters.mjs';

test('converts pasted LaTeX delimiters before Markdown consumes escapes', () => {
  const processor = unified().use(remarkParse).use(remarkMath).use(remarkLatexDelimiters).freeze();
  const tree = processor.parse(String.raw`均值 \(\mu\)。

\[x^2\]`);
  assert.equal(tree.children[0].children[1].type, 'inlineMath');
  assert.equal(tree.children[1].type, 'math');
});

test('preserves existing dollar math and code examples', () => {
  const source = '$x$\n\n$$\nx^2\n$$\n\n`\\(example\\)`\n\n```latex\n\\[example\\]\n```\n\n~~~latex\n\\(example\\)\n~~~';
  assert.equal(normalizeMathDelimiters(source), source);
  assert.equal(normalizeMathDelimiters(String.raw`\\(escaped\\)`), String.raw`\\(escaped\\)`);
});
