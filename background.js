importScripts('defaults.js');

const API = 'https://mis.twse.com.tw/stock/api/getStockInfo.jsp';
const INST_API = 'https://www.twse.com.tw/rwd/zh/fund/BFI82U'; // 三大法人買賣金額統計表
const NIGHT_API = 'https://mis.taifex.com.tw/futures/api/getQuoteList'; // 期交所臺指期夜盤
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
    // 漲停鎖死時買價第一檔會是 0.0000（市價單佔位），須略過 0 取第一個有效價
    const firstPrice = s => String(s || '').split('_').map(num).find(n => n > 0) ?? null;
    price = num(m.z) ?? firstPrice(m.b) ?? firstPrice(m.a) ?? prev;
  }
  if (price == null || prev == null) return null;
  const change = price - prev;
  return { code: m.c, name: m.n, price, change, pct: prev ? (change / prev) * 100 : 0 };
}

let fetchSeq = 0; // 只讓最新一次請求寫入，避免慢回應蓋掉新清單的結果

async function fetchQuotes() {
  const seq = ++fetchSeq;
  const { symbols } = await chrome.storage.sync.get({ symbols: DEFAULTS.symbols });
  const codes = parseSymbols(symbols).filter(c => !isNightCode(c));
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
    let quoteDate = null; // 行情資料日期（YYYYMMDD），盤後模式用來判斷今天是否為交易日
    for (const m of data.msgArray || []) {
      const q = toQuote(m, closed);
      if (q) byCode[q.code] = q;
      if (m.c === INDEX_CODE && m.d) quoteDate = m.d;
    }
    await chrome.storage.local.set({
      quotes: codes.map(c => byCode[c]).filter(Boolean),
      index: byCode[INDEX_CODE] || null,
      quoteDate,
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

// 將 BFI82U 的 data 列整理成 [{ key, buy, sell, net }]（金額單位：元）；缺任一列就回 null
function parseInst(rows) {
  const toNum = v => Number(String(v).replace(/,/g, ''));
  const row = prefix => (rows || []).find(r => String(r[0]).startsWith(prefix));
  const pick = (key, ...parts) => {
    if (parts.some(p => !p)) return null;
    const sum = i => parts.reduce((s, r) => s + toNum(r[i]), 0);
    const out = { key, buy: sum(1), sell: sum(2), net: sum(3) };
    return [out.buy, out.sell, out.net].every(Number.isFinite) ? out : null;
  };
  const list = [
    pick('foreign', row('外資及陸資')),
    pick('trust', row('投信')),
    pick('dealer', row('自營商(自行買賣)'), row('自營商(避險)')),
    pick('total', row('合計'))
  ];
  return list.every(Boolean) ? list : null;
}

let instBusy = false;

// 盤後抓當日三大法人買賣金額；證交所尚未公布時會回前一交易日資料，date 不是今天就視為未公布
async function fetchInstitutional() {
  if (instBusy || !isAfterClose()) return;
  instBusy = true;
  try {
    const { afterHours } = await chrome.storage.sync.get({ afterHours: DEFAULTS.afterHours });
    if (!afterHours) return;
    const today = taipeiDate();
    const { inst, quoteDate } = await chrome.storage.local.get(['inst', 'quoteDate']);
    if (quoteDate !== today || (inst && inst.date === today)) return; // 休市日不抓；今日資料已取得就停止
    const res = await fetch(`${INST_API}?type=day&dayDate=${today}&response=json`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.stat !== 'OK' || json.date !== today) return;
    const rows = parseInst(json.data);
    if (!rows) throw new Error('三大法人資料格式異常');
    await chrome.storage.local.set({ inst: { date: today, rows, updatedAt: Date.now() } });
    console.log('[台股跑馬燈] 三大法人已更新', today);
  } catch (e) {
    console.warn('[台股跑馬燈] 三大法人抓取失敗', e);
  } finally {
    instBusy = false;
  }
}

function fNum(v) {
  const s = String(v ?? '').replace(/,/g, '').trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

// 依期交所 QuoteList 與商品代號（如 TXF、CDF）取第一筆 CLastPrice > 0 的 -M 合約
function toNightQuote(list, cid = 'TXF', fallbackName = '') {
  let curCid = '';
  const candidates = [];
  for (const m of list || []) {
    const sid = String(m?.SymbolID || '');
    if (sid.endsWith('-P')) { curCid = sid.slice(0, -2); continue; }
    if (!sid.endsWith('-M')) continue;
    const rowCid = (curCid && sid.startsWith(curCid)) ? curCid : (curCid && /^MX\d/.test(sid) && curCid === 'MXF' ? 'MXF' : sid.replace(/[A-L]\d-M$/, ''));
    if (rowCid === cid) candidates.push(m);
  }
  // 優先取 SymbolID 以 cid 開頭且 CLastPrice > 0 的近月合約（如 MXFL6-M 優先於 MX4K6-M）
  candidates.sort((a, b) => (String(b.SymbolID).startsWith(cid) ? 1 : 0) - (String(a.SymbolID).startsWith(cid) ? 1 : 0));
  for (const m of candidates) {
    const price = fNum(m.CLastPrice);
    if (price == null || price <= 0) continue;
    const base = String(m.DispCName || '').replace(/\d+$/, '');
    return {
      code: 'N' + cid,
      name: fallbackName || (base ? `${base}夜盤` : `N${cid}`),
      price,
      change: fNum(m.CDiff) ?? 0,
      pct: fNum(m.CDiffRate) ?? 0,
      time: String(m.CTime || '').trim()
    };
  }
  return null;
}

let nightBusy = false;

async function fetchNight() {
  if (nightBusy || !isNightSession()) return;
  nightBusy = true;
  try {
    const { nightFutures, symbols } = await chrome.storage.sync.get({
      nightFutures: DEFAULTS.nightFutures,
      symbols: DEFAULTS.symbols
    });
    const nightCodes = parseSymbols(symbols).filter(isNightCode);
    if (!nightFutures || !nightCodes.length) return;

    const { nightList, night: prevNight } = await chrome.storage.local.get(['nightList', 'night']);
    const metaByCode = {};
    for (const item of [...NIGHT_FALLBACK, ...(nightList?.items || [])]) metaByCode[item.code] = item;

    // 依 kindId 分組請求；未知商品代號則三個 kindId 都查一次
    const byKind = {};
    for (const c of nightCodes) {
      const kinds = metaByCode[c]?.kindId ? [metaByCode[c].kindId] : ['1', '4', '5'];
      for (const k of kinds) (byKind[k] ||= []).push(c);
    }

    const next = (prevNight && typeof prevNight === 'object' && !('price' in prevNight)) ? { ...prevNight } : {};
    // 移除已不在清單內的舊夜盤項目
    for (const k of Object.keys(next)) if (!nightCodes.includes(k)) delete next[k];

    const now = Date.now();
    await Promise.all(Object.entries(byKind).map(async ([kindId, codes]) => {
      try {
        const res = await fetch(NIGHT_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            MarketType: '1', SymbolType: 'F', KindID: kindId, CID: '',
            ExpireMonth: '', RowSize: '全部', PageNo: '', SortColumn: '', AscDesc: 'A'
          }),
          cache: 'no-store'
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (String(json.RtCode) !== '0') throw new Error(json.RtMsg || json.RtCode);
        const list = json.RtData?.QuoteList || [];
        for (const c of codes) {
          const q = toNightQuote(list, nightCid(c), metaByCode[c]?.name);
          if (q) next[c] = { ...q, updatedAt: now };
          else if (metaByCode[c]?.kindId === kindId) delete next[c]; // 該商品無成交時不保留過期值
        }
      } catch (e) {
        console.warn(`[台股跑馬燈] 夜盤 KindID=${kindId} 抓取失敗`, e);
      }
    }));

    await chrome.storage.local.set({ night: next });
    console.log('[台股跑馬燈] 夜盤已更新', Object.keys(next).length, '筆');
  } catch (e) {
    console.warn('[台股跑馬燈] 夜盤抓取失敗', e);
  } finally {
    nightBusy = false;
  }
}

async function onTick() {
  fetchInstitutional();
  fetchNight();
  if (isTradingTime()) return fetchQuotes();
  // 盤後：若上次是在盤中抓的（closed=false）、尚無資料或今天還沒抓過（如電腦睡眠過夜），補抓一次收盤價
  const { closed, updatedAt } = await chrome.storage.local.get(['closed', 'updatedAt']);
  if (!updatedAt || closed === false || taipeiDate(updatedAt) !== taipeiDate()) return fetchQuotes();
}

async function setup() {
  chrome.alarms.create(ALARM, { periodInMinutes: 1 });
  await fetchQuotes(); // 先取得 quoteDate，法人判斷才有依據
  fetchInstitutional();
  fetchNight();
}

chrome.runtime.onInstalled.addListener(details => {
  setup();
  if (details.reason === 'install') chrome.tabs.create({ url: 'welcome.html' });
  else if (details.reason === 'update' && details.previousVersion !== chrome.runtime.getManifest().version) {
    chrome.tabs.create({ url: 'changelog.html' }); // 新版本更新後開啟更新紀錄
  }
});
chrome.runtime.onStartup.addListener(setup);
chrome.alarms.onAlarm.addListener(a => { if (a.name === ALARM) onTick(); });
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.symbols) { fetchQuotes(); fetchNight(); }
  if (area === 'sync' && changes.afterHours) fetchInstitutional();
  if (area === 'sync' && changes.nightFutures) fetchNight();
});
chrome.action.onClicked.addListener(() => {
  chrome.storage.local.set({ actionClickedAt: Date.now() }); // 新手教學用來判斷「從工具列開啟設定頁」任務是否完成
  chrome.runtime.openOptionsPage();
});
