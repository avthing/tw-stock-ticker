// 兩個互動都屬於加強功能：JS 失敗時，網頁內容與連結仍可正常使用
(() => {
  // 跑馬燈示意：暫停／播放。捲動中的示意會在滑鼠移入、焦點進入、移出畫面與使用者偏好減少動態時停住
  const loop = document.querySelector('[data-loop]');
  const track = document.getElementById('track');
  const pause = document.getElementById('pause');
  if (loop && track && pause) {
    // 把內容補到比畫面寬，捲動才不會在寬螢幕出現空白
    const groups = track.querySelectorAll('.tape-group');
    if (groups.length === 2) {
      const [a, b] = groups;
      const base = [...a.children];
      let guard = 0;
      while (a.scrollWidth < window.innerWidth * 1.1 && guard++ < 6) {
        base.forEach((n) => { const c = n.cloneNode(true); c.setAttribute('aria-hidden', 'true'); a.append(c); });
      }
      b.replaceChildren(...[...a.children].map((n) => { const c = n.cloneNode(true); c.setAttribute('aria-hidden', 'true'); return c; }));
    }

    const s = { seen: false, hover: false, focus: false, held: matchMedia('(prefers-reduced-motion: reduce)').matches };
    const sync = () => {
      loop.classList.toggle('is-running', s.seen && !s.hover && !s.focus && !s.held);
      pause.textContent = s.held ? '播放' : '暫停';
      pause.setAttribute('aria-pressed', String(s.held));
      pause.setAttribute('aria-label', s.held ? '播放跑馬燈示意' : '暫停跑馬燈示意');
    };
    pause.addEventListener('click', () => { s.held = !s.held; sync(); });
    [['pointerenter', 'hover', true], ['pointerleave', 'hover', false], ['focusin', 'focus', true], ['focusout', 'focus', false]]
      .forEach(([t, k, v]) => loop.addEventListener(t, () => { s[k] = v; sync(); }));
    new IntersectionObserver(([e]) => { s.seen = e.isIntersecting; sync(); }).observe(loop);
    sync();
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
