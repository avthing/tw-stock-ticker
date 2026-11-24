hydrateIcons();
const picker = initStockPicker(document.getElementById('picker'));

function chipHTML(colors, change) {
  const arrow = change > 0 ? '▲' : '▼';
  return `<span class="chip" style="color:${colors.text};background:${colors.bg}">${arrow}${change > 0 ? '漲' : '跌'}</span>`;
}

const form = bindForm(document, s => {
  renderPreview(document.getElementById('preview'), s);
  for (const scheme of ['tw', 'us']) {
    const t = { ...s, scheme };
    document.getElementById(`pair-${scheme}`).innerHTML = chipHTML(pickColors(t, 1), 1) + chipHTML(pickColors(t, -1), -1);
  }
});

document.getElementById('resetColors').addEventListener('click', () => {
  ['redText', 'redBg', 'greenText', 'greenBg'].forEach(k => {
    const el = document.querySelector(`[data-key="${k}"]`);
    el.value = DEFAULTS[k];
    el.dispatchEvent(new Event('change'));
  });
});

// ── 備份與多台電腦同步（匯出／匯入）────────────────────────
const backupMsg = document.getElementById('backupMsg');
const importFile = document.getElementById('importFile');

function setBackupMsg(text, isErr = false) {
  backupMsg.textContent = text;
  backupMsg.classList.toggle('err', isErr);
}

document.getElementById('exportBtn').addEventListener('click', () => {
  chrome.storage.sync.get(DEFAULTS, s => {
    const settings = {};
    for (const k of Object.keys(DEFAULTS)) settings[k] = s[k];
    const payload = {
      app: 'tw-stock-ticker',
      schema: 1,
      version: chrome.runtime.getManifest().version,
      exportedAt: new Date().toISOString(),
      settings
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tw-stock-ticker-settings-${taipeiDate()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setBackupMsg('已匯出設定檔');
  });
});

document.getElementById('importBtn').addEventListener('click', () => {
  importFile.value = '';
  importFile.click();
});

importFile.addEventListener('change', async () => {
  const file = importFile.files?.[0];
  if (!file) return;
  if (file.size > 64 * 1024) return setBackupMsg('匯入失敗：檔案大小超過 64KB 上限', true);
  let parsed;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    return setBackupMsg('匯入失敗：JSON 格式錯誤', true);
  }
  if (!parsed || typeof parsed !== 'object' || parsed.app !== 'tw-stock-ticker' ||
      !parsed.settings || typeof parsed.settings !== 'object' || Array.isArray(parsed.settings)) {
    return setBackupMsg('匯入失敗：非台股跑馬燈設定檔或缺少 settings 欄位', true);
  }
  const { settings, replaced } = sanitizeSettings(parsed.settings);
  const all = parseSymbols(settings.symbols);
  const nightCount = all.filter(isNightCode).length;
  const stockCount = all.length - nightCount;
  const note = replaced > 0 ? `\n${replaced} 項設定值不合法，已用預設值取代` : '';
  const summary = `確定要匯入並覆寫目前設定嗎？\n自選股 ${stockCount} 檔、夜盤項目 ${nightCount} 個、夜盤開關${settings.nightFutures ? '開啟' : '關閉'}${note}`;
  if (!(await confirmModal(summary, '確認匯入', '取消'))) return;

  chrome.storage.sync.set(settings, () => {
    if (chrome.runtime?.lastError) {
      return setBackupMsg(`匯入失敗：${chrome.runtime.lastError.message}`, true);
    }
    form.reload();
    picker.reload();
    setBackupMsg('已匯入');
  });
});
