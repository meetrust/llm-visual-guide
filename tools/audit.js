// Deep audit for page ① (LLM visual guide), same rules as page ②.
const { chromium } = require('playwright');
const [url, width] = [process.argv[2], +(process.argv[3] || 1440)];
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width, height: 900 } });
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => { if (m.type() === 'error' && !m.text().includes('TUNNEL')) errs.push(m.text()); });
  await p.goto(url); await p.waitForTimeout(4000);
  const r = await p.evaluate(() => {
    const out = { text: [], data: [], sizes: {}, trunc: [], glyphs: {} };
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const seen = new Set(); let n;
    while ((n = w.nextNode())) {
      const el = n.parentElement;
      if (el.closest('svg, script, style, pre, code')) continue;
      const t = n.textContent.replace(/\s+/g, ' ').trim();
      if (!t || seen.has(t)) continue; seen.add(t);
      const add = k => out.text.push(k + ' :: ' + t);
      if (/[一-鿿][A-Za-z0-9$]|[A-Za-z0-9][一-鿿]/.test(t)) add('CJK-Latin no space');
      if (/[一-鿿][,:;!?()]|[,:;!?(][一-鿿]/.test(t)) add('half-width punct');
      if (/"/.test(t)) add('ASCII quote');
      if (/  /.test(t)) add('double space');
      if (/[一-鿿][ \u00a0\u3000]+[一-鿿]/.test(t)) add('space between CJK');
      if (/[^\s，。、；：！？）」”》][ \u00a0]+[，。、；：！？）」”》]|[，。、；：！？）」”》][ \u00a0]+[^\s·（「“《]|[（「“《][ \u00a0]+\S/.test(t)) add('space next to full-width punct');
      const g = t.match(/[▶↗↑☰⇢✕✓▍◆★☆]/g);
      if (g) g.forEach(c => { out.glyphs[c] = (out.glyphs[c] || 0) + 1; });
    }
    // anchors / links / figures
    out.data.push('broken anchors: ' + [...document.querySelectorAll('a[href^="#"]')].filter(a => !document.getElementById(a.getAttribute('href').slice(1))).length);
    out.data.push('external links not new tab: ' + [...document.querySelectorAll('a[href^="http"]')].filter(a => a.target !== '_blank' || a.rel !== 'noopener').length);
    out.data.push('FIG sequence: ' + [...document.querySelectorAll('figcaption b')].map(x => x.textContent.match(/FIG\.(\d+)/)?.[1]).join(' '));
    out.data.push('mermaid svgs: ' + document.querySelectorAll('pre.mermaid svg').length + ' / ' + document.querySelectorAll('pre.mermaid').length);
    // internal numbers
    const bars = [...document.querySelectorAll('.bars .vl')].map(x => parseFloat(x.textContent));
    out.data.push('star bars sum: ' + bars.reduce((a, b) => a + b, 0).toFixed(1) + ' vs hero ' + [...document.querySelectorAll('.stat b')][1].textContent);
    const dm = document.getElementById('depmap');
    if (dm) {
      const labels = [...dm.querySelectorAll('.dep-label')].map(l => l.getBoundingClientRect());
      const nodes = [...dm.querySelectorAll('.dn')].map(x => x.getBoundingClientRect());
      let ov = 0; labels.forEach(l => nodes.forEach(nn => { if (l.left < nn.right && l.right > nn.left && l.top < nn.bottom && l.bottom > nn.top) ov++; }));
      out.data.push('depmap labels ' + labels.length + ', overlapping nodes ' + ov);
    }
    out.data.push('page width ' + document.documentElement.scrollWidth);
    // sizes by role
    const groups = { 'lvl chip': '.lvl', 'spec chip': '.specs div', 'k chip (MECHANISM…)': '.blk h4 .k', 'dn-need chip': '.dn-need', 'dn-badge': '.dn-badge', 'stat tile': '.stat', 'copy btn': '.copy', 'toc link': '.toc nav > ol > li > a', 'toc sub link': '.toc .sub a', 'depmap node': '.dn', 'ladder row': '.ladder li', 'track wk': '.track .wk', 'legend swatch': '.legend i', 'heat cell': '.heat td.h', 'menu btn': '.menu-btn', 'totop': '.totop', 'pipe step': '.pipe-steps li', 'cycle step': '.cy-loop li', 'g-bar': '.g-bar', 'source link': '.sources a', 'calib card': '.calib-card' };
    Object.entries(groups).forEach(([k, sel]) => {
      const hs = [...document.querySelectorAll(sel)].filter(e => e.getClientRects().length).map(e => Math.round(e.getBoundingClientRect().height));
      if (hs.length) out.sizes[k] = [...new Set(hs)].sort((a, b) => a - b).join(',') + '  (n=' + hs.length + ')';
    });
    out.trunc = [...document.querySelectorAll('.dn-desc, .dn-need, .lvl, .specs dd, .pipe-steps b, .pipe-steps span, .bars .nm, .g-label, .stat span')].filter(e => e.getClientRects().length && e.scrollWidth > e.clientWidth + 1).map(e => e.className + ': ' + e.textContent);
    return out;
  });
  console.log('== TEXT ==\n' + (r.text.join('\n') || 'none'));
  console.log('== GLYPH ICONS ==', JSON.stringify(r.glyphs));
  console.log('== DATA ==\n' + r.data.join('\n'));
  console.log('== SIZES (heights px) ==');
  Object.entries(r.sizes).forEach(([k, v]) => console.log('  ' + k.padEnd(22) + v));
  console.log('== TRUNCATED ==\n' + (r.trunc.join('\n') || 'none'));
  console.log('== ERRORS ==\n' + (errs.join('\n') || 'none'));
  await b.close();
})();
