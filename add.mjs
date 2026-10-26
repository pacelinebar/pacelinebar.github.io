// Adds or updates the repos a reel features, rebuilds index.html and publishes it.
// Each card stays hidden on the page until its post time (Brasília, UTC-3).
//   node add.mjs owner/repo "2026-10-26 09:00" [owner/repo "date time" ...] [--no-push]
//   node add.mjs --remove <slug> [--no-push]
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';

const here = new URL('.', import.meta.url);
const file = new URL('./links.json', here);
const data = JSON.parse(readFileSync(file, 'utf8'));
const args = process.argv.slice(2);
const push = !args.includes('--no-push');
const rest = args.filter(a => a !== '--no-push');
const run = (cmd, cmdArgs) => execFileSync(cmd, cmdArgs, { cwd: here, encoding: 'utf8' });

// Verified taglines and slugs from the reel engine, when the repo has one there.
const reelData = (() => {
  const path = 'D:/projetos/paceline-promo/reels/repos-data.js';
  if (!existsSync(path)) return [];
  const sandbox = { window: {} };
  vm.runInNewContext(readFileSync(path, 'utf8'), sandbox);
  return sandbox.window.REPOS || [];
})();

const changed = [];
if (rest[0] === '--remove') {
  const slug = rest[1];
  const before = data.repos.length;
  data.repos = data.repos.filter(r => r.slug !== slug);
  if (data.repos.length === before) throw new Error(`No repo with slug ${slug}`);
  changed.push(`remove ${slug}`);
} else {
  if (!rest.length || rest.length % 2) throw new Error('Pass pairs: owner/repo "YYYY-MM-DD HH:MM"');
  for (let i = 0; i < rest.length; i += 2) {
    const full = rest[i], when = rest[i + 1];
    if (!/^[\w.-]+\/[\w.-]+$/.test(full)) throw new Error(`Not owner/repo: ${full}`);
    const m = /^(\d{4}-\d{2}-\d{2})[ T](\d{2}):(\d{2})$/.exec(when);
    if (!m) throw new Error(`Not "YYYY-MM-DD HH:MM": ${when}`);
    const gh = JSON.parse(run('gh', ['api', `repos/${full}`]));
    const reel = reelData.find(r => r.full_name?.toLowerCase() === gh.full_name.toLowerCase());
    const entry = {
      slug: reel?.slug || gh.name.toLowerCase().replace(/[^a-z0-9-]+/g, '-'),
      repo: gh.full_name,
      tagline: reel?.tagline || (gh.description || '').trim(),
      stars: gh.stargazers_count,
      language: gh.language || '',
      featured: `${m[1]}T${m[2]}:${m[3]}:00-03:00`,
    };
    const at = data.repos.findIndex(r => r.repo.toLowerCase() === entry.repo.toLowerCase());
    if (at >= 0) data.repos[at] = { ...data.repos[at], ...entry }; else data.repos.push(entry);
    changed.push(`${entry.slug} @ ${entry.featured}`);
  }
}

writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
console.log(run('node', ['build.mjs']).trim());
console.log(changed.join('\n'));

if (push) {
  run('git', ['add', 'links.json', 'index.html']);
  if (run('git', ['status', '--porcelain', 'links.json', 'index.html']).trim()) {
    run('git', ['commit', '-q', '-m', `Links: ${changed.join(', ')}`, '-m', 'Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>']);
    run('git', ['push', '-q']);
    console.log('published');
  } else console.log('nothing to publish');
}
