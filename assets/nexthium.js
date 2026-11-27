
(() => {
  const MCP_URL = 'https://nexthium.space/api/mcp';

  const CLIENT_SNIPPETS = {
    'Claude Code': 'claude mcp add --transport http nexthium https://nexthium.space/api/mcp',
    'Cursor': JSON.stringify({
      mcpServers: {
        nexthium: {
          url: MCP_URL
        }
      }
    }, null, 2),
    'VS Code': JSON.stringify({
      servers: {
        nexthium: {
          type: 'http',
          url: MCP_URL
        }
      }
    }, null, 2),
    'HTTP': `curl -X POST ${MCP_URL} \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'`
  };

  function setupReveal() {
    document.querySelectorAll('[data-in]').forEach((el) => {
      el.setAttribute('data-in', 'true');
      if (el.style && el.style.opacity === '0') el.style.opacity = '1';
    });
  }

  function setupGlow() {
    const cursorGlow = document.querySelector('.cursor-glow');
    document.addEventListener('mousemove', (e) => {
      if (cursorGlow) {
        cursorGlow.style.opacity = '1';
        cursorGlow.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
      const card = e.target.closest && e.target.closest('.glow-card');
      if (card) {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
        card.style.setProperty('--my', (e.clientY - rect.top) + 'px');
      }
    });
  }

  function setupCopyButtons() {
    document.querySelectorAll('button').forEach((btn) => {
      const label = (btn.getAttribute('aria-label') || btn.textContent || '').trim().toLowerCase();
      if (label === 'copy' || label.includes('copy')) {
        btn.addEventListener('click', async () => {
          let textToCopy = MCP_URL;
          const container = btn.closest('div, span, section');
          if (container) {
            const pre = container.querySelector('pre code') || container.parentElement?.querySelector('pre code');
            const code = container.querySelector('code');
            if (pre && pre.textContent.trim()) textToCopy = pre.textContent.trim();
            else if (code && code.textContent.trim()) textToCopy = code.textContent.trim();
          }
          try {
            await navigator.clipboard.writeText(textToCopy);
            const span = btn.querySelector('span');
            if (span) {
              const prev = span.textContent;
              span.textContent = 'Copied';
              setTimeout(() => { span.textContent = prev; }, 1500);
            } else {
              btn.style.color = '#ffffff';
              btn.setAttribute('title', 'Copied!');
              setTimeout(() => { btn.style.color = ''; btn.setAttribute('title', 'Copy'); }, 1500);
            }
          } catch {}
        });
      }
    });
  }

  function setupClientTabs() {
    const tabButtons = [...document.querySelectorAll('button')].filter((b) =>
      Object.prototype.hasOwnProperty.call(CLIENT_SNIPPETS, b.textContent.trim())
    );
    if (!tabButtons.length) return;
    tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const name = btn.textContent.trim();
        const group = btn.parentElement;
        if (group) {
          group.querySelectorAll('button').forEach((other) => {
            other.classList.remove('bg-ink', 'text-obsidian', 'text-ink', 'border-ink', 'bg-forest');
            other.classList.add('text-ink-3');
            other.setAttribute('aria-selected', 'false');
          });
        }
        btn.classList.remove('text-ink-3');
        btn.classList.add('bg-ink', 'text-obsidian');
        btn.setAttribute('aria-selected', 'true');
        const section = btn.closest('section') || document;
        const codeEl = section.querySelector('pre code');
        if (codeEl && CLIENT_SNIPPETS[name]) {
          codeEl.textContent = CLIENT_SNIPPETS[name];
        }
      });
    });
  }

  function setupMobileMenu() {
    const menuBtn = document.querySelector('button[aria-controls="mobile-menu"]');
    if (!menuBtn) return;

    const groups = [
      { title: 'Overview', items: [
        ['The flow', '/how-it-works'], ['Tool index', '/tools'], ['Connect a client', '/clients'], ['Safety model', '/security']
      ]},
      { title: 'Reference', items: [
        ['Reference guide', '/docs'], ['Build on the API', '/docs/developers'], ['Run agents', '/docs/teams'], ['Release notes', '/changelog']
      ]},
      { title: 'Agents & Tools', items: [
        ['Agent keys', '/keys'], ['Prompts', '/prompts'], ['Approval page', '/sign'], ['Contract builder', '/contracts'],
        ['Approvals', '/approvals'], ['Rug Prover', '/autopsy'], ['Money Trail', '/trail'], ['Stock Token Lens', '/stocks'],
        ['Chain Pulse', '/pulse'], ['Perps on Lighter', '/perps'], ['Privacy Pools', '/private-payments'], ['Stats', '/stats']
      ]}
    ];

    let drawer = null;
    menuBtn.addEventListener('click', () => {
      if (drawer) {
        drawer.remove();
        drawer = null;
        menuBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        return;
      }
      drawer = document.createElement('div');
      drawer.id = 'mobile-menu';
      drawer.className = 'nexthium-mobile-menu';
      drawer.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #1f1f1f;padding-bottom:16px;margin-bottom:20px">
          <span style="font-weight:600;letter-spacing:-0.02em;color:#fff;font-size:18px">nexthium</span>
          <button type="button" id="nxCloseMob" style="background:#141414;border:1px solid #2b2b2b;color:#fff;padding:6px 14px;font-family:monospace;font-size:12px;cursor:pointer">CLOSE ✕</button>
        </div>
        ${groups.map(g => `
          <div style="margin-bottom:22px">
            <div style="font-family:monospace;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#737373;margin-bottom:10px">${g.title}</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
              ${g.items.map(([label, href]) => `<a href="${href}" style="display:block;padding:10px 12px;border:1px solid #1f1f1f;background:#0d0d0d;color:#e5e5e5;text-decoration:none;font-size:13px">${label}</a>`).join('')}
            </div>
          </div>
        `).join('')}
      `;
      document.body.appendChild(drawer);
      document.body.style.overflow = 'hidden';
      menuBtn.setAttribute('aria-expanded', 'true');
      setupFileLinks(drawer);
      drawer.querySelector('#nxCloseMob').addEventListener('click', () => menuBtn.click());
    });
  }

  function setupFileLinks(root = document) {
    if (window.location.protocol !== 'file:') return;
    const depth = Number(document.documentElement.dataset.depth || '0');
    const up = depth === 0 ? './' : '../'.repeat(depth);
    root.querySelectorAll('a[href]').forEach((a) => {
      const href = a.getAttribute('href');
      if (!href || !href.startsWith('/') || href.startsWith('//')) return;
      if (href === '/') { a.setAttribute('href', up + 'index.html'); return; }
      const [cleanPath, hash] = href.split('#');
      const rel = cleanPath.replace(/^\//, '');
      a.setAttribute('href', up + rel + '/index.html' + (hash ? '#' + hash : ''));
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupReveal();
    setupGlow();
    setupCopyButtons();
    setupClientTabs();
    setupMobileMenu();
    setupFileLinks(document);
  });
})();
