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
  afterHours: true // 盤後模式：收盤後隱藏跑馬燈，公布後改顯示三大法人買賣超
};

const INDEX_CODE = 't00'; // 加權指數

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
