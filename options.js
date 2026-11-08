hydrateIcons();
initStockPicker(document.getElementById('picker'));

function chipHTML(colors, change) {
  const arrow = change > 0 ? '▲' : '▼';
  return `<span class="chip" style="color:${colors.text};background:${colors.bg}">${arrow}${change > 0 ? '漲' : '跌'}</span>`;
}

bindForm(document, s => {
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
