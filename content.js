(async () => {
  if (window.top !== window || document.getElementById('tw-ticker-host')) return;

  const SPEED = { slow: 40, medium: 70, fast: 110 }; // px / 秒
  const FLAT = { text: '#616161', bg: '#F2F2F2' };

  let settings = await chrome.storage.sync.get(DEFAULTS);
  let data = await chrome.storage.local.get({ quotes: [], index: null, closed: false, error: null, updatedAt: 0, minimized: false });

  let host = null;
  let ui = null; // { bar, track, groups, status, tint, restore }

  const CSS = `
    :host { all: initial; }
    .bar { position: fixed; z-index: 2147483647; display: flex; overflow: hidden;
      background: rgba(255,255,255,.94); box-shadow: 0 0 6px rgba(0,0,0,.15);
      font: 13px/1.4 -apple-system, "Segoe UI", "Microsoft JhengHei", "PingFang TC", sans-serif; color: #333; }
    .bar.h { left: 0; right: 0; height: 28px; align-items: center; }
    .bar.top { top: 0; } .bar.bottom { bottom: 0; }
    .bar.v { top: 0; bottom: 0; width: 160px; flex-direction: column; }
    .bar.left { left: 0; } .bar.right { right: 0; }
    .viewport { flex: 1; overflow: hidden; position: relative; }
    .track { display: flex; width: max-content; animation: scroll-x linear infinite; }
    .bar.v .track { flex-direction: column; width: 100%; animation-name: scroll-y; }
    .bar:hover .track { animation-play-state: paused; }
    .group { display: flex; align-items: center; gap: 8px; padding: 0 4px; box-sizing: border-box; }
    .bar.v .group { flex-direction: column; align-items: stretch; padding: 3px 6px; gap: 6px; }
    .item { display: inline-flex; gap: 6px; align-items: baseline; padding: 2px 8px; border-radius: 4px; white-space: nowrap; }
    .bar.v .item { flex-direction: column; gap: 0; }
    .bar.v .name { white-space: normal; }
    .bar.v .chg { font-size: 11px; }
    .name { font-weight: 600; } .price { font-variant-numeric: tabular-nums; }
    .chg { font-variant-numeric: tabular-nums; font-size: 12px; }
    .ctrl { display: flex; align-items: center; gap: 4px; padding: 0 6px; flex: none; }
    .bar.v .ctrl { justify-content: space-between; padding: 4px 6px; border-bottom: 1px solid #eee; }
    .status { font-size: 11px; color: #888; }
    button { all: unset; cursor: pointer; padding: 0 6px; color: #666; font-size: 14px; line-height: 1; }
    button:hover { color: #000; }
    .restore { position: fixed; z-index: 2147483647; right: 8px; bottom: 8px; padding: 6px 8px;
      background: rgba(255,255,255,.94); border-radius: 6px; box-shadow: 0 0 6px rgba(0,0,0,.2); font-size: 14px; }
    .tint { display: none; position: fixed; inset: 0; z-index: 2147483646; pointer-events: none; mix-blend-mode: multiply; opacity: .6; }
    .bar { transition: transform .2s ease-out, opacity .2s ease-out; }
    .bar.hide { opacity: 0; box-shadow: none; pointer-events: none; }
    .bar.hide.top { transform: translateY(-100%); } .bar.hide.bottom { transform: translateY(100%); }
    .bar.hide.left { transform: translateX(-100%); } .bar.hide.right { transform: translateX(100%); }
    .bar.autohide:hover .track { animation-play-state: running; } /* 防窺模式滑鼠一定停在上面，不能暫停 */
    .bar.hide .track { animation-play-state: paused; }
    @media (prefers-reduced-motion: reduce) { .bar { transition: none; } }
    @keyframes scroll-x { from { transform: translateX(0); } to { transform: translateX(-50%); } }
    @keyframes scroll-y { from { transform: translateY(0); } to { transform: translateY(-50%); } }
  `;

  function colorsFor(change) {
    if (!change) return FLAT;
    const isRed = (change > 0) === (settings.scheme === 'tw');
    return isRed ? { text: settings.redText, bg: settings.redBg } : { text: settings.greenText, bg: settings.greenBg };
  }

  function fmt(n, d = 2) {
    return n.toLocaleString('zh-TW', { minimumFractionDigits: d, maximumFractionDigits: d });
  }

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function buildItem(q) {
    const c = colorsFor(q.change);
    const item = el('span', 'item');
    item.style.background = c.bg;
    item.style.color = c.text;
    const label = { t00: '加權指數', o00: '櫃買指數' }[q.code] || `${q.name} ${q.code}`;
    const arrow = q.change > 0 ? '▲' : q.change < 0 ? '▼' : '－';
    const sign = q.change > 0 ? '+' : '';
    item.append(
      el('span', 'name', label),
      el('span', 'price', fmt(q.price)),
      el('span', 'chg', `${arrow}${sign}${fmt(q.change)} (${sign}${fmt(q.pct)}%)`)
    );
    return item;
  }

  // 只替換 group 內容，track 元素不變，動畫不會重新開始
  function fillQuotes() {
    if (!ui) return;
    const quotes = data.quotes || [];
    const hasSymbols = parseSymbols(settings.symbols).length > 0;
    const make = () => quotes.length ? quotes.map(buildItem) : [el('span', 'item', hasSymbols ? '載入行情中…' : '尚未設定自選股，點工具列圖示設定')];
    // 股票少時重複內容直到填滿可視區，避免捲動出現大片空白
    const [g0, g1] = ui.groups;
    g0.replaceChildren(...make());
    const vpSize = () => ui.vertical ? ui.viewport.clientHeight : ui.viewport.clientWidth;
    const gSize = () => ui.vertical ? g0.offsetHeight : g0.offsetWidth;
    for (let i = 0; i < 20 && gSize() > 0 && gSize() < vpSize(); i++) g0.append(...make());
    g1.replaceChildren(...[...g0.children].map(n => n.cloneNode(true)));
    const t = data.updatedAt ? new Date(data.updatedAt).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false }) : '';
    ui.status.textContent = data.error ? '資料延遲' : data.closed ? '收盤' : t ? `${t} 更新` : '';
    ui.status.title = data.error || '';
    updateTint();
    requestAnimationFrame(updateDuration);
  }

  function updateDuration() {
    if (!ui) return;
    const g = ui.groups[0];
    const size = ui.vertical ? g.offsetHeight : g.offsetWidth;
    const dur = Math.max(size / (SPEED[settings.speed] || SPEED.medium), 5);
    const cur = parseFloat(ui.track.style.animationDuration) || 0;
    if (Math.abs(cur - dur) / dur > 0.1) ui.track.style.animationDuration = `${dur}s`;
  }

  function updateTint() {
    if (!ui) return;
    const show = settings.tint && data.index && data.index.change && !data.minimized && !ui.bar.classList.contains('hide');
    ui.tint.style.display = show ? 'block' : 'none';
    if (show) ui.tint.style.background = colorsFor(data.index.change).bg;
  }

  function setMinimized(v) {
    chrome.storage.local.set({ minimized: v });
  }

  function render() {
    teardown();
    if (isExcludedHost(location.hostname, settings.excluded)) return;

    host = document.createElement('div');
    host.id = 'tw-ticker-host';
    const shadow = host.attachShadow({ mode: 'closed' });
    shadow.append(el('style', null, CSS));

    const tint = el('div', 'tint');
    shadow.append(tint);

    if (data.minimized) {
      const restore = el('button', 'restore');
      restore.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#C62828" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 17 9 11 13 15 21 7"/><polyline points="14 7 21 7 21 14"/></svg>';
      restore.title = '展開台股跑馬燈';
      restore.setAttribute('aria-label', '展開台股跑馬燈');
      restore.onclick = () => setMinimized(false);
      shadow.append(restore);
      ui = null;
    } else {
      const pos = settings.position;
      const vertical = pos === 'left' || pos === 'right';
      const bar = el('div', `bar ${vertical ? 'v' : 'h'} ${pos}${settings.autoHide ? ' autohide hide' : ''}`);
      const ctrl = el('div', 'ctrl');
      const status = el('span', 'status');
      const minBtn = el('button', null, '－');
      minBtn.title = '最小化';
      minBtn.setAttribute('aria-label', '最小化跑馬燈');
      minBtn.onclick = () => setMinimized(true);
      ctrl.append(status, minBtn);

      const viewport = el('div', 'viewport');
      const track = el('div', 'track');
      const groups = [el('div', 'group'), el('div', 'group')];
      track.append(...groups);
      viewport.append(track);
      // 直向時控制列放上方，橫向時放右側
      vertical ? bar.append(ctrl, viewport) : bar.append(viewport, ctrl);
      shadow.append(bar);
      ui = { bar, track, groups, status, tint, vertical, viewport };
    }
    document.documentElement.append(host);
    fillQuotes(); // 需在掛上 DOM 後執行，才量得到尺寸
  }

  function teardown() {
    if (host) host.remove();
    host = null;
    ui = null;
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync') {
      for (const k in changes) settings[k] = changes[k].newValue;
      render();
    } else if (area === 'local') {
      const prevMin = data.minimized;
      for (const k in changes) data[k] = changes[k].newValue;
      if (data.minimized !== prevMin) render();
      else fillQuotes();
    }
  });

  // ── 防窺模式：滑鼠移到邊緣才顯示，移開後自動收起 ──
  const EDGE = 8; // px
  let hideTimer = null;

  function nearEdge(e) {
    switch (settings.position) {
      case 'top': return e.clientY <= EDGE;
      case 'bottom': return e.clientY >= window.innerHeight - EDGE;
      case 'left': return e.clientX <= EDGE;
      case 'right': return e.clientX >= window.innerWidth - EDGE;
    }
    return false;
  }

  function setHidden(v) {
    if (!ui) return;
    ui.bar.classList.toggle('hide', v);
    updateTint();
  }

  function scheduleHide(delay) {
    if (!ui || ui.bar.classList.contains('hide') || hideTimer) return;
    hideTimer = setTimeout(() => { hideTimer = null; setHidden(true); }, delay);
  }

  document.addEventListener('mousemove', e => {
    if (!ui || !settings.autoHide) return;
    // closed shadow DOM 內的事件會被重新指向 host，所以 target === host 代表滑鼠在跑馬燈上
    if (nearEdge(e) || e.target === host) {
      clearTimeout(hideTimer);
      hideTimer = null;
      setHidden(false);
    } else scheduleHide(500);
  }, { passive: true });

  // 滑鼠離開視窗時立刻收起
  document.addEventListener('mouseout', e => {
    if (ui && settings.autoHide && !e.relatedTarget) scheduleHide(0);
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(fillQuotes, 200);
  });
  render();
})();
