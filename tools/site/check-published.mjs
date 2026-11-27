// check-published.mjs: stop the site build if a published post still has unfinished work.
// A post counts as published unless its front matter says `published: false` (Jekyll's rule).
// Fails on: the word TK anywhere in a published post (including <!-- notes -->),
// except inside `inline code`, so a post can write about `TK` itself.
// Usage: node tools/site/check-published.mjs
import fs from 'node:fs';
import path from 'node:path';

const dir = '_posts';
const problems = [];
for (const file of fs.readdirSync(dir).filter((f) => /\.(md|markdown|html)$/.test(f))) {
  const text = fs.readFileSync(path.join(dir, file), 'utf8');
  const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (fm && /^published:\s*false\s*$/m.test(fm[1])) continue;   // draft: skip
  text.split(/\r?\n/).forEach((line, i) => {
    if (/\bTK\b/.test(line.replace(/`[^`]*`/g, ''))) problems.push(`${file}:${i + 1}: ${line.trim().slice(0, 100)}`);
  });
}
if (problems.length) {
  console.log('::error::Published post(s) still contain TK. Finish them or set `published: false`.');
  problems.forEach((p) => console.log('  ' + p));
  process.exit(1);
}
console.log('OK: no TKs in published posts.');
