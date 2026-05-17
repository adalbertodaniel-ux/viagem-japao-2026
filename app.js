// ============================================
// TABI NO TOMODACHI - Japão 2026
// App principal: Firebase + UI
// ============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getFirestore, collection, doc, getDocs, setDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// ----- CONFIGURAÇÃO FIREBASE -----
const firebaseConfig = {
  apiKey: "AIzaSyCyAGPobkcOvH8X7EHIrMR-Fv8xob-Fr3A",
  authDomain: "viagem-japao-2026.firebaseapp.com",
  projectId: "viagem-japao-2026",
  storageBucket: "viagem-japao-2026.firebasestorage.app",
  messagingSenderId: "572181163847",
  appId: "1:572181163847:web:a67176ed501b2539ae2662"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ----- CONSTANTES -----
const SENHA_GERAL = "2004";
const SENHA_FIN = "4302";
const STORAGE_KEY = "tabi_japao_2026_auth";
const FIN_KEY = "tabi_japao_2026_fin_auth";

const CATEGORIAS = {
  atracao: { icon: "🎌", label: "Atração" },
  parque: { icon: "🎢", label: "Parque" },
  comida: { icon: "🍱", label: "Refeição" },
  transporte: { icon: "🚄", label: "Transporte" },
  voo: { icon: "✈️", label: "Voo" },
  hotel: { icon: "🏨", label: "Hotel" },
  compras: { icon: "🛍️", label: "Compras" },
  cultural: { icon: "⛩️", label: "Cultural" },
  show: { icon: "🎆", label: "Show" },
  outros: { icon: "📌", label: "Outros" }
};

const DIAS_VIAGEM = [
  { date: "2026-05-23", dow: "Sáb", title: "Embarque", hotel: "✈️ A bordo" },
  { date: "2026-05-24", dow: "Dom", title: "Conexão em Nova Iorque", hotel: "✈️ A bordo" },
  { date: "2026-05-25", dow: "Seg", title: "Chegada Tokyo", hotel: "Sotetsu Grand Fresa Takadanobaba" },
  { date: "2026-05-26", dow: "Ter", title: "teamLab + Geek Tokyo", hotel: "Sotetsu Grand Fresa Takadanobaba" },
  { date: "2026-05-27", dow: "Qua", title: "Tokyo DisneySea", hotel: "Sotetsu Grand Fresa Takadanobaba" },
  { date: "2026-05-28", dow: "Qui", title: "Tokyo Disneyland", hotel: "Sotetsu Grand Fresa Takadanobaba" },
  { date: "2026-05-29", dow: "Sex", title: "Harajuku + Capybara + Ueno", hotel: "Sotetsu Grand Fresa Takadanobaba" },
  { date: "2026-05-30", dow: "Sáb", title: "Tokyo → Osaka", hotel: "Park Front Hotel (Osaka)" },
  { date: "2026-05-31", dow: "Dom", title: "Osaka Castle + Dotonbori", hotel: "Park Front Hotel (Osaka)" },
  { date: "2026-06-01", dow: "Seg", title: "Universal Studios — Dia 1", hotel: "Park Front Hotel (Osaka)" },
  { date: "2026-06-02", dow: "Ter", title: "Universal Studios — Dia 2", hotel: "Park Front Hotel (Osaka)" },
  { date: "2026-06-03", dow: "Qua", title: "Osaka → Narita → Brasil", hotel: "✈️ A bordo" },
  { date: "2026-06-04", dow: "Qui", title: "Chegada São Paulo", hotel: "🏠 Casa" }
];

// ----- ESTADO -----
let eventosCache = [];
let financeiroCache = [];
let unsubscribeEventos = null;
let unsubscribeFin = null;
let diaAtivo = null;
let editandoId = null;

// ============================================
// AUTENTICAÇÃO
// ============================================
function checkAuth() {
  return sessionStorage.getItem(STORAGE_KEY) === "ok" ||
         localStorage.getItem(STORAGE_KEY) === "ok";
}

function checkFinAuth() {
  return sessionStorage.getItem(FIN_KEY) === "ok";
}

function doLogin(senha) {
  if (senha === SENHA_GERAL) {
    localStorage.setItem(STORAGE_KEY, "ok");
    return true;
  }
  return false;
}

function doLogout() {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(FIN_KEY);
  if (unsubscribeEventos) unsubscribeEventos();
  if (unsubscribeFin) unsubscribeFin();
  location.reload();
}

// ============================================
// INICIALIZAÇÃO
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  if (checkAuth()) {
    mostrarApp();
  } else {
    mostrarLogin();
  }
  setupEventListeners();
});

function mostrarLogin() {
  document.getElementById("login-screen").classList.remove("hidden");
  document.getElementById("app").classList.add("hidden");
  setTimeout(() => document.getElementById("pwd-input")?.focus(), 100);
}

function mostrarApp() {
  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
  iniciarApp();
}

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
  // Login form
  document.getElementById("login-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const pwd = document.getElementById("pwd-input").value.trim();
    const err = document.getElementById("pwd-error");
    if (doLogin(pwd)) {
      err.textContent = "";
      mostrarApp();
    } else {
      err.textContent = "Senha incorreta";
      document.getElementById("pwd-input").value = "";
    }
  });

  // Logout
  document.getElementById("btn-logout").addEventListener("click", () => {
    if (confirm("Sair do app? Você precisará digitar a senha novamente.")) {
      doLogout();
    }
  });

  // Tabs
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  // FAB Adicionar
  document.getElementById("fab-add").addEventListener("click", () => abrirModalEvento());

  // Modal evento
  document.getElementById("form-evento").addEventListener("submit", salvarEvento);
  document.getElementById("btn-excluir").addEventListener("click", excluirEvento);
  document.querySelectorAll("[data-close]").forEach(el => {
    el.addEventListener("click", () => fecharModalEvento());
  });

  // Modal financeiro
  document.getElementById("btn-fin").addEventListener("click", abrirModalFin);
  document.getElementById("fin-login-form").addEventListener("submit", loginFin);
  document.querySelectorAll("[data-close-fin]").forEach(el => {
    el.addEventListener("click", fecharModalFin);
  });
}

// ============================================
// INICIAR APP (após login)
// ============================================
function iniciarApp() {
  renderDayNav();
  renderHospedagem();
  renderVoos();
  renderContatos();
  subscribeEventos();
  
  // Define dia ativo (hoje se na viagem, ou primeiro dia)
  const hoje = new Date().toISOString().slice(0, 10);
  const diaHoje = DIAS_VIAGEM.find(d => d.date === hoje);
  diaAtivo = diaHoje ? diaHoje.date : DIAS_VIAGEM[0].date;
  updateDayNav();
}

// ============================================
// FIRESTORE - EVENTOS
// ============================================
function subscribeEventos() {
  showStatus("Sincronizando...", "info");
  const q = query(collection(db, "eventos"), orderBy("data"), orderBy("horario"));
  unsubscribeEventos = onSnapshot(q,
    (snapshot) => {
      eventosCache = [];
      snapshot.forEach(doc => {
        eventosCache.push({ id: doc.id, ...doc.data() });
      });
      renderRoteiro();
      hideStatus();
    },
    (error) => {
      console.error("Erro Firestore:", error);
      showStatus("⚠️ Erro ao conectar. Verifique sua internet.", "error");
    }
  );
}

async function salvarEvento(e) {
  e.preventDefault();
  const dados = {
    titulo: document.getElementById("evt-titulo").value.trim(),
    data: document.getElementById("evt-data").value,
    horario: document.getElementById("evt-horario").value || "",
    categoria: document.getElementById("evt-categoria").value,
    endereco: document.getElementById("evt-endereco").value.trim(),
    notas: document.getElementById("evt-notas").value.trim(),
    updatedAt: serverTimestamp()
  };

  if (!dados.titulo || !dados.data) {
    toast("Preencha título e data.", "error");
    return;
  }

  try {
    if (editandoId) {
      await updateDoc(doc(db, "eventos", editandoId), dados);
      toast("Atualizado ✓", "success");
    } else {
      dados.createdAt = serverTimestamp();
      const id = "evt_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
      await setDoc(doc(db, "eventos", id), dados);
      toast("Adicionado ✓", "success");
    }
    fecharModalEvento();
  } catch (err) {
    console.error(err);
    toast("Erro ao salvar. Tente novamente.", "error");
  }
}

async function excluirEvento() {
  if (!editandoId) return;
  if (!confirm("Excluir este compromisso? Esta ação não pode ser desfeita.")) return;
  try {
    await deleteDoc(doc(db, "eventos", editandoId));
    toast("Excluído ✓", "success");
    fecharModalEvento();
  } catch (err) {
    console.error(err);
    toast("Erro ao excluir.", "error");
  }
}

// ============================================
// FIRESTORE - FINANCEIRO
// ============================================
function subscribeFinanceiro() {
  const q = query(collection(db, "financeiro"), orderBy("ordem"));
  unsubscribeFin = onSnapshot(q, (snapshot) => {
    financeiroCache = [];
    snapshot.forEach(doc => {
      financeiroCache.push({ id: doc.id, ...doc.data() });
    });
    renderFinanceiro();
  });
}

// ============================================
// RENDER: DAY NAV
// ============================================
function renderDayNav() {
  const nav = document.getElementById("day-nav");
  const hoje = new Date().toISOString().slice(0, 10);
  nav.innerHTML = DIAS_VIAGEM.map(d => {
    const [, mes, dia] = d.date.split("-");
    const isToday = d.date === hoje;
    return `
      <button class="day-chip ${isToday ? 'today' : ''}" data-date="${d.date}">
        <div class="day-chip-dow">${d.dow}</div>
        <div class="day-chip-day">${dia}</div>
        <div class="day-chip-month">${getMesAbbr(mes)}</div>
      </button>
    `;
  }).join("");

  nav.querySelectorAll(".day-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      diaAtivo = chip.dataset.date;
      updateDayNav();
      renderRoteiro();
    });
  });
}

function updateDayNav() {
  document.querySelectorAll(".day-chip").forEach(chip => {
    chip.classList.toggle("active", chip.dataset.date === diaAtivo);
  });
  // Scroll chip ativo para visível
  const ativo = document.querySelector(".day-chip.active");
  if (ativo) ativo.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
}

function getMesAbbr(mes) {
  const meses = { "01": "JAN", "02": "FEV", "03": "MAR", "04": "ABR", "05": "MAI", "06": "JUN" };
  return meses[mes] || mes;
}

// ============================================
// RENDER: ROTEIRO
// ============================================
function renderRoteiro() {
  if (!diaAtivo) return;
  const dia = DIAS_VIAGEM.find(d => d.date === diaAtivo);
  if (!dia) return;

  const eventosDia = eventosCache
    .filter(e => e.data === diaAtivo)
    .sort((a, b) => (a.horario || "99:99").localeCompare(b.horario || "99:99"));

  const [ano, mes, dd] = dia.date.split("-");
  const dataFormatada = `${dd} de ${nomeMes(mes)} de ${ano} · ${dia.dow}`;

  let html = `
    <div class="day-header">
      <div class="day-header-date">${dataFormatada}</div>
      <div class="day-header-title">${dia.title}</div>
      <div class="day-header-hotel">🏨 ${dia.hotel}</div>
    </div>
  `;

  if (eventosDia.length === 0) {
    html += `
      <div class="no-events">
        <div class="no-events-kanji">空</div>
        <div>Nenhum compromisso para este dia.</div>
        <div style="font-size: 12px; margin-top: 8px;">Toque no + para adicionar.</div>
      </div>
    `;
  } else {
    html += eventosDia.map(renderEventoCard).join("");
  }

  document.getElementById("roteiro-content").innerHTML = html;

  // Click nos cards
  document.querySelectorAll(".event-card").forEach(card => {
    card.addEventListener("click", () => abrirModalEvento(card.dataset.id));
  });
}

function renderEventoCard(evt) {
  const cat = CATEGORIAS[evt.categoria] || CATEGORIAS.outros;
  const horario = evt.horario
    ? `<span class="event-time">${evt.horario}</span>`
    : `<span class="event-time no-time">— horário flexível —</span>`;
  const endereco = evt.endereco
    ? `<div class="event-location"><span class="event-location-icon">📍</span>${escapeHtml(evt.endereco)}</div>`
    : "";
  const notas = evt.notas
    ? `<div class="event-notes">${escapeHtml(evt.notas)}</div>`
    : "";
  return `
    <div class="event-card cat-${evt.categoria}" data-id="${evt.id}">
      <div class="event-cat-icon">${cat.icon}</div>
      ${horario}
      <div class="event-title">${escapeHtml(evt.titulo)}</div>
      ${endereco}
      ${notas}
    </div>
  `;
}

function nomeMes(mes) {
  const meses = {
    "01": "Janeiro", "02": "Fevereiro", "03": "Março", "04": "Abril",
    "05": "Maio", "06": "Junho", "07": "Julho", "08": "Agosto",
    "09": "Setembro", "10": "Outubro", "11": "Novembro", "12": "Dezembro"
  };
  return meses[mes] || mes;
}

// ============================================
// RENDER: HOSPEDAGEM
// ============================================
function renderHospedagem() {
  const html = `
    <div class="hotel-card">
      <div class="hotel-name">Sotetsu Grand Fresa Takadanobaba</div>
      <div class="hotel-dates">
        <span class="hotel-date-badge">25 MAI</span>
        <span class="hotel-arrow">→</span>
        <span class="hotel-date-badge">30 MAI</span>
      </div>
      <div class="hotel-info">
        <div class="hotel-info-row">
          <span class="hotel-info-icon">📍</span>
          <span>1-chome-27-7 Takadanobaba, Shinjuku, Tokyo 169-0075</span>
        </div>
        <div class="hotel-info-row">
          <span class="hotel-info-icon">🛏️</span>
          <span>Standard Twin Room, Non Smoking</span>
        </div>
        <div class="hotel-info-row">
          <span class="hotel-info-icon">☕</span>
          <span><strong>Café da manhã incluído</strong></span>
        </div>
        <div class="hotel-info-row">
          <span class="hotel-info-icon">🕐</span>
          <span>Check-in: 15:00 · Check-out: 11:00</span>
        </div>
        <div class="hotel-info-row">
          <span class="hotel-info-icon">🚉</span>
          <span>Estação Takadanobaba (JR Yamanote · ~25 min até Tokyo Station)</span>
        </div>
      </div>
    </div>

    <div class="hotel-card">
      <div class="hotel-name">Park Front Hotel at Universal Studios Japan</div>
      <div class="hotel-dates">
        <span class="hotel-date-badge">30 MAI</span>
        <span class="hotel-arrow">→</span>
        <span class="hotel-date-badge">03 JUN</span>
      </div>
      <div class="hotel-info">
        <div class="hotel-info-row">
          <span class="hotel-info-icon">📍</span>
          <span>6-2-52 Shimaya Konohana-ku, Osaka 554-0024</span>
        </div>
        <div class="hotel-info-row">
          <span class="hotel-info-icon">🛏️</span>
          <span>Superior Floor City View Twin Room, Non Smoking</span>
        </div>
        <div class="hotel-info-row">
          <span class="hotel-info-icon">🕐</span>
          <span>Check-in: 15:00 · Check-out: 12:00</span>
        </div>
        <div class="hotel-info-row">
          <span class="hotel-info-icon">🎢</span>
          <span>Em frente aos portões da Universal Studios Japan</span>
        </div>
        <div class="hotel-info-row">
          <span class="hotel-info-icon">🚉</span>
          <span>Estação Universal-city (JR Yumesaki Line)</span>
        </div>
      </div>
    </div>
  `;
  document.getElementById("hospedagem-content").innerHTML = html;
}

// ============================================
// RENDER: VOOS
// ============================================
function renderVoos() {
  const html = `
    <div class="flight-section-title">✈️ Ida — Brasil → Japão</div>

    <div class="flight-card">
      <div class="flight-route">
        <div class="flight-point">
          <div class="flight-airport">GRU</div>
          <div class="flight-time">22:30</div>
          <div class="flight-date">23 mai · Sáb</div>
        </div>
        <div class="flight-arrow">✈</div>
        <div class="flight-point">
          <div class="flight-airport">JFK</div>
          <div class="flight-time">07:05</div>
          <div class="flight-date">24 mai · Dom</div>
        </div>
      </div>
      <div class="flight-meta">
        <span class="flight-tag airline">Japan Airlines</span>
        <span class="flight-tag">JAL 7201</span>
        <span class="flight-tag">São Paulo → Nova Iorque</span>
      </div>
    </div>

    <div class="flight-card">
      <div class="flight-route">
        <div class="flight-point">
          <div class="flight-airport">JFK</div>
          <div class="flight-time">10:30</div>
          <div class="flight-date">24 mai · Dom</div>
        </div>
        <div class="flight-arrow">✈</div>
        <div class="flight-point">
          <div class="flight-airport">HND</div>
          <div class="flight-time">13:55</div>
          <div class="flight-date">25 mai · Seg</div>
        </div>
      </div>
      <div class="flight-meta">
        <span class="flight-tag airline">Japan Airlines</span>
        <span class="flight-tag">Conexão</span>
        <span class="flight-tag">Nova Iorque → Tokyo Haneda</span>
      </div>
    </div>

    <div class="flight-section-title">✈️ Volta — Japão → Brasil</div>

    <div class="flight-card">
      <div class="flight-route">
        <div class="flight-point">
          <div class="flight-airport">NRT</div>
          <div class="flight-time">18:30</div>
          <div class="flight-date">03 jun · Qua</div>
        </div>
        <div class="flight-arrow">✈</div>
        <div class="flight-point">
          <div class="flight-airport">DFW</div>
          <div class="flight-time">16:20</div>
          <div class="flight-date">03 jun · Qua</div>
        </div>
      </div>
      <div class="flight-meta">
        <span class="flight-tag airline">Japan Airlines</span>
        <span class="flight-tag">JAL 7012</span>
        <span class="flight-tag">Tokyo Narita → Dallas</span>
      </div>
    </div>

    <div class="flight-card">
      <div class="flight-route">
        <div class="flight-point">
          <div class="flight-airport">DFW</div>
          <div class="flight-time">20:50</div>
          <div class="flight-date">03 jun · Qua</div>
        </div>
        <div class="flight-arrow">✈</div>
        <div class="flight-point">
          <div class="flight-airport">GRU</div>
          <div class="flight-time">09:00</div>
          <div class="flight-date">04 jun · Qui</div>
        </div>
      </div>
      <div class="flight-meta">
        <span class="flight-tag airline">Japan Airlines</span>
        <span class="flight-tag">Conexão</span>
        <span class="flight-tag">Dallas → São Paulo</span>
      </div>
    </div>

    <div class="flight-section-title">🚄 Trens-bala (Shinkansen)</div>

    <div class="flight-card" style="border-left-color: var(--crimson);">
      <div class="flight-route">
        <div class="flight-point">
          <div class="flight-airport">TYO</div>
          <div class="flight-time">12:42</div>
          <div class="flight-date">30 mai · Sáb</div>
        </div>
        <div class="flight-arrow">🚄</div>
        <div class="flight-point">
          <div class="flight-airport">OSA</div>
          <div class="flight-time">15:12</div>
          <div class="flight-date">30 mai · Sáb</div>
        </div>
      </div>
      <div class="flight-meta">
        <span class="flight-tag airline" style="background: var(--crimson);">Nozomi 397</span>
        <span class="flight-tag">Tokyo Station → Shin-Osaka</span>
        <span class="flight-tag">🗻 Lado Monte Fuji</span>
      </div>
    </div>

    <div class="flight-card" style="border-left-color: var(--crimson);">
      <div class="flight-route">
        <div class="flight-point">
          <div class="flight-airport">OSA</div>
          <div class="flight-time">10:21</div>
          <div class="flight-date">03 jun · Qua</div>
        </div>
        <div class="flight-arrow">🚄</div>
        <div class="flight-point">
          <div class="flight-airport">SGW</div>
          <div class="flight-time">12:43</div>
          <div class="flight-date">03 jun · Qua</div>
        </div>
      </div>
      <div class="flight-meta">
        <span class="flight-tag airline" style="background: var(--crimson);">Nozomi 352</span>
        <span class="flight-tag">Shin-Osaka → Shinagawa</span>
      </div>
    </div>

    <div class="flight-card" style="border-left-color: var(--indigo-soft);">
      <div class="flight-route">
        <div class="flight-point">
          <div class="flight-airport">SGW</div>
          <div class="flight-time">13:24</div>
          <div class="flight-date">03 jun · Qua</div>
        </div>
        <div class="flight-arrow">🚆</div>
        <div class="flight-point">
          <div class="flight-airport">NRT</div>
          <div class="flight-time">14:27</div>
          <div class="flight-date">03 jun · Qua</div>
        </div>
      </div>
      <div class="flight-meta">
        <span class="flight-tag airline" style="background: var(--indigo-soft);">Narita Express 29</span>
        <span class="flight-tag">Shinagawa → Narita Airport T2-3</span>
        <span class="flight-tag">🌟 Green Car</span>
      </div>
    </div>
  `;
  document.getElementById("voos-content").innerHTML = html;
}

// ============================================
// RENDER: CONTATOS / EMERGÊNCIA
// ============================================
function renderContatos() {
  const html = `
    <div class="contact-section">
      <div class="contact-section-title">🚨 Emergências Japão</div>
      <div class="contact-item">
        <div class="contact-label">Polícia</div>
        <div class="contact-value"><a href="tel:110">110</a></div>
      </div>
      <div class="contact-item">
        <div class="contact-label">Bombeiros / Ambulância</div>
        <div class="contact-value"><a href="tel:119">119</a></div>
      </div>
      <div class="contact-item">
        <div class="contact-label">Linha multilíngue de turismo (JNTO)</div>
        <div class="contact-value"><a href="tel:+81503816-2787">+81 50-3816-2787</a></div>
        <div class="contact-note">24h, atende em inglês</div>
      </div>
    </div>

    <div class="contact-section">
      <div class="contact-section-title">🛡️ Seguro Viagem (Generali)</div>
      <div class="contact-item">
        <div class="contact-label">Emergência 24h (mundo)</div>
        <div class="contact-value"><a href="tel:+12029746480">+1 (202) 974-6480</a></div>
        <div class="contact-note">Ligação a cobrar — collect call</div>
      </div>
      <div class="contact-item">
        <div class="contact-label">Atendimento ao cliente</div>
        <div class="contact-value"><a href="tel:+18005519242">+1 (800) 551-9242</a></div>
      </div>
      <div class="contact-item">
        <div class="contact-label">Atendimento em espanhol</div>
        <div class="contact-value"><a href="tel:+18003180179">+1 (800) 318-0179</a></div>
      </div>
    </div>

    <div class="contact-section">
      <div class="contact-section-title">🏨 Hotéis</div>
      <div class="contact-item">
        <div class="contact-label">Sotetsu Grand Fresa Takadanobaba (Tokyo)</div>
        <div class="contact-value">1-27-7 Takadanobaba, Shinjuku</div>
        <div class="contact-note">25/05 a 30/05</div>
      </div>
      <div class="contact-item">
        <div class="contact-label">Park Front Hotel USJ (Osaka)</div>
        <div class="contact-value">6-2-52 Shimaya, Konohana-ku</div>
        <div class="contact-note">30/05 a 03/06</div>
      </div>
    </div>

    <div class="contact-section">
      <div class="contact-section-title">🏛️ Embaixada / Consulado</div>
      <div class="contact-item">
        <div class="contact-label">Embaixada do Brasil em Tóquio</div>
        <div class="contact-value"><a href="tel:+81334045211">+81 3-3404-5211</a></div>
        <div class="contact-note">2-11-12 Kita-Aoyama, Minato-ku, Tokyo</div>
      </div>
      <div class="contact-item">
        <div class="contact-label">Plantão consular (emergências fora do horário)</div>
        <div class="contact-value"><a href="tel:+819085115032">+81 90-8511-5032</a></div>
      </div>
    </div>

    <div class="contact-section">
      <div class="contact-section-title">📱 Apps essenciais</div>
      <div class="contact-item">
        <div class="contact-label">Tokyo Disney Resort</div>
        <div class="contact-note">Para ingressos, Priority Pass e DPA</div>
      </div>
      <div class="contact-item">
        <div class="contact-label">Universal Studios Japan</div>
        <div class="contact-note">Para Express Pass, mapa, restaurantes</div>
      </div>
      <div class="contact-item">
        <div class="contact-label">Google Maps</div>
        <div class="contact-note">Baixar área de Tokyo e Osaka offline</div>
      </div>
      <div class="contact-item">
        <div class="contact-label">Google Tradutor</div>
        <div class="contact-note">Pacote Japonês offline + câmera</div>
      </div>
    </div>
  `;
  document.getElementById("contatos-content").innerHTML = html;
}

// ============================================
// MODAL EVENTO
// ============================================
function abrirModalEvento(id = null) {
  const modal = document.getElementById("modal-evento");
  const form = document.getElementById("form-evento");
  const titulo = document.getElementById("modal-title");
  const btnExcluir = document.getElementById("btn-excluir");

  form.reset();
  editandoId = id;

  if (id) {
    const evt = eventosCache.find(e => e.id === id);
    if (!evt) return;
    titulo.textContent = "Editar compromisso";
    document.getElementById("evt-titulo").value = evt.titulo || "";
    document.getElementById("evt-data").value = evt.data || "";
    document.getElementById("evt-horario").value = evt.horario || "";
    document.getElementById("evt-categoria").value = evt.categoria || "outros";
    document.getElementById("evt-endereco").value = evt.endereco || "";
    document.getElementById("evt-notas").value = evt.notas || "";
    btnExcluir.classList.remove("hidden");
  } else {
    titulo.textContent = "Novo compromisso";
    document.getElementById("evt-data").value = diaAtivo || DIAS_VIAGEM[0].date;
    btnExcluir.classList.add("hidden");
  }

  modal.classList.remove("hidden");
  setTimeout(() => document.getElementById("evt-titulo").focus(), 300);
}

function fecharModalEvento() {
  document.getElementById("modal-evento").classList.add("hidden");
  editandoId = null;
}

// ============================================
// MODAL FINANCEIRO
// ============================================
function abrirModalFin() {
  const modal = document.getElementById("modal-fin");
  modal.classList.remove("hidden");
  if (checkFinAuth()) {
    mostrarPainelFin();
  } else {
    document.getElementById("fin-login").classList.remove("hidden");
    document.getElementById("fin-panel").classList.add("hidden");
    setTimeout(() => document.getElementById("fin-pwd")?.focus(), 300);
  }
}

function fecharModalFin() {
  document.getElementById("modal-fin").classList.add("hidden");
  document.getElementById("fin-pwd").value = "";
  document.getElementById("fin-error").textContent = "";
}

function loginFin(e) {
  e.preventDefault();
  const pwd = document.getElementById("fin-pwd").value.trim();
  const err = document.getElementById("fin-error");
  if (pwd === SENHA_FIN) {
    sessionStorage.setItem(FIN_KEY, "ok");
    err.textContent = "";
    mostrarPainelFin();
  } else {
    err.textContent = "Senha incorreta";
    document.getElementById("fin-pwd").value = "";
  }
}

function mostrarPainelFin() {
  document.getElementById("fin-login").classList.add("hidden");
  document.getElementById("fin-panel").classList.remove("hidden");
  if (!unsubscribeFin) {
    subscribeFinanceiro();
  } else {
    renderFinanceiro();
  }
}

function renderFinanceiro() {
  const list = document.getElementById("fin-list");
  if (financeiroCache.length === 0) {
    list.innerHTML = `<div class="loading">Sem itens financeiros.</div>`;
    return;
  }

  let total = 0, pago = 0, apagar = 0;
  financeiroCache.forEach(item => {
    total += item.valorUSD || 0;
    if (item.status === "pago") pago += item.valorUSD || 0;
    else apagar += item.valorUSD || 0;
  });

  document.getElementById("fin-total").textContent = formatUSD(total);
  document.getElementById("fin-pago").textContent = formatUSD(pago);
  document.getElementById("fin-apagar").textContent = formatUSD(apagar);

  list.innerHTML = financeiroCache.map(item => `
    <div class="fin-item ${item.status}">
      <div>
        <div class="fin-item-desc">${escapeHtml(item.descricao)}</div>
        <div class="fin-item-status ${item.status}">${item.status === 'pago' ? '✓ Pago' : '⏳ A pagar'}</div>
      </div>
      <div class="fin-item-value">${formatUSD(item.valorUSD || 0)}</div>
    </div>
  `).join("");
}

function formatUSD(v) {
  return "$ " + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ============================================
// UTILITÁRIOS
// ============================================
function escapeHtml(s) {
  if (!s) return "";
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function toast(msg, type = "") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = "toast show " + type;
  setTimeout(() => t.classList.remove("show"), 2500);
}

function showStatus(msg, type) {
  const el = document.getElementById("conn-status");
  el.textContent = msg;
  el.className = "conn-status show " + type;
}

function hideStatus() {
  document.getElementById("conn-status").className = "conn-status";
}
