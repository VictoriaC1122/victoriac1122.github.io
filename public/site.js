// Sparkori 花火工作室 — 作品篩選與區塊淡入
document.documentElement.classList.add('js');

// 作品篩選（首頁）
const bar = document.querySelector('.filter-bar');
if (bar) {
  bar.hidden = false;
  const cards = [...document.querySelectorAll('.app-card')];
  const count = document.querySelector('.app-count');
  bar.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-filter]');
    if (!button) return;
    const chosen = button.dataset.filter;
    let shown = 0;
    for (const card of cards) {
      const visible = chosen === '全部' || card.dataset.category === chosen;
      card.hidden = !visible;
      if (visible) shown++;
    }
    for (const item of bar.querySelectorAll('button')) item.setAttribute('aria-pressed', String(item === button));
    if (count) {
      const num = document.createElement('span');
      num.className = 'num';
      num.textContent = String(shown);
      count.replaceChildren(`${chosen} `, num, ' 款 App');
    }
  });
}

// 區塊淡入（尊重「減少動態效果」設定）
const targets = document.querySelectorAll('.reveal');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if ('IntersectionObserver' in window && !reduceMotion) {
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
  targets.forEach((el) => io.observe(el));
} else {
  targets.forEach((el) => el.classList.add('is-in'));
}
