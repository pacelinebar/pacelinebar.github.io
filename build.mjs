// Builds index.html from links.json. Run: node build.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const data = JSON.parse(readFileSync(new URL('./links.json', import.meta.url), 'utf8'));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const stars = n => n >= 1000 ? `${(n / 1000).toFixed(n >= 100000 ? 0 : 1).replace(/\.0$/, '')}k` : String(n);

const repos = [...data.repos].sort((a, b) => b.featured.localeCompare(a.featured) || b.stars - a.stars);
const p = data.pinned;

const cards = repos.map(r => {
  const [owner, name] = r.repo.split('/');
  return `
      <a class="card" id="${esc(r.slug)}" href="https://github.com/${esc(r.repo)}" target="_blank" rel="noopener">
        <img class="avatar" src="https://github.com/${esc(owner)}.png?size=96" alt="" width="44" height="44" loading="lazy">
        <div class="body">
          <div class="name"><span class="owner">${esc(owner)}/</span>${esc(name)}</div>
          <p>${esc(r.tagline)}</p>
          <div class="meta"><span class="star">★ ${stars(r.stars)}</span><span>${esc(r.language)}</span></div>
        </div>
        <span class="go" aria-hidden="true">↗</span>
      </a>`;
}).join('');

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Paceline · links</title>
<meta name="description" content="${esc(p.tagline)} Plus the GitHub repos we feature for Claude Code and Codex users.">
<meta name="theme-color" content="#07090d">
<meta property="og:title" content="Paceline · links">
<meta property="og:description" content="${esc(p.tagline)}">
<meta property="og:image" content="assets/paceline-icon.png">
<link rel="icon" href="assets/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&family=Saira+Condensed:wght@700&display=swap" rel="stylesheet">
<style>
  :root { --bg:#07090d; --card:#10151c; --line:#1e2731; --text:#f3f5ef; --muted:#9aa4b2; --mint:#b9edac; --clay:#d97757; }
  * { box-sizing:border-box; }
  html { -webkit-text-size-adjust:100%; }
  body { margin:0; background:radial-gradient(700px 420px at 50% -80px, #16261b 0%, transparent 70%), var(--bg); color:var(--text);
    font:15px/1.5 Inter, system-ui, -apple-system, "Segoe UI", sans-serif; min-height:100vh; }
  main { max-width:560px; margin:0 auto; padding:28px 16px 40px; }
  .pinned { position:relative; border:1.5px solid color-mix(in srgb, var(--mint) 55%, transparent); border-radius:22px; padding:22px 20px 20px;
    background:linear-gradient(180deg, #121c16, var(--card)); box-shadow:0 18px 60px #000a; }
  .tag { position:absolute; top:-11px; left:20px; background:var(--mint); color:#0b0f14; font:700 12px/1 "Saira Condensed", sans-serif;
    letter-spacing:.12em; padding:6px 10px; border-radius:8px; text-transform:uppercase; }
  .brand { display:flex; align-items:center; gap:14px; }
  .brand img { width:64px; height:64px; border-radius:16px; }
  .word { font:700 34px/1 "Saira Condensed", sans-serif; letter-spacing:.14em; }
  .tagline { font-weight:600; margin:14px 0 4px; font-size:17px; }
  .detail { color:var(--muted); margin:0 0 16px; }
  .buttons { display:flex; gap:10px; flex-wrap:wrap; }
  .btn { flex:1 1 160px; text-align:center; text-decoration:none; font-weight:600; padding:12px 14px; border-radius:12px; border:1.5px solid var(--line); color:var(--text); }
  .btn.primary { background:var(--mint); color:#0b0f14; border-color:var(--mint); }
  .btn:focus-visible, .card:focus-visible { outline:2px solid var(--mint); outline-offset:3px; }
  h2 { font:700 18px/1 "Saira Condensed", sans-serif; letter-spacing:.14em; text-transform:uppercase; color:var(--muted); margin:34px 4px 12px; }
  .list { display:grid; gap:10px; }
  .card { display:flex; gap:12px; align-items:flex-start; text-decoration:none; color:inherit; background:var(--card); border:1px solid var(--line);
    border-radius:16px; padding:14px; transition:border-color .15s, transform .15s; scroll-margin-top:16px; }
  .card:hover { border-color:#33404e; transform:translateY(-1px); }
  .card:target { border-color:var(--mint); box-shadow:0 0 0 3px color-mix(in srgb, var(--mint) 22%, transparent); }
  .avatar { width:44px; height:44px; border-radius:12px; background:#1b232d; flex:none; }
  .body { min-width:0; flex:1; }
  .name { font:500 14.5px/1.3 "JetBrains Mono", ui-monospace, monospace; overflow-wrap:anywhere; }
  .owner { color:var(--muted); }
  .card p { margin:4px 0 8px; color:#d6dbd2; }
  .meta { display:flex; flex-wrap:wrap; gap:6px 14px; color:var(--muted); font-size:13px; }
  .star { color:var(--mint); font-weight:600; }
  .go { color:var(--muted); font-size:18px; line-height:1; }
  footer { color:var(--muted); font-size:13px; text-align:center; margin-top:30px; }
  footer a { color:var(--text); }
</style>
</head>
<body>
<main>
  <section class="pinned" aria-label="Paceline">
    <span class="tag">Our app</span>
    <div class="brand"><img src="assets/paceline-icon.png" alt="Paceline icon" width="64" height="64"><span class="word">PACELINE</span></div>
    <p class="tagline">${esc(p.tagline)}</p>
    <p class="detail">${esc(p.detail)}</p>
    <div class="buttons">
      <a class="btn primary" href="${esc(p.download)}" target="_blank" rel="noopener">Download free</a>
      <a class="btn" href="${esc(p.repo)}" target="_blank" rel="noopener">View on GitHub</a>
    </div>
  </section>

  <h2>Repos we featured · ${repos.length}</h2>
  <div class="list">${cards}
  </div>

  <footer>
    <p>Independent picks for Claude Code &amp; Codex users. Not affiliated with these projects.</p>
    <p><a href="${esc(data.social.instagram)}" target="_blank" rel="noopener">@pacelinebar</a></p>
  </footer>
</main>
</body>
</html>
`;

writeFileSync(new URL('./index.html', import.meta.url), html);
console.log(`index.html written: ${repos.length} repos`);
