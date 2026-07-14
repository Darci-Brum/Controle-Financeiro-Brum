/* ==========================================================
   Controle Financeiro Brum — lógica do app
   Dados salvos em localStorage (neste dispositivo).
   ========================================================== */

'use strict';

// ---------- Estado ----------
const CHAVE = 'cfbrum-dados-v1';
const CHAVE_SESSAO = 'cfbrum-sessao';
const CHAVE_TEMA = 'cfbrum-tema';

const CATEGORIAS_ENTRADA = ['Salário', 'Renda extra', 'Rendimentos', 'Outros'];

function estadoInicial() {
  const hoje = new Date();
  const ym = (d) => d.toISOString().slice(0, 10);
  const mesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const dia = (n) => ym(new Date(mesAtual.getFullYear(), mesAtual.getMonth(), n));
  return {
    perfis: [
      { id: 'darci', nome: 'Darci Brum', cor: '#5f8267', emails: ['darcibrum3010@gmail.com'] },
      { id: 'jamylli', nome: 'Jamylli Kauane', cor: '#b8869a', emails: [] },
    ],
    categorias: ['Mercado', 'Pensão', 'Aluguel', 'Contas (água/luz/internet)', 'Transporte',
      'Saúde', 'Educação', 'Lazer', 'Cartão de crédito', 'Empréstimos',
      'Investimentos', 'Planejamento', 'Outros'],
    lancamentos: [
      { id: 1, demo: true, tipo: 'entrada', desc: 'Salário', cat: 'Salário', valor: 3500, data: dia(5), perfil: 'darci', pag: 'Transferência' },
      { id: 2, demo: true, tipo: 'entrada', desc: 'Salário', cat: 'Salário', valor: 2800, data: dia(5), perfil: 'jamylli', pag: 'Transferência' },
      { id: 3, demo: true, tipo: 'saida', desc: 'Compras do mês', cat: 'Mercado', valor: 850.5, data: dia(6), perfil: 'jamylli', pag: 'Débito' },
      { id: 4, demo: true, tipo: 'saida', desc: 'Aluguel', cat: 'Aluguel', valor: 1200, data: dia(10), perfil: 'darci', pag: 'Pix' },
      { id: 5, demo: true, tipo: 'saida', desc: 'Pensão', cat: 'Pensão', valor: 500, data: dia(8), perfil: 'darci', pag: 'Pix' },
      { id: 6, demo: true, tipo: 'saida', desc: 'Farmácia', cat: 'Saúde', valor: 130, data: dia(12), perfil: 'jamylli', pag: 'Cartão de crédito' },
      { id: 7, demo: true, tipo: 'saida', desc: 'Água e luz', cat: 'Contas (água/luz/internet)', valor: 310, data: dia(15), perfil: 'darci', pag: 'Boleto' },
      { id: 8, demo: true, tipo: 'saida', desc: 'Gasolina', cat: 'Transporte', valor: 220, data: dia(14), perfil: 'darci', pag: 'Débito' },
      { id: 9, demo: true, tipo: 'saida', desc: 'Jantar fora', cat: 'Lazer', valor: 145, data: dia(13), perfil: 'jamylli', pag: 'Cartão de crédito' },
      { id: 10, demo: true, tipo: 'saida', desc: 'Aporte CDB', cat: 'Investimentos', valor: 400, data: dia(7), perfil: 'darci', pag: 'Transferência' },
    ],
    cartoes: [],
    emprestimos: [],
    investimentos: [],
    metas: [],
    orcamentos: {}, // { 'Mercado': 900, ... }
    proximoId: 100,
  };
}

let dados = carregar();
let perfilAtivo = localStorage.getItem(CHAVE_SESSAO) || null;
let mesRef = new Date().toISOString().slice(0, 7); // 'AAAA-MM'
let filtroPerfil = 'todos';
let tipoLanc = 'saida';

function carregar() {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (bruto) return JSON.parse(bruto);
  } catch (e) { /* dados corrompidos: recomeça */ }
  return estadoInicial();
}
function salvar() { localStorage.setItem(CHAVE, JSON.stringify(dados)); }
function novoId() { return dados.proximoId++; }

// ---------- Utilidades ----------
const $ = (sel) => document.querySelector(sel);
const fmtBRL = (v) => (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtPct = (v) => v.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%';
const nomePerfil = (id) => (dados.perfis.find((p) => p.id === id) || { nome: id === 'casal' ? 'Do casal' : id }).nome;
const corPerfil = (id) => (dados.perfis.find((p) => p.id === id) || { cor: '#948d84' }).cor;
const primeiroNome = (id) => nomePerfil(id).split(' ')[0];

const NOMES_MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
function rotuloMes(ym) {
  const [a, m] = ym.split('-');
  return NOMES_MES[+m - 1] + '/' + a.slice(2);
}
function fmtData(iso) {
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
}
function escapar(t) {
  return String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Séries de cor dos gráficos (lê as variáveis CSS do tema ativo)
function coresSeries() {
  const css = getComputedStyle(document.documentElement);
  return [1, 2, 3, 4, 5, 6, 7, 8].map((i) => css.getPropertyValue('--s' + i).trim());
}

// ---------- Filtros de dados ----------
function lancDoMes(ym = mesRef, perfil = filtroPerfil) {
  return dados.lancamentos.filter((l) =>
    l.data.startsWith(ym) && (perfil === 'todos' || l.perfil === perfil));
}
function soma(lista) { return lista.reduce((s, l) => s + l.valor, 0); }

// ---------- Tema ----------
function aplicarTema(t) {
  document.documentElement.setAttribute('data-tema', t);
  $('#btn-tema').textContent = t === 'escuro' ? '☀️' : '🌙';
  localStorage.setItem(CHAVE_TEMA, t);
}
function alternarTema() {
  const atual = document.documentElement.getAttribute('data-tema') === 'escuro' ? 'claro' : 'escuro';
  aplicarTema(atual);
  renderTudo();
}

// ---------- Login / sessão ----------
function renderLogin() {
  const alvo = $('#lista-perfis-login');
  alvo.innerHTML = '';
  dados.perfis.forEach((p) => {
    const btn = document.createElement('button');
    btn.className = 'perfil-btn';
    const iniciais = p.nome.split(' ').map((n) => n[0]).slice(0, 2).join('');
    btn.innerHTML = `
      <div class="perfil-avatar" style="background:${p.cor}">${escapar(iniciais)}</div>
      <strong>${escapar(p.nome)}</strong>
      <small>${escapar(p.emails[0] || 'sem e-mail cadastrado')}</small>`;
    btn.addEventListener('click', () => entrar(p.id));
    alvo.appendChild(btn);
  });
}
function entrar(id) {
  perfilAtivo = id;
  localStorage.setItem(CHAVE_SESSAO, id);
  $('#tela-login').classList.add('oculto');
  $('#app').classList.remove('oculto');
  $('#topo-perfil').textContent = 'Olá, ' + nomePerfil(id) + ' 👋';
  $('#lc-perfil').value = id;
  renderTudo();
}
function sair() {
  perfilAtivo = null;
  localStorage.removeItem(CHAVE_SESSAO);
  $('#app').classList.add('oculto');
  $('#tela-login').classList.remove('oculto');
  renderLogin();
}

// ---------- Selects dinâmicos ----------
function preencherSelects() {
  // Meses: últimos 12
  const selMes = $('#filtro-mes');
  selMes.innerHTML = '';
  const agora = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
    const ym = d.toISOString().slice(0, 7);
    const op = new Option(rotuloMes(ym), ym);
    selMes.appendChild(op);
  }
  selMes.value = mesRef;

  // Perfis
  const selFP = $('#filtro-perfil');
  selFP.querySelectorAll('option:not([value="todos"])').forEach((o) => o.remove());
  const donos = [$('#lc-perfil'), $('#ct-dono'), $('#ep-dono'), $('#iv-dono')];
  donos.forEach((s) => (s.innerHTML = ''));
  const selMeta = $('#mt-dono');
  selMeta.querySelectorAll('option:not([value="casal"])').forEach((o) => o.remove());
  dados.perfis.forEach((p) => {
    selFP.appendChild(new Option(p.nome, p.id));
    donos.forEach((s) => s.appendChild(new Option(p.nome, p.id)));
    selMeta.appendChild(new Option(p.nome, p.id));
  });
  if (perfilAtivo) $('#lc-perfil').value = perfilAtivo;

  // Categorias conforme tipo
  atualizarCategoriasForm();

  // Cartões no form de lançamento
  const selCart = $('#lc-cartao');
  selCart.innerHTML = '';
  dados.cartoes.forEach((c) => selCart.appendChild(new Option(c.nome + ' — ' + primeiroNome(c.dono), c.id)));
}
function atualizarCategoriasForm() {
  const sel = $('#lc-cat');
  sel.innerHTML = '';
  const lista = tipoLanc === 'entrada' ? CATEGORIAS_ENTRADA : dados.categorias;
  lista.forEach((c) => sel.appendChild(new Option(c, c)));
}

// ---------- Tooltip ----------
const tt = $('#tooltip');
function mostrarTooltip(ev, html) {
  tt.innerHTML = html;
  tt.classList.remove('oculto');
  moverTooltip(ev);
}
function moverTooltip(ev) {
  const margem = 14;
  let x = ev.clientX + margem, y = ev.clientY + margem;
  const r = tt.getBoundingClientRect();
  if (x + r.width > window.innerWidth - 8) x = ev.clientX - r.width - margem;
  if (y + r.height > window.innerHeight - 8) y = ev.clientY - r.height - margem;
  tt.style.left = x + 'px';
  tt.style.top = y + 'px';
}
function esconderTooltip() { tt.classList.add('oculto'); }

// ---------- Modal ----------
function abrirModal(titulo, corpoHtml) {
  $('#modal-titulo').textContent = titulo;
  $('#modal-corpo').innerHTML = corpoHtml;
  $('#modal').classList.remove('oculto');
}
function fecharModal() { $('#modal').classList.add('oculto'); }

function modalCategoria(cat) {
  const itens = lancDoMes().filter((l) => l.tipo === 'saida' && l.cat === cat);
  const total = soma(itens);
  const linhas = itens.sort((a, b) => b.valor - a.valor).map((l) => `
    <div class="ultimo-item">
      <div>${escapar(l.desc)}<div class="quem">${fmtData(l.data)} · ${escapar(primeiroNome(l.perfil))} · ${escapar(l.pag)}</div></div>
      <strong class="val-neg">${fmtBRL(l.valor)}</strong>
    </div>`).join('');
  abrirModal(`${cat} — ${fmtBRL(total)}`, linhas || '<p class="vazio">Nenhum lançamento.</p>');
}

// ==========================================================
// DASHBOARD
// ==========================================================
function renderDashboard() {
  const lanc = lancDoMes();
  const entradas = soma(lanc.filter((l) => l.tipo === 'entrada'));
  const saidas = soma(lanc.filter((l) => l.tipo === 'saida'));
  const saldo = entradas - saidas;
  const taxa = entradas > 0 ? (saldo / entradas) * 100 : 0;
  const investido = soma(dados.investimentos.filter((i) => filtroPerfil === 'todos' || i.dono === filtroPerfil));

  const cards = [
    { rot: '⬆ Entradas do mês', val: fmtBRL(entradas), cls: 'pos', extra: rotuloMes(mesRef) },
    { rot: '⬇ Saídas do mês', val: fmtBRL(saidas), cls: 'neg', extra: lanc.filter((l) => l.tipo === 'saida').length + ' lançamentos' },
    { rot: '💼 Saldo do mês', val: fmtBRL(saldo), cls: saldo >= 0 ? 'pos' : 'neg', extra: entradas > 0 ? 'Economia de ' + fmtPct(taxa) : '—' },
    { rot: '📈 Total investido', val: fmtBRL(investido), cls: '', extra: dados.investimentos.length + ' aportes' },
  ];
  $('#cards-resumo').innerHTML = cards.map((c) => `
    <div class="card-resumo" data-tt="${escapar(c.rot)}: ${escapar(c.val)}">
      <div class="rotulo">${c.rot}</div>
      <div class="valor ${c.cls}">${c.val}</div>
      <div class="extra">${c.extra}</div>
    </div>`).join('');

  $('#donut-legenda-mes').textContent = rotuloMes(mesRef) +
    (filtroPerfil === 'todos' ? ' · casal' : ' · ' + primeiroNome(filtroPerfil));

  renderDonut(lanc);
  renderBarras();
  renderPerfis(lanc);
  renderUltimos(lanc);
}

// --- Gráfico de rosca (categorias) ---
function renderDonut(lanc) {
  const alvo = $('#grafico-donut');
  const porCat = {};
  lanc.filter((l) => l.tipo === 'saida').forEach((l) => { porCat[l.cat] = (porCat[l.cat] || 0) + l.valor; });
  let itens = Object.entries(porCat).sort((a, b) => b[1] - a[1]);
  if (!itens.length) { alvo.innerHTML = '<p class="vazio">Sem saídas neste mês. Adicione lançamentos! 🌱</p>'; return; }

  // Máximo 8 fatias: excedente vira "Outros"
  const cores = coresSeries();
  if (itens.length > 8) {
    const resto = itens.slice(7).reduce((s, [, v]) => s + v, 0);
    itens = itens.slice(0, 7);
    itens.push(['Outras categorias', resto]);
  }
  const total = itens.reduce((s, [, v]) => s + v, 0);

  const cx = 130, cy = 130, R = 100, r = 62;
  let ang = -Math.PI / 2;
  const surf = getComputedStyle(document.documentElement).getPropertyValue('--superficie').trim();
  let fatias = '';
  itens.forEach(([cat, val], i) => {
    const frac = val / total;
    const a2 = ang + frac * Math.PI * 2 - 0.0001;
    const grande = frac > 0.5 ? 1 : 0;
    const p = (a, rad) => `${cx + rad * Math.cos(a)},${cy + rad * Math.sin(a)}`;
    const d = `M ${p(ang, R)} A ${R} ${R} 0 ${grande} 1 ${p(a2, R)} L ${p(a2, r)} A ${r} ${r} 0 ${grande} 0 ${p(ang, r)} Z`;
    const cor = i < 7 ? cores[i] : 'var(--serie-outros)';
    fatias += `<path class="marca-hover" d="${d}" fill="${cor}" stroke="${surf}" stroke-width="2"
      data-cat="${escapar(cat)}" data-val="${val}" data-pct="${(frac * 100).toFixed(1)}"/>`;
    ang = a2 + 0.0001;
  });

  alvo.innerHTML = `
    <svg viewBox="0 0 260 260" role="img" aria-label="Gastos por categoria">
      ${fatias}
      <text x="${cx}" y="${cy - 6}" text-anchor="middle" font-size="13" fill="var(--texto-2)">Total</text>
      <text x="${cx}" y="${cy + 16}" text-anchor="middle" font-size="16" font-weight="700" fill="var(--texto)">${fmtBRL(total)}</text>
    </svg>
    <div class="legenda">${itens.map(([cat, val], i) => `
      <span class="legenda-item" data-cat="${escapar(cat)}">
        <span class="legenda-cor" style="background:${i < 7 ? cores[i] : 'var(--serie-outros)'}"></span>
        ${escapar(cat)} · <strong>${fmtPct((val / total) * 100)}</strong>
      </span>`).join('')}
    </div>`;

  alvo.querySelectorAll('path').forEach((el) => {
    el.addEventListener('mousemove', (ev) => mostrarTooltip(ev, `
      <strong>${escapar(el.dataset.cat)}</strong>
      <div class="tt-linha">${fmtBRL(+el.dataset.val)} — ${el.dataset.pct.replace('.', ',')}% das saídas</div>
      <div class="tt-linha">Clique para ver os lançamentos</div>`));
    el.addEventListener('mouseleave', esconderTooltip);
    el.addEventListener('click', () => { esconderTooltip(); modalCategoria(el.dataset.cat); });
  });
  alvo.querySelectorAll('.legenda-item').forEach((el) =>
    el.addEventListener('click', () => modalCategoria(el.dataset.cat)));
}

// --- Barras: entradas × saídas por mês ---
function renderBarras() {
  const alvo = $('#grafico-barras');
  const meses = [];
  const [anoR, mesR] = mesRef.split('-').map(Number);
  for (let i = 5; i >= 0; i--) {
    const d = new Date(anoR, mesR - 1 - i, 1);
    meses.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  const serie = meses.map((ym) => {
    const ls = lancDoMes(ym);
    return { ym, ent: soma(ls.filter((l) => l.tipo === 'entrada')), sai: soma(ls.filter((l) => l.tipo === 'saida')) };
  });
  const max = Math.max(...serie.map((s) => Math.max(s.ent, s.sai)), 1);

  const W = 520, H = 240, mx = 46, my = 16, base = H - 34;
  const larguraGrupo = (W - mx - 10) / 6, lb = Math.min(26, larguraGrupo / 2 - 6);
  const cores = coresSeries();
  const corEnt = cores[1], corSai = cores[5];
  const y = (v) => base - (v / max) * (base - my);

  let barras = '', eixoX = '';
  serie.forEach((s, i) => {
    const x0 = mx + i * larguraGrupo + larguraGrupo / 2;
    barras += barraSVG(x0 - lb - 1, y(s.ent), lb, base, corEnt, s.ym, 'Entradas', s.ent);
    barras += barraSVG(x0 + 1, y(s.sai), lb, base, corSai, s.ym, 'Saídas', s.sai);
    eixoX += `<text x="${x0}" y="${H - 12}" text-anchor="middle" font-size="11" fill="var(--texto-mudo)">${rotuloMes(s.ym)}</text>`;
  });

  // Linhas de grade (4)
  let grade = '';
  for (let g = 0; g <= 4; g++) {
    const val = (max / 4) * g, yy = y(val);
    grade += `<line x1="${mx}" y1="${yy}" x2="${W - 8}" y2="${yy}" stroke="var(--grade)" stroke-width="1"/>
      <text x="${mx - 6}" y="${yy + 4}" text-anchor="end" font-size="10" fill="var(--texto-mudo)">${val >= 1000 ? (val / 1000).toFixed(1).replace('.', ',') + ' mil' : Math.round(val)}</text>`;
  }

  alvo.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Entradas e saídas por mês">
      ${grade}${barras}${eixoX}
    </svg>
    <div class="legenda">
      <span class="legenda-item"><span class="legenda-cor" style="background:${corEnt}"></span> Entradas</span>
      <span class="legenda-item"><span class="legenda-cor" style="background:${corSai}"></span> Saídas</span>
    </div>`;

  alvo.querySelectorAll('rect').forEach((el) => {
    el.addEventListener('mousemove', (ev) => mostrarTooltip(ev, `
      <strong>${escapar(el.dataset.serie)} — ${rotuloMes(el.dataset.ym)}</strong>
      <div class="tt-linha">${fmtBRL(+el.dataset.val)}</div>`));
    el.addEventListener('mouseleave', esconderTooltip);
  });
}
function barraSVG(x, yTopo, w, base, cor, ym, serie, val) {
  const h = Math.max(base - yTopo, val > 0 ? 3 : 0);
  return `<rect class="marca-hover" x="${x}" y="${base - h}" width="${w}" height="${h}" rx="4"
    fill="${cor}" data-ym="${ym}" data-serie="${serie}" data-val="${val}"/>`;
}

// --- Divisão por perfil ---
function renderPerfis(lanc) {
  const alvo = $('#grafico-perfis');
  const saidas = lanc.filter((l) => l.tipo === 'saida');
  const total = soma(saidas);
  if (!total) { alvo.innerHTML = '<p class="vazio">Sem saídas neste mês.</p>'; return; }

  let html = '';
  dados.perfis.forEach((p) => {
    const v = soma(saidas.filter((l) => l.perfil === p.id));
    const pct = (v / total) * 100;
    html += `
      <div style="margin-bottom:14px">
        <div class="prog-info"><span><strong style="color:${p.cor}">●</strong> ${escapar(p.nome)}</span><span>${fmtBRL(v)} · ${fmtPct(pct)}</span></div>
        <div class="progresso perfil-prog" data-nome="${escapar(p.nome)}" data-val="${v}" data-pct="${pct.toFixed(1)}">
          <div style="width:${pct}%; background:${p.cor}"></div>
        </div>
      </div>`;
  });
  alvo.innerHTML = html;
  alvo.querySelectorAll('.perfil-prog').forEach((el) => {
    el.addEventListener('mousemove', (ev) => mostrarTooltip(ev, `
      <strong>${el.dataset.nome}</strong>
      <div class="tt-linha">${fmtBRL(+el.dataset.val)} — ${el.dataset.pct.replace('.', ',')}% das saídas do mês</div>`));
    el.addEventListener('mouseleave', esconderTooltip);
  });
}

function renderUltimos(lanc) {
  const ult = [...lanc].sort((a, b) => b.data.localeCompare(a.data)).slice(0, 7);
  $('#dash-ultimos').innerHTML = ult.length ? ult.map((l) => `
    <div class="ultimo-item">
      <div>${l.tipo === 'entrada' ? '⬆' : '⬇'} ${escapar(l.desc)}
        <div class="quem">${fmtData(l.data)} · ${escapar(primeiroNome(l.perfil))} · ${escapar(l.cat)}</div></div>
      <strong class="${l.tipo === 'entrada' ? 'val-pos' : 'val-neg'}">${l.tipo === 'entrada' ? '+' : '−'} ${fmtBRL(l.valor)}</strong>
    </div>`).join('') : '<p class="vazio">Nenhum lançamento ainda.</p>';
}

// ==========================================================
// LANÇAMENTOS
// ==========================================================
function renderLancamentos() {
  const lanc = lancDoMes().sort((a, b) => b.data.localeCompare(a.data));
  const corpo = $('#tabela-lancamentos tbody');
  $('#lc-total-mes').textContent = `${rotuloMes(mesRef)} · ${lanc.length} itens`;
  corpo.innerHTML = lanc.map((l) => `
    <tr>
      <td>${fmtData(l.data)}</td>
      <td>${escapar(l.desc)}</td>
      <td><span class="chip-cat">${escapar(l.cat)}</span></td>
      <td>${escapar(primeiroNome(l.perfil))}</td>
      <td>${escapar(l.pag)}${l.cartaoId ? ' · ' + escapar((dados.cartoes.find((c) => c.id == l.cartaoId) || {}).nome || '') : ''}</td>
      <td class="dir ${l.tipo === 'entrada' ? 'val-pos' : 'val-neg'}">${l.tipo === 'entrada' ? '+' : '−'} ${fmtBRL(l.valor)}</td>
      <td><button class="btn-lixo" data-id="${l.id}" title="Excluir">🗑</button></td>
    </tr>`).join('') || '<tr><td colspan="7" class="vazio">Nenhum lançamento neste mês.</td></tr>';

  corpo.querySelectorAll('.btn-lixo').forEach((b) => b.addEventListener('click', () => {
    if (confirm('Excluir este lançamento?')) {
      dados.lancamentos = dados.lancamentos.filter((l) => l.id != b.dataset.id);
      salvar(); renderTudo();
    }
  }));
}

function configurarFormLancamento() {
  const setTipo = (t) => {
    tipoLanc = t;
    $('#tg-entrada').classList.toggle('ativo', t === 'entrada');
    $('#tg-saida').classList.toggle('ativo', t === 'saida');
    atualizarCategoriasForm();
  };
  $('#tg-entrada').addEventListener('click', () => setTipo('entrada'));
  $('#tg-saida').addEventListener('click', () => setTipo('saida'));

  $('#lc-pag').addEventListener('change', () => {
    $('#campo-cartao').classList.toggle('oculto', $('#lc-pag').value !== 'Cartão de crédito');
  });

  $('#form-lancamento').addEventListener('submit', (e) => {
    e.preventDefault();
    const l = {
      id: novoId(),
      tipo: tipoLanc,
      desc: $('#lc-desc').value.trim(),
      cat: $('#lc-cat').value,
      valor: parseFloat($('#lc-valor').value),
      data: $('#lc-data').value,
      perfil: $('#lc-perfil').value,
      pag: $('#lc-pag').value,
    };
    if ($('#lc-pag').value === 'Cartão de crédito' && $('#lc-cartao').value) l.cartaoId = +$('#lc-cartao').value;
    dados.lancamentos.push(l);
    salvar();
    $('#form-lancamento').reset();
    $('#lc-data').value = new Date().toISOString().slice(0, 10);
    $('#lc-perfil').value = perfilAtivo;
    $('#campo-cartao').classList.add('oculto');
    renderTudo();
  });
}

// ==========================================================
// CARTÕES
// ==========================================================
function renderCartoes() {
  const alvo = $('#lista-cartoes');
  if (!dados.cartoes.length) { alvo.innerHTML = '<p class="vazio cartao">Nenhum cartão cadastrado ainda. 💳</p>'; return; }
  alvo.innerHTML = dados.cartoes.map((c) => {
    const gasto = soma(lancDoMes(mesRef, 'todos').filter((l) => l.tipo === 'saida' && l.cartaoId == c.id));
    const pct = c.limite > 0 ? Math.min((gasto / c.limite) * 100, 100) : 0;
    const cls = pct >= 100 ? 'estouro' : pct >= 75 ? 'alerta' : '';
    return `
      <div class="cartao cartao-item">
        <button class="btn-lixo remover" data-id="${c.id}" data-tipo="cartao" title="Excluir">🗑</button>
        <div class="cartao-credito-topo">
          <strong>💳 ${escapar(c.nome)}</strong>
          <span class="bandeira">${escapar(c.bandeira)}</span>
        </div>
        <small>Titular: ${escapar(primeiroNome(c.dono))} · Fecha dia ${c.fecha} · Vence dia ${c.vence}</small>
        <div class="progresso"><div class="${cls}" style="width:${pct}%"></div></div>
        <div class="prog-info">
          <span>Fatura de ${rotuloMes(mesRef)}: <strong>${fmtBRL(gasto)}</strong></span>
          <span>Limite: ${fmtBRL(c.limite)} (${fmtPct(pct)})</span>
        </div>
      </div>`;
  }).join('');
  ligarRemocao(alvo, 'cartoes');
}

// ==========================================================
// EMPRÉSTIMOS
// ==========================================================
function renderEmprestimos() {
  const alvo = $('#lista-emprestimos');
  if (!dados.emprestimos.length) { alvo.innerHTML = '<p class="vazio cartao">Nenhum empréstimo cadastrado. Que continue assim! 🎉</p>'; return; }
  alvo.innerHTML = dados.emprestimos.map((e) => {
    const parcela = e.total / e.parcelas;
    const pct = (e.pagas / e.parcelas) * 100;
    const restante = e.total - parcela * e.pagas;
    return `
      <div class="cartao cartao-item">
        <button class="btn-lixo remover" data-id="${e.id}" title="Excluir">🗑</button>
        <strong>🤝 ${escapar(e.desc)}</strong><br>
        <small>Responsável: ${escapar(primeiroNome(e.dono))} · Parcela: ${fmtBRL(parcela)}</small>
        <div class="progresso"><div style="width:${pct}%"></div></div>
        <div class="prog-info">
          <span>${e.pagas}/${e.parcelas} parcelas (${fmtPct(pct)})</span>
          <span>Falta: <strong>${fmtBRL(restante)}</strong></span>
        </div>
        <div class="linha-botoes" style="margin-top:10px">
          <button class="btn-secundario btn-pagar" data-id="${e.id}">✓ Pagar parcela</button>
        </div>
      </div>`;
  }).join('');
  ligarRemocao(alvo, 'emprestimos');
  alvo.querySelectorAll('.btn-pagar').forEach((b) => b.addEventListener('click', () => {
    const e = dados.emprestimos.find((x) => x.id == b.dataset.id);
    if (e && e.pagas < e.parcelas) { e.pagas++; salvar(); renderTudo(); }
  }));
}

// ==========================================================
// INVESTIMENTOS
// ==========================================================
function renderInvestimentos() {
  const lista = dados.investimentos;
  const total = soma(lista);
  const porPerfil = dados.perfis.map((p) => ({ p, v: soma(lista.filter((i) => i.dono === p.id)) }));
  $('#resumo-invest').innerHTML = `
    <div class="card-resumo"><div class="rotulo">📈 Total do casal</div><div class="valor pos">${fmtBRL(total)}</div></div>
    ${porPerfil.map(({ p, v }) => `
      <div class="card-resumo"><div class="rotulo"><span style="color:${p.cor}">●</span> ${escapar(primeiroNome(p.id))}</div>
      <div class="valor">${fmtBRL(v)}</div>
      <div class="extra">${total > 0 ? fmtPct((v / total) * 100) + ' da carteira' : '—'}</div></div>`).join('')}`;

  const corpo = $('#tabela-invest tbody');
  corpo.innerHTML = lista.slice().sort((a, b) => b.data.localeCompare(a.data)).map((i) => `
    <tr>
      <td>${fmtData(i.data)}</td>
      <td>${escapar(i.desc)}</td>
      <td><span class="chip-cat">${escapar(i.tipo)}</span></td>
      <td>${escapar(primeiroNome(i.dono))}</td>
      <td class="dir val-pos">${fmtBRL(i.valor)}</td>
      <td><button class="btn-lixo" data-id="${i.id}" title="Excluir">🗑</button></td>
    </tr>`).join('') || '<tr><td colspan="6" class="vazio">Nenhum investimento ainda. Comece hoje! 🌱</td></tr>';
  corpo.querySelectorAll('.btn-lixo').forEach((b) => b.addEventListener('click', () => {
    if (confirm('Excluir este investimento?')) {
      dados.investimentos = dados.investimentos.filter((i) => i.id != b.dataset.id);
      salvar(); renderTudo();
    }
  }));
}

// ==========================================================
// PLANEJAMENTO (metas + orçamentos)
// ==========================================================
function renderMetas() {
  const alvo = $('#lista-metas');
  if (!dados.metas.length) { alvo.innerHTML = '<p class="vazio cartao">Nenhuma meta ainda. Sonhem juntos! ✨</p>'; return; }
  alvo.innerHTML = dados.metas.map((m) => {
    const pct = Math.min((m.atual / m.alvo) * 100, 100);
    return `
      <div class="cartao cartao-item">
        <button class="btn-lixo remover" data-id="${m.id}" title="Excluir">🗑</button>
        <strong>🎯 ${escapar(m.nome)}</strong><br>
        <small>${m.dono === 'casal' ? '👫 Meta do casal' : 'Meta de ' + escapar(primeiroNome(m.dono))}${m.prazo ? ' · até ' + rotuloMes(m.prazo) : ''}</small>
        <div class="progresso"><div style="width:${pct}%"></div></div>
        <div class="prog-info">
          <span>${fmtBRL(m.atual)} de ${fmtBRL(m.alvo)}</span>
          <span><strong>${fmtPct(pct)}</strong></span>
        </div>
        <div class="linha-botoes" style="margin-top:10px">
          <button class="btn-secundario btn-aportar" data-id="${m.id}">＋ Guardar valor</button>
        </div>
      </div>`;
  }).join('');
  ligarRemocao(alvo, 'metas');
  alvo.querySelectorAll('.btn-aportar').forEach((b) => b.addEventListener('click', () => {
    const m = dados.metas.find((x) => x.id == b.dataset.id);
    const v = parseFloat((prompt('Quanto deseja guardar para "' + m.nome + '"? (R$)') || '').replace(',', '.'));
    if (v > 0) { m.atual += v; salvar(); renderTudo(); }
  }));
}

function renderOrcamentos() {
  const alvo = $('#lista-orcamentos');
  const saidas = lancDoMes(mesRef, 'todos').filter((l) => l.tipo === 'saida');
  alvo.innerHTML = dados.categorias.map((cat) => {
    const orc = dados.orcamentos[cat] || 0;
    const gasto = soma(saidas.filter((l) => l.cat === cat));
    const pct = orc > 0 ? Math.min((gasto / orc) * 100, 100) : 0;
    const cls = orc > 0 && gasto > orc ? 'estouro' : pct >= 75 ? 'alerta' : '';
    return `
      <div class="orc-linha">
        <span>${escapar(cat)}</span>
        <div>
          <div class="progresso" style="margin:0 0 4px"><div class="${cls}" style="width:${pct}%"></div></div>
          <div class="prog-info"><span>Gasto: ${fmtBRL(gasto)}</span><span>${orc > 0 ? fmtPct((gasto / orc) * 100) + ' do teto' : 'sem teto definido'}</span></div>
        </div>
        <input type="number" step="10" min="0" placeholder="Teto R$" value="${orc || ''}" data-cat="${escapar(cat)}">
      </div>`;
  }).join('');
  alvo.querySelectorAll('input').forEach((inp) => inp.addEventListener('change', () => {
    const v = parseFloat(inp.value);
    if (v > 0) dados.orcamentos[inp.dataset.cat] = v;
    else delete dados.orcamentos[inp.dataset.cat];
    salvar(); renderOrcamentos();
  }));
}

// ==========================================================
// CONFIGURAÇÕES
// ==========================================================
function renderConfig() {
  // Perfis + e-mails
  const alvo = $('#config-perfis');
  alvo.innerHTML = dados.perfis.map((p) => `
    <div class="perfil-config">
      <div class="perfil-config-topo">
        <div class="perfil-avatar" style="background:${p.cor}; width:42px; height:42px; font-size:1rem">
          ${p.nome.split(' ').map((n) => n[0]).slice(0, 2).join('')}
        </div>
        <strong>${escapar(p.nome)}</strong>
      </div>
      <div class="emails-lista">
        ${p.emails.map((em, i) => `
          <div class="email-item">📧 <span>${escapar(em)}</span>
            <button class="btn-lixo" data-perfil="${p.id}" data-i="${i}" title="Remover e-mail">✕</button>
          </div>`).join('') || '<small>Nenhum e-mail cadastrado.</small>'}
      </div>
      <form class="form-email" data-perfil="${p.id}">
        <input type="email" placeholder="novo@email.com" required>
        <button type="submit" class="btn-secundario">＋ Adicionar e-mail</button>
      </form>
    </div>`).join('');

  alvo.querySelectorAll('.form-email').forEach((f) => f.addEventListener('submit', (e) => {
    e.preventDefault();
    const p = dados.perfis.find((x) => x.id === f.dataset.perfil);
    const em = f.querySelector('input').value.trim().toLowerCase();
    if (em && !p.emails.includes(em)) { p.emails.push(em); salvar(); renderConfig(); }
  }));
  alvo.querySelectorAll('.btn-lixo').forEach((b) => b.addEventListener('click', () => {
    const p = dados.perfis.find((x) => x.id === b.dataset.perfil);
    p.emails.splice(+b.dataset.i, 1);
    salvar(); renderConfig();
  }));

  // Categorias
  $('#config-categorias').innerHTML = dados.categorias.map((c) => `
    <span class="chip-cat">${escapar(c)} <button data-cat="${escapar(c)}" title="Remover">✕</button></span>`).join('');
  $('#config-categorias').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
    if (confirm(`Remover a categoria "${b.dataset.cat}"? Lançamentos existentes não serão apagados.`)) {
      dados.categorias = dados.categorias.filter((c) => c !== b.dataset.cat);
      delete dados.orcamentos[b.dataset.cat];
      salvar(); renderTudo();
    }
  }));
}

function configurarConfig() {
  $('#form-categoria').addEventListener('submit', (e) => {
    e.preventDefault();
    const c = $('#cat-nova').value.trim();
    if (c && !dados.categorias.includes(c)) { dados.categorias.push(c); salvar(); renderTudo(); }
    $('#cat-nova').value = '';
  });
  $('#btn-exportar').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'controle-financeiro-brum.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });
  $('#btn-limpar-demo').addEventListener('click', () => {
    dados.lancamentos = dados.lancamentos.filter((l) => !l.demo);
    salvar(); renderTudo();
  });
  $('#btn-zerar').addEventListener('click', () => {
    if (confirm('Apagar TODOS os dados (lançamentos, cartões, metas...)? Essa ação não pode ser desfeita.') &&
        confirm('Tem certeza mesmo? Última chance!')) {
      const perfis = dados.perfis; // preserva perfis e e-mails
      dados = estadoInicial();
      dados.perfis = perfis;
      dados.lancamentos = [];
      salvar(); renderTudo();
    }
  });
}

// ---------- Remoção genérica em grades ----------
function ligarRemocao(container, colecao) {
  container.querySelectorAll('.remover').forEach((b) => b.addEventListener('click', () => {
    if (confirm('Excluir este item?')) {
      dados[colecao] = dados[colecao].filter((x) => x.id != b.dataset.id);
      salvar(); renderTudo();
    }
  }));
}

// ---------- Formulários das demais abas ----------
function configurarForms() {
  $('#form-cartao').addEventListener('submit', (e) => {
    e.preventDefault();
    dados.cartoes.push({
      id: novoId(), nome: $('#ct-nome').value.trim(), bandeira: $('#ct-bandeira').value,
      limite: parseFloat($('#ct-limite').value), fecha: +$('#ct-fecha').value,
      vence: +$('#ct-vence').value, dono: $('#ct-dono').value,
    });
    salvar(); $('#form-cartao').reset(); preencherSelects(); renderTudo();
  });

  $('#form-emprestimo').addEventListener('submit', (e) => {
    e.preventDefault();
    dados.emprestimos.push({
      id: novoId(), desc: $('#ep-desc').value.trim(), total: parseFloat($('#ep-total').value),
      parcelas: +$('#ep-parcelas').value, pagas: Math.min(+$('#ep-pagas').value, +$('#ep-parcelas').value),
      dono: $('#ep-dono').value,
    });
    salvar(); $('#form-emprestimo').reset(); renderTudo();
  });

  $('#form-investimento').addEventListener('submit', (e) => {
    e.preventDefault();
    dados.investimentos.push({
      id: novoId(), desc: $('#iv-desc').value.trim(), tipo: $('#iv-tipo').value,
      valor: parseFloat($('#iv-valor').value), data: $('#iv-data').value, dono: $('#iv-dono').value,
    });
    salvar(); $('#form-investimento').reset();
    $('#iv-data').value = new Date().toISOString().slice(0, 10);
    renderTudo();
  });

  $('#form-meta').addEventListener('submit', (e) => {
    e.preventDefault();
    dados.metas.push({
      id: novoId(), nome: $('#mt-nome').value.trim(), alvo: parseFloat($('#mt-alvo').value),
      atual: parseFloat($('#mt-atual').value) || 0, prazo: $('#mt-prazo').value, dono: $('#mt-dono').value,
    });
    salvar(); $('#form-meta').reset(); renderTudo();
  });
}

// ---------- Navegação por abas ----------
function configurarAbas() {
  document.querySelectorAll('.aba').forEach((b) => b.addEventListener('click', () => {
    document.querySelectorAll('.aba').forEach((x) => x.classList.remove('ativa'));
    document.querySelectorAll('.painel').forEach((x) => x.classList.remove('ativo'));
    b.classList.add('ativa');
    $('#aba-' + b.dataset.aba).classList.add('ativo');
  }));
}

// ---------- Render geral ----------
function renderTudo() {
  preencherSelects();
  $('#filtro-perfil').value = filtroPerfil;
  $('#filtro-mes').value = mesRef;
  renderDashboard();
  renderLancamentos();
  renderCartoes();
  renderEmprestimos();
  renderInvestimentos();
  renderMetas();
  renderOrcamentos();
  renderConfig();
}

// ---------- Inicialização ----------
function iniciar() {
  aplicarTema(localStorage.getItem(CHAVE_TEMA) ||
    (matchMedia('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro'));

  $('#btn-tema').addEventListener('click', alternarTema);
  $('#btn-sair').addEventListener('click', sair);
  $('#modal-fechar').addEventListener('click', fecharModal);
  $('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal') fecharModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fecharModal(); });

  $('#filtro-mes').addEventListener('change', (e) => { mesRef = e.target.value; renderTudo(); });
  $('#filtro-perfil').addEventListener('change', (e) => { filtroPerfil = e.target.value; renderTudo(); });

  $('#lc-data').value = new Date().toISOString().slice(0, 10);
  $('#iv-data').value = new Date().toISOString().slice(0, 10);

  configurarAbas();
  configurarFormLancamento();
  configurarForms();
  configurarConfig();

  if (perfilAtivo && dados.perfis.some((p) => p.id === perfilAtivo)) entrar(perfilAtivo);
  else renderLogin();
}

document.addEventListener('DOMContentLoaded', iniciar);
