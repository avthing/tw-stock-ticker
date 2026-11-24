// 共用預設設定與解析函式（background / content / options 共用）
const DEFAULTS = {
  symbols: 't00, 2330',
  position: 'bottom', // top | bottom | left | right
  scheme: 'tw', // tw: 紅漲綠跌；us: 綠漲紅跌
  redText: '#C62828',
  redBg: '#FDECEC',
  greenText: '#2E7D32',
  greenBg: '#E8F5E9',
  speed: 'medium', // slow | medium | fast
  excluded: 'youtube.com\nnetflix.com',
  tint: false,
  autoHide: false, // 防窺模式：滑鼠移到邊緣才顯示
  afterHours: true, // 盤後模式：收盤後隱藏跑馬燈，公布後改顯示三大法人買賣超
  nightFutures: false // 夜盤總開關：夜盤時段（15:00～隔日 05:00）顯示清單中的夜盤項目
};

const INDEX_CODE = 't00'; // 加權指數
const NIGHT_FALLBACK = [{ code: 'NTXF', name: '臺指期夜盤', kindId: '1' }];

function isNightCode(c) {
  return /^N[A-Z0-9]{2,6}$/.test(String(c || '').toUpperCase());
}

function nightCid(c) {
  const s = String(c || '').toUpperCase();
  return isNightCode(s) ? s.slice(1) : '';
}

// 股票代號：大寫（如 00631L），指數代號維持小寫（t00 加權、o00 櫃買；MIS 區分大小寫）
function parseSymbols(text) {
  const list = String(text || '')
    .split(/[\s,，、]+/)
    .map(s => s.trim())
    .filter(s => /^[0-9a-zA-Z]+$/.test(s))
    .map(s => (/^[to]\d+$/i.test(s) ? s.toLowerCase() : s.toUpperCase()));
  return [...new Set(list)];
}

function parseDomains(text) {
  return String(text || '')
    .split(/[\s,，]+/)
    .map(s => s.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, ''))
    .filter(Boolean);
}

function isExcludedHost(hostname, excludedText) {
  const host = hostname.toLowerCase();
  return parseDomains(excludedText).some(d => host === d || host.endsWith('.' + d));
}

// 台北時間週一到週五 09:00–13:35 視為盤中
function isTradingTime(now = Date.now()) {
  const d = new Date(now + 8 * 3600 * 1000);
  const day = d.getUTCDay();
  const min = d.getUTCHours() * 60 + d.getUTCMinutes();
  return day >= 1 && day <= 5 && min >= 9 * 60 && min <= 13 * 60 + 35;
}

// 台北時間週一到週五 13:35 之後視為收盤後（與 isTradingTime 互補）
function isAfterClose(now = Date.now()) {
  const d = new Date(now + 8 * 3600 * 1000);
  const day = d.getUTCDay();
  const min = d.getUTCHours() * 60 + d.getUTCMinutes();
  return day >= 1 && day <= 5 && min > 13 * 60 + 35;
}

// 台北時間的日期字串 YYYYMMDD（與證交所 date 欄位同格式）
function taipeiDate(now = Date.now()) {
  return new Date(now + 8 * 3600 * 1000).toISOString().slice(0, 10).replace(/-/g, '');
}

// 台北時間週一～週五 15:00–23:59、週二～週六 00:00–05:00 視為臺指期夜盤時段
function isNightSession(now = Date.now()) {
  const d = new Date(now + 8 * 3600 * 1000);
  const day = d.getUTCDay();
  const min = d.getUTCHours() * 60 + d.getUTCMinutes();
  return (day >= 1 && day <= 5 && min >= 15 * 60) || (day >= 2 && day <= 6 && min <= 5 * 60);
}

// 確認夜盤資料有效：在夜盤時段內、updatedAt 在 10 分鐘內、且 CTime（HHMMSS）距今不超過 15 分鐘
function isNightFresh(night, now = Date.now()) {
  if (!night || !isNightSession(now)) return false;
  if (!night.updatedAt || now - night.updatedAt > 10 * 60 * 1000) return false;
  const t = String(night.time || '').trim();
  if (!/^\d{6}$/.test(t)) return false;
  const tickSec = Number(t.slice(0, 2)) * 3600 + Number(t.slice(2, 4)) * 60 + Number(t.slice(4, 6));
  const d = new Date(now + 8 * 3600 * 1000);
  const nowSec = d.getUTCHours() * 3600 + d.getUTCMinutes() * 60 + d.getUTCSeconds();
  let diff = nowSec - tickSec;
  if (diff < -12 * 3600) diff += 86400; // 跨午夜（例：23:58 成交，00:02 顯示）
  return diff >= -120 && diff <= 15 * 60;
}

// 驗證並正規化匯入設定（白名單 + 型別／格式檢查，避免原型污染與 XSS）
function sanitizeSettings(obj) {
  const out = {};
  let replaced = 0;
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return { settings: { ...DEFAULTS }, replaced: Object.keys(DEFAULTS).length };
  }
  const has = k => Object.prototype.hasOwnProperty.call(obj, k) && obj[k] !== undefined;
  const hexColor = v => typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v);
  const rules = {
    position: v => ['top', 'bottom', 'left', 'right'].includes(v),
    scheme: v => ['tw', 'us'].includes(v),
    speed: v => ['slow', 'medium', 'fast'].includes(v),
    tint: v => typeof v === 'boolean',
    autoHide: v => typeof v === 'boolean',
    afterHours: v => typeof v === 'boolean',
    nightFutures: v => typeof v === 'boolean',
    redText: hexColor,
    redBg: hexColor,
    greenText: hexColor,
    greenBg: hexColor
  };
  for (const k of Object.keys(DEFAULTS)) {
    if (!has(k)) { out[k] = DEFAULTS[k]; continue; }
    const v = obj[k];
    if (k === 'symbols') {
      if (typeof v !== 'string') { out[k] = DEFAULTS[k]; replaced++; }
      else {
        const list = parseSymbols(v);
        if (list.length > 100) replaced++;
        out[k] = list.slice(0, 100).join(', ');
      }
    } else if (k === 'excluded') {
      if (typeof v !== 'string' || v.length > 2000) { out[k] = DEFAULTS[k]; replaced++; }
      else out[k] = parseDomains(v).join('\n');
    } else if (rules[k](v)) {
      out[k] = v;
    } else {
      out[k] = DEFAULTS[k];
      replaced++;
    }
  }
  return { settings: out, replaced };
}
