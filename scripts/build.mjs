// Sparkori 花火工作室官網 — 靜態網站產生器
// 執行：node scripts/build.mjs
// 讀取 src/home.html、data/apple-catalog.json、data/privacy-sources/manifest.json，
// 產出 public/ 底下的首頁、11 款 App 介紹頁與隱私頁、隱私中心、支援頁、網站隱私說明與 404。
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFile(resolve(root, path), 'utf8');
const catalog = JSON.parse(await read('data/apple-catalog.json'));
const policies = JSON.parse(await read('data/privacy-sources/manifest.json')).apps;
const email = 'victoriacheng1122@gmail.com';
const compiledOn = '2026 年 10 月 12 日';
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// --------------------------------------------------------------------------
// 作品資料
// --------------------------------------------------------------------------
const categories = {
  'compound-calculator': '學習與規劃', 'easy-draw': '日常工具', 'stock-simulator': '學習與規劃',
  vitamins: '生活記錄', 'crypto-dictionary': '學習與規劃', 'perfect-pig': '遊戲與創作',
  'design-it': '遊戲與創作', 'pr-diary': '生活記錄', 'larry-cocktail': '遊戲與創作',
  'time-manager': '日常工具', 'dream-journal': '生活記錄',
};
const shortNames = {
  'compound-calculator': '複利計算器', 'easy-draw': '輕鬆抽獎', 'stock-simulator': '股神養成',
  vitamins: '你今天維他命了嗎', 'crypto-dictionary': '幣圈神器', 'perfect-pig': '完美養豬',
  'design-it': '自己來設計', 'pr-diary': '公關日記', 'larry-cocktail': '賴瑞的調酒研究室',
  'time-manager': 'AI 時間管理', 'dream-journal': '把夢遺留下來',
};
const order = ['dream-journal', 'design-it', 'perfect-pig', 'time-manager', 'vitamins', 'easy-draw', 'compound-calculator', 'stock-simulator', 'crypto-dictionary', 'pr-diary', 'larry-cocktail'];
const apps = [...catalog.apps].sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug));
const appURL = (a) => `/apps/${a.slug}/`;
const policyURL = (a) => `${appURL(a)}privacy/`;
const mailto = (subject = 'Sparkori 支援與聯絡') => `mailto:${email}?subject=${encodeURIComponent(subject)}`;
const pad = (n) => String(n).padStart(2, '0');

// --------------------------------------------------------------------------
// 共用版型
// --------------------------------------------------------------------------
const fonts = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Noto+Serif+TC:wght@400;500;600&family=Noto+Sans+TC:wght@400;500&display=swap">`;
const brand = `<a class="brand" href="/" aria-label="Sparkori 花火工作室首頁"><img class="brand-mark" src="/logo.svg" alt="" width="30" height="30"><span class="brand-text"><span class="brand-latin">Sparkori</span><span class="brand-cjk">花火工作室</span></span></a>`;
const header = `<a class="skip-link" href="#main">跳到主要內容</a><header class="site-header"><div class="wrap header-inner">${brand}<nav class="site-nav" aria-label="主要導覽"><a href="/#apps">作品</a><a href="/#about">關於</a><a href="/support/">支援與聯絡</a></nav></div></header>`;
const footer = `<footer class="site-footer"><div class="wrap footer-grid"><div class="footer-brand">${brand}<p>把腦海裡的小小火花，<br>做成生活裡用得到、喜歡用的 App。</p></div><nav class="footer-col" aria-label="頁尾導覽"><p class="footer-title">Explore</p><div class="footer-nav"><a href="/#apps">作品</a><a href="/#about">關於花火</a><a href="/support/">支援與聯絡</a></div></nav><nav class="footer-col" aria-label="隱私資訊"><p class="footer-title">Privacy</p><div class="footer-nav"><a href="/privacy/">App 隱私政策</a><a href="/website-privacy/">網站隱私說明</a></div></nav></div><div class="wrap footer-bottom"><span>© 2026 Sparkori · 花火工作室</span><span>獨立創作 · 用心製作</span></div></footer>`;

function page(title, description, content) {
  return `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="${esc(description)}"><meta name="theme-color" content="#f5f1e8"><meta property="og:type" content="website"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:site_name" content="Sparkori 花火工作室"><title>${esc(title)}</title><link rel="icon" href="/favicon.svg" type="image/svg+xml">${fonts}<link rel="stylesheet" href="/style.css"><script src="/site.js" defer></script></head><body>${header}<main id="main">${content}</main>${footer}</body></html>`;
}
async function save(path, content) {
  const file = resolve(root, 'public', path);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, content);
}
const breadcrumb = (label, parent = '') => `<nav class="breadcrumb" aria-label="頁面位置"><a href="/">首頁</a><span class="sep" aria-hidden="true">/</span>${parent}<span aria-current="page">${label}</span></nav>`;
const crumbLink = (href, label) => `<a href="${href}">${label}</a><span class="sep" aria-hidden="true">/</span>`;

// --------------------------------------------------------------------------
// 首頁徽章：刻度圓環、弧形文字、金色火花
// --------------------------------------------------------------------------
function emblem() {
  const cx = 300, cy = 300;
  const ticks = [];
  for (let i = 0; i < 72; i++) {
    const long = i % 6 === 0;
    ticks.push(`<line x1="${cx}" y1="${cy - (long ? 262 : 270)}" x2="${cx}" y2="${cy - 282}" stroke-width="${long ? 1 : .6}" transform="rotate(${i * 5} ${cx} ${cy})"/>`);
  }
  // 弧形文字：每個字依字寬排列，上弧由左至右、下弧字面朝向圓心
  const advance = (ch) => (/[㐀-鿿]/.test(ch) ? 19 : ch === ' ' ? 7 : /[,.]/.test(ch) ? 5 : 14);
  const arc = (text, r, bottom) => {
    const chars = [...text];
    const total = chars.reduce((s, c) => s + advance(c), 0);
    const perUnit = 180 / (Math.PI * r);
    let pos = -total / 2;
    return chars.map((ch) => {
      const centre = pos + advance(ch) / 2;
      pos += advance(ch);
      if (ch === ' ') return '';
      const deg = centre * perUnit;
      const cjk = /[㐀-鿿]/.test(ch);
      const cls = cjk ? 'em-cjk' : 'em-latin';
      return bottom
        ? `<text class="${cls}" x="${cx}" y="${cy + r}" text-anchor="middle" transform="rotate(${(-deg).toFixed(2)} ${cx} ${cy})">${esc(ch)}</text>`
        : `<text class="${cls}" x="${cx}" y="${cy - r}" text-anchor="middle" transform="rotate(${deg.toFixed(2)} ${cx} ${cy})">${esc(ch)}</text>`;
    }).join('');
  };
  const diamond = (deg) => `<rect x="${cx - 3}" y="${cy - 232 - 3}" width="6" height="6" transform="rotate(${deg} ${cx} ${cy}) rotate(45 ${cx} ${cy - 232})"/>`;
  const spark = 'M32 9l5 16 15-7-9 14 12 9-18-2-5 17-5-17-18 2 12-9-9-14 15 7z';
  return `<svg class="emblem-svg" viewBox="0 0 600 600" aria-hidden="true" focusable="false">
<defs>
<radialGradient id="em-paper" cx="50%" cy="46%" r="52%"><stop offset="0" stop-color="#fffdf8"/><stop offset=".72" stop-color="#faf7f0"/><stop offset="1" stop-color="#f5f1e8" stop-opacity="0"/></radialGradient>
<linearGradient id="em-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e2cf9c"/><stop offset=".5" stop-color="#bf9f5f"/><stop offset="1" stop-color="#8d7140"/></linearGradient>
<filter id="em-shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="16" stdDeviation="14" flood-color="#1b1915" flood-opacity=".16"/></filter>
</defs>
<circle cx="${cx}" cy="${cy}" r="296" fill="url(#em-paper)"/>
<g fill="none" stroke="#dbcfaa"><circle cx="${cx}" cy="${cy}" r="288" stroke-width="1"/><circle cx="${cx}" cy="${cy}" r="256" stroke-width=".75"/><circle cx="${cx}" cy="${cy}" r="206" stroke-width=".75"/><circle cx="${cx}" cy="${cy}" r="162" stroke-width="1" stroke="#cdbd8c"/></g>
<g stroke="#b8995c" stroke-linecap="round">${ticks.join('')}</g>
<g fill="#7b6637">${arc('SPARKORI  花火工作室', 230, false)}${arc('LITTLE IDEAS, REAL THINGS', 230, true)}${diamond(90)}${diamond(270)}</g>
<g transform="translate(${cx} ${cy}) rotate(22.5) scale(5.15) translate(-32 -32)"><path d="${spark}" fill="none" stroke="#d6c69a" stroke-width=".55"/></g>
<g transform="translate(${cx} ${cy}) scale(3.9) translate(-32 -32)" filter="url(#em-shadow)"><path d="${spark}" fill="url(#em-gold)"/></g>
<circle cx="${cx}" cy="${cy}" r="17" fill="#f7f3ea" stroke="#b8995c" stroke-width="1"/>
<circle cx="${cx}" cy="${cy}" r="4" fill="#1b1915"/>
</svg>`;
}

// --------------------------------------------------------------------------
// 作品卡片、作品區
// --------------------------------------------------------------------------
const card = (a, i) => `<article class="app-card reveal" data-category="${categories[a.slug]}"><div class="card-top"><img src="${a.iconPath}" alt="" loading="lazy" width="64" height="64"><span class="card-no num">No. ${pad(i + 1)}</span></div><p class="card-category">${categories[a.slug]}</p><h3 class="card-title"><a href="${appURL(a)}">${esc(shortNames[a.slug])}</a></h3><p class="card-desc">${esc(a.shortDescription)}</p><div class="card-links"><a href="${appURL(a)}">探索 App <span aria-hidden="true">→</span></a><a href="${a.storeUrl}" aria-label="在 App Store 查看${esc(a.nameZhHant)}">App Store <span aria-hidden="true">↗</span></a></div></article>`;
const groups = ['全部', ...new Set(Object.values(categories))];
const gallery = `<section id="apps" class="portfolio" aria-labelledby="apps-title"><div class="wrap"><div class="section-heading reveal"><div><p class="eyebrow">Our Apps / 我們的作品</p><h2 id="apps-title">日常的每一面，<br>都有一點花火。</h2></div><p class="section-intro">從生活記錄、學習工具，到遊戲與創作，<br>在這裡，找到你的下一個小幫手。</p></div><div class="portfolio-toolbar reveal"><div class="filter-bar" role="group" aria-label="依作品類型篩選" hidden>${groups.map((g, i) => `<button type="button" data-filter="${g}" aria-pressed="${i === 0}">${g}</button>`).join('')}</div><p class="app-count" aria-live="polite">全部 <span class="num">${apps.length}</span> 款 App</p></div><div class="app-grid">${apps.map(card).join('')}</div></div></section>`;

// --------------------------------------------------------------------------
// 首頁
// --------------------------------------------------------------------------
let home = await read('src/home.html');
const mainMatch = home.match(/<main id="main">([\s\S]*?)<\/main>/);
home = (mainMatch ? mainMatch[1] : home)
  .replace(/<!--[\s\S]*?-->\s*(?=<section)/, '')
  .replace('<!-- @emblem -->', emblem())
  .replace('<!-- @apps -->', gallery)
  .replace(/(data-app-count>)\d+(<)/, `$1${apps.length}$2`);
await save('index.html', page('Sparkori 花火工作室｜讓靈感，走進日常', `探索 Sparkori 花火工作室的 ${apps.length} 款獨立 App：生活記錄、日常工具、學習規劃與遊戲創作。查看作品、取得支援與閱讀隱私政策。`, home));

// --------------------------------------------------------------------------
// 作品頁、隱私頁
// --------------------------------------------------------------------------
const contactBox = (a) => `<aside class="contact-box frame reveal"><p class="eyebrow">We’re here to help</p><h2>有問題，一起解決。</h2><p>來信時請告訴我們 App 名稱、裝置與系統版本，以及遇到的狀況。</p><a class="button" href="${mailto(a ? `${a.nameZhHant}｜使用支援` : undefined)}">寄信聯絡 <span aria-hidden="true">↗</span></a><a class="email-link" href="${mailto()}">${email}</a></aside>`;
const appRows = (kind, list = apps) => list.map((a) => `<a class="resource-row" href="${kind === 'privacy' ? policyURL(a) : appURL(a)}"><img src="${a.iconPath}" alt="" width="52" height="52" loading="lazy"><span><strong>${esc(a.nameZhHant)}</strong><small>${kind === 'privacy' ? (policies[a.trackId].policyStatus === 'website_only_privacy' ? '現有隱私資訊與聯絡方式' : 'App 隱私權政策') : categories[a.slug]}</small></span><span class="row-arrow" aria-hidden="true">→</span></a>`).join('');

for (const [i, a] of apps.entries()) {
  const p = policies[a.trackId];
  const others = [1, 2, 3].map((k) => apps[(i + k) % apps.length]);
  const spec = `<dl class="spec-list reveal"><div><dt>類別</dt><dd>${esc(a.genres.join(' · '))}</dd></div><div><dt>系統需求</dt><dd>iOS ${esc(a.minimumOsVersion)} 或以上</dd></div><div><dt>年齡分級</dt><dd>${esc(a.contentRating)}</dd></div><div><dt>開發者</dt><dd>${esc(a.artistName)}</dd></div></dl>`;
  const content = `<div class="wrap">${breadcrumb(esc(shortNames[a.slug]))}<section class="app-intro"><div class="app-hero-icon-wrap reveal"><img class="app-hero-icon" src="${a.iconPath}" alt="${esc(shortNames[a.slug])}圖示" width="144" height="144"></div><div class="app-intro-copy reveal"><p class="eyebrow">${categories[a.slug]} / No. ${pad(i + 1)}</p><h1>${esc(a.nameZhHant)}</h1><p class="lead">${esc(a.shortDescription)}</p><div class="actions"><a class="button" href="${a.storeUrl}">在 App Store 查看 <span aria-hidden="true">↗</span></a><a class="text-link" href="${policyURL(a)}">${p.policyStatus === 'website_only_privacy' ? '隱私資訊' : '隱私政策'} <span aria-hidden="true">→</span></a></div></div></section>${spec}<section class="app-support"><div class="app-support-copy reveal"><p class="eyebrow">Good to know / 使用資訊</p><h2>下載、支援與隱私。</h2><p>功能、系統需求、價格及 App 內購買項目，請以 App Store 的最新說明為準。</p><div class="info-links"><a class="text-link" href="${policyURL(a)}">閱讀隱私資訊 <span aria-hidden="true">→</span></a><a class="text-link" href="/support/">支援與常見問題 <span aria-hidden="true">→</span></a></div></div>${contactBox(a)}</section></div><section class="more-apps"><div class="wrap"><div class="section-heading reveal"><div><p class="eyebrow">More from Sparkori / 更多作品</p><h2>再看看其他的花火。</h2></div></div><div class="resource-list reveal">${appRows('app', others)}</div></div></section>`;
  await save(`apps/${a.slug}/index.html`, page(`${a.nameZhHant}｜Sparkori 花火工作室`, a.shortDescription, content));

  const original = await read(`data/privacy-sources/${p.policyTextFile}`);
  const text = original.replaceAll('victoriacheeng1122@gmail.com', email);
  const numericHeading = /^(?:\d{1,2}[.、．]\s*|第[一二三四五六七八九十]+[條節])/;
  const titles = new Set(['我們收集的資訊', '資訊的使用', '第三方服務', '兒童隱私', '本政策的變更', '我們收集哪些資料', '行情資料與網路連線', '保存在裝置上的資料', 'Pro 訂閱與 Apple', '通知', '資料分享、廣告與追蹤', '寄信聯絡與瀏覽本網站', '你如何控制資料', '服務與投資聲明', '政策更新', '聯絡我們', '政策摘要']);
  const blocks = text.split('\n').filter((x) => x.trim()).map((line) => (numericHeading.test(line) || titles.has(line) ? `<h2>${esc(line)}</h2>` : `<p>${esc(line)}</p>`)).join('');
  const notice = p.policyStatus === 'website_only_privacy'
    ? `<div class="policy-note"><strong>現有說明的適用範圍</strong><p>以下是原作品公開資訊頁的隱私說明，僅涵蓋該網頁，未完整說明 App 內的資料處理。若你需要了解 App 的資料、儲存或刪除方式，請透過下方信箱聯絡我們。</p></div>`
    : `<div class="policy-note"><p>以下沿用此 App 既有的隱私政策。原文提及舊支援網站、GitHub Pages 或字型服務時，指的是原網站；本 Sparkori 官網的資料處理請見<a href="/website-privacy/">網站隱私說明</a>。</p>${a.slug === 'compound-calculator' ? `<p>本頁聯絡信箱已統一更新為 ${email}。</p>` : ''}</div>`;
  const privacyContent = `<div class="wrap reading-wrap">${breadcrumb('隱私資訊', crumbLink(appURL(a), esc(shortNames[a.slug])))}<header class="page-heading"><p class="eyebrow">Privacy / 隱私資訊</p><h1>${esc(shortNames[a.slug])}<br>${p.policyStatus === 'website_only_privacy' ? '隱私資訊' : '隱私權政策'}</h1><p class="lead">${esc(p.policyUpdatedText || '依既有公開政策內容整理')}</p></header>${notice}<article class="policy-body">${blocks}</article><div class="policy-source"><p><a href="${esc(p.policySourceURL)}">查看原政策頁面 ↗</a></p><p>隱私或資料問題：<a href="${mailto(`${shortNames[a.slug]}｜隱私問題`)}">${email}</a></p><p class="small">彙整日期：${compiledOn}</p></div></div>`;
  await save(`apps/${a.slug}/privacy/index.html`, page(`${shortNames[a.slug]}隱私資訊｜Sparkori`, `${a.nameZhHant}的隱私政策與聯絡方式。`, privacyContent));
}

// --------------------------------------------------------------------------
// 隱私中心、支援、網站隱私說明、404
// --------------------------------------------------------------------------
await save('privacy/index.html', page('App 隱私政策｜Sparkori 花火工作室', '依 App 查閱資料處理、權限、保存與刪除方式。', `<div class="wrap reading-wrap">${breadcrumb('App 隱私政策')}<header class="page-heading"><p class="eyebrow">Your Privacy / 隱私中心</p><h1>每一款 App，<br>都有自己的說明。</h1><p class="lead">選擇你使用的 App，了解它的資料處理與聯絡方式。</p></header><div class="resource-list reveal">${appRows('privacy')}</div><p class="section-note">瀏覽這個官網的資料處理，請參閱<a href="/website-privacy/">網站隱私說明</a>。</p></div>`));

await save('support/index.html', page('支援與聯絡｜Sparkori 花火工作室', '取得 Sparkori App 使用支援、回報問題，或聯繫花火工作室。', `<div class="wrap">${breadcrumb('支援與聯絡')}<header class="page-heading"><p class="eyebrow">Support / 支援與聯絡</p><h1>你的每個提問，<br>我們都在意。</h1><p class="lead">使用上的疑問、問題回報，或想分享一個點子，<br>歡迎寫信給花火工作室。</p></header><section class="support-grid">${contactBox()}<div class="support-instructions reveal"><h2>讓我們更快了解狀況</h2><ol><li>你使用的 App 名稱與版本。</li><li>iPhone 或 iPad 型號、系統版本。</li><li>發生問題的步驟，以及預期看到的結果。</li><li>如附截圖，請先遮住不必要的個人資訊。</li></ol><p>不需要提供密碼、付款卡號或其他敏感內容。</p></div></section><section class="faq reveal"><p class="eyebrow">Common Questions / 常見問題</p><h2>你可能也想知道</h2><details><summary>如何管理訂閱或申請退款？</summary><p>若 App 提供 Apple App 內購買或訂閱，可在 iPhone「設定 → 你的姓名 → 訂閱項目」管理。退款請透過 <a href="https://reportaproblem.apple.com/">Apple 回報問題</a>提出，是否符合退款條件由 Apple 審核。刪除 App 不會自動取消訂閱。</p></details><details><summary>在哪裡查看 App 的隱私政策？</summary><p>前往<a href="/privacy/">隱私中心</a>，選擇你使用的 App。不同 App 的資料、權限及刪除方式可能不同。</p></details><details><summary>可以協助找回 App 裡的資料嗎？</summary><p>請先來信說明 App 名稱與狀況。各 App 的儲存與備份功能不同，部分資料只保存在你的裝置上，開發者可能無法存取或還原；操作刪除、重裝前，請先確認該 App 的備份方式。</p></details></section></div>`));

await save('website-privacy/index.html', page('網站隱私說明｜Sparkori 花火工作室', 'Sparkori 官網的連線資料、電子郵件聯絡及外部連結說明。', `<div class="wrap reading-wrap">${breadcrumb('網站隱私說明')}<header class="page-heading"><p class="eyebrow">Website Privacy</p><h1>網站隱私說明</h1><p class="lead">更新日期：${compiledOn}</p></header><article class="policy-body"><p>本說明適用於 Sparkori 花火工作室官網。各 App 的資料處理方式另見<a href="/privacy/">App 隱私政策</a>。App Store 開發者名稱為 Yung Wen Cheng。</p><h2>1. 瀏覽本網站</h2><p>本站提供作品介紹、下載連結、支援與隱私資訊，未設置會員帳號、付款表單、廣告、網站分析或追蹤像素，也未自行設定 Cookie。作品篩選只在瀏覽器當次頁面中運作，不會傳送篩選內容。</p><p>網站託管服務為傳送網頁、維持安全與排查錯誤，可能處理 IP 位址、請求網址、瀏覽器資訊與存取紀錄。若你透過 Vercel 部署網址瀏覽，相關處理依 <a href="https://vercel.com/legal/privacy-policy">Vercel 隱私政策</a>辦理；託管服務的保存與處理方式由該服務管理。</p><p>本站標題字型由 Google Fonts 提供；瀏覽器載入字型檔時，Google 可能收到你的 IP 位址等連線資訊，相關處理依 <a href="https://policies.google.com/privacy?hl=zh-TW">Google 隱私權政策</a>辦理。</p><h2>2. 電子郵件聯絡</h2><p>當你主動寄信，我們會收到寄件地址、姓名（如有提供）、信件內容及附件，用於回覆問題、提供支援與處理隱私請求。請只提供處理問題所需的資料。</p><p>目前支援信箱使用 Gmail，郵件可能依服務安排在境外處理，相關服務適用 <a href="https://policies.google.com/privacy?hl=zh-TW">Google 隱私權政策</a>。我們於處理問題及必要後續追蹤期間保留往來內容；目的完成且無法律或爭議處理上的保留必要後，會刪除不再需要的內容。我們不會將你的支援信件用於廣告行銷。</p><h2>3. 外部連結</h2><p>點選 App Store、原政策頁或其他外部服務後，該服務依其自身的隱私政策處理資料。本站不會將 App 內的個人紀錄附加到下載連結。</p><h2>4. 查詢、更正與刪除</h2><p>如希望查詢、更正或刪除透過支援信件提供的個人資料，請寄信至 <a href="${mailto('Sparkori｜隱私與資料請求')}">${email}</a>。我們會依請求內容處理；如有依法需保留的部分，會說明原因。郵件服務的備份清除時程由該服務管理。</p><h2>5. 說明更新</h2><p>若網站功能或使用的服務改變，本頁將更新並標示更新日期。</p></article></div>`));

await save('404.html', page('找不到頁面｜Sparkori', '回到花火工作室，繼續探索 App。', `<section class="wrap page-heading not-found"><p class="eyebrow">404 / Page not found</p><h1>這朵火花，<br>不在這裡。</h1><p class="lead">連結可能已經變更，從作品列表重新出發吧。</p><a class="button" href="/#apps">看看所有 App <span aria-hidden="true">→</span></a></section>`));

await save('robots.txt', 'User-agent: *\nAllow: /\n');
console.log(`Built Sparkori website: ${apps.length} apps, ${apps.length} privacy pages, 5 shared pages.`);
