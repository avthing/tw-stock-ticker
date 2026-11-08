// 設定頁與新手教學頁共用：SVG 圖示、跑馬燈預覽、表單綁定
const ICONS = {
  trend: '<polyline points="3 17 9 11 13 15 21 7"/><polyline points="14 7 21 7 21 14"/>',
  list: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
  layout: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="17" x2="21" y2="17"/>',
  palette: '<circle cx="12" cy="12" r="9"/><circle cx="8.5" cy="10" r="1.2"/><circle cx="12" cy="7.5" r="1.2"/><circle cx="15.5" cy="10" r="1.2"/>',
  gauge: '<path d="M12 14l4-4"/><path d="M3.3 17a9 9 0 1 1 17.4 0"/>',
  layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
  ban: '<circle cx="12" cy="12" r="9"/><line x1="5.6" y1="5.6" x2="18.4" y2="18.4"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5V21h16"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  pause: '<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>',
  minus: '<line x1="5" y1="12" x2="19" y2="12"/>',
  eyeOff: '<path d="M17.94 17.94A10 10 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9 9 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>',
  puzzle: '<path d="M19.44 7.85c-.05.32.06.65.29.88l1.57 1.57a2.41 2.41 0 0 1 0 3.41l-1.61 1.61a.98.98 0 0 1-.84.28c-.47-.07-.8-.48-.97-.93a2.5 2.5 0 1 0-3.21 3.21c.45.17.86.5.93.97a.98.98 0 0 1-.28.84l-1.61 1.61a2.41 2.41 0 0 1-3.41 0l-1.57-1.57a1.03 1.03 0 0 0-.88-.29c-.49.07-.84.5-1.02.97a2.5 2.5 0 1 1-3.24-3.24c.46-.18.89-.53.97-1.02a1.03 1.03 0 0 0-.29-.88l-1.57-1.57a2.41 2.41 0 0 1 0-3.41L4.23 8.77c.24-.24.58-.35.92-.3.51.08.88.53 1.07 1.01a2.5 2.5 0 1 0 3.26-3.26c-.48-.2-.93-.56-1.01-1.07-.05-.34.06-.68.3-.92l1.53-1.53a2.41 2.41 0 0 1 3.41 0l1.57 1.57c.23.23.56.34.88.29.49-.07.84-.5 1.02-.97a2.5 2.5 0 1 1 3.24 3.24c-.46.18-.89.53-.97 1.02z"/>',
  pin: '<line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24z"/>',
  search: '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  grip: '<circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>',
  arrowUp: '<line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>',
  arrowDown: '<line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>',
  arrowRight: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
  arrowLeft: '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>'
};

function icon(name) {
  return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>`;
}

// 將 [data-icon] 元素填入 SVG
function hydrateIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach(e => e.insertAdjacentHTML('afterbegin', icon(e.dataset.icon)));
}

const SAMPLE = [
  { name: '加權指數', price: '23,456.78', change: 123.45, pct: 0.53 },
  { name: '台積電 2330', price: '1,085.00', change: -15, pct: -1.36 },
  { name: '元大台灣50 0050', price: '192.35', change: 0, pct: 0 },
  { name: '聯發科 2454', price: '1,320.00', change: 25, pct: 1.93 }
];

function pickColors(s, change) {
  if (!change) return { text: '#616161', bg: '#F2F2F2' };
  const red = (change > 0) === (s.scheme === 'tw');
  return red ? { text: s.redText, bg: s.redBg } : { text: s.greenText, bg: s.greenBg };
}

// 繪製預覽：上方假網頁（濾鏡用），下方跑馬燈
function renderPreview(container, s) {
  const items = previewItemsHTML(s);
  const tint = s.tint ? pickColors(s, 1).bg : '#fff';
  container.innerHTML = `
    <div class="preview" role="img" aria-label="跑馬燈預覽">
      <div class="preview-page" style="background:${tint}"><b></b><b></b><b></b></div>
      <div class="preview-bar"><div class="preview-track">${items}${items}</div></div>
    </div>`;
}

// 範例跑馬燈項目（SAMPLE 為固定字串，無外部輸入）
function previewItemsHTML(s) {
  return SAMPLE.map(q => {
    const c = pickColors(s, q.change);
    const arrow = q.change > 0 ? '▲' : q.change < 0 ? '▼' : '－';
    const sign = q.change > 0 ? '+' : '';
    return `<span class="pv-item" style="color:${c.text};background:${c.bg}"><span class="n">${q.name}</span><span class="p">${q.price}</span><span class="c">${arrow}${sign}${q.change.toFixed(2)} (${sign}${q.pct.toFixed(2)}%)</span></span>`;
  }).join('');
}

// 儲存設定並顯示「已儲存」提示
let toastTimer;
function save(patch) {
  chrome.storage.sync.set(patch, () => {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1500);
  });
}

// 依 data-key 自動綁定表單：textarea/text/color/checkbox/radio，變更即存
function bindForm(root, onChange) {
  chrome.storage.sync.get(DEFAULTS, s => {
    root.querySelectorAll('[data-key]').forEach(el => {
      const k = el.dataset.key;
      if (el.type === 'radio') el.checked = el.value === s[k];
      else if (el.type === 'checkbox') el.checked = !!s[k];
      else el.value = s[k];
      const ev = el.tagName === 'TEXTAREA' ? 'input' : 'change';
      el.addEventListener(ev, () => {
        const v = el.type === 'checkbox' ? el.checked : el.value;
        s[k] = v;
        onChange && onChange(s);
        // 文字欄位延遲儲存，避免每個按鍵都寫入 sync（有寫入頻率限制）
        if (ev === 'input') {
          clearTimeout(el._t);
          el._t = setTimeout(() => save({ [k]: v }), 500);
        } else save({ [k]: v });
      });
    });
    onChange && onChange(s);
  });
}

// ── 股票搜尋 ─────────────────────────────────────────────
const INDEX_NAMES = { t00: '加權指數', o00: '櫃買指數' };
const LIST_URLS = [
  ['https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL', x => [x.Code, x.Name]], // 上市（含 ETF）
  ['https://www.tpex.org.tw/openapi/v1/tpex_mainboard_quotes', x => [x.SecuritiesCompanyCode, x.CompanyName]] // 上櫃
];
const LIST_TTL = 7 * 24 * 3600 * 1000;

// 取得 [[代號, 名稱], ...]；快取 7 天，抓取失敗時沿用舊快取
async function loadStockList() {
  const { stockList } = await chrome.storage.local.get('stockList');
  if (stockList && Date.now() - stockList.updatedAt < LIST_TTL) return stockList.items;
  const res = await Promise.allSettled(LIST_URLS.map(([url, pick]) =>
    fetch(url).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }).then(a => a.map(pick))));
  const items = res.filter(r => r.status === 'fulfilled').flatMap(r => r.value).filter(([c, n]) => c && n);
  if (!items.length) return stockList ? stockList.items : [];
  // 只有兩邊都成功才寫入快取，避免部分失敗時快取 7 天的殘缺清單
  if (res.every(r => r.status === 'fulfilled')) await chrome.storage.local.set({ stockList: { updatedAt: Date.now(), items } });
  return items;
}

const norm = s => String(s).toLowerCase().replace(/\s+/g, '');

// 依序比對字元，例如「元50」可以找到「元大台灣50」
function isSubsequence(q, s) {
  let i = 0;
  for (const ch of s) if (ch === q[i] && ++i === q.length) return true;
  return false;
}

// 模糊搜尋：完全相符 > 代號開頭 > 名稱開頭 > 名稱包含 > 代號包含 > 字元依序出現；同分時名稱短的優先
function searchStocks(items, query, limit = 8) {
  const q = norm(query);
  if (!q) return [];
  const scored = [];
  for (const [code, name] of items) {
    const c = code.toLowerCase(), n = norm(name);
    const s = c === q || n === q ? 100 : c.startsWith(q) ? 80 : n.startsWith(q) ? 70
      : n.includes(q) ? 60 : c.includes(q) ? 50 : isSubsequence(q, n) ? 30 : 0;
    if (s) scored.push({ score: s - n.length * 0.1, code, name });
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

// 名稱中符合查詢的部分用 <mark> 標示（以 DOM 組裝，避免 XSS）
function highlight(name, query) {
  const frag = document.createDocumentFragment();
  const i = name.toLowerCase().indexOf(query.trim().toLowerCase());
  if (!query.trim() || i < 0) { frag.append(name); return frag; }
  const len = query.trim().length;
  frag.append(name.slice(0, i), el('mark', null, name.slice(i, i + len)), name.slice(i + len));
  return frag;
}

// 股票選擇器：搜尋框 + 下拉建議（combobox）+ 已加入標籤
function initStockPicker(root) {
  root.innerHTML = `
    <label class="field-label" for="stockSearch">搜尋股票</label>
    <div class="combo">
      <span class="combo-icon">${icon('search')}</span>
      <input id="stockSearch" type="text" role="combobox" aria-expanded="false" aria-controls="stockOptions"
        aria-autocomplete="list" aria-describedby="pickerStatus" autocomplete="off" spellcheck="false"
        placeholder="輸入名稱或代號，例如：台積電、2330、元大50">
      <ul id="stockOptions" class="suggest" role="listbox" aria-label="搜尋結果" hidden></ul>
    </div>
    <div id="pickerStatus" class="helper picker-status" aria-live="polite"></div>
    <span class="field-label">已加入的股票</span>
    <div class="helper" style="margin:-2px 0 8px">由上到下就是跑馬燈的播放順序，可以拖曳或用箭頭按鈕調整</div>
    <ol class="stock-list" aria-label="已加入的股票（依跑馬燈播放順序）"></ol>`;
  const input = root.querySelector('input');
  const listEl = root.querySelector('[role="listbox"]');
  const listOl = root.querySelector('.stock-list');
  const statusEl = root.querySelector('.picker-status');
  let items = Object.entries(INDEX_NAMES);
  const names = { ...INDEX_NAMES };
  let codes = [];
  let results = [];
  let active = -1;

  const label = c => (INDEX_NAMES[c] ? INDEX_NAMES[c] : names[c] ? `${names[c]} ${c}` : c);

  let dragFrom = -1;

  function rowButton(act, iconName, aria, onClick, disabled) {
    const b = el('button', 'row-btn');
    b.type = 'button';
    b.dataset.act = act;
    b.innerHTML = icon(iconName);
    b.title = aria;
    b.setAttribute('aria-label', aria);
    b.disabled = disabled;
    b.onclick = onClick;
    return b;
  }

  function clearDropMarks() {
    listOl.querySelectorAll('.drop-before, .drop-after').forEach(r => r.classList.remove('drop-before', 'drop-after'));
  }

  // 已加入清單：順序即跑馬燈播放順序；支援拖曳與上移/下移按鈕（鍵盤可操作）
  function renderSelected() {
    if (!codes.length) return listOl.replaceChildren(el('li', 'helper', '尚未加入任何股票'));
    listOl.replaceChildren(...codes.map((c, i) => {
      const name = label(c);
      const li = el('li', 'stock-row');
      li.draggable = true;
      const handle = el('span', 'drag-handle');
      handle.innerHTML = icon('grip');
      handle.title = '拖曳調整順序';
      li.append(
        handle,
        el('span', 'row-no', String(i + 1)),
        el('span', 'row-name', name),
        rowButton('up', 'arrowUp', `上移 ${name}`, () => move(i, i - 1, 'up'), i === 0),
        rowButton('down', 'arrowDown', `下移 ${name}`, () => move(i, i + 1, 'down'), i === codes.length - 1),
        rowButton('remove', 'x', `移除 ${name}`, () => remove(c), false)
      );
      li.addEventListener('dragstart', e => {
        dragFrom = i;
        li.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', c);
      });
      li.addEventListener('dragend', () => { dragFrom = -1; li.classList.remove('dragging'); clearDropMarks(); });
      const isAfter = e => { const r = li.getBoundingClientRect(); return e.clientY > r.top + r.height / 2; };
      li.addEventListener('dragover', e => {
        if (dragFrom < 0) return;
        e.preventDefault();
        clearDropMarks();
        li.classList.add(isAfter(e) ? 'drop-after' : 'drop-before');
      });
      li.addEventListener('drop', e => {
        if (dragFrom < 0) return;
        e.preventDefault();
        let to = i + (isAfter(e) ? 1 : 0);
        if (dragFrom < to) to--;
        const from = dragFrom;
        dragFrom = -1;
        move(from, to);
      });
      return li;
    }));
  }

  function move(from, to, focusAct) {
    if (to < 0 || to >= codes.length || from === to) return;
    const [c] = codes.splice(from, 1);
    codes.splice(to, 0, c);
    persist();
    // 用按鈕移動後，焦點跟著同一檔股票，方便連續按
    if (focusAct) {
      const row = listOl.children[to];
      const btn = row.querySelector(`[data-act="${focusAct}"]:not(:disabled)`) || row.querySelector('[data-act="remove"]');
      btn.focus();
    }
  }

  function persist() {
    save({ symbols: codes.join(', ') });
    renderSelected();
  }

  function add(code) {
    const c = parseSymbols(code)[0];
    if (!c) return;
    if (!codes.includes(c)) codes.push(c);
    persist();
    input.value = '';
    close();
    input.focus();
  }

  function remove(code) {
    codes = codes.filter(c => c !== code);
    persist();
  }

  function close() {
    listEl.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    active = -1;
  }

  function renderList() {
    const q = input.value;
    if (!q.trim()) return close();
    listEl.replaceChildren(...(results.length ? results.map((r, i) => {
      const li = el('li');
      li.id = `opt-${i}`;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', String(i === active));
      const left = el('span', 'opt-main');
      left.append(el('span', 'opt-name'), el('span', 'code', INDEX_NAMES[r.code] ? '指數' : r.code));
      left.firstChild.append(highlight(r.name, q));
      li.append(left);
      if (codes.includes(r.code)) li.append(el('span', 'added', '已加入'));
      li.addEventListener('mousedown', e => { e.preventDefault(); add(r.code); });
      li.addEventListener('mousemove', () => { if (active !== i) { active = i; renderList(); } });
      return li;
    }) : [el('li', 'empty', /^[0-9a-z]+$/i.test(q.trim()) ? `找不到「${q.trim()}」，按 Enter 直接以代號加入` : `找不到「${q.trim()}」`)]));
    listEl.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    if (active >= 0) {
      input.setAttribute('aria-activedescendant', `opt-${active}`);
      listEl.children[active].scrollIntoView({ block: 'nearest' });
    } else input.removeAttribute('aria-activedescendant');
  }

  input.addEventListener('input', () => {
    results = searchStocks(items, input.value);
    active = results.length ? 0 : -1;
    renderList();
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!results.length) return;
      e.preventDefault();
      active = (active + (e.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length;
      renderList();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (active >= 0 && !listEl.hidden) add(results[active].code);
      else if (/^[0-9a-z]+$/i.test(input.value.trim())) add(input.value.trim());
    } else if (e.key === 'Escape') {
      close();
    } else if (e.key === 'Backspace' && !input.value && codes.length) {
      remove(codes[codes.length - 1]);
    }
  });

  input.addEventListener('blur', () => setTimeout(close, 120));

  chrome.storage.sync.get({ symbols: DEFAULTS.symbols }, s => {
    codes = parseSymbols(s.symbols);
    renderSelected();
  });

  statusEl.textContent = '正在載入股票清單…';
  loadStockList().then(list => {
    items = [...Object.entries(INDEX_NAMES), ...list];
    for (const [c, n] of list) names[c] = n;
    renderSelected();
    statusEl.textContent = list.length
      ? `可搜尋 ${list.length.toLocaleString()} 檔上市櫃股票與 ETF，用方向鍵選擇、Enter 加入`
      : '股票清單載入失敗，仍可直接輸入代號後按 Enter 加入';
    if (input.value) input.dispatchEvent(new Event('input'));
  });
}
