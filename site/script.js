// 兩個互動都屬於加強功能：JS 失敗時，網頁內容與連結仍可正常使用
(() => {
  // 跑馬燈示意：暫停／播放
  const track = document.getElementById('track');
  const pause = document.getElementById('pause');
  if (track && pause) {
    pause.hidden = false;
    pause.addEventListener('click', () => {
      const paused = track.classList.toggle('paused');
      pause.setAttribute('aria-pressed', String(paused));
      pause.setAttribute('aria-label', paused ? '播放跑馬燈示意' : '暫停跑馬燈示意');
      pause.querySelector('use').setAttribute('href', paused ? '#i-play' : '#i-pause');
    });
  }

  // 複製 chrome://extensions（瀏覽器不允許網頁直接連結過去）
  const copy = document.getElementById('copy');
  const url = document.getElementById('ext-url');
  const label = document.getElementById('copy-label');
  const status = document.getElementById('copy-status');
  if (!copy || !url) return;
  copy.hidden = false;

  const fallbackCopy = () => {
    const range = document.createRange();
    range.selectNodeContents(url);
    const sel = getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    return document.execCommand('copy');
  };

  let timer;
  copy.addEventListener('click', async () => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(url.textContent.trim());
      ok = true;
    } catch (e) {
      try { ok = fallbackCopy(); } catch (e2) { ok = false; }
    }
    label.textContent = ok ? '已複製' : '請手動複製';
    status.textContent = ok ? '已複製 chrome://extensions' : '複製失敗，請手動選取網址複製';
    clearTimeout(timer);
    timer = setTimeout(() => { label.textContent = '複製網址'; status.textContent = ''; }, 2000);
  });
})();
