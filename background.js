importScripts('defaults.js');

const API = 'https://mis.twse.com.tw/stock/api/getStockInfo.jsp';
const ALARM = 'tw-ticker-refresh';

function num(v) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

// 將 MIS 回傳的單筆資料轉為 { code, name, price, change, pct }
function toQuote(m, closed) {
  if (!m || !m.c) return null; // 無效前綴（上市/上櫃猜錯）會回傳 c 為空字串
  const prev = num(m.y);
  let price;
  if (closed) {
    // 非盤中：MIS 在週末／盤前可能回傳不是收盤的行情。只有資料時間 ≥ 13:30 才是當日收盤，否則用 y（上一交易日收盤）
    const finalTick = String(m.t || '') >= '13:30:00';
    price = (finalTick ? num(m.z) : null) ?? prev;
  } else {
    // 無成交時依序退回：最佳買價 → 最佳賣價（跌停鎖死時只有賣價）→ 昨收
    price = num(m.z) ?? num(String(m.b || '').split('_')[0]) ?? num(String(m.a || '').split('_')[0]) ?? prev;
  }
  if (price == null || prev == null) return null;
  const change = price - prev;
  return { code: m.c, name: m.n, price, change, pct: prev ? (change / prev) * 100 : 0 };
}

let fetchSeq = 0; // 只讓最新一次請求寫入，避免慢回應蓋掉新清單的結果

async function fetchQuotes() {
  const seq = ++fetchSeq;
  const { symbols } = await chrome.storage.sync.get({ symbols: DEFAULTS.symbols });
  const codes = parseSymbols(symbols);
  // 一律附帶加權指數，供整頁濾鏡判斷大盤漲跌
  const all = [...new Set([...codes, INDEX_CODE])];
  const exCh = all.flatMap(c => [`tse_${c}.tw`, `otc_${c}.tw`]).join('|');
  const closed = !isTradingTime();

  try {
    const res = await fetch(`${API}?ex_ch=${encodeURIComponent(exCh)}&json=1&delay=0&_=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (seq !== fetchSeq) return;
    if (data.rtcode !== '0000') throw new Error(data.rtmessage || data.rtcode);

    const byCode = {};
    for (const m of data.msgArray || []) {
      const q = toQuote(m, closed);
      if (q) byCode[q.code] = q;
    }
    await chrome.storage.local.set({
      quotes: codes.map(c => byCode[c]).filter(Boolean),
      index: byCode[INDEX_CODE] || null,
      closed,
      error: null,
      updatedAt: Date.now()
    });
    console.log('[台股跑馬燈] 更新', Object.keys(byCode).length, '筆');
  } catch (e) {
    // 保留舊資料，只標記錯誤
    if (seq !== fetchSeq) return;
    await chrome.storage.local.set({ closed, error: String(e.message || e) });
    console.warn('[台股跑馬燈] 抓取失敗', e);
  }
}

async function onTick() {
  if (isTradingTime()) return fetchQuotes();
  // 盤後：若上次是在盤中抓的（closed=false）或尚無資料，補抓一次收盤價
  const { closed, updatedAt } = await chrome.storage.local.get(['closed', 'updatedAt']);
  if (!updatedAt || closed === false) return fetchQuotes();
}

function setup() {
  chrome.alarms.create(ALARM, { periodInMinutes: 1 });
  fetchQuotes();
}

chrome.runtime.onInstalled.addListener(details => {
  setup();
  if (details.reason === 'install') chrome.tabs.create({ url: 'welcome.html' });
});
chrome.runtime.onStartup.addListener(setup);
chrome.alarms.onAlarm.addListener(a => { if (a.name === ALARM) onTick(); });
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.symbols) fetchQuotes();
});
chrome.action.onClicked.addListener(() => {
  chrome.storage.local.set({ actionClickedAt: Date.now() }); // 新手教學用來判斷「從工具列開啟設定頁」任務是否完成
  chrome.runtime.openOptionsPage();
});
