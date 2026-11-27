// check-published.mjs: stop the site build if a live post still has unfinished work.
// A post counts as published unless its front matter says `published: false` (Jekyll's rule).
// Looks for the word TK anywhere in the post (including <!-- notes -->),
// except inside `inline code`, so a post can write about `TK` itself.
// - Post dated today or earlier (it goes live on this build): error, build stops.
// - Post dated in the future (scheduled, not built yet): warning only, so it can be
//   flipped to published early and finished before its day.
// Usage: node tools/site/check-published.mjs
import fs from 'node:fs';
import path from 'node:path';

const dir = '_posts';
const tz = (fs.readFileSync('_config.yml', 'utf8').match(/^timezone:\s*(\S+)/m) || [])[1] || 'UTC';
const today = new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date()); // YYYY-MM-DD

const live = [];
const scheduled = [];
for (const file of fs.readdirSync(dir).filter((f) => /\.(md|markdown|html)$/.test(f))) {
  const text = fs.readFileSync(path.join(dir, file), 'utf8');
  const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (fm && /^published:\s*false\s*$/m.test(fm[1])) continue;   // draft: skip
  const date = ((fm && fm[1].match(/^date:\s*(\d{4}-\d{2}-\d{2})/m)) || file.match(/^(\d{4}-\d{2}-\d{2})/) || [])[1];
  const bucket = date && date > today ? scheduled : live;
  text.split(/\r?\n/).forEach((line, i) => {
    if (/\bTK\b/.test(line.replace(/`[^`]*`/g, ''))) bucket.push(`${file}:${i + 1}: ${line.trim().slice(0, 100)}`);
  });
}
if (scheduled.length) {
  console.log('::warning::Scheduled post(s) still contain TK. Finish them before their date, or the build will stop that day.');
  scheduled.forEach((p) => console.log('  ' + p));
}
if (live.length) {
  console.log('::error::Published post(s) still contain TK. Finish them or set `published: false`.');
  live.forEach((p) => console.log('  ' + p));
  process.exit(1);
}
console.log(`OK: no TKs in live posts (as of ${today}, ${tz}).`);
