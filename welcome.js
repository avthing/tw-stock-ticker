hydrateIcons();
initStockPicker(document.getElementById('picker'));

const TOTAL = 4;
let step = 1;
const prev = document.getElementById('prev');
const next = document.getElementById('next');

function show(n, focus = true) {
  step = Math.min(Math.max(n, 1), TOTAL);
  document.querySelectorAll('.step').forEach(s => s.classList.toggle('active', +s.dataset.step === step));
  document.querySelectorAll('.stepper li').forEach((li, i) => {
    li.classList.toggle('active', i + 1 === step);
    li.classList.toggle('done', i + 1 < step);
    li.toggleAttribute('aria-current', i + 1 === step);
  });
  prev.style.visibility = step === 1 ? 'hidden' : 'visible';
  next.textContent = step === TOTAL ? '完成，開始使用' : '下一步';
  document.getElementById('skip').style.display = step === TOTAL ? 'none' : '';
  const heading = document.querySelector(`.step[data-step="${step}"] h2`);
  if (heading && focus) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
}

prev.addEventListener('click', () => show(step - 1));
next.addEventListener('click', () => {
  if (step < TOTAL) return show(step + 1);
  next.textContent = '設定完成！可以關閉這個分頁了';
  next.disabled = true;
  setTimeout(() => chrome.tabs.getCurrent(t => t && chrome.tabs.remove(t.id)), 1200);
});

// ── 示範跑馬燈元件（只影響示範畫面） ──
function createDemo(root, { minimizable = true, onPause, onMinimize, onReveal } = {}) {
  root.innerHTML = `
    <div class="demo-chrome" aria-hidden="true"><i></i><i></i><i></i><span>https://www.example.com</span></div>
    <div class="demo-page" aria-hidden="true"><b></b><b></b><b></b><b></b></div>
    <div class="demo-hint" hidden>把滑鼠移到這個畫面的最下緣 ↓</div>
    <div class="demo-bar">
      <div class="demo-vp"><div class="preview-track"></div></div>
      <span class="demo-status" aria-hidden="true"></span>
      ${minimizable ? '<button type="button" class="demo-min" aria-label="最小化示範跑馬燈" title="最小化">－</button>' : ''}
    </div>
    ${minimizable ? `<button type="button" class="demo-restore" aria-label="展開示範跑馬燈" title="展開" hidden>${icon('trend')}</button>` : ''}`;
  const bar = root.querySelector('.demo-bar');
  const track = root.querySelector('.preview-track');
  const status = root.querySelector('.demo-status');
  const hint = root.querySelector('.demo-hint');
  let autoHide = false;
  let hideTimer = null;

  const setHidden = v => {
    bar.classList.toggle('hide', v);
    hint.hidden = !(autoHide && v && !bar.hidden);
  };

  bar.addEventListener('mouseenter', () => {
    status.textContent = autoHide ? '不暫停' : '已暫停';
    if (!autoHide && onPause) onPause();
  });
  bar.addEventListener('mouseleave', () => { status.textContent = ''; });

  root.addEventListener('mousemove', e => {
    if (!autoHide || bar.hidden) return;
    const r = root.getBoundingClientRect();
    if (e.clientY >= r.bottom - 10 || bar.contains(e.target)) {
      clearTimeout(hideTimer);
      hideTimer = null;
      if (bar.classList.contains('hide')) {
        setHidden(false);
        if (onReveal) onReveal();
      }
    } else if (!bar.classList.contains('hide') && !hideTimer) {
      hideTimer = setTimeout(() => { hideTimer = null; setHidden(true); }, 500);
    }
  });
  root.addEventListener('mouseleave', () => { if (autoHide) setHidden(true); });

  if (minimizable) {
    const min = root.querySelector('.demo-min');
    const restore = root.querySelector('.demo-restore');
    let minimizedOnce = false;
    min.addEventListener('click', () => {
      bar.hidden = true;
      hint.hidden = true;
      restore.hidden = false;
      minimizedOnce = true;
      restore.focus();
    });
    restore.addEventListener('click', () => {
      bar.hidden = false;
      restore.hidden = true;
      setHidden(autoHide);
      if (minimizedOnce && onMinimize) onMinimize();
      min.focus();
    });
  }

  return {
    setItems(html) { track.innerHTML = html + html; },
    setAutoHide(v) {
      autoHide = v;
      root.classList.toggle('autohide', v);
      clearTimeout(hideTimer);
      hideTimer = null;
      setHidden(v);
    }
  };
}

// ── 任務與慶祝 ──
const taskLive = document.getElementById('taskLive');
const TASK_NAMES = { pause: '暫停捲動', minimize: '最小化與展開', autohide: '防窺模式', settings: '從工具列開啟設定頁' };

function completeTask(name) {
  const li = document.querySelector(`.tasks li[data-task="${name}"]`);
  if (!li || li.classList.contains('done')) return;
  li.classList.add('done');
  taskLive.textContent = `完成任務：${TASK_NAMES[name]}`;
  if ([...document.querySelectorAll('.tasks > li')].every(l => l.classList.contains('done'))) celebrate();
}

let celebrated = false;
function celebrate() {
  if (celebrated) return;
  celebrated = true;
  const banner = document.getElementById('celebrate');
  banner.hidden = false;
  next.focus({ preventScroll: true });
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // 若使用者剛點了工具列圖示而停在設定頁，等回到這個分頁才放煙火
  if (document.hidden) {
    document.addEventListener('visibilitychange', function once() {
      if (document.hidden) return;
      document.removeEventListener('visibilitychange', once);
      fireworks();
    });
  } else fireworks();
}

// 簡易 canvas 煙火：數次爆炸，粒子受重力下墜並淡出，約 3 秒後移除
function fireworks() {
  const canvas = document.createElement('canvas');
  canvas.id = 'fireworks';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.append(canvas);
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const W = innerWidth, H = innerHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.scale(dpr, dpr);

  const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#FACC15'];
  const particles = [];
  const burst = () => {
    const x = W * (0.2 + Math.random() * 0.6), y = H * (0.15 + Math.random() * 0.35);
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    for (let i = 0; i < 70; i++) {
      const a = Math.random() * Math.PI * 2, sp = 2 + Math.random() * 4.5;
      particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, decay: 0.012 + Math.random() * 0.012, color });
    }
  };
  [0, 350, 700, 1050, 1500, 1900].forEach(t => setTimeout(burst, t));

  const start = performance.now();
  (function frame(now) {
    ctx.clearRect(0, 0, W, H);
    for (const p of particles) {
      if (p.life <= 0) continue;
      p.vx *= 0.985; p.vy = p.vy * 0.985 + 0.06;
      p.x += p.vx; p.y += p.vy; p.life -= p.decay;
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
    if (now - start < 3600) requestAnimationFrame(frame);
    else canvas.remove();
  })(start);
}

const demoA = createDemo(document.getElementById('demoA'), {
  onPause: () => completeTask('pause'),
  onMinimize: () => completeTask('minimize')
});
const demoB = createDemo(document.getElementById('demoB'), {
  minimizable: false,
  onReveal: () => completeTask('autohide')
});

// 使用者照做後可自行打勾
document.getElementById('settingsCheck').addEventListener('click', () => completeTask('settings'));

// 使用者點了工具列圖示（background 記錄時間）→ 也自動完成任務
const openedAt = Date.now();
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.actionClickedAt && changes.actionClickedAt.newValue >= openedAt) completeTask('settings');
});

let lastAutoHide = null;
bindForm(document, s => {
  renderPreview(document.getElementById('preview1'), s);
  renderPreview(document.getElementById('preview3'), s);
  const items = previewItemsHTML(s);
  demoA.setItems(items);
  demoB.setItems(items);
  if (s.autoHide !== lastAutoHide) {
    lastAutoHide = !!s.autoHide;
    demoB.setAutoHide(lastAutoHide);
  }
});

show(1, false);
