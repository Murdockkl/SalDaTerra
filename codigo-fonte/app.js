(() => {
'use strict';

/* =====================================================================
   CONFIGURAÇÃO: edite aqui
   ===================================================================== */
const CONFIG = {
  // Número do WhatsApp: DDI + DDD + número, somente dígitos. Ex.: 5511999998888
  whatsapp: '5500000000000',
  defaultMessage: 'Olá, Sal da Terra! Vim pelo site e gostaria de fazer um pedido personalizado.'
};

// Tabela regressiva: quanto maior a quantidade, menor o preço por unidade.
// "mult" multiplica o preço base do produto (1 = preço cheio).
const TIERS = [
  { min: 1,  max: 5,        mult: 1.00 },
  { min: 6,  max: 10,       mult: 0.90 },
  { min: 11, max: 20,       mult: 0.80 },
  { min: 21, max: 50,       mult: 0.72 },
  { min: 51, max: Infinity, mult: 0.65 }
];

// Produtos do catálogo (JSON). "price" é o valor por unidade na faixa de 1 a 5.
// Os preços abaixo são exemplos: ajuste para os seus.
const PRODUCTS = [
  { id: 'caneca-porcelana', name: 'Caneca de Porcelana', cats: ['canecas'], price: 35, art: 'mug', color: '#FFFFFF', sim: 'mug', best: true,
    desc: '325 ml, impressão nítida e resistente a lavagens.', tags: ['caneca', 'presente', 'aniversario', 'festa', 'dia das maes'] },
  { id: 'caneca-alca', name: 'Caneca com Alça Colorida', cats: ['canecas'], price: 39, art: 'mug', color: '#FFFFFF', handle: '#C39A3B', sim: 'mug',
    desc: 'Alça e interior coloridos para um toque de estilo.', tags: ['caneca', 'presente', 'colorida'] },
  { id: 'camisa-algodao', name: 'Camisa Personalizada', cats: ['camisas'], price: 49.9, art: 'tee', color: '#1E3A63', sim: 'tee', best: true, sizes: ['P', 'M', 'G', 'GG'],
    desc: 'Malha de algodão com estampa em alta definição.', tags: ['camisa', 'camiseta', 'turma', 'festa', 'evento', 'familia'] },
  { id: 'camisa-baby', name: 'Camisa Baby Look', cats: ['camisas'], price: 49.9, art: 'tee', color: '#EBB9BF', sim: 'tee', sizes: ['P', 'M', 'G'],
    desc: 'Corte ajustado, leve e confortável para o dia a dia.', tags: ['camisa', 'baby look', 'feminina', 'festa', 'turma'] },
  { id: 'camisa-dryfit', name: 'Camisa Dry Fit', cats: ['camisas', 'corporativo'], price: 54.9, art: 'tee', color: '#6F8B76', sim: 'tee', sizes: ['P', 'M', 'G', 'GG'],
    desc: 'Tecido leve que seca rápido: times, corridas e eventos.', tags: ['camisa', 'esporte', 'corrida', 'time', 'empresa', 'evento'] },
  { id: 'squeeze', name: 'Squeeze 500 ml', cats: ['brindes', 'corporativo'], price: 28, art: 'bottle', color: '#C39A3B', best: true,
    desc: 'Garrafa leve e reutilizável com o seu nome ou marca.', tags: ['squeeze', 'garrafa', 'brinde', 'empresa', 'academia'] },
  { id: 'chaveiro', name: 'Chaveiro Acrílico', cats: ['brindes'], price: 8, art: 'keychain', color: '#E4ECF7',
    desc: 'Lembrancinha leve para festas, casamentos e eventos.', tags: ['chaveiro', 'lembrancinha', 'festa', 'casamento', 'brinde'] },
  { id: 'ecobag', name: 'Ecobag de Algodão Cru', cats: ['brindes', 'corporativo'], price: 25, art: 'tote', color: '#EDE4D0', sim: 'tote', best: true,
    desc: 'Sacola resistente, ótima para eventos e lojas.', tags: ['ecobag', 'sacola', 'brinde', 'empresa', 'evento'] }
];

// Guia de tamanhos (A = altura, L = largura, em cm). Ajuste com as medidas reais das suas peças.
const SIZE_TABLE = [
  { group: 'Unissex', label: 'P',  h: 68, w: 50 },
  { group: 'Unissex', label: 'M',  h: 71, w: 53 },
  { group: 'Unissex', label: 'G',  h: 74, w: 56 },
  { group: 'Unissex', label: 'GG', h: 77, w: 59 },
  { group: 'Baby Look', label: 'Baby Look P', h: 57, w: 42 },
  { group: 'Baby Look', label: 'Baby Look M', h: 59, w: 44 },
  { group: 'Baby Look', label: 'Baby Look G', h: 61, w: 46 }
];

// Galeria e depoimentos. Para usar fotos reais, preencha "src" com o caminho da imagem
// (ex.: 'fotos/caneca-camila.jpg'). Sem "src", aparece uma ilustração do produto.
const FAQ = [
  { q: 'Qual é o prazo de produção?',
    a: 'Costuma ficar entre 3 e 7 dias úteis depois que a prévia é aprovada e o pedido é confirmado. Se o seu evento tem data marcada, informe no pedido e avisamos se conseguimos encaixar.' },
  { q: 'Qual resolução a imagem precisa ter?',
    a: 'Para imprimir com nitidez, a imagem precisa ter boa resolução no tamanho final (o ideal é 300 dpi). Na prática, procure arquivos com pelo menos 2000 pixels no maior lado. Você pode conferir o seu arquivo no teste da <a class="underline underline-offset-4" href="#artes">Central de artes</a>.' },
  { q: 'Como escolho o tamanho da camisa?',
    a: 'Compare as medidas de altura e largura de cada modelo com uma camisa que já serve em você. <button type="button" data-action="size-guide" class="font-medium underline underline-offset-4">Abrir o guia de tamanhos</button>.' },
  { q: 'Como funciona a entrega?',
    a: 'Somos de São Luís e combinamos a entrega direto com você (retirada ou entrega combinada) no atendimento pelo WhatsApp. Não trabalhamos com Correios ou transportadora.' },
  { q: 'Quais são as formas de pagamento?',
    a: 'Aceitamos Pix e cartão de crédito. Para iniciar a produção, pedimos o pagamento do pedido (ou de uma entrada, em pedidos maiores). Os detalhes são combinados no atendimento.' },
  { q: 'Posso pedir apenas uma unidade?',
    a: 'Pode. Tudo é produzido sob demanda. Quanto maior a quantidade, menor o valor de cada unidade — o desconto é aplicado automaticamente no seu pedido.' },
  { q: 'Não tenho a arte pronta. E agora?',
    a: 'Sem problema. Conte a ideia, o tema e as cores, mande fotos e referências, e a gente monta a arte com você. Você só aprova quando estiver do jeito que imaginou.' },
  { q: 'A cor impressa será igual à da tela?',
    a: 'Cores de tela e de impressão podem ter pequenas diferenças. Por isso a prévia é aprovada antes da produção. Se a cor for essencial (como a logo de uma empresa), avise para conferirmos com você.' }
];

/* =====================================================================
   UTILITÁRIOS
   ===================================================================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const brl = n => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const byId = id => PRODUCTS.find(p => p.id === id);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const go = sel => { const el = $(sel); if (el) el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' }); };

const shade = (hex, p) => {
  const n = parseInt(hex.slice(1), 16);
  let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const t = p < 0 ? 0 : 255, q = Math.abs(p) / 100;
  r = Math.round((t - r) * q + r); g = Math.round((t - g) * q + g); b = Math.round((t - b) * q + b);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};
const isDark = hex => { const n = parseInt(hex.slice(1), 16); return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) < 140; };

/* ---------- Ícones ---------- */
const ICONS = {
  bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  whatsapp: '<path d="M3 21l1.65-4.9A9 9 0 1 1 8.1 19.4z"/><path d="M9.2 8.6c.2 2.6 3.6 6 6.2 6.2l1.2-1.2-1.9-1.2-1 .9c-1-.4-2-1.4-2.4-2.4l.9-1-1.2-1.9z"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>',
  grid: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  plus: '<path d="M5 12h14M12 5v14"/>',
  minus: '<path d="M5 12h14"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  star: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',
  zoom: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M11 8v6M8 11h6"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  instagram: '<rect width="20" height="20" x="2" y="2" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><path d="M17.5 6.5h.01"/>',
  facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
  image: '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>'
};
const ic = (name, cls = 'h-5 w-5', fill = false) =>
  `<svg viewBox="0 0 24 24" fill="${fill ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="${fill ? 1 : 1.8}" stroke-linecap="round" stroke-linejoin="round" class="${cls}" aria-hidden="true" focusable="false">${ICONS[name] || ''}</svg>`;
const hydrate = (root = document) => {
  $$('[data-i]', root).forEach(el => {
    if (el.dataset.done) return;
    el.innerHTML = ic(el.dataset.i, 'block h-full w-full');
    el.dataset.done = '1';
  });
};

/* =====================================================================
   ILUSTRAÇÕES DOS PRODUTOS (SVG)
   ===================================================================== */
const stamp = (cx, cy, s, fg) =>
  `<g transform="translate(${cx} ${cy}) scale(${s})" fill="${fg}"><path d="M0 9C-16-2-11-15 0-8 11-15 16-2 0 9Z"/><circle cx="-14" cy="18" r="1.7"/><circle cx="-7" cy="21" r="1.7"/><circle cx="0" cy="23" r="1.7"/><circle cx="7" cy="21" r="1.7"/><circle cx="14" cy="18" r="1.7"/></g>`;
const svgWrap = inner => `<svg viewBox="0 0 200 200" class="h-full w-full" aria-hidden="true" focusable="false">${inner}</svg>`;
const fgFor = c => (isDark(c) ? '#F3E6C0' : '#12294A');
const OUT = 'rgba(18,41,74,.2)';

const ART = {
  mug: (c, o = {}) => svgWrap(`
    <ellipse cx="100" cy="180" rx="58" ry="7" fill="#12294A" opacity=".12"/>
    <path d="M148 78c30-2 38 14 36 30s-12 30-38 30" fill="none" stroke="${o.handle || shade(c, -12)}" stroke-width="11" stroke-linecap="round"/>
    <path d="M46 56h106v92c0 15-11 26-26 26H72c-15 0-26-11-26-26z" fill="${c}" stroke="${OUT}"/>
    <path d="M60 68v88" stroke="#fff" stroke-opacity=".45" stroke-width="6" stroke-linecap="round"/>
    <ellipse cx="99" cy="56" rx="53" ry="9" fill="${shade(c, -8)}" stroke="${OUT}"/>
    <ellipse cx="99" cy="58" rx="46" ry="6" fill="${shade(c, -38)}"/>
    ${stamp(99, 112, 1.5, fgFor(c))}`),
  tee: c => svgWrap(`
    <ellipse cx="100" cy="184" rx="58" ry="6" fill="#12294A" opacity=".1"/>
    <path d="M70 34 L34 50 L14 92 L42 103 L54 84 L54 172 L146 172 L146 84 L158 103 L186 92 L166 50 L130 34 Q100 58 70 34Z" fill="${c}" stroke="${OUT}" stroke-linejoin="round"/>
    <path d="M70 34 Q100 46 130 34 Q100 58 70 34Z" fill="${shade(c, -30)}"/>
    ${stamp(100, 106, 1.7, fgFor(c))}`),
  bottle: c => svgWrap(`
    <ellipse cx="100" cy="185" rx="36" ry="5" fill="#12294A" opacity=".12"/>
    <rect x="86" y="12" width="28" height="14" rx="4" fill="${shade(c, -28)}"/>
    <rect x="80" y="26" width="40" height="18" rx="4" fill="${shade(c, -14)}"/>
    <rect x="68" y="44" width="64" height="136" rx="14" fill="${c}" stroke="${OUT}"/>
    <rect x="76" y="56" width="6" height="108" rx="3" fill="#fff" opacity=".4"/>
    ${stamp(100, 102, 1.4, fgFor(c))}`),
  keychain: c => svgWrap(`
    <circle cx="100" cy="24" r="14" fill="none" stroke="#9AA3AD" stroke-width="4"/>
    <path d="M100 38v14" stroke="#9AA3AD" stroke-width="4"/>
    <rect x="56" y="52" width="88" height="120" rx="24" fill="${c}" stroke="${OUT}"/>
    <rect x="63" y="59" width="74" height="106" rx="18" fill="none" stroke="#fff" stroke-opacity=".8"/>
    <path d="M72 76 L92 66" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".9"/>
    ${stamp(100, 106, 1.6, '#12294A')}`),
  tote: c => svgWrap(`
    <ellipse cx="100" cy="187" rx="58" ry="5" fill="#12294A" opacity=".1"/>
    <path d="M76 82 C76 20 124 20 124 82" fill="none" stroke="${shade(c, -16)}" stroke-width="8" stroke-linecap="round"/>
    <path d="M52 78 H148 L154 178 H46 Z" fill="${c}" stroke="${OUT}" stroke-linejoin="round"/>
    <path d="M51 90 H149" stroke="rgba(18,41,74,.14)"/>
    ${stamp(100, 128, 1.6, fgFor(c))}`)
};
const artFor = p => ART[p.art](p.color, p);

/* =====================================================================
   PREÇOS E FAIXAS
   ===================================================================== */
const tierIndex = q => TIERS.findIndex(t => q >= t.min && q <= t.max);
const tierLabel = t => (t.max === Infinity ? `${t.min} ou mais` : `${t.min} a ${t.max}`);
const unitPrice = (p, q) => Math.round(p.price * TIERS[tierIndex(Math.max(1, q))].mult * 100) / 100;

/* =====================================================================
   TOAST
   ===================================================================== */
let toastTimer;
function toast(msg, link) {
  $$('.toast').forEach(t => t.remove());
  const t = document.createElement('div');
  t.className = 'toast fixed bottom-24 left-1/2 z-[70] flex max-w-[92vw] items-center gap-4 bg-mare-900 px-4 py-3 text-sm text-white shadow-xl';
  t.setAttribute('role', 'status');
  t.innerHTML = `<span>${esc(msg)}</span>${link ? `<a href="${link.href}" class="shrink-0 font-semibold text-ouro-300 underline underline-offset-4">${esc(link.label)}</a>` : ''}`;
  document.body.appendChild(t);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.remove(), 4200);
}

/* =====================================================================
   WHATSAPP
   ===================================================================== */
let warned = false;
function waLink(msg) {
  if (!warned && CONFIG.whatsapp === '5500000000000') {
    warned = true;
    console.warn('[Sal da Terra] Defina o número do WhatsApp em CONFIG.whatsapp no início do script.');
  }
  return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
}
function openWA(msg) {
  const a = document.createElement('a');
  a.href = waLink(msg); a.target = '_blank'; a.rel = 'noopener';
  document.body.appendChild(a); a.click(); a.remove();
}
function hydrateWA() {
  $$('[data-wa]').forEach(a => { a.href = waLink(a.dataset.waMsg || CONFIG.defaultMessage); });
}

/* =====================================================================
   PEDIDO (CARRINHO)
   ===================================================================== */
const CART_KEY = 'sdt-pedido-v1';
let cart = [];
try { cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]').filter(i => byId(i.pid) && i.qty > 0); } catch (e) { cart = []; }
const saveCart = () => { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) { /* ignora */ } };

function addToCart({ pid, qty = 1, size = '', detail = '' }) {
  qty = Math.max(1, Math.min(9999, parseInt(qty, 10) || 1));
  const ex = cart.find(i => i.pid === pid && i.size === size && i.detail === detail);
  if (ex) ex.qty += qty; else cart.push({ pid, qty, size, detail });
  saveCart(); renderCart();
  const p = byId(pid);
  toast(`Adicionado: ${qty}x ${p.name}`, { href: '#pedido', label: 'Ver pedido' });
}
const qtyByPid = () => cart.reduce((m, i) => { m[i.pid] = (m[i.pid] || 0) + i.qty; return m; }, {});
function cartTotals() {
  const qb = qtyByPid(); let total = 0, base = 0;
  cart.forEach(i => { const p = byId(i.pid); total += unitPrice(p, qb[i.pid]) * i.qty; base += p.price * i.qty; });
  return { total, saving: base - total };
}

function renderCart() {
  const qb = qtyByPid();
  const count = cart.reduce((a, i) => a + i.qty, 0);
  const badge = $('#cartCount');
  badge.textContent = count > 99 ? '99+' : count;
  badge.classList.toggle('hidden', count === 0);
  badge.classList.toggle('inline-flex', count > 0);

  const list = $('#cartList'), tot = $('#cartTotal'), clear = $('#cartClear');
  if (!cart.length) {
    list.innerHTML = `<div class="py-10"><p class="font-display text-xl">Seu pedido está vazio.</p>
      <p class="mt-2 max-w-md text-mare/70">Escolha itens no catálogo ou use o simulador. Se preferir conversar antes, é só chamar no WhatsApp.</p>
      <div class="mt-5"><a href="#catalogo" class="btn btn-navy">Ver catálogo</a></div></div>`;
    tot.classList.add('hidden'); clear.classList.add('hidden');
    updatePreview(); return;
  }
  list.innerHTML = cart.map((it, idx) => {
    const p = byId(it.pid), u = unitPrice(p, qb[it.pid]);
    const meta = [it.size ? `Tamanho ${it.size}` : '', it.detail].filter(Boolean).join('; ');
    return `<div class="flex gap-4 border-b border-areia py-4">
      <div class="h-16 w-16 shrink-0 bg-pedra p-1.5">${artFor(p)}</div>
      <div class="min-w-0 flex-1">
        <p class="font-display text-lg leading-tight">${esc(p.name)}</p>
        ${meta ? `<p class="mt-1 text-sm text-mare/65">${esc(meta)}</p>` : ''}
        <p class="mt-1 text-sm text-mare/55">${brl(u)} cada</p>
        <div class="mt-2 flex items-center gap-2">
          <button type="button" data-cart="dec" data-idx="${idx}" class="flex h-9 w-9 items-center justify-center rounded-md border border-areia hover:border-mare" aria-label="Diminuir quantidade de ${esc(p.name)}">${ic('minus', 'h-4 w-4')}</button>
          <span class="w-9 text-center font-semibold" aria-live="polite">${it.qty}</span>
          <button type="button" data-cart="inc" data-idx="${idx}" class="flex h-9 w-9 items-center justify-center rounded-md border border-areia hover:border-mare" aria-label="Aumentar quantidade de ${esc(p.name)}">${ic('plus', 'h-4 w-4')}</button>
        </div>
      </div>
      <div class="text-right">
        <p class="font-semibold">${brl(u * it.qty)}</p>
        <button type="button" data-cart="del" data-idx="${idx}" class="mt-3 text-sm text-mare/60 underline underline-offset-4 hover:text-mare">Remover</button>
      </div>
    </div>`;
  }).join('');

  const { total, saving } = cartTotals();
  tot.classList.remove('hidden'); clear.classList.remove('hidden');
  tot.innerHTML = `<div class="flex items-end justify-between gap-4"><span class="text-mare/70">Valor estimado</span><span class="font-display text-3xl font-semibold">${brl(total)}</span></div>
    ${saving > 0.005 ? `<p class="mt-2 text-sm font-medium text-ouro-700">Você economiza ${brl(saving)} com os descontos por quantidade.</p>` : ''}
    <p class="mt-2 text-xs text-mare/55">O valor final é confirmado no atendimento.</p>`;
  updatePreview();
}

const formFields = () => ({
  name: $('#fName').value.trim(), date: $('#fDate').value,
  idea: $('#fIdea').value.trim(), notes: $('#fNotes').value.trim()
});
function buildOrderMessage() {
  const f = formFields(); const L = ['Olá, Sal da Terra! 👋'];
  if (cart.length) {
    L.push('Gostaria de encomendar:');
    cart.forEach(it => {
      const p = byId(it.pid); const ex = [];
      if (it.size) ex.push(`Tam. ${it.size}`);
      if (it.detail) ex.push(it.detail);
      L.push(`• ${it.qty}x ${p.name}${ex.length ? ` (${ex.join('; ')})` : ''}`);
    });
    L.push('', `Valor estimado: ${brl(cartTotals().total)} (a confirmar)`);
  } else {
    L.push('Gostaria de fazer um pedido personalizado.');
  }
  const extra = [];
  if (f.name) extra.push(`Nome: ${f.name}`);
  if (f.date) extra.push(`Preciso para: ${f.date.split('-').reverse().join('/')}`);
  if (f.idea) extra.push(`Ideia/tema da arte: ${f.idea}`);
  if (f.notes) extra.push(`Observações: ${f.notes}`);
  if (extra.length) L.push('', ...extra);
  L.push('', 'Como prosseguimos?');
  return L.join('\n');
}
function updatePreview() { const el = $('#msgPreview'); if (el) el.textContent = buildOrderMessage(); }

function initOrder() {
  $('#cartList').addEventListener('click', e => {
    const b = e.target.closest('[data-cart]'); if (!b) return;
    const i = +b.dataset.idx, it = cart[i]; if (!it) return;
    if (b.dataset.cart === 'inc') it.qty = Math.min(9999, it.qty + 1);
    if (b.dataset.cart === 'dec') it.qty = Math.max(1, it.qty - 1);
    if (b.dataset.cart === 'del') cart.splice(i, 1);
    saveCart(); renderCart();
  });
  $('#cartClear').addEventListener('click', () => { cart = []; saveCart(); renderCart(); });
  $('#orderForm').addEventListener('input', updatePreview);
  $('#orderForm').addEventListener('submit', e => {
    e.preventDefault();
    const err = $('#fNameErr');
    if (!formFields().name) { err.classList.remove('hidden'); $('#fName').focus(); return; }
    err.classList.add('hidden');
    openWA(buildOrderMessage());
    toast('Abrindo o WhatsApp com o seu pedido…');
  });
  const d = $('#fDate'); const today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  d.min = today.toISOString().slice(0, 10);
  renderCart();
}

/* =====================================================================
   HERO: vitrine + grãos de sal
   ===================================================================== */
function renderHero() {
  const ids = ['caneca-porcelana', 'camisa-algodao', 'squeeze', 'ecobag'];
  const tints = ['#EFECE5', '#E6EAF1', '#F4EBD2', '#E8ECE6'];
  $('#heroGrid').innerHTML = ids.map((id, i) => {
    const p = byId(id);
    return `<a href="#catalogo" class="group block ${i % 2 ? 'mt-10' : ''}">
      <div class="aspect-[4/5] overflow-hidden rounded-t-[999px] p-6 pt-16 transition duration-300 group-hover:brightness-95" style="background:${tints[i]}">${artFor(p)}</div>
      <p class="mt-3 font-display text-lg leading-tight">${p.name}</p>
      <p class="text-sm text-mare/65">${brl(p.price)} a unidade</p></a>`;
  }).join('');
}
function renderPile() {
  const svg = $('#saltPile'); if (!svg) return;
  let s = 20260921;
  const rnd = () => { s |= 0; s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const gauss = () => (rnd() + rnd() + rnd() + rnd() - 2) / 2;
  const W = 360, base = 166, dots = [];
  for (let i = 0; i < 170; i++) {
    const t = Math.pow(rnd(), 1.7);
    const spread = (1 - t) * 150 + 8;
    dots.push({ x: W / 2 + gauss() * spread * 0.75, y: base - t * 96, r: (1 - t * 0.45) * (1.1 + rnd() * 2.4), c: '#12294A', d: 0.35 + rnd() * 1.4 });
  }
  for (let i = 0; i < 16; i++) {
    dots.push({ x: W / 2 + gauss() * 9 * (1 - i / 22), y: base - 100 - i * 3.6 - rnd() * 5, r: 1 + rnd() * 1.5, c: '#C39A3B', d: rnd() * 0.7 });
  }
  svg.innerHTML = dots.map(d => `<circle cx="${d.x.toFixed(1)}" cy="${d.y.toFixed(1)}" r="${d.r.toFixed(2)}" fill="${d.c}" style="--d:${d.d.toFixed(2)}s"/>`).join('');
}

/* =====================================================================
   CATÁLOGO
   ===================================================================== */
const CATS = [['todas', 'Todas'], ['camisas', 'Camisas'], ['canecas', 'Canecas'], ['brindes', 'Brindes'], ['corporativo', 'Corporativo']];
const TILE = { camisas: '#E6EAF1', canecas: '#F4EBD2', brindes: '#EFECE5', corporativo: '#E8ECE6' };
const cat = { key: 'todas', q: '' };

function renderTabs() {
  $('#catTabs').innerHTML = CATS.map(([k, l]) => {
    const n = k === 'todas' ? PRODUCTS.length : PRODUCTS.filter(p => p.cats.includes(k)).length;
    return `<button type="button" class="tab shrink-0" data-cat="${k}" aria-pressed="${cat.key === k}">${l} <span class="text-xs opacity-60">${n}</span></button>`;
  }).join('');
}
function cardHTML(p) {
  const low = unitPrice(p, 51);
  return `<article class="flex flex-col border border-areia bg-white" data-pid="${p.id}">
    <div class="relative aspect-[5/4] p-6" style="background:${TILE[p.cats[0]] || '#EFECE5'}">
      ${artFor(p)}
      ${p.best ? '<span class="absolute left-3 top-3 bg-ouro px-2.5 py-1 text-xs font-semibold text-mare-900">Mais pedido</span>' : ''}
    </div>
    <div class="flex flex-1 flex-col p-5">
      <h3 class="font-display text-xl font-semibold leading-tight">${esc(p.name)}</h3>
      <p class="mt-1 text-sm text-mare/70">${esc(p.desc)}</p>
      <p class="mt-4"><span class="font-display text-2xl font-semibold">${brl(p.price)}</span> <span class="text-sm text-mare/60">a unidade</span></p>
      <p class="text-xs text-mare/55">Cai para ${brl(low)} acima de 50 unidades</p>
      <div class="mt-4 flex items-center gap-2">
        ${p.sizes ? `<label class="shrink-0"><span class="sr-only">Tamanho de ${esc(p.name)}</span><select data-size class="field w-[4.6rem] px-2 py-2.5 text-sm">${p.sizes.map(s => `<option>${s}</option>`).join('')}</select></label>` : ''}
        <button type="button" data-action="add" class="btn btn-navy btn-sm grow">${ic('plus', 'h-4 w-4')}Adicionar</button>
      </div>
      <div class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        ${p.sim ? '<button type="button" data-action="sim" class="font-medium text-mare underline underline-offset-4 hover:text-ouro-700">Simular arte</button>' : ''}
        ${p.sizes ? '<button type="button" data-action="size-guide" class="font-medium text-mare underline underline-offset-4 hover:text-ouro-700">Guia de tamanhos</button>' : ''}
      </div>
    </div></article>`;
}
function renderCatalog() {
  const q = norm(cat.q);
  const list = PRODUCTS.filter(p => (cat.key === 'todas' || p.cats.includes(cat.key)) &&
    (!q || norm([p.name, p.desc, ...p.tags, ...p.cats].join(' ')).includes(q)));
  $('#catGrid').innerHTML = list.map(cardHTML).join('');
  $('#catEmpty').classList.toggle('hidden', list.length > 0);
  $('#catEmptyTerm').textContent = cat.q;
  $('#catStatus').textContent = list.length
    ? `${list.length} ${list.length === 1 ? 'produto encontrado' : 'produtos encontrados'}`
    : 'Nenhum produto encontrado';
  renderTabs(); hydrate($('#catEmpty'));
}
function initCatalog() {
  renderTabs(); renderCatalog();
  $('#catTabs').addEventListener('click', e => {
    const b = e.target.closest('[data-cat]'); if (!b) return;
    cat.key = b.dataset.cat; renderCatalog();
  });
  $('#catSearch').addEventListener('input', e => { cat.q = e.target.value; renderCatalog(); });
  $('#catClear').addEventListener('click', () => { cat.q = ''; $('#catSearch').value = ''; renderCatalog(); $('#catSearch').focus(); });
  $('#catGrid').addEventListener('click', e => {
    const b = e.target.closest('[data-action]'); if (!b) return;
    const card = b.closest('[data-pid]'); const p = byId(card.dataset.pid);
    const size = $('[data-size]', card)?.value || '';
    if (b.dataset.action === 'add') addToCart({ pid: p.id, qty: 1, size });
    if (b.dataset.action === 'sim') { setSimProduct(p.sim); go('#simulador'); }
  });
}

/* =====================================================================
   SIMULADOR (Canvas)
   ===================================================================== */
const SIMS = {
  mug:    { label: 'Caneca',   pid: 'caneca-porcelana', area: { x: 158, y: 196, w: 224, h: 186 },
            colors: [['Branca', '#FFFFFF'], ['Preta', '#20242B'], ['Azul', '#1E3A63'], ['Dourada', '#C39A3B'], ['Rosa', '#EBB9BF'], ['Verde', '#86A38B']] },
  tee:    { label: 'Camisa',   pid: 'camisa-algodao', area: { x: 205, y: 212, w: 190, h: 226 },
            colors: [['Branca', '#FFFFFF'], ['Preta', '#20242B'], ['Areia', '#D9CDB4'], ['Azul-marinho', '#1E3A63'], ['Terracota', '#B8664A'], ['Verde', '#6F8B76']] },
  tote:   { label: 'Ecobag',   pid: 'ecobag', area: { x: 185, y: 290, w: 230, h: 190 },
            colors: [['Cru', '#EDE4D0'], ['Preta', '#20242B'], ['Azul', '#1E3A63'], ['Verde', '#6F8B76']] }
};
const FONTS = {
  'Playfair Display': { label: 'Clássica', w: 700 },
  'Jost': { label: 'Moderna', w: 600 },
  'Dancing Script': { label: 'Manuscrita', w: 700 },
  'Bebas Neue': { label: 'Impacto', w: 400 }
};
const S = {
  key: 'mug', color: '#FFFFFF', colorName: 'Branca',
  text: '', font: 'Playfair Display', textColor: '#12294A', textTouched: false, textSize: 38, textX: .5, textY: .5, textMoved: false,
  img: null, imgName: '', imgScale: 1, imgX: .5, imgY: .5, imgMoved: false,
  guide: true, sel: 'text', _tb: null, _ib: null
};
let cv, ctx;
const DPR = Math.min(window.devicePixelRatio || 1, 2);

const DRAW = {
  mug(c, x) {
    x.fillStyle = 'rgba(18,41,74,.12)'; x.beginPath(); x.ellipse(285, 514, 175, 20, 0, 0, 7); x.fill();
    x.strokeStyle = shade(c, -12); x.lineWidth = 34; x.lineCap = 'round';
    x.beginPath(); x.moveTo(398, 222); x.bezierCurveTo(505, 205, 512, 402, 392, 412); x.stroke();
    const clip = new Path2D('M130 140H410V440Q410 492 358 492H182Q130 492 130 440Z');
    x.fillStyle = c; x.fill(clip);
    return {
      clip,
      overlay() {
        const g = x.createLinearGradient(130, 0, 410, 0);
        g.addColorStop(0, 'rgba(0,0,0,.24)'); g.addColorStop(.18, 'rgba(0,0,0,0)'); g.addColorStop(.34, 'rgba(255,255,255,.2)');
        g.addColorStop(.5, 'rgba(255,255,255,0)'); g.addColorStop(.85, 'rgba(0,0,0,.05)'); g.addColorStop(1, 'rgba(0,0,0,.28)');
        x.fillStyle = g; x.fillRect(130, 140, 280, 352);
      },
      after() {
        x.fillStyle = shade(c, -8); x.beginPath(); x.ellipse(270, 140, 140, 22, 0, 0, 7); x.fill();
        x.strokeStyle = 'rgba(18,41,74,.16)'; x.lineWidth = 1.5; x.stroke();
        x.fillStyle = shade(c, -38); x.beginPath(); x.ellipse(270, 143, 124, 15, 0, 0, 7); x.fill();
      }
    };
  },
  tee(c, x) {
    x.fillStyle = 'rgba(18,41,74,.1)'; x.beginPath(); x.ellipse(300, 530, 160, 14, 0, 0, 7); x.fill();
    const clip = new Path2D('M215 92 L128 128 L70 232 L140 262 L168 220 L168 492 L432 492 L432 220 L460 262 L530 232 L472 128 L385 92 Q300 150 215 92Z');
    x.fillStyle = c; x.fill(clip);
    return {
      clip,
      overlay() {
        const g = x.createLinearGradient(0, 90, 0, 492);
        g.addColorStop(0, 'rgba(255,255,255,.10)'); g.addColorStop(1, 'rgba(0,0,0,.10)');
        x.fillStyle = g; x.fillRect(60, 90, 480, 410);
        x.strokeStyle = 'rgba(0,0,0,.08)'; x.lineWidth = 2;
        x.beginPath(); x.moveTo(168, 220); x.lineTo(140, 262); x.moveTo(432, 220); x.lineTo(460, 262); x.stroke();
      },
      after() {
        x.fillStyle = shade(c, -30); x.beginPath(); x.moveTo(215, 92); x.quadraticCurveTo(300, 118, 385, 92); x.quadraticCurveTo(300, 150, 215, 92); x.fill();
      }
    };
  },
  tote(c, x) {
    x.fillStyle = 'rgba(18,41,74,.1)'; x.beginPath(); x.ellipse(300, 532, 170, 14, 0, 0, 7); x.fill();
    x.strokeStyle = shade(c, -16); x.lineWidth = 18; x.lineCap = 'round';
    x.beginPath(); x.moveTo(228, 250); x.bezierCurveTo(228, 96, 372, 96, 372, 250); x.stroke();
    const clip = new Path2D('M150 242H450L466 516H134Z');
    x.fillStyle = c; x.fill(clip);
    return {
      clip,
      overlay() {
        const g = x.createLinearGradient(134, 0, 466, 0);
        g.addColorStop(0, 'rgba(0,0,0,.10)'); g.addColorStop(.5, 'rgba(255,255,255,.08)'); g.addColorStop(1, 'rgba(0,0,0,.12)');
        x.fillStyle = g; x.fillRect(134, 242, 332, 274);
        x.strokeStyle = 'rgba(0,0,0,.10)'; x.lineWidth = 2; x.beginPath(); x.moveTo(150, 268); x.lineTo(450, 268); x.stroke();
      }
    };
  }
};

function drawArt(x, a, exporting) {
  S._ib = null; S._tb = null;
  if (S.img) {
    const iw = S.img.naturalWidth || S.img.width, ih = S.img.naturalHeight || S.img.height;
    const fit = Math.min(a.w / iw, a.h / ih) * S.imgScale;
    const w = iw * fit, h = ih * fit, cx = a.x + S.imgX * a.w, cy = a.y + S.imgY * a.h;
    x.drawImage(S.img, cx - w / 2, cy - h / 2, w, h);
    S._ib = { x: cx - w / 2, y: cy - h / 2, w, h };
  }
  const lines = S.text.split('\n').slice(0, 3);
  if (S.text.trim()) {
    const f = FONTS[S.font];
    let size = S.textSize;
    x.font = `${f.w} ${size}px "${S.font}", serif`;
    const widest = Math.max(...lines.map(l => x.measureText(l).width));
    if (widest > a.w * 0.98) { size = size * (a.w * 0.98) / widest; x.font = `${f.w} ${size}px "${S.font}", serif`; }
    x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = S.textColor;
    const lh = size * 1.12, cx = a.x + S.textX * a.w, cy = a.y + S.textY * a.h;
    let maxW = 0;
    lines.forEach((ln, i) => { x.fillText(ln, cx, cy + (i - (lines.length - 1) / 2) * lh); maxW = Math.max(maxW, x.measureText(ln).width); });
    S._tb = { x: cx - maxW / 2, y: cy - (lines.length * lh) / 2, w: maxW, h: lines.length * lh };
  } else if (!S.img && !exporting) {
    x.font = '500 22px Jost, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillStyle = isDark(S.color) ? 'rgba(255,255,255,.5)' : 'rgba(18,41,74,.4)';
    x.fillText('Sua arte aqui', a.x + a.w / 2, a.y + a.h / 2);
  }
}
function render(exporting = false) {
  if (!ctx) return;
  const { area } = SIMS[S.key];
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.setLineDash([]); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#FBFAF7'; ctx.fillRect(0, 0, 600, 600);
  const d = DRAW[S.key](S.color, ctx);
  ctx.save(); ctx.clip(d.clip); drawArt(ctx, area, exporting); if (d.overlay) d.overlay(); ctx.restore();
  if (d.after) d.after();
  ctx.save(); ctx.strokeStyle = 'rgba(18,41,74,.16)'; ctx.lineWidth = 1.5; ctx.stroke(d.clip); ctx.restore();
  if (!exporting && S.guide) {
    ctx.save(); ctx.setLineDash([6, 5]); ctx.strokeStyle = 'rgba(195,154,59,.95)'; ctx.lineWidth = 1.5;
    ctx.strokeRect(area.x, area.y, area.w, area.h); ctx.restore();
  }
}
function autoLayout() {
  if (!S.textMoved) S.textY = S.img ? 0.86 : 0.5;
  if (!S.imgMoved) S.imgY = S.text.trim() ? 0.4 : 0.5;
}
function loadFont(name) {
  const f = FONTS[name];
  if (document.fonts && document.fonts.load) document.fonts.load(`${f.w} 40px "${name}"`).then(() => render()).catch(() => {});
}

function setSimProduct(key) {
  if (!SIMS[key]) return;
  S.key = key;
  const [n, c] = SIMS[key].colors[0]; S.colorName = n; S.color = c;
  if (!S.textTouched) { S.textColor = isDark(c) ? '#FFFFFF' : '#12294A'; $('#simTextColor').value = S.textColor; }
  $$('#simProducts [data-sim]').forEach(b => b.setAttribute('aria-checked', b.dataset.sim === key));
  $('#simSizeWrap').classList.toggle('hidden', key !== 'tee');
  renderSwatches(); render();
}
function renderSwatches() {
  $('#simColors').innerHTML = SIMS[S.key].colors.map(([n, c]) =>
    `<button type="button" role="radio" class="swatch" data-color="${c}" data-name="${n}" style="background:${c}" aria-label="${n}" title="${n}" aria-checked="${c === S.color}"></button>`).join('');
  $('#simColorName').textContent = S.colorName;
}
function simDetail() {
  const d = [`cor ${S.colorName.toLowerCase()}`];
  if (S.text.trim()) d.push(`texto “${S.text.trim().replace(/\s*\n\s*/g, ' / ')}”`);
  if (S.img) d.push('arte: imagem minha (vou anexar na conversa)');
  return d.join('; ');
}
function exportBlob(cb) { render(true); cv.toBlob(b => { render(false); cb(b); }, 'image/png'); }
const canShareFiles = () => { try { return !!(navigator.canShare && navigator.canShare({ files: [new File([''], 'a.png', { type: 'image/png' })] })); } catch (e) { return false; } };

function initSim() {
  cv = $('#simCanvas'); ctx = cv.getContext('2d');
  cv.width = 600 * DPR; cv.height = 600 * DPR;

  $('#simProducts').innerHTML = Object.entries(SIMS).map(([k, v]) => `<button type="button" role="radio" class="seg" data-sim="${k}" aria-checked="${k === S.key}">${v.label}</button>`).join('');
  $('#simFont').innerHTML = Object.entries(FONTS).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('');
  $('#simSizeSel').innerHTML = ['P', 'M', 'G', 'GG'].map(s => `<option>${s}</option>`).join('');
  Object.keys(FONTS).forEach(loadFont);
  renderSwatches();

  $('#simProducts').addEventListener('click', e => { const b = e.target.closest('[data-sim]'); if (b) setSimProduct(b.dataset.sim); });
  $('#simColors').addEventListener('click', e => {
    const b = e.target.closest('[data-color]'); if (!b) return;
    S.color = b.dataset.color; S.colorName = b.dataset.name;
    if (!S.textTouched) { S.textColor = isDark(S.color) ? '#FFFFFF' : '#12294A'; $('#simTextColor').value = S.textColor; }
    renderSwatches(); render();
  });
  $('#simText').addEventListener('input', e => { S.text = e.target.value; autoLayout(); render(); });
  $('#simFont').addEventListener('change', e => { S.font = e.target.value; loadFont(S.font); render(); });
  $('#simTextColor').addEventListener('input', e => { S.textColor = e.target.value; S.textTouched = true; render(); });
  $('#simTextSize').addEventListener('input', e => { S.textSize = +e.target.value; render(); });
  $('#simGuide').addEventListener('change', e => { S.guide = e.target.checked; render(); });
  $('#simScale').addEventListener('input', e => { S.imgScale = +e.target.value / 100; render(); });

  $('#simFile').addEventListener('change', e => {
    const f = e.target.files[0]; if (!f) return;
    if (!f.type.startsWith('image/')) { toast('Escolha um arquivo de imagem (PNG, JPG, WEBP ou SVG).'); return; }
    if (f.size > 20 * 1024 * 1024) { toast('A imagem é muito grande. Use um arquivo de até 20 MB.'); return; }
    const url = URL.createObjectURL(f), im = new Image();
    im.onload = () => {
      S.img = im; S.imgName = f.name; S.imgScale = 1; S.imgMoved = false; S.sel = 'img';
      $('#simScale').value = 100; $('#simScaleWrap').classList.remove('hidden');
      $('#simFileName').textContent = f.name; $('#simClearImg').classList.remove('hidden');
      autoLayout(); render();
    };
    im.onerror = () => { toast('Não foi possível abrir essa imagem. Tente PNG ou JPG.'); URL.revokeObjectURL(url); };
    im.src = url;
  });
  $('#simClearImg').addEventListener('click', () => {
    S.img = null; S.imgName = ''; $('#simFile').value = ''; $('#simFileName').textContent = 'Nenhuma imagem enviada';
    $('#simClearImg').classList.add('hidden'); $('#simScaleWrap').classList.add('hidden'); autoLayout(); render();
  });

  // Arrastar
  const pt = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * 600 / r.width, y: (e.clientY - r.top) * 600 / r.height }; };
  const inBox = (b, p, pad) => b && p.x >= b.x - pad && p.x <= b.x + b.w + pad && p.y >= b.y - pad && p.y <= b.y + b.h + pad;
  let drag = null;
  cv.addEventListener('pointerdown', e => {
    const p = pt(e), a = SIMS[S.key].area; let t = null;
    if (inBox(S._tb, p, 10)) t = 'text'; else if (inBox(S._ib, p, 0)) t = 'img';
    if (!t) return;
    const cx = a.x + (t === 'text' ? S.textX : S.imgX) * a.w, cy = a.y + (t === 'text' ? S.textY : S.imgY) * a.h;
    drag = { t, dx: p.x - cx, dy: p.y - cy }; S.sel = t;
    cv.setPointerCapture(e.pointerId); cv.style.cursor = 'grabbing'; e.preventDefault();
  });
  cv.addEventListener('pointermove', e => {
    const p = pt(e), a = SIMS[S.key].area;
    if (!drag) { cv.style.cursor = (inBox(S._tb, p, 10) || inBox(S._ib, p, 0)) ? 'grab' : 'default'; return; }
    const nx = Math.min(1, Math.max(0, (p.x - drag.dx - a.x) / a.w)), ny = Math.min(1, Math.max(0, (p.y - drag.dy - a.y) / a.h));
    if (drag.t === 'text') { S.textX = nx; S.textY = ny; S.textMoved = true; } else { S.imgX = nx; S.imgY = ny; S.imgMoved = true; }
    render();
  });
  const end = () => { drag = null; cv.style.cursor = 'default'; };
  cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
  cv.addEventListener('keydown', e => {
    const k = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key]; if (!k) return;
    e.preventDefault();
    const t = (S.sel === 'img' && S.img) || !S.text.trim() ? 'img' : 'text';
    if (t === 'img' && !S.img) return;
    const step = e.shiftKey ? 0.06 : 0.02;
    if (t === 'text') { S.textX = Math.min(1, Math.max(0, S.textX + k[0] * step)); S.textY = Math.min(1, Math.max(0, S.textY + k[1] * step)); S.textMoved = true; }
    else { S.imgX = Math.min(1, Math.max(0, S.imgX + k[0] * step)); S.imgY = Math.min(1, Math.max(0, S.imgY + k[1] * step)); S.imgMoved = true; }
    render();
  });

  $('#simAdd').addEventListener('click', () => {
    addToCart({ pid: SIMS[S.key].pid, qty: $('#simQty').value, size: S.key === 'tee' ? $('#simSizeSel').value : '', detail: simDetail() });
  });
  $('#simDownload').addEventListener('click', () => {
    exportBlob(b => {
      const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'previa-sal-da-terra.png';
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    });
  });
  if (canShareFiles()) {
    const sb = $('#simShare'); sb.classList.remove('hidden');
    sb.addEventListener('click', () => exportBlob(b => {
      const file = new File([b], 'previa-sal-da-terra.png', { type: 'image/png' });
      navigator.share({ files: [file], text: 'Prévia do meu pedido, Sal da Terra Personalizados' }).catch(() => {});
    }));
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => render());
  setSimProduct('mug');
}



/* =====================================================================
   DIÁLOGOS
   ===================================================================== */
function initDialogs() {
  $$('dialog').forEach(dlg => {
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('close', () => { document.body.style.overflow = ''; });
    $$('[data-close]', dlg).forEach(b => b.addEventListener('click', () => dlg.close()));
  });
  const openDlg = dlg => { document.body.style.overflow = 'hidden'; dlg.showModal(); };

  const sd = $('#sizeDialog');
  buildSizeGuide();
  document.addEventListener('click', e => {
    if (e.target.closest('[data-action="size-guide"]')) { e.preventDefault(); openDlg(sd); }
  });
}

/* =====================================================================
   GUIA DE TAMANHOS
   ===================================================================== */
function buildSizeGuide() {
  const rows = ['Unissex', 'Baby Look'].map(g => `
    <tr><th colspan="3" class="bg-pedra px-3 py-2 text-left font-display text-base font-semibold">${g}</th></tr>
    ${SIZE_TABLE.filter(s => s.group === g).map(s => `<tr data-size-row="${s.label}" class="border-b border-areia/70">
      <td class="px-3 py-2.5 font-medium">${s.label}</td><td class="px-3 py-2.5">${s.h} cm</td><td class="px-3 py-2.5">${s.w} cm</td></tr>`).join('')}`).join('');
  $('#sizeBody').innerHTML = `
    <div class="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
      <svg viewBox="0 0 200 190" class="w-40 shrink-0 text-mare" role="img" aria-label="Como medir: A é a altura, da gola à barra; L é a largura, de axila a axila">
        <path d="M70 20 L30 36 L12 76 L38 86 L48 68 L48 176 L152 176 L152 68 L162 86 L188 76 L170 36 L130 20 Q100 44 70 20Z" fill="#fff" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
        <path d="M100 40 V176" stroke="#C39A3B" stroke-width="2" stroke-dasharray="4 4"/>
        <path d="M48 138 H152" stroke="#C39A3B" stroke-width="2" stroke-dasharray="4 4"/>
        <circle cx="100" cy="40" r="3" fill="#C39A3B"/><circle cx="100" cy="176" r="3" fill="#C39A3B"/><circle cx="48" cy="138" r="3" fill="#C39A3B"/><circle cx="152" cy="138" r="3" fill="#C39A3B"/>
        <text x="106" y="100" font-size="15" font-weight="600" fill="currentColor" font-family="Jost, sans-serif">A</text>
        <text x="94" y="130" font-size="15" font-weight="600" fill="currentColor" font-family="Jost, sans-serif">L</text>
      </svg>
      <div class="w-full overflow-x-auto">
        <table class="w-full min-w-[300px] text-left text-sm">
          <caption class="sr-only">Medidas por tamanho, altura e largura em centímetros</caption>
          <thead class="text-mare/65"><tr><th class="px-3 py-2 font-medium">Modelo</th><th class="px-3 py-2 font-medium">Altura (A)</th><th class="px-3 py-2 font-medium">Largura (L)</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
    <div class="mt-6 border-t border-areia pt-5">
      <h3 class="font-display text-lg font-semibold">Compare com uma camisa sua</h3>
      <p class="mt-1 text-sm text-mare/70">Estenda sobre uma mesa uma camisa que serve bem em você e meça a altura (da gola até a barra) e a largura (de axila a axila).</p>
      <div class="mt-3 grid grid-cols-2 gap-3">
        <div><label for="sgH" class="mb-1 block text-sm font-medium">Altura (cm)</label><input id="sgH" type="number" min="30" max="120" inputmode="decimal" class="field" placeholder="Ex.: 72"></div>
        <div><label for="sgW" class="mb-1 block text-sm font-medium">Largura (cm)</label><input id="sgW" type="number" min="25" max="90" inputmode="decimal" class="field" placeholder="Ex.: 53"></div>
      </div>
      <p id="sgResult" class="mt-3 min-h-6 text-sm font-medium" aria-live="polite"></p>
      <p class="mt-3 text-xs text-mare/55">Medidas aproximadas, com variação de 1 a 2 cm por causa da malha e da costura.</p>
    </div>`;
  const update = () => {
    const h = parseFloat($('#sgH').value), w = parseFloat($('#sgW').value);
    $$('[data-size-row]').forEach(r => r.classList.remove('bg-ouro/20', 'font-semibold'));
    const out = $('#sgResult');
    if (!h || !w) { out.textContent = ''; return; }
    let best = null, bd = Infinity;
    SIZE_TABLE.forEach(s => { const d = Math.hypot(s.h - h, s.w - w); if (d < bd) { bd = d; best = s; } });
    if (bd > 9) { out.textContent = 'Essa medida está fora da nossa tabela. Chame a gente no WhatsApp para vermos a melhor opção.'; return; }
    out.textContent = `O modelo mais próximo é o ${best.label} (${best.h} × ${best.w} cm). Em dúvida entre dois tamanhos, o maior deixa a peça mais solta.`;
    $(`[data-size-row="${best.label}"]`).classList.add('bg-ouro/20', 'font-semibold');
  };
  $('#sgH').addEventListener('input', update); $('#sgW').addEventListener('input', update);
}

/* =====================================================================
   CENTRAL DE ARTES: teste de qualidade
   ===================================================================== */
const USES = [['Caneca (arte de 20 cm)', 20], ['Camisa (arte de 30 cm)', 30], ['Ecobag (arte de 25 cm)', 25], ['Chaveiro (arte de 5 cm)', 5]];
function initChecker() {
  const out = $('#chkResult');
  $('#chkFile').addEventListener('change', e => {
    const f = e.target.files[0]; if (!f) return;
    out.classList.remove('hidden');
    const url = URL.createObjectURL(f), im = new Image();
    im.onerror = () => {
      out.innerHTML = `<p class="border-l-2 border-[#A32A2A] pl-3 text-sm">Não foi possível ler esse arquivo aqui. Sem problema: envie direto pelo WhatsApp que a gente confere.</p>`;
      URL.revokeObjectURL(url);
    };
    im.onload = () => {
      const w = im.naturalWidth, h = im.naturalHeight, px = Math.max(w, h);
      const thumb = `<img src="${url}" alt="Miniatura da sua imagem" class="h-24 w-24 shrink-0 border border-areia bg-pedra object-contain">`;
      if (f.type === 'image/svg+xml') {
        out.innerHTML = `<div class="flex gap-4">${thumb}<div><p class="font-semibold text-[#2F7A4E]">Vetor: excelente</p><p class="mt-1 text-sm text-mare/75">Arquivos vetoriais podem ser ampliados sem perder nitidez.</p></div></div>`;
        return;
      }
      let verdict, color;
      if (px >= 2400) { verdict = 'Excelente resolução'; color = '#2F7A4E'; }
      else if (px >= 1200) { verdict = 'Boa para peças pequenas e médias'; color = '#A66A00'; }
      else { verdict = 'Resolução baixa: pode sair borrada'; color = '#A32A2A'; }
      const max300 = Math.round(px / 300 * 2.54), max150 = Math.round(px / 150 * 2.54);
      const rows = USES.map(([label, cm]) => {
        const need = cm / 2.54 * 300;
        const st = px >= need ? ['Ideal', '#2F7A4E'] : px >= need / 2 ? ['Aceitável', '#A66A00'] : ['Baixa', '#A32A2A'];
        return `<li class="flex items-center justify-between gap-3 border-b border-areia/70 py-2"><span>${label}</span><span class="font-semibold" style="color:${st[1]}">${st[0]}</span></li>`;
      }).join('');
      const light = f.size < 200 * 1024 && px > 1000
        ? `<p class="mt-3 border-l-2 border-ouro pl-3 text-sm text-mare/80">O arquivo é bem leve para essas dimensões e pode ter sido comprimido (redes sociais ou WhatsApp). Se tiver o original, prefira ele.</p>` : '';
      out.innerHTML = `<div class="flex gap-4">${thumb}<div>
          <p class="font-semibold" style="color:${color}">${verdict}</p>
          <p class="mt-1 text-sm text-mare/75">${w} × ${h} pixels</p>
          <p class="text-sm text-mare/75">Até ${max300} cm com qualidade ideal (300 dpi) e até ${max150} cm com qualidade aceitável (150 dpi).</p></div></div>
        <ul class="mt-4 text-sm">${rows}</ul>${light}
        <p class="mt-3 text-xs text-mare/55">Considera o maior lado da imagem. O resultado é uma estimativa; conferimos tudo na prévia.</p>`;
    };
    im.src = url;
  });
}

/* =====================================================================
   FAQ
   ===================================================================== */
function initFaq() {
  $('#faqList').innerHTML = FAQ.map((f, i) => `
    <div class="border-b border-areia first:border-t">
      <h3><button type="button" id="faq-btn-${i}" class="flex w-full items-center justify-between gap-4 py-5 text-left font-display text-lg font-semibold" aria-expanded="false" aria-controls="faq-${i}">
        <span>${f.q}</span><span class="acc-chevron h-5 w-5 shrink-0" data-i="chevron"></span></button></h3>
      <div id="faq-${i}" class="acc-panel" role="region" aria-labelledby="faq-btn-${i}" data-open="false"><div inert><p class="pb-5 pr-8 leading-relaxed text-mare/75">${f.a}</p></div></div>
    </div>`).join('');
  hydrate($('#faqList'));
  $('#faqList').addEventListener('click', e => {
    const b = e.target.closest('button[aria-controls]'); if (!b) return;
    const panel = document.getElementById(b.getAttribute('aria-controls'));
    const open = b.getAttribute('aria-expanded') !== 'true';
    b.setAttribute('aria-expanded', open); panel.dataset.open = open; panel.firstElementChild.inert = !open;
  });
}

/* =====================================================================
   NAVEGAÇÃO, ROLAGEM E REVELAÇÃO
   ===================================================================== */
function initNav() {
  const btn = $('#menuBtn'), menu = $('#mobileMenu'), header = $('#siteHeader');
  const setMenu = open => {
    menu.classList.toggle('hidden', !open);
    btn.setAttribute('aria-expanded', open);
    btn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    btn.innerHTML = ic(open ? 'x' : 'menu', 'h-5 w-5');
  };
  btn.addEventListener('click', () => setMenu(menu.classList.contains('hidden')));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.classList.contains('hidden')) { setMenu(false); btn.focus(); } });
  const onScroll = () => header.classList.toggle('shadow-md', window.scrollY > 8);
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  $('#year').textContent = new Date().getFullYear();
}
function initReveal() {
  const els = $$('[data-reveal]');
  if (!('IntersectionObserver' in window) || reduceMotion) { els.forEach(el => el.classList.add('is-in')); return; }
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => io.observe(el));
}

/* =====================================================================
   INÍCIO
   ===================================================================== */
function init() {
  renderHero(); renderPile();
  initCatalog(); initSim();
  initDialogs(); initChecker(); initFaq(); initOrder(); initNav();
  hydrate(); hydrateWA(); initReveal();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
