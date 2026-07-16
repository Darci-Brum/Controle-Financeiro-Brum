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
    crediarios: [],
    investimentos: [],
    metas: [],
    notas: [], // notas fiscais do mercado
    salarios: [], // registro de trabalho (bruto, líquido, FGTS)
    recorrentes: [], // lançamentos fixos mensais
    pin: null, // PIN de entrada (hash)
    cofre: { senha: null, movs: [] },
    orcamentos: {}, // { 'Mercado': 900, ... }
    proximoId: 100,
  };
}

// Exemplos da aba Trabalho (flag demo:true)
function adicionarExemplosTrabalho(d) {
  const hoje = new Date();
  const mes = (recuo) => {
    const dt = new Date(hoje.getFullYear(), hoje.getMonth() - recuo, 1);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
  };
  d.salarios.push(
    { id: 9171, demo: true, perfil: 'darci', tipo: 'salario', mes: mes(2), bruto: 3500, liquido: 3012.5, fgts: 280, obs: '' },
    { id: 9172, demo: true, perfil: 'darci', tipo: 'salario', mes: mes(1), bruto: 3500, liquido: 3012.5, fgts: 280, obs: '' },
    { id: 9173, demo: true, perfil: 'darci', tipo: 'salario', mes: mes(0), bruto: 3850, liquido: 3290, fgts: 308, obs: 'Aumento de 10% 🎉' },
    { id: 9174, demo: true, perfil: 'jamylli', tipo: 'salario', mes: mes(2), bruto: 2800, liquido: 2464, fgts: 224, obs: '' },
    { id: 9175, demo: true, perfil: 'jamylli', tipo: 'salario', mes: mes(1), bruto: 2800, liquido: 2464, fgts: 224, obs: '' },
    { id: 9176, demo: true, perfil: 'jamylli', tipo: 'salario', mes: mes(0), bruto: 2800, liquido: 2464, fgts: 224, obs: '' },
  );
  adicionarExemplosFeriasDecimo(d);
  d.proximoId = Math.max(d.proximoId || 100, 9200);
  d.exemplosV3 = true;
}

// Exemplos de férias e 13º (flag demo:true)
function adicionarExemplosFeriasDecimo(d) {
  const hoje = new Date();
  const mes = (recuo) => {
    const dt = new Date(hoje.getFullYear(), hoje.getMonth() - recuo, 1);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
  };
  d.salarios.push(
    { id: 9177, demo: true, perfil: 'darci', tipo: 'decimo', mes: mes(1), bruto: 1925, liquido: 1750, fgts: 154, obs: '1ª parcela do 13º' },
    { id: 9178, demo: true, perfil: 'jamylli', tipo: 'ferias', mes: mes(2), bruto: 3733.33, liquido: 3200, fgts: 298.67, obs: 'Férias com 1/3' },
  );
  d.proximoId = Math.max(d.proximoId || 100, 9200);
  d.exemplosV4 = true;
}

// Exemplos (flag demo:true) para mostrar como fica na vida real —
// removíveis em Configurações → Remover dados de exemplo.
function adicionarExemplos(d) {
  const hoje = new Date();
  const dia = (n) => {
    const dt = new Date(hoje.getFullYear(), hoje.getMonth(), Math.min(n, 28));
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  };
  d.cartoes.push(
    { id: 9101, demo: true, nome: 'Nubank', bandeira: 'Mastercard', limite: 2500, fecha: 28, vence: 5, dono: 'darci' },
    { id: 9102, demo: true, nome: 'Itaú Click', bandeira: 'Visa', limite: 1800, fecha: 15, vence: 22, dono: 'jamylli' },
    { id: 9103, demo: true, nome: 'Caixa Elo', bandeira: 'Elo', limite: 1200, fecha: 20, vence: 27, dono: 'darci' },
  );
  d.lancamentos.push(
    { id: 9111, demo: true, tipo: 'saida', desc: 'Compras diversas', cat: 'Cartão de crédito', valor: 1400, data: dia(4), perfil: 'darci', pag: 'Cartão de crédito', cartaoId: 9101 },
    { id: 9112, demo: true, tipo: 'saida', desc: 'Streaming e assinaturas', cat: 'Cartão de crédito', valor: 600, data: dia(9), perfil: 'darci', pag: 'Cartão de crédito', cartaoId: 9101 },
    { id: 9113, demo: true, tipo: 'saida', desc: 'Roupas e presentes', cat: 'Cartão de crédito', valor: 900, data: dia(11), perfil: 'jamylli', pag: 'Cartão de crédito', cartaoId: 9102 },
    { id: 9114, demo: true, tipo: 'saida', desc: 'Farmácia', cat: 'Saúde', valor: 180, data: dia(6), perfil: 'darci', pag: 'Cartão de crédito', cartaoId: 9103 },
  );
  d.emprestimos.push(
    { id: 9121, demo: true, desc: 'Financiamento do carro', total: 24000, pago: 9600, dono: 'darci' },
    { id: 9122, demo: true, desc: 'Empréstimo pessoal', total: 5000, pago: 3500, dono: 'jamylli' },
    { id: 9123, demo: true, desc: 'Consignado', total: 8000, pago: 1200, dono: 'darci' },
  );
  d.crediarios.push(
    { id: 9131, demo: true, desc: 'Geladeira — Casas Bahia', total: 3200, pago: 1600, dono: 'jamylli' },
    { id: 9132, demo: true, desc: 'Celular — Magazine Luiza', total: 2400, pago: 800, dono: 'darci' },
    { id: 9133, demo: true, desc: 'Óculos — Ótica Diniz', total: 900, pago: 300, dono: 'jamylli' },
  );
  d.investimentos.push(
    { id: 9141, demo: true, desc: 'CDB Banco Inter', tipo: 'CDB / Renda fixa', valor: 5000, data: dia(2), dono: 'darci', pctCdi: 110 },
    { id: 9142, demo: true, desc: 'LCI Caixa', tipo: 'CDB / Renda fixa', valor: 3000, data: dia(3), dono: 'jamylli', pctCdi: 95 },
    { id: 9143, demo: true, desc: 'Tesouro Selic', tipo: 'Tesouro Direto', valor: 2000, data: dia(8), dono: 'darci', pctCdi: 100 },
  );
  d.metas.push(
    { id: 9151, demo: true, nome: 'Viagem de férias', alvo: 6000, atual: 2500, prazo: `${hoje.getFullYear()}-12`, dono: 'casal' },
    { id: 9152, demo: true, nome: 'Reserva de emergência', alvo: 15000, atual: 8200, prazo: '', dono: 'casal' },
    { id: 9153, demo: true, nome: 'Notebook novo', alvo: 4500, atual: 1300, prazo: '', dono: 'darci' },
  );
  d.cofre.movs.push(
    { id: 9161, demo: true, tipo: 'aplicar', valor: 1500, data: dia(3), desc: 'Aplicação inicial' },
    { id: 9162, demo: true, tipo: 'aplicar', valor: 800, data: dia(10), desc: 'Sobra do mês' },
    { id: 9163, demo: true, tipo: 'retirar', valor: 300, data: dia(12), desc: 'Emergência' },
  );
  d.proximoId = Math.max(d.proximoId || 100, 9200);
  d.exemplosV2 = true;
}

let dados = carregar();
let perfilAtivo = localStorage.getItem(CHAVE_SESSAO) || null;
let mesRef = new Date().toISOString().slice(0, 7); // 'AAAA-MM'
let filtroPerfil = 'todos';
let tipoLanc = 'saida';

function carregar() {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (bruto) {
      const d = JSON.parse(bruto);
      // migrações de versões antigas
      if (!d.notas) d.notas = [];
      if (!d.crediarios) d.crediarios = [];
      if (!d.cofre) d.cofre = { senha: null, movs: [] };
      d.emprestimos.forEach((e) => {
        if (e.pago === undefined) e.pago = e.parcelas ? +((e.total / e.parcelas) * (e.pagas || 0)).toFixed(2) : 0;
      });
      if (!d.exemplosV2) adicionarExemplos(d);
      if (!d.salarios) d.salarios = [];
      if (!d.exemplosV3) adicionarExemplosTrabalho(d);
      d.salarios.forEach((s) => { if (!s.tipo) s.tipo = 'salario'; });
      if (!d.exemplosV4) adicionarExemplosFeriasDecimo(d);
      if (!d.recorrentes) d.recorrentes = [];
      return d;
    }
  } catch (e) { /* dados corrompidos: recomeça */ }
  const novo = estadoInicial();
  adicionarExemplos(novo);
  adicionarExemplosTrabalho(novo);
  return novo;
}
function salvar() {
  localStorage.setItem(CHAVE, JSON.stringify(dados));
  agendarEnvioNuvem(); // envia para a nuvem se este aparelho estiver conectado
}
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

// ---------- Avatares (foto ou iniciais) ----------
function avatarHtml(p, tam) {
  if (p.foto) {
    return `<img class="avatar-img" style="width:${tam}px;height:${tam}px" src="${p.foto}" alt="${escapar(p.nome)}">`;
  }
  const iniciais = p.nome.split(' ').map((n) => n[0]).slice(0, 2).join('');
  return `<div class="perfil-avatar" style="background:${p.cor};width:${tam}px;height:${tam}px;font-size:${Math.round(tam * 0.38)}px">${escapar(iniciais)}</div>`;
}

// ---------- Login / sessão ----------
function renderLogin() {
  const alvo = $('#lista-perfis-login');
  alvo.innerHTML = '';
  dados.perfis.forEach((p) => {
    const btn = document.createElement('button');
    btn.className = 'perfil-btn';
    btn.innerHTML = `
      <div style="display:flex;justify-content:center;margin-bottom:10px">${avatarHtml(p, 58)}</div>
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
  const donos = [$('#lc-perfil'), $('#ct-dono'), $('#ep-dono'), $('#cr-dono'), $('#iv-dono'), $('#nf-perfil'), $('#tb-perfil')];
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
function mesAnterior(ym) {
  const [a, m] = ym.split('-').map(Number);
  const d = new Date(a, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
function htmlDelta(atual, anterior, invertido) {
  if (!anterior) return '';
  const pct = ((atual - anterior) / anterior) * 100;
  if (!isFinite(pct) || Math.abs(pct) < 0.05) return 'igual ao mês anterior';
  const subiu = pct > 0;
  const bom = invertido ? !subiu : subiu; // para saídas, cair é bom
  return `<span class="${bom ? 'delta-pos' : 'delta-neg'}">${subiu ? '▲' : '▼'} ${fmtPct(Math.abs(pct))}</span> vs ${rotuloMes(mesAnterior(mesRef))}`;
}

function renderDashboard() {
  const lanc = lancDoMes();
  const entradas = soma(lanc.filter((l) => l.tipo === 'entrada'));
  const saidas = soma(lanc.filter((l) => l.tipo === 'saida'));
  const saldo = entradas - saidas;
  const taxa = entradas > 0 ? (saldo / entradas) * 100 : 0;
  const lancAnt = lancDoMes(mesAnterior(mesRef));
  const entAnt = soma(lancAnt.filter((l) => l.tipo === 'entrada'));
  const saiAnt = soma(lancAnt.filter((l) => l.tipo === 'saida'));
  const investido = soma(dados.investimentos.filter((i) => filtroPerfil === 'todos' || i.dono === filtroPerfil));
  const dividas = [...dados.emprestimos, ...dados.crediarios]
    .reduce((s, e) => s + Math.max(e.total - e.pago, 0), 0);

  // Hero de boas-vindas
  const p = dados.perfis.find((x) => x.id === perfilAtivo) || dados.perfis[0];
  const estourados = dados.categorias
    .filter((cat) => dados.orcamentos[cat] > 0)
    .map((cat) => ({ cat, gasto: soma(lancDoMes(mesRef, 'todos').filter((l) => l.tipo === 'saida' && l.cat === cat)), teto: dados.orcamentos[cat] }))
    .filter((o) => o.gasto > o.teto);
  $('#dash-hero').innerHTML = `
    <div class="hero">
      <div class="hero-esq">
        ${avatarHtml(p, 56)}
        <div>
          <h2>Olá, ${escapar(primeiroNome(p.id))}! 👋</h2>
          <small>Resumo de ${rotuloMes(mesRef)} · ${filtroPerfil === 'todos' ? 'vocês dois' : primeiroNome(filtroPerfil)}</small>
        </div>
      </div>
      <div class="hero-saldo">
        <span>Saldo do mês</span>
        <strong class="${saldo >= 0 ? 'pos' : 'neg'}">${fmtBRL(saldo)}</strong>
      </div>
      <div class="hero-chips">
        <span class="chip-hero pos">⬆ ${fmtBRL(entradas)}</span>
        <span class="chip-hero neg">⬇ ${fmtBRL(saidas)}</span>
        ${entradas > 0 ? `<span class="chip-hero">💰 ${fmtPct(Math.max(taxa, 0))} economizado</span>` : ''}
        ${estourados.map((o) => `<span class="chip-hero alerta-orc">⚠️ ${escapar(o.cat)}: estourou ${fmtBRL(o.gasto - o.teto)} do teto</span>`).join('')}
        ${avisosFaturas().map((a) => `<span class="chip-hero alerta-orc">${escapar(a)}</span>`).join('')}
      </div>
    </div>`;

  const cards = [
    { rot: '⬆ Entradas do mês', val: fmtBRL(entradas), cls: 'pos', extra: htmlDelta(entradas, entAnt) || rotuloMes(mesRef) },
    { rot: '⬇ Saídas do mês', val: fmtBRL(saidas), cls: 'neg', extra: htmlDelta(saidas, saiAnt, true) || lanc.filter((l) => l.tipo === 'saida').length + ' lançamentos' },
    { rot: '📈 Total investido', val: fmtBRL(investido), cls: '', extra: dados.investimentos.length + ' aportes' },
    { rot: '🤝 Dívidas em aberto', val: fmtBRL(dividas), cls: dividas > 0 ? 'neg' : 'pos', extra: (dados.emprestimos.length + dados.crediarios.length) + ' contratos' },
  ];
  $('#cards-resumo').innerHTML = cards.map((c) => `
    <div class="card-resumo">
      <div class="rotulo">${c.rot}</div>
      <div class="valor ${c.cls}">${c.val}</div>
      <div class="extra">${c.extra}</div>
    </div>`).join('');

  const sufixo = rotuloMes(mesRef) + (filtroPerfil === 'todos' ? ' · casal' : ' · ' + primeiroNome(filtroPerfil));
  $('#donut-legenda-mes').textContent = sufixo;
  $('#saldo-legenda-mes').textContent = sufixo;

  renderSaldoLinha(lanc);
  renderDonut(lanc);
  renderBarras();
  renderRapida();
  renderPerfis(lanc);
  renderUltimos(lanc);
}

// --- Evolução do saldo acumulado no mês (área) ---
function renderSaldoLinha(lanc) {
  const alvo = $('#grafico-saldo');
  if (!lanc.length) { alvo.innerHTML = '<p class="vazio">Sem lançamentos neste mês.</p>'; return; }
  const [ano, mes] = mesRef.split('-').map(Number);
  const totalDias = new Date(ano, mes, 0).getDate();
  const porDia = Array(totalDias + 1).fill(0);
  lanc.forEach((l) => { porDia[+l.data.slice(8, 10)] += l.tipo === 'entrada' ? l.valor : -l.valor; });
  const serie = []; let acum = 0;
  for (let d = 1; d <= totalDias; d++) { acum += porDia[d]; serie.push(acum); }

  const W = 520, H = 220, mx = 52, my = 14, base = H - 28;
  const vMax = Math.max(...serie, 0), vMin = Math.min(...serie, 0);
  const faixa = vMax - vMin || 1;
  const x = (d) => mx + ((d - 1) / (totalDias - 1)) * (W - mx - 12);
  const y = (v) => my + (1 - (v - vMin) / faixa) * (base - my);

  let caminho = '', area = `M ${x(1)} ${y(0)} `;
  serie.forEach((v, i) => {
    caminho += `${i === 0 ? 'M' : 'L'} ${x(i + 1).toFixed(1)} ${y(v).toFixed(1)} `;
    area += `L ${x(i + 1).toFixed(1)} ${y(v).toFixed(1)} `;
  });
  area += `L ${x(totalDias)} ${y(0)} Z`;

  let grade = '';
  [vMin, vMin + faixa / 2, vMax].forEach((v) => {
    grade += `<line x1="${mx}" y1="${y(v)}" x2="${W - 8}" y2="${y(v)}" stroke="var(--grade)"/>
      <text x="${mx - 6}" y="${y(v) + 4}" text-anchor="end" font-size="10" fill="var(--texto-mudo)">${Math.abs(v) >= 1000 ? (v / 1000).toFixed(1).replace('.', ',') + ' mil' : Math.round(v)}</text>`;
  });
  const zeroY = y(0);
  const cores = coresSeries();
  const corLinha = cores[0];
  const ultimo = serie[totalDias - 1];

  // pontos de interação: um retângulo invisível por dia
  let toques = '';
  for (let d = 1; d <= totalDias; d++) {
    toques += `<rect x="${(x(d) - (W - mx) / totalDias / 2).toFixed(1)}" y="${my}" width="${((W - mx) / totalDias).toFixed(1)}" height="${base - my}"
      fill="transparent" data-dia="${d}" data-val="${serie[d - 1].toFixed(2)}"/>`;
  }

  alvo.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Evolução do saldo acumulado no mês">
      ${grade}
      <line x1="${mx}" y1="${zeroY}" x2="${W - 8}" y2="${zeroY}" stroke="var(--texto-mudo)" stroke-dasharray="3 3"/>
      <path d="${area}" fill="${corLinha}" opacity="0.14"/>
      <path d="${caminho}" fill="none" stroke="${corLinha}" stroke-width="2.5" stroke-linejoin="round"/>
      <circle id="saldo-ponto" r="4.5" fill="${corLinha}" stroke="var(--superficie)" stroke-width="2" opacity="0"/>
      <text x="${x(totalDias) - 4}" y="${y(ultimo) - 10}" text-anchor="end" font-size="12" font-weight="700"
        fill="${ultimo >= 0 ? 'var(--positivo)' : 'var(--negativo)'}">${fmtBRL(ultimo)}</text>
      ${toques}
      <text x="${mx}" y="${H - 8}" font-size="10" fill="var(--texto-mudo)">dia 1</text>
      <text x="${W - 10}" y="${H - 8}" text-anchor="end" font-size="10" fill="var(--texto-mudo)">dia ${totalDias}</text>
    </svg>`;

  const ponto = alvo.querySelector('#saldo-ponto');
  alvo.querySelectorAll('rect').forEach((r) => {
    r.addEventListener('mousemove', (ev) => {
      const d = +r.dataset.dia, v = +r.dataset.val;
      ponto.setAttribute('cx', x(d)); ponto.setAttribute('cy', y(v)); ponto.setAttribute('opacity', 1);
      mostrarTooltip(ev, `<strong>Dia ${d} de ${rotuloMes(mesRef)}</strong>
        <div class="tt-linha">Saldo acumulado: ${fmtBRL(v)}</div>`);
    });
    r.addEventListener('mouseleave', () => { ponto.setAttribute('opacity', 0); esconderTooltip(); });
  });
}

// --- Visão rápida (atalhos com status) ---
function renderRapida() {
  const alvo = $('#dash-rapida');
  let html = '';

  if (dados.cartoes.length) {
    html += '<div class="rapida-titulo">💳 Cartões</div>';
    dados.cartoes.forEach((c) => {
      const gasto = soma(lancDoMes(mesRef, 'todos').filter((l) => l.tipo === 'saida' && l.cartaoId == c.id));
      const restPct = c.limite > 0 ? 100 - Math.min((gasto / c.limite) * 100, 100) : 100;
      const st = statusCartao(restPct);
      html += `<div class="rapida-item" data-aba="cartoes">
        <span class="pontinho" style="background:${st.cor}"></span> ${escapar(c.nome)}
        <span class="direita">${fmtPct(restPct)} livre · fecha dia ${c.fecha}</span></div>`;
    });
  }

  const dividas = [...dados.emprestimos.map((e) => ({ ...e, ic: '🤝' })), ...dados.crediarios.map((c) => ({ ...c, ic: '🧾' }))]
    .filter((e) => e.total - e.pago > 0.005)
    .sort((a, b) => (b.total - b.pago) - (a.total - a.pago)).slice(0, 3);
  if (dividas.length) {
    html += '<div class="rapida-titulo">🤝 Maiores dívidas</div>';
    dividas.forEach((e) => {
      html += `<div class="rapida-item" data-aba="emprestimos">${e.ic} ${escapar(e.desc)}
        <span class="direita">falta ${fmtBRL(e.total - e.pago)}</span></div>`;
    });
  }

  const metas = [...dados.metas].sort((a, b) => (b.atual / b.alvo) - (a.atual / a.alvo)).slice(0, 3);
  if (metas.length) {
    html += '<div class="rapida-titulo">🎯 Metas</div>';
    metas.forEach((m) => {
      html += `<div class="rapida-item" data-aba="planejamento">🎯 ${escapar(m.nome)}
        <span class="direita">${fmtPct(Math.min((m.atual / m.alvo) * 100, 100))}</span></div>`;
    });
  }

  alvo.innerHTML = html || '<p class="vazio">Cadastre cartões, dívidas e metas para ver os atalhos aqui.</p>';
  alvo.querySelectorAll('.rapida-item').forEach((el) =>
    el.addEventListener('click', () => document.querySelector(`[data-aba="${el.dataset.aba}"]`).click()));
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
      <td>${escapar(l.desc)}${l.recId ? ' <span title="Lançamento fixo">🔁</span>' : ''}</td>
      <td><span class="chip-cat">${escapar(l.cat)}</span></td>
      <td>${escapar(primeiroNome(l.perfil))}</td>
      <td>${escapar(l.pag)}${l.cartaoId ? ' · ' + escapar((dados.cartoes.find((c) => c.id == l.cartaoId) || {}).nome || '') : ''}</td>
      <td class="dir ${l.tipo === 'entrada' ? 'val-pos' : 'val-neg'}">${l.tipo === 'entrada' ? '+' : '−'} ${fmtBRL(l.valor)}</td>
      <td style="white-space:nowrap">
        <button class="btn-lixo btn-ed" data-id="${l.id}" title="Editar">✏️</button>
        <button class="btn-lixo btn-del" data-id="${l.id}" title="Excluir">🗑</button>
      </td>
    </tr>`).join('') || '<tr><td colspan="7" class="vazio">Nenhum lançamento neste mês.</td></tr>';

  corpo.querySelectorAll('.btn-del').forEach((b) => b.addEventListener('click', () => {
    if (confirm('Excluir este lançamento?')) {
      dados.lancamentos = dados.lancamentos.filter((l) => l.id != b.dataset.id);
      salvar(); renderTudo();
    }
  }));
  corpo.querySelectorAll('.btn-ed').forEach((b) => b.addEventListener('click', () => editarLancamento(+b.dataset.id)));
}

// --- Edição de lançamentos ---
let editandoLancId = null;

function setTipoLanc(t) {
  tipoLanc = t;
  $('#tg-entrada').classList.toggle('ativo', t === 'entrada');
  $('#tg-saida').classList.toggle('ativo', t === 'saida');
  atualizarCategoriasForm();
}
function resetFormLanc() {
  editandoLancId = null;
  $('#form-lancamento').reset();
  $('#lc-data').value = new Date().toISOString().slice(0, 10);
  if (perfilAtivo) $('#lc-perfil').value = perfilAtivo;
  $('#campo-cartao').classList.add('oculto');
  $('#btn-lanc-salvar').textContent = 'Adicionar';
  $('#btn-lanc-cancelar').classList.add('oculto');
}
function editarLancamento(id) {
  const l = dados.lancamentos.find((x) => x.id === id);
  if (!l) return;
  setTipoLanc(l.tipo);
  $('#lc-desc').value = l.desc;
  $('#lc-valor').value = l.valor;
  $('#lc-data').value = l.data;
  $('#lc-cat').value = l.cat;
  $('#lc-perfil').value = l.perfil;
  $('#lc-pag').value = l.pag;
  $('#campo-cartao').classList.toggle('oculto', l.pag !== 'Cartão de crédito');
  if (l.cartaoId) $('#lc-cartao').value = l.cartaoId;
  editandoLancId = l.id;
  $('#btn-lanc-salvar').textContent = '💾 Salvar alterações';
  $('#btn-lanc-cancelar').classList.remove('oculto');
  $('#form-lancamento').scrollIntoView({ behavior: 'smooth' });
  $('#lc-desc').focus();
}

function configurarFormLancamento() {
  $('#tg-entrada').addEventListener('click', () => setTipoLanc('entrada'));
  $('#tg-saida').addEventListener('click', () => setTipoLanc('saida'));
  $('#btn-lanc-cancelar').addEventListener('click', resetFormLanc);

  $('#lc-pag').addEventListener('change', () => {
    $('#campo-cartao').classList.toggle('oculto', $('#lc-pag').value !== 'Cartão de crédito');
  });

  $('#form-lancamento').addEventListener('submit', (e) => {
    e.preventDefault();
    const l = {
      tipo: tipoLanc,
      desc: $('#lc-desc').value.trim(),
      cat: $('#lc-cat').value,
      valor: parseFloat($('#lc-valor').value),
      data: $('#lc-data').value,
      perfil: $('#lc-perfil').value,
      pag: $('#lc-pag').value,
    };
    if ($('#lc-pag').value === 'Cartão de crédito' && $('#lc-cartao').value) l.cartaoId = +$('#lc-cartao').value;

    if (editandoLancId !== null) {
      const i = dados.lancamentos.findIndex((x) => x.id === editandoLancId);
      if (i >= 0) {
        l.id = editandoLancId;
        if (dados.lancamentos[i].recId) l.recId = dados.lancamentos[i].recId;
        dados.lancamentos[i] = l;
      }
    } else {
      l.id = novoId();
      dados.lancamentos.push(l);
      if ($('#lc-recorrente').checked) {
        dados.recorrentes.push({
          id: novoId(), ativo: true, tipo: l.tipo, desc: l.desc, cat: l.cat,
          valor: l.valor, perfil: l.perfil, pag: l.pag,
          ...(l.cartaoId ? { cartaoId: l.cartaoId } : {}),
          dia: +l.data.slice(8, 10),
        });
        l.recId = dados.recorrentes[dados.recorrentes.length - 1].id;
      }
    }
    salvar();
    resetFormLanc();
    renderTudo();
  });
}

// --- Lançamentos fixos (recorrentes) ---
function materializarRecorrentes() {
  const agora = new Date();
  const ym = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`;
  const ultimoDia = new Date(agora.getFullYear(), agora.getMonth() + 1, 0).getDate();
  let criou = false;
  dados.recorrentes.forEach((r) => {
    if (!r.ativo) return;
    if (dados.lancamentos.some((l) => l.recId === r.id && l.data.startsWith(ym))) return;
    const dia = Math.min(r.dia || 1, ultimoDia);
    dados.lancamentos.push({
      id: novoId(), recId: r.id, tipo: r.tipo, desc: r.desc, cat: r.cat, valor: r.valor,
      data: `${ym}-${String(dia).padStart(2, '0')}`, perfil: r.perfil, pag: r.pag,
      ...(r.cartaoId ? { cartaoId: r.cartaoId } : {}),
    });
    criou = true;
  });
  if (criou) salvar();
}
function renderRecorrentes() {
  const alvo = $('#lista-recorrentes');
  if (!dados.recorrentes.length) {
    alvo.innerHTML = '<p class="vazio">Nenhum lançamento fixo ainda. Marque "🔁 Repetir todo mês" ao adicionar um lançamento.</p>';
    return;
  }
  alvo.innerHTML = dados.recorrentes.map((r) => `
    <div class="rec-item ${r.ativo ? '' : 'pausado'}">
      <span>${r.tipo === 'entrada' ? '⬆' : '⬇'}</span>
      <div class="rec-info">${escapar(r.desc)}
        <small>· ${escapar(r.cat)} · todo dia ${r.dia} · ${escapar(primeiroNome(r.perfil))}${r.ativo ? '' : ' · pausado'}</small></div>
      <strong class="${r.tipo === 'entrada' ? 'val-pos' : 'val-neg'}">${fmtBRL(r.valor)}</strong>
      <button class="btn-secundario rec-pausar" data-id="${r.id}">${r.ativo ? '⏸ Pausar' : '▶ Ativar'}</button>
      <button class="btn-lixo rec-remover" data-id="${r.id}" title="Excluir">🗑</button>
    </div>`).join('');
  alvo.querySelectorAll('.rec-pausar').forEach((b) => b.addEventListener('click', () => {
    const r = dados.recorrentes.find((x) => x.id == b.dataset.id);
    r.ativo = !r.ativo;
    if (r.ativo) materializarRecorrentes();
    salvar(); renderTudo();
  }));
  alvo.querySelectorAll('.rec-remover').forEach((b) => b.addEventListener('click', () => {
    if (confirm('Excluir este lançamento fixo? Os lançamentos já criados por ele continuam.')) {
      dados.recorrentes = dados.recorrentes.filter((x) => x.id != b.dataset.id);
      salvar(); renderTudo();
    }
  }));
}

// ==========================================================
// CARTÕES
// ==========================================================
// Cor conforme o limite RESTANTE — paleta azul/vermelho/verde:
// ≤25% livre vermelho · ≤70% azul · acima verde
function statusCartao(restantePct) {
  if (restantePct <= 25) return { cls: 'st-vermelho', selo: '🔴 Limite crítico', cor: '#d03b3b' };
  if (restantePct <= 70) return { cls: 'st-azul', selo: '🔵 Uso moderado', cor: '#2a78d6' };
  return { cls: 'st-verde', selo: '🟢 Limite tranquilo', cor: '#0ca30c' };
}
function renderCartoes() {
  const alvo = $('#lista-cartoes');
  if (!dados.cartoes.length) { alvo.innerHTML = '<p class="vazio cartao">Nenhum cartão cadastrado ainda. 💳</p>'; }
  else alvo.innerHTML = dados.cartoes.map((c) => {
    const gasto = soma(lancDoMes(mesRef, 'todos').filter((l) => l.tipo === 'saida' && l.cartaoId == c.id));
    const pct = c.limite > 0 ? Math.min((gasto / c.limite) * 100, 100) : 0;
    const restantePct = 100 - pct;
    const st = statusCartao(restantePct);
    return `
      <div class="cartao cartao-item ${st.cls}">
        <button class="btn-lixo remover" data-id="${c.id}" data-tipo="cartao" title="Excluir">🗑</button>
        <div class="cartao-credito-topo">
          <strong>💳 ${escapar(c.nome)}</strong>
          <span class="bandeira">${escapar(c.bandeira)}</span>
        </div>
        <small>Titular: ${escapar(primeiroNome(c.dono))} · Fecha dia ${c.fecha} · Vence dia ${c.vence}</small>
        <div class="progresso"><div style="width:${pct}%"></div></div>
        <div class="prog-info">
          <span>Fatura de ${rotuloMes(mesRef)}: <strong>${fmtBRL(gasto)}</strong></span>
          <span>Livre: <strong>${fmtBRL(Math.max(c.limite - gasto, 0))}</strong> (${fmtPct(restantePct)})</span>
        </div>
        <span class="selo-status">${st.selo}</span>
      </div>`;
  }).join('');
  ligarRemocao(alvo, 'cartoes');
  renderCalendario();
}

// --- Calendário de fechamento/vencimento das faturas ---
function renderCalendario() {
  const alvo = $('#calendario-cartoes');
  const [ano, mes] = mesRef.split('-').map(Number);
  $('#cal-mes').textContent = rotuloMes(mesRef);
  const primeiroDiaSemana = new Date(ano, mes - 1, 1).getDay();
  const totalDias = new Date(ano, mes, 0).getDate();
  const hoje = new Date();
  const ehMesAtual = hoje.getFullYear() === ano && hoje.getMonth() + 1 === mes;

  let html = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    .map((d) => `<div class="cal-cab">${d}</div>`).join('');
  for (let i = 0; i < primeiroDiaSemana; i++) html += '<div class="cal-dia vazio-cal"></div>';
  for (let d = 1; d <= totalDias; d++) {
    const eventos = [];
    dados.cartoes.forEach((c) => {
      if (Math.min(c.fecha, totalDias) === d) eventos.push(`<div class="cal-evento fecha" title="Fechamento da fatura ${escapar(c.nome)}">🔒 ${escapar(c.nome)}</div>`);
      if (Math.min(c.vence, totalDias) === d) eventos.push(`<div class="cal-evento vence" title="Vencimento da fatura ${escapar(c.nome)}">💰 ${escapar(c.nome)}</div>`);
    });
    const ehHoje = ehMesAtual && hoje.getDate() === d;
    html += `<div class="cal-dia ${ehHoje ? 'hoje' : ''}"><span class="num">${d}</span>${eventos.join('')}</div>`;
  }
  alvo.innerHTML = html;

  // Avisos de fechamento próximo (até 5 dias)
  const avisos = [];
  const hoje0 = new Date(); hoje0.setHours(0, 0, 0, 0);
  dados.cartoes.forEach((c) => {
    const ultimoDia = (a, m) => new Date(a, m + 1, 0).getDate();
    let fecha = new Date(hoje0.getFullYear(), hoje0.getMonth(), Math.min(c.fecha, ultimoDia(hoje0.getFullYear(), hoje0.getMonth())));
    if (fecha < hoje0) fecha = new Date(hoje0.getFullYear(), hoje0.getMonth() + 1, Math.min(c.fecha, ultimoDia(hoje0.getFullYear(), hoje0.getMonth() + 1)));
    const dias = Math.round((fecha - hoje0) / 86400000);
    if (dias <= 5) avisos.push(`<span class="alerta-chip">⚠️ <strong>${escapar(c.nome)}</strong> fecha ${dias === 0 ? 'HOJE' : dias === 1 ? 'amanhã' : 'em ' + dias + ' dias'} (dia ${c.fecha})</span>`);
  });
  $('#alertas-cartoes').innerHTML = avisos.join('') ||
    (dados.cartoes.length ? '<span class="dica">Nenhuma fatura fechando nos próximos 5 dias. 😌</span>' : '');
}

// ==========================================================
// EMPRÉSTIMOS E CONTAS/CREDIÁRIO (valor pago × restante)
// ==========================================================
function cartaoDivida(item, icone) {
  const pct = item.total > 0 ? Math.min((item.pago / item.total) * 100, 100) : 0;
  const restante = Math.max(item.total - item.pago, 0);
  const quitado = restante <= 0.005;
  return `
    <div class="cartao cartao-item ${quitado ? 'st-verde' : ''}">
      <button class="btn-lixo remover" data-id="${item.id}" title="Excluir">🗑</button>
      <strong>${icone} ${escapar(item.desc)}</strong><br>
      <small>Responsável: ${escapar(primeiroNome(item.dono))} · Total: ${fmtBRL(item.total)}</small>
      <div class="progresso"><div style="width:${pct}%"></div></div>
      <div class="prog-info">
        <span>Pago: <strong class="val-pos">${fmtBRL(item.pago)}</strong> (${fmtPct(pct)})</span>
        <span>Restante: <strong class="${quitado ? 'val-pos' : 'val-neg'}">${fmtBRL(restante)}</strong></span>
      </div>
      <div class="linha-botoes" style="margin-top:10px">
        ${quitado ? '<span class="selo-status">✅ Quitado!</span>'
          : `<button class="btn-secundario btn-pagamento" data-id="${item.id}">＋ Registrar pagamento</button>`}
      </div>
    </div>`;
}
function ligarPagamentos(container, colecao) {
  container.querySelectorAll('.btn-pagamento').forEach((b) => b.addEventListener('click', () => {
    const item = dados[colecao].find((x) => x.id == b.dataset.id);
    const v = parseFloat((prompt(`Quanto foi pago de "${item.desc}"? (R$)`) || '').replace(',', '.'));
    if (v > 0) {
      item.pago = Math.min(+(item.pago + v).toFixed(2), item.total);
      salvar(); renderTudo();
    }
  }));
}
// Gráfico de avanço: rosca com o % total quitado + barras por item
function renderGraficoDividas(alvoSel, lista) {
  const alvo = $(alvoSel);
  if (!lista.length) { alvo.innerHTML = '<p class="vazio">Nada cadastrado ainda.</p>'; return; }
  const totalGeral = lista.reduce((s, x) => s + x.total, 0);
  const pagoGeral = lista.reduce((s, x) => s + Math.min(x.pago, x.total), 0);
  const pctGeral = totalGeral > 0 ? (pagoGeral / totalGeral) * 100 : 0;

  // rosca de duas fatias (pago × restante)
  const cx = 75, cy = 75, R = 62, r = 44;
  const ang = -Math.PI / 2 + (pctGeral / 100) * Math.PI * 2;
  const p = (a, rad) => `${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`;
  const grande = pctGeral > 50 ? 1 : 0;
  const cores = coresSeries();
  const fatiaPago = pctGeral >= 99.95
    ? `<circle cx="${cx}" cy="${cy}" r="${(R + r) / 2}" fill="none" stroke="${cores[1]}" stroke-width="${R - r}"/>`
    : pctGeral <= 0.05 ? ''
      : `<path d="M ${p(-Math.PI / 2, R)} A ${R} ${R} 0 ${grande} 1 ${p(ang, R)} L ${p(ang, r)} A ${r} ${r} 0 ${grande} 0 ${p(-Math.PI / 2, r)} Z" fill="${cores[1]}"/>`;

  const barras = lista.map((item, i) => {
    const pct = item.total > 0 ? Math.min((item.pago / item.total) * 100, 100) : 0;
    return `
      <div class="barra-cat divida-hover" data-desc="${escapar(item.desc)}" data-pago="${item.pago}" data-resta="${Math.max(item.total - item.pago, 0)}" data-pct="${pct.toFixed(1)}">
        <div class="prog-info"><span>${escapar(item.desc)}</span><span><strong>${fmtPct(pct)}</strong> pago</span></div>
        <div class="progresso"><div style="width:${pct}%; background:${cores[i % 8]}"></div></div>
      </div>`;
  }).join('');

  alvo.innerHTML = `
    <div class="divida-graf">
      <svg width="150" height="150" viewBox="0 0 150 150" role="img" aria-label="Percentual total quitado">
        <circle cx="${cx}" cy="${cy}" r="${(R + r) / 2}" fill="none" stroke="var(--grade)" stroke-width="${R - r}"/>
        ${fatiaPago}
        <text x="${cx}" y="${cy - 2}" text-anchor="middle" font-size="20" font-weight="700" fill="var(--texto)">${fmtPct(pctGeral)}</text>
        <text x="${cx}" y="${cy + 16}" text-anchor="middle" font-size="10" fill="var(--texto-2)">quitado</text>
      </svg>
      <div class="divida-barras">${barras}
        <p class="dica" style="margin-top:6px">Pago: <strong>${fmtBRL(pagoGeral)}</strong> · Restante: <strong>${fmtBRL(totalGeral - pagoGeral)}</strong> de ${fmtBRL(totalGeral)}</p>
      </div>
    </div>`;

  alvo.querySelectorAll('.divida-hover').forEach((el) => {
    el.addEventListener('mousemove', (ev) => mostrarTooltip(ev, `
      <strong>${el.dataset.desc}</strong>
      <div class="tt-linha">Pago: ${fmtBRL(+el.dataset.pago)} (${el.dataset.pct.replace('.', ',')}%)</div>
      <div class="tt-linha">Restante: ${fmtBRL(+el.dataset.resta)}</div>`));
    el.addEventListener('mouseleave', esconderTooltip);
  });
}

function renderEmprestimos() {
  const alvo = $('#lista-emprestimos');
  alvo.innerHTML = dados.emprestimos.length
    ? dados.emprestimos.map((e) => cartaoDivida(e, '🤝')).join('')
    : '<p class="vazio cartao">Nenhum empréstimo cadastrado. Que continue assim! 🎉</p>';
  ligarRemocao(alvo, 'emprestimos');
  ligarPagamentos(alvo, 'emprestimos');
  renderGraficoDividas('#grafico-emprestimos', dados.emprestimos);
}
function renderCrediarios() {
  const alvo = $('#lista-crediarios');
  alvo.innerHTML = dados.crediarios.length
    ? dados.crediarios.map((c) => cartaoDivida(c, '🧾')).join('')
    : '<p class="vazio cartao">Nenhuma conta ou crediário cadastrado.</p>';
  ligarRemocao(alvo, 'crediarios');
  ligarPagamentos(alvo, 'crediarios');
  renderGraficoDividas('#grafico-crediarios', dados.crediarios);
}

// ==========================================================
// INVESTIMENTOS (com % do CDI)
// ==========================================================
let cdiBuscado = null; // taxa % a.a. vinda do Banco Central

function cdiAtual() {
  const manual = parseFloat($('#cdi-valor').value);
  return manual > 0 ? manual : cdiBuscado;
}
async function buscarCDI() {
  const fonte = $('#cdi-fonte');
  fonte.textContent = 'buscando no Banco Central...';
  try {
    // Série SGS 4389: Taxa DI anualizada (% a.a.) — API pública do Banco Central
    const r = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.4389/dados/ultimos/1?formato=json');
    const j = await r.json();
    cdiBuscado = parseFloat(j[0].valor);
    fonte.textContent = `${cdiBuscado.toLocaleString('pt-BR')}% a.a. — Banco Central, ${j[0].data}`;
    $('#cdi-valor').placeholder = String(cdiBuscado).replace('.', ',');
  } catch (e) {
    fonte.textContent = 'não foi possível buscar (sem internet?) — digite a taxa manualmente';
  }
  renderInvestimentos();
}

function rendimentoMes(inv) {
  const cdi = cdiAtual();
  if (!cdi || !inv.pctCdi) return null;
  return inv.valor * (cdi / 100) * (inv.pctCdi / 100) / 12;
}
// Valor estimado hoje: aplicado corrigido pelo CDI desde a data (juros compostos mensais)
function valorHoje(inv) {
  const cdi = cdiAtual();
  if (!cdi || !inv.pctCdi || !inv.data) return null;
  const meses = Math.max(0, (Date.now() - new Date(inv.data + 'T12:00:00')) / (30.44 * 86400000));
  return inv.valor * Math.pow(1 + (cdi / 100) * (inv.pctCdi / 100) / 12, meses);
}

function renderInvestimentos() {
  const lista = dados.investimentos;
  const total = soma(lista);
  const rendaMes = lista.reduce((s, i) => s + (rendimentoMes(i) || 0), 0);
  const carteiraHoje = lista.reduce((s, i) => s + (valorHoje(i) || i.valor), 0);
  const porPerfil = dados.perfis.map((p) => ({ p, v: soma(lista.filter((i) => i.dono === p.id)) }));
  $('#resumo-invest').innerHTML = `
    <div class="card-resumo"><div class="rotulo">📈 Total aplicado</div><div class="valor pos">${fmtBRL(total)}</div></div>
    <div class="card-resumo"><div class="rotulo">🌱 Carteira hoje ≈</div><div class="valor pos">${carteiraHoje > 0 ? fmtBRL(carteiraHoje) : '—'}</div>
      <div class="extra">${carteiraHoje > total ? '+' + fmtBRL(carteiraHoje - total) + ' de rendimento estimado' : 'corrigido pelo CDI desde cada aporte'}</div></div>
    <div class="card-resumo"><div class="rotulo">💹 Rende ≈ por mês</div><div class="valor pos">${rendaMes > 0 ? fmtBRL(rendaMes) : '—'}</div>
      <div class="extra">${rendaMes > 0 ? 'estimativa com o CDI atual' : 'informe o CDI e o % de cada investimento'}</div></div>
    ${porPerfil.map(({ p, v }) => `
      <div class="card-resumo"><div class="rotulo"><span style="color:${p.cor}">●</span> ${escapar(primeiroNome(p.id))}</div>
      <div class="valor">${fmtBRL(v)}</div>
      <div class="extra">${total > 0 ? fmtPct((v / total) * 100) + ' da carteira' : '—'}</div></div>`).join('')}`;

  const corpo = $('#tabela-invest tbody');
  corpo.innerHTML = lista.slice().sort((a, b) => b.data.localeCompare(a.data)).map((i) => {
    const rm = rendimentoMes(i);
    const vh = valorHoje(i);
    return `
    <tr>
      <td>${fmtData(i.data)}</td>
      <td>${escapar(i.desc)}</td>
      <td><span class="chip-cat">${escapar(i.tipo)}</span></td>
      <td>${escapar(primeiroNome(i.dono))}</td>
      <td class="dir">${i.pctCdi ? i.pctCdi.toLocaleString('pt-BR') + '%' : '—'}</td>
      <td class="dir val-pos">${rm ? fmtBRL(rm) : '—'}</td>
      <td class="dir">${fmtBRL(i.valor)}</td>
      <td class="dir val-pos">${vh ? fmtBRL(vh) : '—'}</td>
      <td><button class="btn-lixo" data-id="${i.id}" title="Excluir">🗑</button></td>
    </tr>`;
  }).join('') || '<tr><td colspan="9" class="vazio">Nenhum investimento ainda. Comece hoje! 🌱</td></tr>';
  corpo.querySelectorAll('.btn-lixo').forEach((b) => b.addEventListener('click', () => {
    if (confirm('Excluir este investimento?')) {
      dados.investimentos = dados.investimentos.filter((i) => i.id != b.dataset.id);
      salvar(); renderTudo();
    }
  }));
}

// ==========================================================
// COFRE DO CASAL (valores ocultos por senha)
// ==========================================================
let cofreLiberado = false;

async function hashSenha(texto) {
  if (crypto && crypto.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('cfbrum:' + texto));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  // fallback simples caso o navegador não tenha crypto.subtle
  let h = 5381;
  for (const ch of 'cfbrum:' + texto) h = ((h * 33) ^ ch.charCodeAt(0)) >>> 0;
  return 'x' + h.toString(16);
}
async function criarSenhaCofre() {
  const s1 = prompt('Crie uma senha para o cofre (você vai usá-la para ver e retirar valores):');
  if (!s1) return false;
  const s2 = prompt('Digite a senha de novo para confirmar:');
  if (s1 !== s2) { alert('As senhas não conferem. Tente de novo.'); return false; }
  dados.cofre.senha = await hashSenha(s1);
  salvar();
  cofreLiberado = true;
  alert('Senha criada! 🔒 Guarde-a bem: sem ela não dá para ver os valores.');
  return true;
}
async function pedirSenhaCofre() {
  if (cofreLiberado) return true;
  if (!dados.cofre.senha) return criarSenhaCofre();
  const s = prompt('Digite a senha do cofre:');
  if (s === null) return false;
  if (await hashSenha(s) === dados.cofre.senha) { cofreLiberado = true; return true; }
  alert('Senha incorreta. ❌');
  return false;
}
function saldoCofre() {
  return dados.cofre.movs.reduce((s, m) => s + (m.tipo === 'aplicar' ? m.valor : -m.valor), 0);
}
function renderCofre() {
  const mask = 'R$ ••••••';
  $('#cofre-total').textContent = cofreLiberado ? fmtBRL(saldoCofre()) : mask;
  $('#cofre-info').textContent = dados.cofre.movs.length
    ? `${dados.cofre.movs.length} movimentações` + (dados.cofre.senha ? '' : ' · senha ainda não criada')
    : 'nenhuma movimentação ainda';
  $('#btn-cofre-ver').textContent = cofreLiberado ? '🙈 Ocultar valores' : '👁 Mostrar valores';
  const movs = [...dados.cofre.movs].sort((a, b) => b.data.localeCompare(a.data)).slice(0, 10);
  $('#cofre-movs').innerHTML = movs.map((m) => `
    <div class="ultimo-item">
      <div>${m.tipo === 'aplicar' ? '⬆ Aplicação' : '⬇ Retirada'}${m.desc ? ' — ' + escapar(m.desc) : ''}
        <div class="quem">${fmtData(m.data)}</div></div>
      <strong class="${m.tipo === 'aplicar' ? 'val-pos' : 'val-neg'} ${cofreLiberado ? '' : 'mov-mask'}">
        ${cofreLiberado ? (m.tipo === 'aplicar' ? '+ ' : '− ') + fmtBRL(m.valor) : '••••'}</strong>
    </div>`).join('');
}
function configurarCofre() {
  $('#btn-cofre-ver').addEventListener('click', async () => {
    if (cofreLiberado) cofreLiberado = false;
    else if (!(await pedirSenhaCofre())) return;
    renderCofre();
  });
  $('#btn-cofre-aplicar').addEventListener('click', async () => {
    if (!dados.cofre.senha && !(await criarSenhaCofre())) return;
    const v = parseFloat((prompt('Quanto deseja aplicar no cofre? (R$)') || '').replace(',', '.'));
    if (!(v > 0)) return;
    const desc = prompt('Descrição (opcional):') || '';
    dados.cofre.movs.push({ id: novoId(), tipo: 'aplicar', valor: v, data: new Date().toISOString().slice(0, 10), desc });
    salvar(); renderCofre();
  });
  $('#btn-cofre-retirar').addEventListener('click', async () => {
    if (!(await pedirSenhaCofre())) return;
    const v = parseFloat((prompt('Quanto deseja retirar do cofre? (R$)') || '').replace(',', '.'));
    if (!(v > 0)) return;
    if (v > saldoCofre()) { alert('O cofre não tem tudo isso! Saldo atual: ' + fmtBRL(saldoCofre())); return; }
    const desc = prompt('Motivo da retirada (opcional):') || '';
    dados.cofre.movs.push({ id: novoId(), tipo: 'retirar', valor: v, data: new Date().toISOString().slice(0, 10), desc });
    salvar(); renderCofre(); // o total é recalculado automaticamente
  });
}

// ==========================================================
// MODO TV (tela cheia para apresentação)
// ==========================================================
function alternarTV() {
  if (document.fullscreenElement) document.exitFullscreen();
  else {
    document.querySelector('[data-aba="dashboard"]').click();
    (document.documentElement.requestFullscreen ? document.documentElement.requestFullscreen() : Promise.reject())
      .catch(() => document.body.classList.add('modo-tv'));
  }
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
        ${avatarHtml(p, 46)}
        <strong style="flex:1">${escapar(p.nome)}</strong>
        <button class="btn-secundario btn-foto" data-perfil="${p.id}">📷 ${p.foto ? 'Trocar' : 'Adicionar'} foto</button>
        ${p.foto ? `<button class="btn-secundario btn-foto-remover" data-perfil="${p.id}">✕ Remover foto</button>` : ''}
        <input type="file" accept="image/*" class="oculto inp-foto" data-perfil="${p.id}">
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

  // Foto de perfil
  alvo.querySelectorAll('.btn-foto').forEach((b) => b.addEventListener('click', () =>
    alvo.querySelector(`.inp-foto[data-perfil="${b.dataset.perfil}"]`).click()));
  alvo.querySelectorAll('.btn-foto-remover').forEach((b) => b.addEventListener('click', () => {
    const p = dados.perfis.find((x) => x.id === b.dataset.perfil);
    delete p.foto;
    salvar(); renderTudo();
    if (!perfilAtivo) renderLogin();
  }));
  alvo.querySelectorAll('.inp-foto').forEach((inp) => inp.addEventListener('change', () => {
    const f = inp.files[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      // recorte quadrado central, reduzido para 128px
      const lado = Math.min(img.width, img.height);
      const cv = document.createElement('canvas');
      cv.width = cv.height = 128;
      cv.getContext('2d').drawImage(img, (img.width - lado) / 2, (img.height - lado) / 2, lado, lado, 0, 0, 128, 128);
      URL.revokeObjectURL(url);
      const p = dados.perfis.find((x) => x.id === inp.dataset.perfil);
      p.foto = cv.toDataURL('image/jpeg', 0.8);
      try { salvar(); } catch (e) { delete p.foto; alert('A foto é grande demais para o armazenamento do navegador.'); }
      renderTudo();
    };
    img.onerror = () => alert('Não foi possível abrir essa imagem.');
    img.src = url;
  }));

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
    ['lancamentos', 'cartoes', 'emprestimos', 'crediarios', 'investimentos', 'metas', 'notas', 'salarios']
      .forEach((col) => { dados[col] = dados[col].filter((x) => !x.demo); });
    dados.cofre.movs = dados.cofre.movs.filter((m) => !m.demo);
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
    const total = parseFloat($('#ep-total').value);
    dados.emprestimos.push({
      id: novoId(), desc: $('#ep-desc').value.trim(), total,
      pago: Math.min(parseFloat($('#ep-pago').value) || 0, total),
      dono: $('#ep-dono').value,
    });
    salvar(); $('#form-emprestimo').reset(); renderTudo();
  });

  $('#form-crediario').addEventListener('submit', (e) => {
    e.preventDefault();
    const total = parseFloat($('#cr-total').value);
    dados.crediarios.push({
      id: novoId(), desc: $('#cr-desc').value.trim(), total,
      pago: Math.min(parseFloat($('#cr-pago').value) || 0, total),
      dono: $('#cr-dono').value,
    });
    salvar(); $('#form-crediario').reset(); renderTudo();
  });

  $('#form-investimento').addEventListener('submit', (e) => {
    e.preventDefault();
    dados.investimentos.push({
      id: novoId(), desc: $('#iv-desc').value.trim(), tipo: $('#iv-tipo').value,
      valor: parseFloat($('#iv-valor').value), data: $('#iv-data').value, dono: $('#iv-dono').value,
      pctCdi: parseFloat($('#iv-cdi').value) || null,
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

// ==========================================================
// MERCADO — nota fiscal com leitura de imagem (OCR)
// ==========================================================
const CATS_PRODUTO = {
  '🥩 Carnes': ['CARNE', 'BOVIN', 'SUIN', 'FRANGO', 'FGO', 'AVE', 'PEITO', 'COXA', 'ASA', 'LINGUICA', 'SALSICHA', 'PICANHA', 'ALCATRA', 'PATINHO', 'ACEM', 'COSTELA', 'BACON', 'PEIXE', 'TILAPIA', 'SARDINHA', 'ATUM', 'MOIDA', 'BISTECA', 'FILE', 'HAMBURG', 'ALMONDEGA', 'CHURRASCO'],
  '🧹 Limpeza': ['DETERG', 'SABAO', 'SAB PO', 'AMACIANTE', 'DESINF', 'AGUA SANIT', 'CANDIDA', 'ALVEJANTE', 'ESPONJA', 'BUCHA', 'VASSOURA', 'RODO', 'PANO', 'LIMPADOR', 'MULTIUSO', 'LUSTRA', 'SAPOLIO', 'CLORO', 'INSETICIDA', 'SACO LIXO', 'DESENGORD', 'LIMPA'],
  '🍬 Guloseimas': ['CHOCOLATE', 'CHOC ', 'BALA', 'BOMBOM', 'PIRULITO', 'CHICLETE', 'BISCOITO', 'BISC ', 'BOLACHA', 'WAFER', 'DOCE', 'SORVETE', 'PICOLE', 'GELATINA', 'PACOCA', 'GOMA', 'SALGADINHO', 'CHIPS', 'PIPOCA', 'AMENDOIM', 'BROWNIE', 'TORTA', 'RECHEADO'],
  '🥦 Hortifruti': ['BANANA', 'MACA', 'LARANJA', 'LIMAO', 'MAMAO', 'MELANCIA', 'ABACAXI', 'UVA', 'MORANGO', 'PERA', 'MANGA', 'TOMATE', 'ALFACE', 'CEBOLA', 'ALHO', 'BATATA', 'CENOURA', 'ABOBORA', 'ABOBRINHA', 'CHUCHU', 'REPOLHO', 'COUVE', 'BROCOLIS', 'PIMENTAO', 'PEPINO', 'BETERRABA', 'MANDIOCA', 'AIPIM', 'VERDURA', 'LEGUME', 'FRUTA', 'SALSA', 'COENTRO', 'RUCULA'],
  '🥛 Laticínios e frios': ['LEITE', 'QUEIJO', 'QJO', 'MUSSARELA', 'PRATO', 'IOGURTE', 'IOG ', 'MANTEIGA', 'MARGARINA', 'REQUEIJAO', 'CREME DE LEITE', 'LEITE COND', 'NATA', 'PRESUNTO', 'MORTADELA', 'SALAME', 'PEITO PERU', 'RICOTA', 'COALHADA', 'OVO'],
  '🍞 Padaria': ['PAO', 'BAGUETE', 'BISNAGA', 'BOLO', 'ROSCA', 'CROISSANT', 'TORRADA', 'SONHO', 'CUCA', 'SALGADO', 'PASTEL', 'PIZZA'],
  '🥤 Bebidas': ['REFRIG', 'COCA', 'GUARANA', 'PEPSI', 'FANTA', 'SPRITE', 'SUCO', 'NECTAR', 'AGUA MIN', 'AGUA C GAS', 'CERVEJA', 'CERV ', 'SKOL', 'BRAHMA', 'HEINEKEN', 'VINHO', 'CACHACA', 'VODKA', 'WHISKY', 'ENERGETICO', 'CHA ', 'CAFE PRONTO', 'ISOTONICO', 'REFRESCO'],
  '🍚 Mercearia': ['ARROZ', 'FEIJAO', 'OLEO', 'AZEITE', 'ACUCAR', 'SAL ', 'CAFE', 'MACARRAO', 'MASSA', 'FARINHA', 'TRIGO', 'FUBA', 'AVEIA', 'MILHO', 'ERVILHA', 'SELETA', 'MOLHO', 'EXTRATO', 'TEMPERO', 'CALDO', 'MAIONESE', 'KETCHUP', 'MOSTARDA', 'VINAGRE', 'ENLATADO', 'CONSERVA', 'SARDINHA LATA', 'GRANOLA', 'CEREAL', 'ACHOCOLATADO', 'NESCAU', 'TODDY', 'LEITE PO', 'MISTURA BOLO', 'FERMENTO', 'GELEIA', 'MEL '],
  '🧴 Higiene': ['SHAMPOO', 'XAMPU', 'CONDICIONADOR', 'SABONETE', 'PAPEL HIG', 'CREME DENTAL', 'PASTA DENT', 'ESCOVA DENT', 'FIO DENTAL', 'DESODORANTE', 'ABSORVENTE', 'FRALDA', 'LENCO', 'ALGODAO', 'COTONETE', 'BARBEAD', 'HIDRATANTE', 'PROTETOR SOLAR'],
  '🐾 Pet e outros': ['RACAO', 'PETISCO', 'AREIA GATO', 'PET '],
};
const NOMES_CATS_PRODUTO = [...Object.keys(CATS_PRODUTO), '📦 Outros'];

function normalizarTexto(t) {
  return t.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
}
function categorizarProduto(nome) {
  const n = ' ' + normalizarTexto(nome) + ' ';
  for (const [cat, chaves] of Object.entries(CATS_PRODUTO)) {
    if (chaves.some((c) => n.includes(c.length > 4 ? c : ' ' + c))) return cat;
  }
  return '📦 Outros';
}

// --- Interpretação do texto do cupom fiscal ---
function interpretarCupom(texto) {
  const itens = [];
  const ignorar = /CNPJ|CPF|CUPOM|FISCAL|EXTRATO|CAIXA|OPERADOR|ICMS|IMPOSTO|TRIBUT|FORMA|PAGAMENTO|PAGTO|DINHEIRO|CARTAO|CREDITO|DEBITO|PIX|TROCO|DESCONTO|SUBTOTAL|QTD|TOTAL DE ITENS|VOLUMES|OBRIGADO|VOLTE SEMPRE|SAT |NFC|CONSUMIDOR|ENDERECO|RUA |AV |FONE|TEL|DATA|HORA|DOC|COO|LOJA|PDV|VENDA|www|HTTP/i;
  const regPreco = /(\d{1,4}[.,]\d{2})\s*[A-Z]?\s*$/;
  let total = 0;
  for (let linha of texto.split('\n')) {
    linha = linha.replace(/\s+/g, ' ').trim();
    if (linha.length < 4) continue;
    const mTotal = linha.match(/^TOTAL\b.*?(\d{1,5}[.,]\d{2})/i);
    if (mTotal) { total = parseFloat(mTotal[1].replace(',', '.')); continue; }
    if (ignorar.test(linha)) continue;
    const m = linha.match(regPreco);
    if (!m) continue;
    const valor = parseFloat(m[1].replace(',', '.'));
    if (!(valor > 0) || valor > 9999) continue;
    let nome = linha.slice(0, m.index)
      .replace(/\b\d{7,14}\b/g, ' ')            // código de barras
      .replace(/^\s*\d{1,3}[\s.)-]+/, ' ')       // número do item
      .replace(/\b\d+([.,]\d+)?\s*(UN|KG|LT|L|PC|CX|G|ML)\b/gi, ' ')
      .replace(/\bX\s*\d+[.,]\d{2}\b/gi, ' ')    // "x 3,49"
      .replace(/[|_*#=~]+/g, ' ')
      .replace(/\s+/g, ' ').trim();
    if (nome.replace(/[^A-Za-zÀ-ú]/g, '').length < 3) continue;
    itens.push({ nome, valor, cat: categorizarProduto(nome) });
  }
  return { itens, total };
}

// --- Carregamento do Tesseract.js (OCR) sob demanda ---
let tesseractPronto = null;
function carregarTesseract() {
  if (!tesseractPronto) {
    tesseractPronto = new Promise((resolver, falhar) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
      s.onload = () => resolver(window.Tesseract);
      s.onerror = () => { tesseractPronto = null; falhar(new Error('Sem conexão para baixar o leitor de imagem.')); };
      document.head.appendChild(s);
    });
  }
  return tesseractPronto;
}

function redimensionar(img, maxLado, qualidade) {
  const escala = Math.min(1, maxLado / Math.max(img.width, img.height));
  const cv = document.createElement('canvas');
  cv.width = Math.round(img.width * escala);
  cv.height = Math.round(img.height * escala);
  cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
  return cv.toDataURL('image/jpeg', qualidade);
}

let notaEmRevisao = null; // { itens, img, totalLido }

async function processarFoto(arquivo) {
  const status = $('#ocr-status'), barra = $('#ocr-progresso'), txt = $('#ocr-texto');
  status.classList.remove('oculto');
  barra.style.width = '5%';
  txt.textContent = 'Abrindo a imagem...';
  try {
    const url = URL.createObjectURL(arquivo);
    const img = await new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(i); i.onerror = rej; i.src = url;
    });
    const imgOcr = redimensionar(img, 1800, 0.9);   // maior = melhor leitura
    const imgMini = redimensionar(img, 480, 0.6);   // miniatura para guardar
    URL.revokeObjectURL(url);

    txt.textContent = 'Baixando o leitor (só na primeira vez)...';
    const Tesseract = await carregarTesseract();
    txt.textContent = 'Lendo a nota fiscal... 🔎';
    const resultado = await Tesseract.recognize(imgOcr, 'por', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          barra.style.width = Math.round(10 + m.progress * 88) + '%';
          txt.textContent = `Lendo a nota fiscal... ${Math.round(m.progress * 100)}%`;
        }
      },
    });
    barra.style.width = '100%';
    const { itens, total } = interpretarCupom(resultado.data.text);
    status.classList.add('oculto');
    if (!itens.length) {
      alert('Não consegui identificar itens nessa foto. 😕\nDica: tire a foto de frente, com boa luz e a nota esticada.\nVocê também pode digitar os itens manualmente.');
      abrirRevisao([{ nome: '', valor: 0, cat: '📦 Outros' }], imgMini, 0);
      return;
    }
    abrirRevisao(itens, imgMini, total);
  } catch (erro) {
    status.classList.add('oculto');
    alert('Não foi possível ler a imagem: ' + erro.message);
  }
}

function abrirRevisao(itens, img, totalLido) {
  notaEmRevisao = { itens, img, totalLido };
  $('#revisao-nota').classList.remove('oculto');
  $('#nf-data').value = new Date().toISOString().slice(0, 10);
  if (perfilAtivo) $('#nf-perfil').value = perfilAtivo;
  const prev = $('#nf-preview');
  if (img) { prev.src = img; prev.classList.remove('oculto'); }
  else prev.classList.add('oculto');
  renderRevisao();
  $('#revisao-nota').scrollIntoView({ behavior: 'smooth' });
}

function renderRevisao() {
  const corpo = $('#tabela-revisao tbody');
  corpo.innerHTML = notaEmRevisao.itens.map((it, i) => `
    <tr>
      <td><input value="${escapar(it.nome)}" data-i="${i}" data-campo="nome" placeholder="Nome do item"></td>
      <td><select data-i="${i}" data-campo="cat">
        ${NOMES_CATS_PRODUTO.map((c) => `<option ${c === it.cat ? 'selected' : ''}>${c}</option>`).join('')}
      </select></td>
      <td class="dir"><input class="inp-valor" type="number" step="0.01" min="0" value="${it.valor || ''}" data-i="${i}" data-campo="valor"></td>
      <td><button class="btn-lixo" data-i="${i}" title="Remover item">✕</button></td>
    </tr>`).join('');

  corpo.querySelectorAll('input, select').forEach((el) => el.addEventListener('change', () => {
    const it = notaEmRevisao.itens[+el.dataset.i];
    it[el.dataset.campo] = el.dataset.campo === 'valor' ? (parseFloat(el.value) || 0) : el.value;
    if (el.dataset.campo === 'nome') { it.cat = categorizarProduto(el.value); renderRevisao(); return; }
    atualizarTotalRevisao();
  }));
  corpo.querySelectorAll('.btn-lixo').forEach((b) => b.addEventListener('click', () => {
    notaEmRevisao.itens.splice(+b.dataset.i, 1);
    renderRevisao();
  }));
  atualizarTotalRevisao();
}
function atualizarTotalRevisao() {
  const soma = notaEmRevisao.itens.reduce((s, it) => s + (it.valor || 0), 0);
  const dif = notaEmRevisao.totalLido && Math.abs(soma - notaEmRevisao.totalLido) > 0.02
    ? ` (total impresso na nota: ${fmtBRL(notaEmRevisao.totalLido)})` : '';
  $('#nf-total').textContent = 'Total: ' + fmtBRL(soma) + dif;
}

function salvarNota() {
  const itens = notaEmRevisao.itens.filter((it) => it.nome.trim() && it.valor > 0);
  if (!itens.length) { alert('Adicione pelo menos um item com nome e valor.'); return; }
  const total = itens.reduce((s, it) => s + it.valor, 0);
  const data = $('#nf-data').value || new Date().toISOString().slice(0, 10);
  const mercado = $('#nf-mercado').value.trim() || 'Mercado';
  const perfil = $('#nf-perfil').value;
  const lancId = novoId();
  dados.lancamentos.push({
    id: lancId, tipo: 'saida', desc: '🛒 ' + mercado, cat: 'Mercado',
    valor: +total.toFixed(2), data, perfil, pag: 'Nota do mercado',
  });
  dados.notas.push({ id: novoId(), data, mercado, perfil, total: +total.toFixed(2), img: notaEmRevisao.img, itens, lancId });
  try {
    salvar();
  } catch (e) {
    // localStorage cheio: guarda a nota sem a foto
    dados.notas[dados.notas.length - 1].img = null;
    salvar();
    alert('O armazenamento do navegador encheu, então a nota foi salva sem a foto (os itens foram mantidos).');
  }
  fecharRevisao();
  renderTudo();
  document.querySelector('[data-aba="mercado"]').click();
}
function fecharRevisao() {
  notaEmRevisao = null;
  $('#revisao-nota').classList.add('oculto');
  $('#nf-mercado').value = '';
  $('#nf-arquivo').value = '';
}

// --- Renderização da aba Mercado ---
function renderMercado() {
  const notasMes = dados.notas.filter((n) =>
    n.data.startsWith(mesRef) && (filtroPerfil === 'todos' || n.perfil === filtroPerfil));
  $('#mercado-mes').textContent = rotuloMes(mesRef) +
    (filtroPerfil === 'todos' ? ' · casal' : ' · ' + primeiroNome(filtroPerfil));

  // Gráfico: gasto por categoria de produto
  const alvo = $('#grafico-mercado');
  const porCat = {};
  notasMes.forEach((n) => n.itens.forEach((it) => { porCat[it.cat] = (porCat[it.cat] || 0) + it.valor; }));
  const itensCat = Object.entries(porCat).sort((a, b) => b[1] - a[1]);
  if (!itensCat.length) {
    alvo.innerHTML = '<p class="vazio">Nenhuma nota neste mês. Anexe a primeira! 🧾</p>';
  } else {
    const totalMes = itensCat.reduce((s, [, v]) => s + v, 0);
    const cores = coresSeries();
    alvo.innerHTML = itensCat.map(([cat, v], i) => {
      const pct = (v / totalMes) * 100;
      return `
        <div class="barra-cat cat-hover" data-cat="${escapar(cat)}" data-val="${v}" data-pct="${pct.toFixed(1)}">
          <div class="prog-info"><span>${escapar(cat)}</span><span>${fmtBRL(v)} · <strong>${fmtPct(pct)}</strong></span></div>
          <div class="progresso"><div style="width:${pct}%; background:${cores[i % 8]}"></div></div>
        </div>`;
    }).join('') + `<p class="dica" style="margin-top:8px">Total do mês em mercado: <strong>${fmtBRL(totalMes)}</strong></p>`;
    alvo.querySelectorAll('.cat-hover').forEach((el) => {
      el.addEventListener('mousemove', (ev) => mostrarTooltip(ev, `
        <strong>${el.dataset.cat}</strong>
        <div class="tt-linha">${fmtBRL(+el.dataset.val)} — ${el.dataset.pct.replace('.', ',')}% das compras do mês</div>
        <div class="tt-linha">Clique para ver os itens</div>`));
      el.addEventListener('mouseleave', esconderTooltip);
      el.addEventListener('click', () => { esconderTooltip(); modalCategoriaProduto(el.dataset.cat, notasMes); });
    });
  }

  // Lista de notas
  const lista = $('#lista-notas');
  const notasFiltro = dados.notas
    .filter((n) => filtroPerfil === 'todos' || n.perfil === filtroPerfil)
    .sort((a, b) => b.data.localeCompare(a.data));
  lista.innerHTML = notasFiltro.length ? notasFiltro.map((n) => {
    const cats = [...new Set(n.itens.map((it) => it.cat))].slice(0, 4);
    return `
      <div class="cartao cartao-item">
        <button class="btn-lixo remover" data-id="${n.id}" title="Excluir nota">🗑</button>
        <strong>🧾 ${escapar(n.mercado)}</strong><br>
        <small>${fmtData(n.data)} · ${escapar(primeiroNome(n.perfil))} · ${n.itens.length} itens</small>
        <div style="font-size:1.2rem; font-weight:700; margin-top:6px">${fmtBRL(n.total)}</div>
        <div class="mini-cats">${cats.map((c) => `<span class="chip-cat">${escapar(c)}</span>`).join('')}</div>
        ${n.img ? `<img class="nota-thumb" src="${n.img}" alt="Nota de ${escapar(n.mercado)}" data-id="${n.id}">` : ''}
        <div class="linha-botoes" style="margin-top:10px">
          <button class="btn-secundario ver-nota" data-id="${n.id}">👁 Ver itens</button>
        </div>
      </div>`;
  }).join('') : '<p class="vazio cartao">Nenhuma nota salva ainda.</p>';

  lista.querySelectorAll('.ver-nota').forEach((b) => b.addEventListener('click', () => modalNota(+b.dataset.id)));
  lista.querySelectorAll('.nota-thumb').forEach((im) => im.addEventListener('click', () => {
    const n = dados.notas.find((x) => x.id == im.dataset.id);
    abrirModal('🧾 ' + n.mercado + ' — ' + fmtData(n.data), `<img class="img-modal" src="${n.img}" alt="Nota fiscal">`);
  }));
  lista.querySelectorAll('.remover').forEach((b) => b.addEventListener('click', () => {
    if (confirm('Excluir esta nota? O lançamento correspondente em "Mercado" também será removido.')) {
      const n = dados.notas.find((x) => x.id == b.dataset.id);
      dados.notas = dados.notas.filter((x) => x.id != b.dataset.id);
      if (n && n.lancId) dados.lancamentos = dados.lancamentos.filter((l) => l.id !== n.lancId);
      salvar(); renderTudo();
    }
  }));
}

function modalNota(id) {
  const n = dados.notas.find((x) => x.id === id);
  if (!n) return;
  const porCat = {};
  n.itens.forEach((it) => { (porCat[it.cat] = porCat[it.cat] || []).push(it); });
  const corpo = Object.entries(porCat).map(([cat, its]) => `
    <p style="margin:10px 0 4px"><strong>${escapar(cat)}</strong> — ${fmtBRL(its.reduce((s, i) => s + i.valor, 0))}</p>
    ${its.map((it) => `<div class="ultimo-item"><span>${escapar(it.nome)}</span><span>${fmtBRL(it.valor)}</span></div>`).join('')}`).join('');
  abrirModal(`🧾 ${n.mercado} — ${fmtBRL(n.total)}`, corpo);
}
function modalCategoriaProduto(cat, notasMes) {
  const its = [];
  notasMes.forEach((n) => n.itens.forEach((it) => { if (it.cat === cat) its.push({ ...it, mercado: n.mercado, data: n.data }); }));
  const corpo = its.sort((a, b) => b.valor - a.valor).map((it) => `
    <div class="ultimo-item">
      <div>${escapar(it.nome)}<div class="quem">${fmtData(it.data)} · ${escapar(it.mercado)}</div></div>
      <strong>${fmtBRL(it.valor)}</strong>
    </div>`).join('');
  abrirModal(`${cat} — ${fmtBRL(its.reduce((s, i) => s + i.valor, 0))}`, corpo || '<p class="vazio">Nenhum item.</p>');
}

function configurarMercado() {
  const arquivo = $('#nf-arquivo');
  $('#btn-escolher-foto').addEventListener('click', () => arquivo.click());
  arquivo.addEventListener('change', () => { if (arquivo.files[0]) processarFoto(arquivo.files[0]); });

  const area = $('#upload-area');
  area.addEventListener('dragover', (e) => { e.preventDefault(); area.classList.add('arrastando'); });
  area.addEventListener('dragleave', () => area.classList.remove('arrastando'));
  area.addEventListener('drop', (e) => {
    e.preventDefault(); area.classList.remove('arrastando');
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith('image/')) processarFoto(f);
  });

  $('#btn-itens-manual').addEventListener('click', () =>
    abrirRevisao([{ nome: '', valor: 0, cat: '📦 Outros' }], null, 0));
  $('#btn-add-item').addEventListener('click', () => {
    notaEmRevisao.itens.push({ nome: '', valor: 0, cat: '📦 Outros' });
    renderRevisao();
  });
  $('#btn-salvar-nota').addEventListener('click', salvarNota);
  $('#btn-cancelar-nota').addEventListener('click', fecharRevisao);
  $('#nf-preview').addEventListener('click', () => {
    if (notaEmRevisao && notaEmRevisao.img)
      abrirModal('🧾 Foto da nota', `<img class="img-modal" src="${notaEmRevisao.img}" alt="Nota fiscal">`);
  });
}

// ==========================================================
// TRABALHO — registro de salários (bruto, líquido, FGTS)
// ==========================================================
const TIPOS_TRAB = { salario: '💼 Salário', ferias: '🏖 Férias', decimo: '🎁 13º' };

function renderTrabalho() {
  const lista = dados.salarios;

  // Cards de resumo por pessoa (somatória automática)
  const anoAtual = String(new Date().getFullYear());
  let cardsHtml = '';
  dados.perfis.forEach((p) => {
    const meus = lista.filter((s) => s.perfil === p.id).sort((a, b) => a.mes.localeCompare(b.mes));
    if (!meus.length) {
      cardsHtml += `<div class="card-resumo"><div class="rotulo"><span style="color:${p.cor}">●</span> ${escapar(primeiroNome(p.id))}</div>
        <div class="valor">—</div><div class="extra">nenhum registro ainda</div></div>`;
      return;
    }
    const salariosMensais = meus.filter((s) => s.tipo === 'salario');
    const atual = salariosMensais[salariosMensais.length - 1];
    const primeiro = salariosMensais[0];
    const evol = primeiro && primeiro.liquido > 0 ? ((atual.liquido - primeiro.liquido) / primeiro.liquido) * 100 : 0;
    const fgtsAcum = meus.reduce((s, x) => s + (x.fgts || 0), 0);
    const doAno = meus.filter((x) => x.mes.startsWith(anoAtual));
    const liqAno = doAno.reduce((s, x) => s + x.liquido, 0);
    const extrasAno = doAno.filter((x) => x.tipo !== 'salario');
    const liqExtras = extrasAno.reduce((s, x) => s + x.liquido, 0);
    cardsHtml += `
      <div class="card-resumo">
        <div class="rotulo"><span style="color:${p.cor}">●</span> ${escapar(primeiroNome(p.id))} · salário atual</div>
        <div class="valor">${atual ? fmtBRL(atual.liquido) : '—'}</div>
        <div class="extra">${!atual || !primeiro ? 'sem salário mensal registrado'
          : Math.abs(evol) < 0.05 ? 'sem variação desde ' + rotuloMes(primeiro.mes)
          : `<span class="${evol >= 0 ? 'delta-pos' : 'delta-neg'}">${evol >= 0 ? '▲' : '▼'} ${fmtPct(Math.abs(evol))}</span> desde ${rotuloMes(primeiro.mes)}`}</div>
      </div>
      <div class="card-resumo">
        <div class="rotulo"><span style="color:${p.cor}">●</span> ${escapar(primeiroNome(p.id))} · FGTS somado</div>
        <div class="valor pos">${fmtBRL(fgtsAcum)}</div>
        <div class="extra">${meus.length} ${meus.length === 1 ? 'registro' : 'registros'} (salário + férias + 13º)</div>
      </div>
      <div class="card-resumo">
        <div class="rotulo"><span style="color:${p.cor}">●</span> ${escapar(primeiroNome(p.id))} · líquido em ${anoAtual}</div>
        <div class="valor">${fmtBRL(liqAno)}</div>
        <div class="extra">soma automática do ano</div>
      </div>
      <div class="card-resumo">
        <div class="rotulo"><span style="color:${p.cor}">●</span> ${escapar(primeiroNome(p.id))} · férias + 13º em ${anoAtual}</div>
        <div class="valor pos">${fmtBRL(liqExtras)}</div>
        <div class="extra">${extrasAno.length ? extrasAno.map((x) => TIPOS_TRAB[x.tipo]).join(' · ') : 'nada recebido ainda'}</div>
      </div>`;
  });
  $('#trabalho-cards').innerHTML = cardsHtml;

  renderGraficoTrabalho();

  // Histórico (mais recente primeiro) com variação vs mês anterior da mesma pessoa
  const corpo = $('#tabela-trabalho tbody');
  const ordenada = [...lista].sort((a, b) => b.mes.localeCompare(a.mes) || a.perfil.localeCompare(b.perfil));
  corpo.innerHTML = ordenada.map((s) => {
    let variacao = '—';
    if (s.tipo === 'salario') {
      const anteriores = lista.filter((x) => x.perfil === s.perfil && x.tipo === 'salario' && x.mes < s.mes)
        .sort((a, b) => b.mes.localeCompare(a.mes));
      const ant = anteriores[0];
      variacao = '<span class="chip-cat">primeiro registro</span>';
      if (ant && ant.liquido > 0) {
        const v = ((s.liquido - ant.liquido) / ant.liquido) * 100;
        variacao = Math.abs(v) < 0.05 ? '='
          : `<span class="${v > 0 ? 'delta-pos' : 'delta-neg'}">${v > 0 ? '▲' : '▼'} ${fmtPct(Math.abs(v))}</span>`;
      }
    }
    return `
      <tr>
        <td>${rotuloMes(s.mes)}</td>
        <td>${escapar(primeiroNome(s.perfil))}</td>
        <td><span class="chip-cat">${TIPOS_TRAB[s.tipo] || TIPOS_TRAB.salario}</span></td>
        <td class="dir">${fmtBRL(s.bruto)}</td>
        <td class="dir val-neg">− ${fmtBRL(Math.max(s.bruto - s.liquido, 0))}</td>
        <td class="dir val-pos">${fmtBRL(s.liquido)}</td>
        <td class="dir">${fmtBRL(s.fgts || 0)}</td>
        <td>${variacao}</td>
        <td>${escapar(s.obs || '')}</td>
        <td><button class="btn-lixo" data-id="${s.id}" title="Excluir">🗑</button></td>
      </tr>`;
  }).join('') || '<tr><td colspan="10" class="vazio">Nenhum salário registrado ainda.</td></tr>';

  const fgtsTotal = lista.reduce((s, x) => s + (x.fgts || 0), 0);
  $('#trabalho-resumo').textContent = lista.length
    ? `${lista.length} registros · FGTS do casal somado: ${fmtBRL(fgtsTotal)}` : '';

  corpo.querySelectorAll('.btn-lixo').forEach((b) => b.addEventListener('click', () => {
    if (confirm('Excluir este registro de salário?')) {
      dados.salarios = dados.salarios.filter((s) => s.id != b.dataset.id);
      salvar(); renderTudo();
    }
  }));
}

// Gráfico de linhas: evolução do salário líquido de cada um
function renderGraficoTrabalho() {
  const alvo = $('#grafico-trabalho');
  const lista = dados.salarios;
  if (!lista.length) { alvo.innerHTML = '<p class="vazio">Registre os salários para ver a evolução aqui. 📈</p>'; return; }
  const meses = [...new Set(lista.map((s) => s.mes))].sort();

  const W = 560, H = 250, mx = 56, my = 16, base = H - 32;
  const vals = lista.map((s) => s.liquido);
  const vMax = Math.max(...vals) * 1.06;
  const vMin = Math.max(Math.min(...vals) * 0.92, 0);
  const faixa = vMax - vMin || 1;
  const x = (i) => meses.length === 1 ? (mx + (W - mx) / 2) : mx + (i / (meses.length - 1)) * (W - mx - 16);
  const y = (v) => my + (1 - (v - vMin) / faixa) * (base - my);

  let grade = '';
  for (let g = 0; g <= 3; g++) {
    const v = vMin + (faixa / 3) * g;
    grade += `<line x1="${mx}" y1="${y(v)}" x2="${W - 10}" y2="${y(v)}" stroke="var(--grade)"/>
      <text x="${mx - 6}" y="${y(v) + 4}" text-anchor="end" font-size="10" fill="var(--texto-mudo)">${(v / 1000).toFixed(1).replace('.', ',')} mil</text>`;
  }
  let eixoX = '';
  meses.forEach((m, i) => {
    eixoX += `<text x="${x(i)}" y="${H - 10}" text-anchor="middle" font-size="10" fill="var(--texto-mudo)">${rotuloMes(m)}</text>`;
  });

  let linhas = '', pontos = '';
  dados.perfis.forEach((p) => {
    // linha: só o salário mensal (férias/13º viram marcadores avulsos)
    const meus = meses.map((m) => lista.find((s) => s.perfil === p.id && s.mes === m && s.tipo === 'salario') || null);
    let caminho = '', ligado = false;
    meus.forEach((s, i) => {
      if (!s) { ligado = false; return; }
      caminho += `${ligado ? 'L' : 'M'} ${x(i).toFixed(1)} ${y(s.liquido).toFixed(1)} `;
      ligado = true;
      pontos += `<circle class="marca-hover" cx="${x(i).toFixed(1)}" cy="${y(s.liquido).toFixed(1)}" r="5.5"
        fill="${p.cor}" stroke="var(--superficie)" stroke-width="2"
        data-tipo="salario" data-nome="${escapar(primeiroNome(p.id))}" data-mes="${s.mes}" data-bruto="${s.bruto}"
        data-liq="${s.liquido}" data-fgts="${s.fgts || 0}" data-obs="${escapar(s.obs || '')}"/>`;
      if (s.obs) pontos += `<text x="${x(i).toFixed(1)}" y="${(y(s.liquido) - 12).toFixed(1)}" text-anchor="middle" font-size="11">⭐</text>`;
    });
    if (caminho) linhas += `<path d="${caminho}" fill="none" stroke="${p.cor}" stroke-width="2.5" stroke-linejoin="round"/>`;

    // marcadores de férias e 13º
    lista.filter((s) => s.perfil === p.id && s.tipo !== 'salario').forEach((s) => {
      const i = meses.indexOf(s.mes);
      if (i < 0) return;
      pontos += `<text class="marca-hover" x="${x(i).toFixed(1)}" y="${(y(s.liquido) + 5).toFixed(1)}" text-anchor="middle" font-size="15"
        data-tipo="${s.tipo}" data-nome="${escapar(primeiroNome(p.id))}" data-mes="${s.mes}" data-bruto="${s.bruto}"
        data-liq="${s.liquido}" data-fgts="${s.fgts || 0}" data-obs="${escapar(s.obs || '')}">${s.tipo === 'ferias' ? '🏖' : '🎁'}</text>`;
    });
  });

  alvo.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Evolução do salário líquido">
      ${grade}${linhas}${pontos}${eixoX}
    </svg>
    <div class="legenda">
      ${dados.perfis.map((p) => `<span class="legenda-item"><span class="legenda-cor" style="background:${p.cor}"></span> ${escapar(primeiroNome(p.id))}</span>`).join('')}
      <span class="legenda-item">⭐ = aumento/promoção · 🏖 = férias · 🎁 = 13º</span>
    </div>`;

  alvo.querySelectorAll('.marca-hover').forEach((el) => {
    el.addEventListener('mousemove', (ev) => mostrarTooltip(ev, `
      <strong>${el.dataset.nome} — ${TIPOS_TRAB[el.dataset.tipo] || ''} ${rotuloMes(el.dataset.mes)}</strong>
      <div class="tt-linha">Bruto: ${fmtBRL(+el.dataset.bruto)}</div>
      <div class="tt-linha">Descontos: ${fmtBRL(Math.max(+el.dataset.bruto - +el.dataset.liq, 0))}</div>
      <div class="tt-linha">Líquido: ${fmtBRL(+el.dataset.liq)}</div>
      <div class="tt-linha">FGTS: ${fmtBRL(+el.dataset.fgts)}</div>
      ${el.dataset.obs ? `<div class="tt-linha">📝 ${el.dataset.obs}</div>` : ''}`));
    el.addEventListener('mouseleave', esconderTooltip);
  });
}

function configurarTrabalho() {
  // FGTS sugerido automaticamente: 8% do bruto (até a pessoa digitar manualmente)
  $('#tb-bruto').addEventListener('input', () => {
    const f = $('#tb-fgts');
    if (!f.dataset.manual) {
      const b = parseFloat($('#tb-bruto').value);
      f.value = b > 0 ? (b * 0.08).toFixed(2) : '';
    }
  });
  $('#tb-fgts').addEventListener('input', () => { $('#tb-fgts').dataset.manual = '1'; });

  $('#form-trabalho').addEventListener('submit', (e) => {
    e.preventDefault();
    const perfil = $('#tb-perfil').value;
    const tipo = $('#tb-tipo').value;
    const mes = $('#tb-mes').value;
    const bruto = parseFloat($('#tb-bruto').value);
    const liquido = parseFloat($('#tb-liquido').value);
    const fgts = parseFloat($('#tb-fgts').value) || +(bruto * 0.08).toFixed(2);
    if (liquido > bruto) { alert('O valor líquido não pode ser maior que o bruto. Confira os valores.'); return; }
    const existente = dados.salarios.find((s) => s.perfil === perfil && s.mes === mes && s.tipo === tipo);
    if (existente) {
      if (!confirm(`Já existe ${TIPOS_TRAB[tipo]} de ${primeiroNome(perfil)} em ${rotuloMes(mes)}. Substituir?`)) return;
      dados.salarios = dados.salarios.filter((s) => s !== existente);
    }
    dados.salarios.push({ id: novoId(), perfil, tipo, mes, bruto, liquido, fgts, obs: $('#tb-obs').value.trim() });
    salvar();
    $('#form-trabalho').reset();
    delete $('#tb-fgts').dataset.manual;
    $('#tb-mes').value = new Date().toISOString().slice(0, 7);
    if (perfilAtivo) $('#tb-perfil').value = perfilAtivo;
    renderTudo();
  });
}

// ==========================================================
// IMPORTAÇÃO DE EXTRATO (CSV / OFX)
// ==========================================================
const CATS_EXTRATO = {
  'Mercado': ['MERCADO', 'SUPERMERC', 'ATACAD', 'CARREFOUR', 'ASSAI', 'BISTEK', 'ANGELONI', 'HORTIFRUTI'],
  'Transporte': ['POSTO', 'COMBUST', 'GASOLINA', 'UBER', '99APP', '99POP', 'ESTACIONAMENTO', 'PEDAGIO', 'ONIBUS'],
  'Saúde': ['FARMACIA', 'DROGARIA', 'DROGASIL', 'PANVEL', 'HOSPITAL', 'CLINICA', 'LABORAT', 'UNIMED'],
  'Lazer': ['RESTAURANTE', 'LANCHONETE', 'IFOOD', 'CINEMA', 'NETFLIX', 'SPOTIFY', 'BAR ', 'PIZZARIA', 'HAMBURG'],
  'Contas (água/luz/internet)': ['ENERGIA', 'CELESC', 'COPEL', 'CEMIG', 'ENEL', 'SANEAMENTO', 'CASAN', 'SANEPAR', 'VIVO', 'CLARO', 'TIM ', 'INTERNET', 'TELEFON'],
  'Aluguel': ['ALUGUEL', 'IMOBILIARIA', 'CONDOMINIO'],
  'Educação': ['ESCOLA', 'FACULDADE', 'UNIVERSIDADE', 'CURSO', 'LIVRARIA'],
  'Cartão de crédito': ['FATURA', 'PAGTO CARTAO', 'PAGAMENTO CARTAO'],
};
function categorizarExtrato(desc, tipo) {
  const n = normalizarTexto(desc);
  if (tipo === 'entrada') return /SALARIO|PROVENTO|PAGAMENTO REF|REMUNERAC|FOLHA/.test(n) ? 'Salário' : 'Outros';
  for (const [cat, chaves] of Object.entries(CATS_EXTRATO)) {
    if (chaves.some((c) => n.includes(c))) return cat;
  }
  return 'Outros';
}
function parseValorExtrato(c) {
  if (!/\d/.test(c) || /\d{2}[\/\-]\d{2}/.test(c)) return NaN;
  let t = c.replace(/[R$\s]/g, '');
  if (/,\d{1,2}$/.test(t)) t = t.replace(/\./g, '').replace(',', '.'); // formato brasileiro 1.234,56
  else t = t.replace(/,/g, '');
  if (!/^[+-]?\d+(\.\d+)?$/.test(t)) return NaN;
  return parseFloat(t);
}
function interpretarOFX(txt) {
  const trans = [];
  txt.split(/<STMTTRN>/i).slice(1).forEach((b) => {
    const pega = (tag) => {
      const m = b.match(new RegExp('<' + tag + '>([^<\r\n]+)', 'i'));
      return m ? m[1].trim() : '';
    };
    const dt = pega('DTPOSTED').slice(0, 8);
    const valor = parseFloat(pega('TRNAMT').replace(',', '.'));
    const desc = pega('MEMO') || pega('NAME') || 'Movimentação';
    if (dt.length === 8 && isFinite(valor) && valor !== 0) {
      trans.push({
        data: `${dt.slice(0, 4)}-${dt.slice(4, 6)}-${dt.slice(6, 8)}`,
        valor: Math.abs(valor), tipo: valor > 0 ? 'entrada' : 'saida', desc,
      });
    }
  });
  return trans;
}
function interpretarCSVExtrato(txt) {
  const trans = [];
  const sep = ((txt.match(/;/g) || []).length >= (txt.match(/,/g) || []).length) ? ';' : ',';
  txt.split(/\r?\n/).forEach((linha) => {
    if (!linha.trim()) return;
    const celulas = linha.split(sep).map((c) => c.replace(/^"|"$/g, '').trim());
    let data = null, valor = null; const textos = [];
    celulas.forEach((c) => {
      let m = c.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
      if (m && !data) { data = `${m[3]}-${m[2]}-${m[1]}`; return; }
      m = c.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (m && !data) { data = `${m[1]}-${m[2]}-${m[3]}`; return; }
      if (valor === null) {
        const v = parseValorExtrato(c);
        if (isFinite(v)) { valor = v; return; }
      }
      if (/[A-Za-zÀ-ú]{3,}/.test(c)) textos.push(c);
    });
    if (data && valor !== null && isFinite(valor) && valor !== 0) {
      trans.push({
        data, valor: Math.abs(valor), tipo: valor > 0 ? 'entrada' : 'saida',
        desc: (textos.join(' ') || 'Movimentação').slice(0, 80),
      });
    }
  });
  return trans;
}

let extratoPrevia = [];
function processarExtrato(arquivo) {
  const leitor = new FileReader();
  leitor.onload = () => {
    const txt = String(leitor.result);
    const trans = /<OFX|<STMTTRN/i.test(txt) ? interpretarOFX(txt) : interpretarCSVExtrato(txt);
    if (!trans.length) {
      alert('Não consegui entender esse arquivo. 😕\nExporte o extrato em CSV ou OFX pelo app do banco e tente de novo.');
      return;
    }
    trans.forEach((t) => {
      t.cat = categorizarExtrato(t.desc, t.tipo);
      t.dup = dados.lancamentos.some((l) => l.data === t.data && Math.abs(l.valor - t.valor) < 0.005);
      t.incluir = !t.dup;
    });
    extratoPrevia = trans;
    renderExtratoPrevia();
  };
  leitor.readAsText(arquivo);
}
function renderExtratoPrevia() {
  const alvo = $('#extrato-previa');
  if (!extratoPrevia.length) { alvo.innerHTML = ''; return; }
  alvo.innerHTML = `
    <div class="tabela-scroll"><table class="tabela">
      <thead><tr><th></th><th>Data</th><th>Descrição</th><th>Categoria</th><th class="dir">Valor</th></tr></thead>
      <tbody>${extratoPrevia.map((t, i) => `
        <tr class="${t.dup ? 'pausado' : ''}">
          <td><input type="checkbox" data-i="${i}" class="ext-check" ${t.incluir ? 'checked' : ''}></td>
          <td>${fmtData(t.data)}</td>
          <td>${escapar(t.desc)}${t.dup ? ' <span class="chip-cat">possível duplicado</span>' : ''}</td>
          <td><select data-i="${i}" class="ext-cat">
            ${(t.tipo === 'entrada' ? CATEGORIAS_ENTRADA : dados.categorias).map((c) => `<option ${c === t.cat ? 'selected' : ''}>${c}</option>`).join('')}
          </select></td>
          <td class="dir ${t.tipo === 'entrada' ? 'val-pos' : 'val-neg'}">${t.tipo === 'entrada' ? '+' : '−'} ${fmtBRL(t.valor)}</td>
        </tr>`).join('')}
      </tbody>
    </table></div>
    <div class="revisao-rodape">
      <div class="campo" style="max-width:220px"><label>Lançar para</label><select id="ext-perfil">
        ${dados.perfis.map((p) => `<option value="${p.id}" ${p.id === perfilAtivo ? 'selected' : ''}>${escapar(p.nome)}</option>`).join('')}
      </select></div>
      <div class="linha-botoes">
        <button id="btn-ext-cancelar" class="btn-secundario" type="button">Cancelar</button>
        <button id="btn-ext-importar" class="btn-principal" type="button">📥 Importar selecionados</button>
      </div>
    </div>`;
  alvo.querySelectorAll('.ext-check').forEach((c) => c.addEventListener('change', () => { extratoPrevia[+c.dataset.i].incluir = c.checked; }));
  alvo.querySelectorAll('.ext-cat').forEach((s) => s.addEventListener('change', () => { extratoPrevia[+s.dataset.i].cat = s.value; }));
  $('#btn-ext-cancelar').addEventListener('click', () => { extratoPrevia = []; alvo.innerHTML = ''; $('#ext-arquivo').value = ''; });
  $('#btn-ext-importar').addEventListener('click', () => {
    const perfil = $('#ext-perfil').value;
    const escolhidos = extratoPrevia.filter((t) => t.incluir);
    if (!escolhidos.length) { alert('Marque pelo menos uma movimentação.'); return; }
    escolhidos.forEach((t) => dados.lancamentos.push({
      id: novoId(), tipo: t.tipo, desc: t.desc, cat: t.cat, valor: t.valor, data: t.data, perfil, pag: 'Extrato importado',
    }));
    salvar();
    extratoPrevia = []; alvo.innerHTML = ''; $('#ext-arquivo').value = '';
    alert(`${escolhidos.length} lançamentos importados! ✅`);
    renderTudo();
  });
}

// ==========================================================
// AVISOS DE FATURAS (dashboard)
// ==========================================================
function avisosFaturas() {
  const avisos = [];
  const hoje0 = new Date(); hoje0.setHours(0, 0, 0, 0);
  const diasAte = (diaAlvo) => {
    const ult = (a, m) => new Date(a, m + 1, 0).getDate();
    let d = new Date(hoje0.getFullYear(), hoje0.getMonth(), Math.min(diaAlvo, ult(hoje0.getFullYear(), hoje0.getMonth())));
    if (d < hoje0) d = new Date(hoje0.getFullYear(), hoje0.getMonth() + 1, Math.min(diaAlvo, ult(hoje0.getFullYear(), hoje0.getMonth() + 1)));
    return Math.round((d - hoje0) / 86400000);
  };
  const quando = (n) => n === 0 ? 'HOJE' : n === 1 ? 'amanhã' : `em ${n} dias`;
  dados.cartoes.forEach((c) => {
    const f = diasAte(c.fecha);
    if (f <= 5) avisos.push(`💳 ${c.nome} fecha ${quando(f)}`);
    const v = diasAte(c.vence);
    if (v <= 5) avisos.push(`💰 Fatura ${c.nome} vence ${quando(v)}`);
  });
  return avisos;
}

// ==========================================================
// RELATÓRIO DO MÊS (imprimir / salvar em PDF)
// ==========================================================
function gerarRelatorio() {
  const lanc = lancDoMes(mesRef, 'todos');
  const entradas = soma(lanc.filter((l) => l.tipo === 'entrada'));
  const saidas = soma(lanc.filter((l) => l.tipo === 'saida'));
  const porCat = {};
  lanc.filter((l) => l.tipo === 'saida').forEach((l) => { porCat[l.cat] = (porCat[l.cat] || 0) + l.valor; });
  const cats = Object.entries(porCat).sort((a, b) => b[1] - a[1]);
  const dividas = [...dados.emprestimos.map((e) => ({ ...e, ic: 'Empréstimo' })), ...dados.crediarios.map((c) => ({ ...c, ic: 'Crediário' }))];

  $('#relatorio').innerHTML = `
    <h1>💰 Controle Financeiro Brum</h1>
    <p class="rel-sub">Relatório de ${rotuloMes(mesRef)} — gerado em ${fmtData(new Date().toISOString().slice(0, 10))}</p>
    <div class="rel-kpis">
      <div class="rel-kpi"><small>Entradas</small><strong>${fmtBRL(entradas)}</strong></div>
      <div class="rel-kpi"><small>Saídas</small><strong>${fmtBRL(saidas)}</strong></div>
      <div class="rel-kpi"><small>Saldo</small><strong>${fmtBRL(entradas - saidas)}</strong></div>
      <div class="rel-kpi"><small>Investido (total)</small><strong>${fmtBRL(soma(dados.investimentos))}</strong></div>
    </div>
    <h2>Saídas por categoria</h2>
    <table><thead><tr><th>Categoria</th><th class="dir">Valor</th><th class="dir">% das saídas</th></tr></thead><tbody>
      ${cats.map(([c, v]) => `<tr><td>${escapar(c)}</td><td class="dir">${fmtBRL(v)}</td><td class="dir">${saidas > 0 ? fmtPct((v / saidas) * 100) : '—'}</td></tr>`).join('') || '<tr><td colspan="3">Sem saídas no mês.</td></tr>'}
    </tbody></table>
    <h2>Lançamentos do mês (${lanc.length})</h2>
    <table><thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Quem</th><th class="dir">Valor</th></tr></thead><tbody>
      ${[...lanc].sort((a, b) => a.data.localeCompare(b.data)).map((l) => `
        <tr><td>${fmtData(l.data)}</td><td>${escapar(l.desc)}</td><td>${escapar(l.cat)}</td>
        <td>${escapar(primeiroNome(l.perfil))}</td><td class="dir">${l.tipo === 'entrada' ? '+' : '−'} ${fmtBRL(l.valor)}</td></tr>`).join('')}
    </tbody></table>
    ${dividas.length ? `<h2>Dívidas em aberto</h2>
    <table><thead><tr><th>Tipo</th><th>Descrição</th><th class="dir">Pago</th><th class="dir">Restante</th></tr></thead><tbody>
      ${dividas.map((d) => `<tr><td>${d.ic}</td><td>${escapar(d.desc)}</td><td class="dir">${fmtBRL(d.pago)}</td><td class="dir">${fmtBRL(Math.max(d.total - d.pago, 0))}</td></tr>`).join('')}
    </tbody></table>` : ''}`;

  document.body.classList.add('imprimindo');
  window.print();
}

// ==========================================================
// COMPARATIVO ANUAL
// ==========================================================
function renderAnual() {
  const sel = $('#anual-ano');
  const anoAtualStr = String(new Date().getFullYear());
  const anos = [...new Set(dados.lancamentos.map((l) => l.data.slice(0, 4)))].sort().reverse();
  if (!anos.includes(anoAtualStr)) anos.unshift(anoAtualStr);
  const escolhido = anos.includes(sel.value) ? sel.value : anoAtualStr;
  sel.innerHTML = anos.map((a) => `<option ${a === escolhido ? 'selected' : ''}>${a}</option>`).join('');

  const doAno = dados.lancamentos.filter((l) =>
    l.data.startsWith(escolhido) && (filtroPerfil === 'todos' || l.perfil === filtroPerfil));
  const entradas = soma(doAno.filter((l) => l.tipo === 'entrada'));
  const saidas = soma(doAno.filter((l) => l.tipo === 'saida'));

  const porMes = [];
  for (let m = 1; m <= 12; m++) {
    const ym = `${escolhido}-${String(m).padStart(2, '0')}`;
    const ml = doAno.filter((l) => l.data.startsWith(ym));
    porMes.push({ ym, ent: soma(ml.filter((l) => l.tipo === 'entrada')), sai: soma(ml.filter((l) => l.tipo === 'saida')), tem: ml.length > 0 });
  }
  const comMov = porMes.filter((m) => m.tem);
  const melhor = comMov.length ? comMov.reduce((a, b) => (a.ent - a.sai) >= (b.ent - b.sai) ? a : b) : null;
  const pior = comMov.length ? comMov.reduce((a, b) => (a.ent - a.sai) <= (b.ent - b.sai) ? a : b) : null;

  const dividasRestante = [...dados.emprestimos, ...dados.crediarios].reduce((s, e) => s + Math.max(e.total - e.pago, 0), 0);
  const patrimonioBase = soma(dados.investimentos) - dividasRestante;
  const patrimonio = cofreLiberado ? patrimonioBase + saldoCofre() : patrimonioBase;

  $('#anual-cards').innerHTML = `
    <div class="card-resumo"><div class="rotulo">⬆ Entradas em ${escolhido}</div><div class="valor pos">${fmtBRL(entradas)}</div></div>
    <div class="card-resumo"><div class="rotulo">⬇ Saídas em ${escolhido}</div><div class="valor neg">${fmtBRL(saidas)}</div></div>
    <div class="card-resumo"><div class="rotulo">💼 Saldo do ano</div><div class="valor ${entradas - saidas >= 0 ? 'pos' : 'neg'}">${fmtBRL(entradas - saidas)}</div>
      <div class="extra">${entradas > 0 ? fmtPct(((entradas - saidas) / entradas) * 100) + ' economizado' : '—'}</div></div>
    <div class="card-resumo"><div class="rotulo">🏆 Melhor mês</div><div class="valor pos">${melhor ? rotuloMes(melhor.ym) : '—'}</div>
      <div class="extra">${melhor ? 'saldo de ' + fmtBRL(melhor.ent - melhor.sai) : ''}</div></div>
    <div class="card-resumo"><div class="rotulo">📉 Mês mais apertado</div><div class="valor neg">${pior ? rotuloMes(pior.ym) : '—'}</div>
      <div class="extra">${pior ? 'saldo de ' + fmtBRL(pior.ent - pior.sai) : ''}</div></div>
    <div class="card-resumo"><div class="rotulo">🏦 Patrimônio (investido − dívidas)</div>
      <div class="valor ${patrimonio >= 0 ? 'pos' : 'neg'}">${fmtBRL(patrimonio)}</div>
      <div class="extra">${cofreLiberado ? 'incluindo o cofre' : 'sem o cofre (🔒 bloqueado)'}</div></div>`;

  // Barras de saldo mês a mês
  const alvo = $('#anual-barras');
  const maxAbs = Math.max(...porMes.map((m) => Math.abs(m.ent - m.sai)), 1);
  const W = 560, H = 240, mx = 50, meio = (H - 30) / 2 + 10;
  const lb = (W - mx - 10) / 12 - 8;
  let barras = '', eixo = '';
  porMes.forEach((m, i) => {
    const saldo = m.ent - m.sai;
    const h = Math.abs(saldo) / maxAbs * (meio - 16);
    const x0 = mx + i * ((W - mx - 10) / 12) + 4;
    if (m.tem) {
      barras += `<rect class="marca-hover" x="${x0}" y="${saldo >= 0 ? meio - h : meio}" width="${lb}" height="${Math.max(h, 2)}" rx="3"
        fill="${saldo >= 0 ? '#0ca30c' : '#d03b3b'}" data-ym="${m.ym}" data-ent="${m.ent}" data-sai="${m.sai}"/>`;
    }
    eixo += `<text x="${x0 + lb / 2}" y="${H - 8}" text-anchor="middle" font-size="9" fill="var(--texto-mudo)">${NOMES_MES[i]}</text>`;
  });
  alvo.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Saldo mês a mês do ano">
      <line x1="${mx}" y1="${meio}" x2="${W - 8}" y2="${meio}" stroke="var(--texto-mudo)" stroke-dasharray="3 3"/>
      ${barras}${eixo}
    </svg>`;
  alvo.querySelectorAll('rect').forEach((el) => {
    el.addEventListener('mousemove', (ev) => mostrarTooltip(ev, `
      <strong>${rotuloMes(el.dataset.ym)}</strong>
      <div class="tt-linha">Entradas: ${fmtBRL(+el.dataset.ent)}</div>
      <div class="tt-linha">Saídas: ${fmtBRL(+el.dataset.sai)}</div>
      <div class="tt-linha">Saldo: ${fmtBRL(+el.dataset.ent - +el.dataset.sai)}</div>`));
    el.addEventListener('mouseleave', esconderTooltip);
  });

  // Categorias do ano
  const porCat = {};
  doAno.filter((l) => l.tipo === 'saida').forEach((l) => { porCat[l.cat] = (porCat[l.cat] || 0) + l.valor; });
  const cats = Object.entries(porCat).sort((a, b) => b[1] - a[1]);
  const cores = coresSeries();
  $('#anual-categorias').innerHTML = cats.length ? cats.map(([cat, v], i) => `
    <div class="barra-cat">
      <div class="prog-info"><span>${escapar(cat)}</span><span>${fmtBRL(v)} · <strong>${fmtPct((v / saidas) * 100)}</strong></span></div>
      <div class="progresso"><div style="width:${(v / cats[0][1]) * 100}%; background:${cores[i % 8]}"></div></div>
    </div>`).join('') : '<p class="vazio">Sem saídas neste ano.</p>';
}

// ==========================================================
// PIN DE ENTRADA
// ==========================================================
function renderPin() {
  const alvo = $('#pin-botoes');
  alvo.innerHTML = dados.pin
    ? `<span class="selo-status">🔐 PIN ativo</span>
       <button id="btn-pin-trocar" class="btn-secundario">🔑 Trocar PIN</button>
       <button id="btn-pin-remover" class="btn-perigo">Remover PIN</button>`
    : `<button id="btn-pin-criar" class="btn-principal">🔐 Criar PIN</button>`;
  const pedirNovo = async () => {
    const p1 = prompt('Crie um PIN de 4 a 6 números:');
    if (!p1) return null;
    if (!/^\d{4,6}$/.test(p1)) { alert('O PIN precisa ter de 4 a 6 números.'); return null; }
    const p2 = prompt('Digite o PIN de novo para confirmar:');
    if (p1 !== p2) { alert('Os PINs não conferem.'); return null; }
    return hashSenha('pin:' + p1);
  };
  const conferirAtual = async () => {
    const p = prompt('Digite o PIN atual:');
    if (p === null) return false;
    if (await hashSenha('pin:' + p) === dados.pin) return true;
    alert('PIN incorreto. ❌'); return false;
  };
  if ($('#btn-pin-criar')) $('#btn-pin-criar').addEventListener('click', async () => {
    const h = await pedirNovo();
    if (h) { dados.pin = h; salvar(); alert('PIN criado! 🔐 Será pedido sempre que abrir o site.'); renderPin(); }
  });
  if ($('#btn-pin-trocar')) $('#btn-pin-trocar').addEventListener('click', async () => {
    if (!(await conferirAtual())) return;
    const h = await pedirNovo();
    if (h) { dados.pin = h; salvar(); alert('PIN trocado! ✅'); }
  });
  if ($('#btn-pin-remover')) $('#btn-pin-remover').addEventListener('click', async () => {
    if (!(await conferirAtual())) return;
    dados.pin = null; salvar(); renderPin();
  });
}
function exigirPin() {
  return new Promise((res) => {
    const tela = $('#tela-pin'), campo = $('#pin-campo'), erro = $('#pin-erro');
    tela.classList.remove('oculto');
    campo.focus();
    campo.addEventListener('input', async () => {
      if (campo.value.length < 4) return;
      if (await hashSenha('pin:' + campo.value) === dados.pin) {
        tela.classList.add('oculto');
        campo.value = ''; erro.textContent = '';
        res();
      } else if (campo.value.length >= 6) {
        erro.textContent = 'PIN incorreto — tente de novo';
        campo.value = '';
      }
    });
  });
}

// ==========================================================
// SIMULADOR DE QUITAÇÃO
// ==========================================================
function preencherSimulador() {
  const sel = $('#sim-divida');
  const atual = sel.value;
  sel.innerHTML = '';
  [...dados.emprestimos.map((e) => ({ ...e, ic: '🤝' })), ...dados.crediarios.map((c) => ({ ...c, ic: '🧾' }))]
    .filter((d) => d.total - d.pago > 0.005)
    .forEach((d) => sel.appendChild(new Option(`${d.ic} ${d.desc} — falta ${fmtBRL(d.total - d.pago)}`, d.id)));
  if (atual && [...sel.options].some((o) => o.value === atual)) sel.value = atual;
}
function simularQuitacao() {
  const id = $('#sim-divida').value;
  const d = [...dados.emprestimos, ...dados.crediarios].find((x) => x.id == id);
  const mensal = parseFloat($('#sim-mensal').value);
  const extra = parseFloat($('#sim-extra').value) || 0;
  if (!d || !(mensal > 0)) { alert('Escolha a dívida e informe quanto paga por mês.'); return; }
  const restante = d.total - d.pago;
  const m1 = Math.ceil(restante / mensal);
  const m2 = Math.ceil(restante / (mensal + extra));
  const dataFim = (n) => {
    const dt = new Date(); dt.setMonth(dt.getMonth() + n);
    return rotuloMes(`${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`);
  };
  $('#sim-resultado').innerHTML = `
    <div class="sim-caixa">
      Pagando <strong>${fmtBRL(mensal)}</strong> por mês, <strong>${escapar(d.desc)}</strong> é quitado em
      <strong>${m1} ${m1 === 1 ? 'mês' : 'meses'}</strong> (${dataFim(m1)}).<br>
      ${extra > 0
        ? `Com <strong>+${fmtBRL(extra)}</strong> por mês: <strong>${m2} ${m2 === 1 ? 'mês' : 'meses'}</strong> (${dataFim(m2)})
           — termina <strong class="delta-pos">${m1 - m2} ${m1 - m2 === 1 ? 'mês' : 'meses'} antes</strong>! 🎉`
        : 'Preencha o valor extra para ver quanto tempo você ganharia pagando um pouco a mais.'}
    </div>`;
}

// ==========================================================
// SINCRONIZAÇÃO NA NUVEM (Supabase — código da família + senha)
// ==========================================================
const NUVEM_URL = 'https://jiefqjpvxbgzxyhufpib.supabase.co';
const NUVEM_CHAVE = 'sb_publishable_pC5Q0DLXbQdoJZlmr5pjiA_0qyH5doF';
const CHAVE_NUVEM = 'cfbrum-nuvem';
const CHAVE_SYNC_EM = 'cfbrum-sync-em';

let nuvem = null;
try { nuvem = JSON.parse(localStorage.getItem(CHAVE_NUVEM) || 'null'); } catch (e) { /* ignora */ }
let timerNuvem = null;

async function rpcNuvem(fn, corpo) {
  const r = await fetch(`${NUVEM_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: NUVEM_CHAVE, Authorization: 'Bearer ' + NUVEM_CHAVE },
    body: JSON.stringify(corpo),
  });
  const resp = await r.json().catch(() => null);
  if (!r.ok) throw new Error((resp && (resp.message || resp.hint)) || 'Falha na conexão com a nuvem');
  return resp;
}
function statusSync(txt, erro) {
  const el = $('#sync-status');
  if (el) { el.textContent = txt; el.style.color = erro ? 'var(--negativo)' : 'var(--texto-2)'; }
}
function agendarEnvioNuvem() {
  if (!nuvem) return;
  clearTimeout(timerNuvem);
  statusSync('salvando na nuvem...');
  timerNuvem = setTimeout(enviarParaNuvem, 1500);
}
async function enviarParaNuvem() {
  if (!nuvem) return;
  try {
    const quando = await rpcNuvem('cf_salvar', { fid: nuvem.fid, senha: nuvem.senha, novo: dados });
    localStorage.setItem(CHAVE_SYNC_EM, quando);
    statusSync('✅ sincronizado às ' + new Date(quando).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
  } catch (e) { statusSync('⚠️ ' + e.message, true); }
}
async function baixarDaNuvem() {
  if (!nuvem) return;
  try {
    statusSync('sincronizando...');
    const res = await rpcNuvem('cf_obter', { fid: nuvem.fid, senha: nuvem.senha });
    const localEm = localStorage.getItem(CHAVE_SYNC_EM) || '';
    if (res.dados && res.dados.perfis && res.atualizado > localEm) {
      dados = res.dados;
      localStorage.setItem(CHAVE, JSON.stringify(dados));
      localStorage.setItem(CHAVE_SYNC_EM, res.atualizado);
      if (perfilAtivo) renderTudo(); else renderLogin();
      statusSync('✅ dados atualizados da nuvem');
    } else {
      enviarParaNuvem(); // este aparelho está mais novo: envia
    }
  } catch (e) { statusSync('⚠️ ' + e.message, true); }
}

function renderSync() {
  const alvo = $('#sync-area');
  if (!alvo) return;
  if (!nuvem) {
    alvo.innerHTML = `
      <div class="linha-botoes">
        <button id="btn-sync-criar" class="btn-principal">☁️ Criar código da família</button>
        <button id="btn-sync-conectar" class="btn-secundario">🔗 Já tenho um código</button>
      </div>
      <p id="sync-status" class="dica" style="margin-top:8px">Este aparelho ainda não está sincronizado.</p>`;
    $('#btn-sync-criar').addEventListener('click', criarFamiliaNuvem);
    $('#btn-sync-conectar').addEventListener('click', conectarFamiliaNuvem);
  } else {
    alvo.innerHTML = `
      <p style="font-size:.85rem; margin-bottom:6px">Código da família conectado neste aparelho:</p>
      <div class="email-item" style="margin-bottom:10px">
        <span style="font-family:ui-monospace, monospace">${escapar(nuvem.fid)}</span>
        <button id="btn-sync-copiar" class="btn-lixo" title="Copiar código">📋</button>
      </div>
      <div class="linha-botoes">
        <button id="btn-sync-agora" class="btn-secundario">🔄 Sincronizar agora</button>
        <button id="btn-sync-sair" class="btn-perigo">Desconectar este aparelho</button>
      </div>
      <p id="sync-status" class="dica" style="margin-top:8px"></p>`;
    $('#btn-sync-copiar').addEventListener('click', () =>
      navigator.clipboard.writeText(nuvem.fid).then(() => alert('Código copiado! 📋')).catch(() => prompt('Copie o código:', nuvem.fid)));
    $('#btn-sync-agora').addEventListener('click', () => baixarDaNuvem());
    $('#btn-sync-sair').addEventListener('click', () => {
      if (confirm('Desconectar? Os dados continuam neste aparelho e na nuvem — só param de sincronizar.')) {
        nuvem = null;
        localStorage.removeItem(CHAVE_NUVEM);
        localStorage.removeItem(CHAVE_SYNC_EM);
        renderSync();
      }
    });
  }
}
async function criarFamiliaNuvem() {
  const s1 = prompt('Crie uma senha de sincronização (mínimo 4 caracteres) — vocês dois vão usá-la para conectar os aparelhos:');
  if (s1 === null) return;
  if (s1.length < 4) { alert('A senha precisa ter pelo menos 4 caracteres.'); return; }
  const s2 = prompt('Digite a senha de novo para confirmar:');
  if (s1 !== s2) { alert('As senhas não conferem.'); return; }
  try {
    const fid = await rpcNuvem('cf_criar_familia', { senha: s1 });
    nuvem = { fid, senha: s1 };
    localStorage.setItem(CHAVE_NUVEM, JSON.stringify(nuvem));
    renderSync();
    await enviarParaNuvem();
    alert('Pronto! ☁️ Este aparelho está sincronizado.\n\nCÓDIGO DA FAMÍLIA:\n' + fid +
      '\n\nNo outro aparelho: Configurações → Sincronização → "Já tenho um código", e use esse código com a senha que você criou.');
  } catch (e) { alert('Não deu certo: ' + e.message); }
}
async function conectarFamiliaNuvem() {
  const fid = (prompt('Cole o código da família:') || '').trim();
  if (!fid) return;
  const senha = prompt('Digite a senha de sincronização:');
  if (senha === null) return;
  try {
    const res = await rpcNuvem('cf_obter', { fid, senha });
    nuvem = { fid, senha };
    localStorage.setItem(CHAVE_NUVEM, JSON.stringify(nuvem));
    if (res.dados && res.dados.perfis &&
        confirm('Conectado! Este aparelho deve USAR OS DADOS DA NUVEM?\n\nOK = trazer os dados da nuvem para cá (recomendado no aparelho novo)\nCancelar = enviar os dados DESTE aparelho para a nuvem')) {
      dados = res.dados;
      localStorage.setItem(CHAVE, JSON.stringify(dados));
      localStorage.setItem(CHAVE_SYNC_EM, res.atualizado);
      if (perfilAtivo && !dados.perfis.some((p) => p.id === perfilAtivo)) sair();
      else renderTudo();
    } else {
      await enviarParaNuvem();
    }
    renderSync();
    alert('Aparelho conectado! ☁️ Agora tudo o que for lançado aqui aparece nos outros aparelhos conectados.');
  } catch (e) { alert('Não deu certo: ' + e.message); }
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
  renderMercado();
  renderCartoes();
  renderEmprestimos();
  renderCrediarios();
  renderInvestimentos();
  renderCofre();
  renderMetas();
  renderOrcamentos();
  renderTrabalho();
  renderConfig();
  renderRecorrentes();
  renderAnual();
  renderPin();
  renderSync();
  preencherSimulador();
}

// ---------- Inicialização ----------
async function iniciar() {
  aplicarTema(localStorage.getItem(CHAVE_TEMA) ||
    (matchMedia('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro'));

  // PIN de entrada (se configurado)
  if (dados.pin) {
    $('#tela-login').classList.add('oculto');
    await exigirPin();
    $('#tela-login').classList.remove('oculto');
  }

  materializarRecorrentes();

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
  configurarMercado();
  configurarTrabalho();
  $('#tb-mes').value = new Date().toISOString().slice(0, 7);
  configurarCofre();

  // Relatório do mês (imprimir / PDF)
  $('#btn-relatorio').addEventListener('click', gerarRelatorio);
  window.addEventListener('afterprint', () => document.body.classList.remove('imprimindo'));

  // Importação de extrato
  $('#btn-extrato').addEventListener('click', () => $('#ext-arquivo').click());
  $('#ext-arquivo').addEventListener('change', () => {
    if ($('#ext-arquivo').files[0]) processarExtrato($('#ext-arquivo').files[0]);
  });

  // Comparativo anual e simulador
  $('#anual-ano').addEventListener('change', renderAnual);
  $('#btn-simular').addEventListener('click', simularQuitacao);

  // Modo TV
  $('#btn-tv').addEventListener('click', alternarTV);
  document.addEventListener('fullscreenchange', () => {
    document.body.classList.toggle('modo-tv', !!document.fullscreenElement);
  });

  // CDI
  $('#btn-cdi-buscar').addEventListener('click', buscarCDI);
  $('#cdi-valor').addEventListener('change', renderInvestimentos);
  buscarCDI();

  // PWA: permite instalar como aplicativo e abrir sem internet
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  // Nuvem: baixa os dados mais recentes se este aparelho estiver conectado
  baixarDaNuvem();

  if (perfilAtivo && dados.perfis.some((p) => p.id === perfilAtivo)) entrar(perfilAtivo);
  else renderLogin();
}

document.addEventListener('DOMContentLoaded', iniciar);
