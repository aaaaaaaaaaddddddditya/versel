/* ============================================================
   Perkmc — Admin Panel logic
   All data is read/written through config.js helpers and saved
   to this browser's localStorage. No backend required.
   ============================================================ */

const CATEGORY_EMOJIS = {
  Owner: "👑", Manager: "🧭", Admin: "🛡️", Moderator: "🔨",
  Helper: "🌿", Builder: "🧱", Support: "🎧"
};

const QUICK_EMOJIS = ["👑","🧭","🛡️","🔨","🌿","🍀","🧱","🎧","⭐","🐉","⚔️","🎮"];

// 30+ emoji reference library shown on the Appearance tab
const EMOJI_LIBRARY = [
  "🌲","🌳","🌿","🍀","🍃","🌱","🌍","🌙","☀️","⭐",
  "🔥","💎","⚔️","🛡️","🏹","🧪","⛏️","🧱","🏰","🗺️",
  "🐉","🐐","🦋","🐾","🎮","🏆","👑","🎁","💰","🛒",
  "📢","📅","🎉","🤝","🚫","🔨","✅","❌","💬","📖",
  "🔒","🔑","🎧","🧭","✨","🌟","🚀","💚"
];

/* ---------------- Password hashing ---------------- */
async function sha256Hex(text) {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

/* ---------------- Small helpers ---------------- */
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => t.classList.remove("show"), 2200);
}

function mutate(fn) {
  const cfg = perkmcGetConfig();
  fn(cfg);
  perkmcSaveConfig(cfg);
  renderActiveTab();
}

function openModal(html) {
  document.getElementById("modalContent").innerHTML = html;
  document.getElementById("modalOverlay").style.display = "flex";
}
function closeModal() {
  document.getElementById("modalOverlay").style.display = "none";
}
document.addEventListener("click", (e) => {
  if (e.target.id === "modalOverlay") closeModal();
});

function quickEmojiBarHtml(inputId) {
  return `<div class="emoji-picker" style="max-width:100%;">
    ${QUICK_EMOJIS.map(e => `<button type="button" onclick="document.getElementById('${inputId}').value='${e}'">${e}</button>`).join("")}
  </div>`;
}

/* ================================================================
   AUTH
   ================================================================ */
function isLoggedIn() {
  return sessionStorage.getItem("perkmcAdminSession") === "yes";
}

function showAdminShell() {
  document.getElementById("loginWrap").style.display = "none";
  document.getElementById("adminShell").style.display = "flex";
  initAdminPanel();

  // Pull the shared database content (if configured) so this admin session
  // reflects the latest data — including edits made from another device.
  perkmcSyncCloudConfig(
    () => renderActiveTab(),
    () => { renderActiveTab(); showToast("🔄 Synced latest data from the cloud"); }
  );
}

document.addEventListener("DOMContentLoaded", () => {
  if (isLoggedIn()) {
    showAdminShell();
  } else {
    document.getElementById("loginWrap").style.display = "flex";
  }

  document.getElementById("loginBtn").addEventListener("click", attemptLogin);
  document.getElementById("loginPassword").addEventListener("keydown", (e) => {
    if (e.key === "Enter") attemptLogin();
  });
});

async function attemptLogin() {
  const pass = document.getElementById("loginPassword").value;
  const cfg = perkmcGetConfig();
  const errEl = document.getElementById("loginError");
  if (!pass) { errEl.textContent = "Please enter a password."; return; }
  const hash = await sha256Hex(pass);
  if (hash === cfg.adminPasswordHash) {
    sessionStorage.setItem("perkmcAdminSession", "yes");
    errEl.textContent = "";
    showAdminShell();
  } else {
    errEl.textContent = "❌ Incorrect password. Try again.";
  }
}

/* ================================================================
   PANEL INIT / TABS
   ================================================================ */
let currentTab = "dashboard";

function initAdminPanel() {
  document.querySelectorAll(".admin-nav-btn[data-tab]").forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });
  document.getElementById("logoutBtn").addEventListener("click", () => {
    sessionStorage.removeItem("perkmcAdminSession");
    location.reload();
  });

  bindStaticButtons();
  renderActiveTab();
}

function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll(".admin-nav-btn[data-tab]").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
  document.querySelectorAll(".admin-panel-view").forEach(v => v.classList.toggle("active", v.id === "tab-" + tab));
  renderActiveTab();
}

function renderActiveTab() {
  const cfg = perkmcGetConfig();
  switch (currentTab) {
    case "dashboard": renderDashboard(cfg); break;
    case "console": renderConsole(cfg); break;
    case "settings": renderSettings(cfg); break;
    case "staff": renderStaffTable(cfg); break;
    case "categories": renderCategories(cfg); break;
    case "announcements": renderAnnouncements(cfg); break;
    case "store": renderStore(cfg); break;
    case "rules": renderRulesAdmin(cfg); break;
    case "appearance": renderAppearance(cfg); break;
  }
}

/* ================================================================
   DASHBOARD
   ================================================================ */
function renderDashboard(cfg) {
  document.getElementById("dashboardStats").innerHTML = `
    <div class="card"><div class="emoji-badge">🖥️</div><h3>${cfg.serverIpJava}</h3><p>Current Server IP</p></div>
    <div class="card"><div class="emoji-badge">🟢</div><h3>${cfg.playersOnline} / ${cfg.playersMax}</h3><p>Players Online</p></div>
    <div class="card"><div class="emoji-badge">🛡️</div><h3>${cfg.staff.length}</h3><p>Staff Members</p></div>
    <div class="card"><div class="emoji-badge">📢</div><h3>${cfg.announcements.length}</h3><p>Announcements</p></div>
    <div class="card"><div class="emoji-badge">🛒</div><h3>${cfg.storeItems.length}</h3><p>Store Items</p></div>
    <div class="card"><div class="emoji-badge">🗂️</div><h3>${cfg.staffCategories.length}</h3><p>Staff Categories</p></div>
  `;
}

/* ================================================================
   CONSOLE (live visitor activity, via Firebase — see firebase-config.js)
   ================================================================ */
let consoleEvents = [];
let consoleUnsub = null;

const CONSOLE_ACTION_LABELS = {
  page_view: "👀 Viewed page",
  ip_copy: "📋 Copied server IP",
  username_set: "🎮 Set username",
  store_buy_click: "🛒 Clicked Buy",
  outbound_click: "🔗 Clicked link"
};

function renderConsole() {
  const notice = document.getElementById("consoleSetupNotice");
  if (!window.perkmcDb) {
    notice.style.display = "block";
    document.getElementById("consoleStats").innerHTML = "";
    document.getElementById("consolePlayersBody").innerHTML = "";
    document.getElementById("consoleFeedBody").innerHTML = "";
    return;
  }
  notice.style.display = "none";
  startConsoleListener();
  renderConsoleFromCache();
}

function startConsoleListener() {
  if (consoleUnsub) return; // already subscribed, Firestore keeps it live
  consoleUnsub = window.perkmcDb.collection("activity")
    .orderBy("tsClient", "desc")
    .limit(200)
    .onSnapshot(
      snap => {
        consoleEvents = snap.docs.map(d => d.data());
        if (currentTab === "console") renderConsoleFromCache();
      },
      err => console.warn("Perkmc: console listener error", err)
    );
}

function consoleDetailText(e) {
  const d = e.details || {};
  if (e.type === "store_buy_click") return d.item || "";
  if (e.type === "ip_copy") return d.ip || "";
  if (e.type === "outbound_click") return d.target || "";
  return "";
}

function timeAgo(ts) {
  if (!ts) return "just now";
  const diff = Math.max(0, Date.now() - ts);
  const s = Math.floor(diff / 1000);
  if (s < 60) return s + "s ago";
  const m = Math.floor(s / 60);
  if (m < 60) return m + "m ago";
  const h = Math.floor(m / 60);
  if (h < 24) return h + "h ago";
  return Math.floor(h / 24) + "d ago";
}

function renderConsoleFromCache() {
  const total = consoleEvents.length;
  const uniquePlayers = new Set(consoleEvents.filter(e => e.username).map(e => e.username));
  const ipCopies = consoleEvents.filter(e => e.type === "ip_copy").length;

  document.getElementById("consoleStats").innerHTML = `
    <div class="card"><div class="emoji-badge">📜</div><h3>${total}</h3><p>Recent Events</p></div>
    <div class="card"><div class="emoji-badge">👥</div><h3>${uniquePlayers.size}</h3><p>Unique Players Seen</p></div>
    <div class="card"><div class="emoji-badge">📋</div><h3>${ipCopies}</h3><p>IP Copies</p></div>
  `;

  const byPlayer = {};
  consoleEvents.forEach(e => {
    if (!e.username) return;
    const t = e.tsClient || 0;
    if (!byPlayer[e.username]) byPlayer[e.username] = { last: t, count: 0 };
    byPlayer[e.username].count += 1;
    if (t > byPlayer[e.username].last) byPlayer[e.username].last = t;
  });
  const playerRows = Object.entries(byPlayer).sort((a, b) => b[1].last - a[1].last);
  document.getElementById("consolePlayersBody").innerHTML = playerRows.length ? playerRows.map(([name, info]) => `
    <tr><td>🎮 ${name}</td><td>${timeAgo(info.last)}</td><td>${info.count}</td></tr>
  `).join("") : `<tr><td colspan="3" class="muted">No players have entered a username yet.</td></tr>`;

  document.getElementById("consoleFeedBody").innerHTML = consoleEvents.length ? consoleEvents.slice(0, 100).map(e => `
    <tr>
      <td class="muted" style="white-space:nowrap;">${timeAgo(e.tsClient)}</td>
      <td>${e.username ? "🎮 " + e.username : "👤 Guest"}</td>
      <td>${CONSOLE_ACTION_LABELS[e.type] || e.type}</td>
      <td class="muted">${consoleDetailText(e)}</td>
      <td class="muted">${e.page || ""}</td>
    </tr>
  `).join("") : `<tr><td colspan="5" class="muted">No activity yet — visit your live site to generate some!</td></tr>`;
}

/* ================================================================
   SETTINGS
   ================================================================ */
function renderSettings(cfg) {
  document.getElementById("f-siteName").value = cfg.siteName;
  document.getElementById("f-tagline").value = cfg.tagline;
  document.getElementById("f-ipJava").value = cfg.serverIpJava;
  document.getElementById("f-ipBedrock").value = cfg.serverIpBedrock;
  document.getElementById("f-version").value = cfg.version;
  document.getElementById("f-playersOnline").value = cfg.playersOnline;
  document.getElementById("f-playersMax").value = cfg.playersMax;
  document.getElementById("f-discordInvite").value = cfg.discordInvite;
  document.getElementById("f-heroHighlight").value = cfg.heroTitleHighlight;
  document.getElementById("f-heroSubtitle").value = cfg.heroSubtitle;
  document.getElementById("f-social-discord").value = cfg.socials.discord;
  document.getElementById("f-social-youtube").value = cfg.socials.youtube;
  document.getElementById("f-social-tiktok").value = cfg.socials.tiktok;
  document.getElementById("f-social-instagram").value = cfg.socials.instagram;
  document.getElementById("f-social-twitter").value = cfg.socials.twitter;
}

function bindStaticButtons() {
  document.getElementById("saveSettings").addEventListener("click", () => {
    mutate(cfg => {
      cfg.siteName = document.getElementById("f-siteName").value.trim() || "Perkmc";
      cfg.tagline = document.getElementById("f-tagline").value.trim();
      cfg.serverIpJava = document.getElementById("f-ipJava").value.trim();
      cfg.serverIpBedrock = document.getElementById("f-ipBedrock").value.trim();
      cfg.version = document.getElementById("f-version").value.trim();
      cfg.playersOnline = parseInt(document.getElementById("f-playersOnline").value, 10) || 0;
      cfg.playersMax = parseInt(document.getElementById("f-playersMax").value, 10) || 0;
      cfg.discordInvite = document.getElementById("f-discordInvite").value.trim();
      cfg.heroTitleHighlight = document.getElementById("f-heroHighlight").value.trim();
      cfg.heroSubtitle = document.getElementById("f-heroSubtitle").value.trim();
      cfg.socials.discord = document.getElementById("f-social-discord").value.trim();
      cfg.socials.youtube = document.getElementById("f-social-youtube").value.trim();
      cfg.socials.tiktok = document.getElementById("f-social-tiktok").value.trim();
      cfg.socials.instagram = document.getElementById("f-social-instagram").value.trim();
      cfg.socials.twitter = document.getElementById("f-social-twitter").value.trim();
    });
    showToast("✅ Settings saved!");
  });

  document.getElementById("addStaffBtn").addEventListener("click", () => openStaffModal(null));
  document.getElementById("addCategoryBtn").addEventListener("click", addCategory);
  document.getElementById("addAnnouncementBtn").addEventListener("click", () => openAnnouncementModal(null));
  document.getElementById("addStoreBtn").addEventListener("click", () => openStoreModal(null));
  document.getElementById("addRuleGroupBtn").addEventListener("click", addRuleGroup);

  document.getElementById("changePasswordBtn").addEventListener("click", changePassword);

  const resetBtn = document.getElementById("resetAllBtn");
  let resetArmed = false;
  resetBtn.addEventListener("click", () => {
    if (!resetArmed) {
      resetArmed = true;
      resetBtn.textContent = "⚠️ Click again to confirm reset";
      setTimeout(() => { resetArmed = false; resetBtn.textContent = "⚠️ Reset to Defaults"; }, 4000);
      return;
    }
    perkmcResetConfig();
    showToast("♻️ Reset to defaults!");
    setTimeout(() => location.reload(), 700);
  });
}

/* ================================================================
   STAFF
   ================================================================ */
function renderStaffTable(cfg) {
  const body = document.getElementById("staffTableBody");
  if (!cfg.staff.length) {
    body.innerHTML = `<tr><td colspan="5" class="muted">No staff members yet. Click "Add Staff Member" above.</td></tr>`;
    return;
  }
  body.innerHTML = cfg.staff.map((m, i) => `
    <tr>
      <td style="font-size:1.3rem;">${m.emoji}</td>
      <td>${m.name}</td>
      <td>${m.category}</td>
      <td class="muted">${m.note || ""}</td>
      <td class="row-actions">
        <button class="btn btn-outline btn-sm" onclick="openStaffModal(${i})">✏️ Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteStaff(${i})">🗑️ Delete</button>
      </td>
    </tr>
  `).join("");
}

function openStaffModal(index) {
  const cfg = perkmcGetConfig();
  const editing = index !== null;
  const m = editing ? cfg.staff[index] : { name: "", category: cfg.staffCategories[0] || "Helper", emoji: "🌿", note: "" };

  openModal(`
    <h3>${editing ? "✏️ Edit" : "➕ Add"} Staff Member</h3>
    <div class="form-field"><label>Name</label><input id="m-name" value="${m.name}"></div>
    <div class="form-field"><label>Category</label>
      <select id="m-category">${cfg.staffCategories.map(c => `<option value="${c}" ${c === m.category ? "selected" : ""}>${c}</option>`).join("")}</select>
    </div>
    <div class="form-field"><label>Emoji (avatar)</label><input id="m-emoji" value="${m.emoji}">
      ${quickEmojiBarHtml("m-emoji")}
    </div>
    <div class="form-field"><label>Note / Title</label><input id="m-note" value="${m.note || ""}"></div>
    <div class="row-actions" style="justify-content:flex-end; margin-top:10px;">
      <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveStaffModal(${editing ? index : "null"})">💾 Save</button>
    </div>
  `);
}

function saveStaffModal(index) {
  const name = document.getElementById("m-name").value.trim();
  if (!name) { showToast("⚠️ Name is required"); return; }
  const entry = {
    name,
    category: document.getElementById("m-category").value,
    emoji: document.getElementById("m-emoji").value.trim() || "🙂",
    note: document.getElementById("m-note").value.trim()
  };
  mutate(cfg => {
    if (index === null) cfg.staff.push(entry);
    else cfg.staff[index] = entry;
  });
  closeModal();
  showToast("✅ Staff member saved!");
}

function deleteStaff(index) {
  mutate(cfg => cfg.staff.splice(index, 1));
  showToast("🗑️ Staff member removed");
}

/* ================================================================
   CATEGORIES
   ================================================================ */
function renderCategories(cfg) {
  const body = document.getElementById("categoryTableBody");
  body.innerHTML = cfg.staffCategories.map((c, i) => {
    const count = cfg.staff.filter(m => m.category === c).length;
    return `
      <tr>
        <td>${i + 1}</td>
        <td>${CATEGORY_EMOJIS[c] || "⭐"} ${c}</td>
        <td>${count}</td>
        <td class="row-actions">
          <button class="btn btn-outline btn-sm" onclick="moveCategory(${i}, -1)">⬆️</button>
          <button class="btn btn-outline btn-sm" onclick="moveCategory(${i}, 1)">⬇️</button>
          <button class="btn btn-outline btn-sm" onclick="renameCategory(${i})">✏️ Rename</button>
          <button class="btn btn-danger btn-sm" onclick="deleteCategory(${i})">🗑️ Delete</button>
        </td>
      </tr>`;
  }).join("");
}

function addCategory() {
  const input = document.getElementById("f-newCategory");
  const name = input.value.trim();
  if (!name) { showToast("⚠️ Enter a category name"); return; }
  mutate(cfg => {
    if (!cfg.staffCategories.includes(name)) cfg.staffCategories.push(name);
  });
  input.value = "";
  showToast("✅ Category added!");
}

function moveCategory(index, dir) {
  mutate(cfg => {
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= cfg.staffCategories.length) return;
    const arr = cfg.staffCategories;
    [arr[index], arr[newIndex]] = [arr[newIndex], arr[index]];
  });
}

function renameCategory(index) {
  const cfg = perkmcGetConfig();
  const oldName = cfg.staffCategories[index];
  openModal(`
    <h3>✏️ Rename Category</h3>
    <div class="form-field"><label>Category name</label><input id="m-catname" value="${oldName}"></div>
    <div class="row-actions" style="justify-content:flex-end;">
      <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveCategoryRename(${index}, '${oldName.replace(/'/g, "\\'")}')">💾 Save</button>
    </div>
  `);
}

function saveCategoryRename(index, oldName) {
  const newName = document.getElementById("m-catname").value.trim();
  if (!newName) { showToast("⚠️ Name required"); return; }
  mutate(cfg => {
    cfg.staffCategories[index] = newName;
    cfg.staff.forEach(m => { if (m.category === oldName) m.category = newName; });
  });
  closeModal();
  showToast("✅ Category renamed!");
}

function deleteCategory(index) {
  const cfg = perkmcGetConfig();
  const name = cfg.staffCategories[index];
  const inUse = cfg.staff.some(m => m.category === name);
  if (inUse) { showToast("⚠️ Move or delete staff in this category first"); return; }
  mutate(cfg => cfg.staffCategories.splice(index, 1));
  showToast("🗑️ Category deleted");
}

/* ================================================================
   ANNOUNCEMENTS
   ================================================================ */
function renderAnnouncements(cfg) {
  const body = document.getElementById("announcementTableBody");
  if (!cfg.announcements.length) {
    body.innerHTML = `<tr><td colspan="5" class="muted">No announcements yet.</td></tr>`;
    return;
  }
  body.innerHTML = cfg.announcements.map((a, i) => `
    <tr>
      <td style="font-size:1.3rem;">${a.emoji}</td>
      <td>${a.title}</td>
      <td>${a.tag}</td>
      <td>${a.date}</td>
      <td class="row-actions">
        <button class="btn btn-outline btn-sm" onclick="openAnnouncementModal(${i})">✏️ Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteAnnouncement(${i})">🗑️ Delete</button>
      </td>
    </tr>
  `).join("");
}

function openAnnouncementModal(index) {
  const cfg = perkmcGetConfig();
  const editing = index !== null;
  const a = editing ? cfg.announcements[index] : { title: "", tag: "Update", emoji: "📢", date: new Date().toISOString().slice(0, 10), body: "" };

  openModal(`
    <h3>${editing ? "✏️ Edit" : "➕ New"} Announcement</h3>
    <div class="form-field"><label>Title</label><input id="m-title" value="${a.title}"></div>
    <div class="form-field"><label>Tag</label><input id="m-tag" value="${a.tag}" placeholder="Update / Event / Store"></div>
    <div class="form-field"><label>Emoji</label><input id="m-emoji2" value="${a.emoji}">${quickEmojiBarHtml("m-emoji2")}</div>
    <div class="form-field"><label>Date</label><input type="date" id="m-date" value="${a.date}"></div>
    <div class="form-field"><label>Body</label><textarea id="m-body">${a.body}</textarea></div>
    <div class="row-actions" style="justify-content:flex-end;">
      <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveAnnouncementModal(${editing ? index : "null"})">💾 Save</button>
    </div>
  `);
}

function saveAnnouncementModal(index) {
  const title = document.getElementById("m-title").value.trim();
  if (!title) { showToast("⚠️ Title required"); return; }
  const entry = {
    title,
    tag: document.getElementById("m-tag").value.trim() || "Update",
    emoji: document.getElementById("m-emoji2").value.trim() || "📢",
    date: document.getElementById("m-date").value || new Date().toISOString().slice(0, 10),
    body: document.getElementById("m-body").value.trim()
  };
  mutate(cfg => {
    if (index === null) cfg.announcements.unshift(entry);
    else cfg.announcements[index] = entry;
  });
  closeModal();
  showToast("✅ Announcement saved!");
}

function deleteAnnouncement(index) {
  mutate(cfg => cfg.announcements.splice(index, 1));
  showToast("🗑️ Announcement removed");
}

/* ================================================================
   STORE
   ================================================================ */
function renderStore(cfg) {
  const body = document.getElementById("storeTableBody");
  if (!cfg.storeItems.length) {
    body.innerHTML = `<tr><td colspan="5" class="muted">No store items yet.</td></tr>`;
    return;
  }
  body.innerHTML = cfg.storeItems.map((s, i) => `
    <tr>
      <td><div style="width:42px;height:42px;">${typeof perkmcStoreIcon === "function" ? perkmcStoreIcon(s.icon) : s.emoji}</div></td>
      <td>${s.name}</td>
      <td>${s.price}</td>
      <td>${s.tag}</td>
      <td class="row-actions">
        <button class="btn btn-outline btn-sm" onclick="openStoreModal(${i})">✏️ Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteStoreItem(${i})">🗑️ Delete</button>
      </td>
    </tr>
  `).join("");
}

function storeIconPickerHtml(selected) {
  const names = (typeof PERKMC_STORE_ICON_NAMES !== "undefined") ? PERKMC_STORE_ICON_NAMES : [];
  return `<div class="emoji-picker" style="max-width:100%; gap:10px;">
    ${names.map(n => `
      <button type="button" title="${n}" onclick="selectStoreIcon('${n}')"
        style="width:52px;height:52px;padding:4px;border-radius:12px;border:2px solid ${n === selected ? "var(--green-400)" : "var(--border-soft)"};background:rgba(255,255,255,0.02);"
        data-icon-btn="${n}">${typeof perkmcStoreIcon === "function" ? perkmcStoreIcon(n) : n}</button>
    `).join("")}
  </div>`;
}

function selectStoreIcon(name) {
  document.getElementById("m-sicon").value = name;
  document.querySelectorAll("[data-icon-btn]").forEach(b => {
    b.style.borderColor = (b.getAttribute("data-icon-btn") === name) ? "var(--green-400)" : "var(--border-soft)";
  });
}

function openStoreModal(index) {
  const cfg = perkmcGetConfig();
  const editing = index !== null;
  const s = editing ? cfg.storeItems[index] : { name: "", price: "$4.99", tag: "New", color: "#2bff9b", emoji: "🌿", icon: "crate", perks: [] };

  openModal(`
    <h3>${editing ? "✏️ Edit" : "➕ New"} Store Item</h3>
    <div class="form-field"><label>Name</label><input id="m-sname" value="${s.name}"></div>
    <div class="form-field"><label>Price</label><input id="m-sprice" value="${s.price}"></div>
    <div class="form-field"><label>Tag</label><input id="m-stag" value="${s.tag}"></div>
    <div class="form-field"><label>Accent Color</label><input type="color" id="m-scolor" value="${s.color}"></div>
    <div class="form-field"><label>3D Icon</label>
      <input type="hidden" id="m-sicon" value="${s.icon || "crate"}">
      ${storeIconPickerHtml(s.icon || "crate")}
    </div>
    <div class="form-field"><label>Emoji (fallback)</label><input id="m-semoji" value="${s.emoji}">${quickEmojiBarHtml("m-semoji")}</div>
    <div class="form-field"><label>Perks (one per line)</label><textarea id="m-sperks">${(s.perks || []).join("\n")}</textarea></div>
    <div class="row-actions" style="justify-content:flex-end;">
      <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveStoreModal(${editing ? index : "null"})">💾 Save</button>
    </div>
  `);
}

function saveStoreModal(index) {
  const name = document.getElementById("m-sname").value.trim();
  if (!name) { showToast("⚠️ Name required"); return; }
  const entry = {
    name,
    price: document.getElementById("m-sprice").value.trim() || "$0.00",
    tag: document.getElementById("m-stag").value.trim() || "Item",
    color: document.getElementById("m-scolor").value,
    icon: document.getElementById("m-sicon").value || "crate",
    emoji: document.getElementById("m-semoji").value.trim() || "🛒",
    perks: document.getElementById("m-sperks").value.split("\n").map(s => s.trim()).filter(Boolean)
  };
  mutate(cfg => {
    if (index === null) cfg.storeItems.push(entry);
    else cfg.storeItems[index] = entry;
  });
  closeModal();
  showToast("✅ Store item saved!");
}

function deleteStoreItem(index) {
  mutate(cfg => cfg.storeItems.splice(index, 1));
  showToast("🗑️ Store item removed");
}

/* ================================================================
   RULES
   ================================================================ */
function renderRulesAdmin(cfg) {
  const wrap = document.getElementById("rulesAdminList");
  wrap.innerHTML = cfg.rules.map((group, gi) => `
    <div class="card" style="margin-bottom:18px;">
      <div class="admin-topbar" style="margin-bottom:12px;">
        <h3 style="margin:0;">${group.emoji} ${group.category}</h3>
        <div class="row-actions">
          <button class="btn btn-outline btn-sm" onclick="editRuleGroupMeta(${gi})">✏️ Rename</button>
          <button class="btn btn-danger btn-sm" onclick="deleteRuleGroup(${gi})">🗑️ Delete Category</button>
        </div>
      </div>
      <ul style="padding-left:20px; color:var(--text-muted);">
        ${group.items.map((item, ii) => `
          <li style="margin-bottom:8px; display:flex; align-items:center; gap:10px;">
            <span style="flex:1;">${item}</span>
            <button class="btn btn-outline btn-sm" onclick="deleteRuleItem(${gi}, ${ii})">🗑️</button>
          </li>
        `).join("")}
      </ul>
      <div class="form-grid" style="grid-template-columns: 3fr 1fr; margin-top:10px;">
        <input placeholder="New rule text..." id="new-rule-${gi}">
        <button class="btn btn-primary btn-sm" onclick="addRuleItem(${gi})">➕ Add Rule</button>
      </div>
    </div>
  `).join("");
}

function addRuleGroup() {
  openModal(`
    <h3>➕ New Rule Category</h3>
    <div class="form-field"><label>Category Name</label><input id="m-rcat" placeholder="e.g. Chat Rules"></div>
    <div class="form-field"><label>Emoji</label><input id="m-remoji" value="📖">${quickEmojiBarHtml("m-remoji")}</div>
    <div class="row-actions" style="justify-content:flex-end;">
      <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveNewRuleGroup()">💾 Save</button>
    </div>
  `);
}

function saveNewRuleGroup() {
  const category = document.getElementById("m-rcat").value.trim();
  if (!category) { showToast("⚠️ Name required"); return; }
  const emoji = document.getElementById("m-remoji").value.trim() || "📖";
  mutate(cfg => cfg.rules.push({ category, emoji, items: [] }));
  closeModal();
  showToast("✅ Rule category added!");
}

function editRuleGroupMeta(gi) {
  const cfg = perkmcGetConfig();
  const g = cfg.rules[gi];
  openModal(`
    <h3>✏️ Rename Rule Category</h3>
    <div class="form-field"><label>Category Name</label><input id="m-rcat2" value="${g.category}"></div>
    <div class="form-field"><label>Emoji</label><input id="m-remoji2" value="${g.emoji}">${quickEmojiBarHtml("m-remoji2")}</div>
    <div class="row-actions" style="justify-content:flex-end;">
      <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveRuleGroupMeta(${gi})">💾 Save</button>
    </div>
  `);
}

function saveRuleGroupMeta(gi) {
  const category = document.getElementById("m-rcat2").value.trim();
  const emoji = document.getElementById("m-remoji2").value.trim() || "📖";
  mutate(cfg => { cfg.rules[gi].category = category; cfg.rules[gi].emoji = emoji; });
  closeModal();
  showToast("✅ Saved!");
}

function deleteRuleGroup(gi) {
  mutate(cfg => cfg.rules.splice(gi, 1));
  showToast("🗑️ Rule category deleted");
}

function addRuleItem(gi) {
  const input = document.getElementById(`new-rule-${gi}`);
  const text = input.value.trim();
  if (!text) { showToast("⚠️ Enter rule text"); return; }
  mutate(cfg => cfg.rules[gi].items.push(text));
  showToast("✅ Rule added!");
}

function deleteRuleItem(gi, ii) {
  mutate(cfg => cfg.rules[gi].items.splice(ii, 1));
  showToast("🗑️ Rule removed");
}

/* ================================================================
   APPEARANCE (fonts + emoji library)
   ================================================================ */
function renderAppearance(cfg) {
  document.getElementById("headingFontCount").textContent = cfg.fontsHeading.length + " fonts";
  document.getElementById("smallFontCount").textContent = cfg.fontsSmall.length + " fonts";

  const headingGrid = document.getElementById("headingFontGrid");
  headingGrid.innerHTML = cfg.fontsHeading.map(f => `
    <div class="font-preview-card ${cfg.fontHeading.includes(f) ? "selected" : ""}" onclick="selectHeadingFont('${f.replace(/'/g, "\\'")}')">
      <div class="sample" style="font-family:'${f}';">Perkmc</div>
      <div class="name">${f}</div>
    </div>
  `).join("");

  const smallGrid = document.getElementById("smallFontGrid");
  smallGrid.innerHTML = cfg.fontsSmall.map(f => `
    <div class="font-preview-card ${cfg.fontSmall.includes(f) ? "selected" : ""}" onclick="selectSmallFont('${f.replace(/'/g, "\\'")}')">
      <div class="sample" style="font-family:'${f}'; font-size:1rem;">The quick brown fox</div>
      <div class="name">${f}</div>
    </div>
  `).join("");

  document.getElementById("emojiLibrary").innerHTML = EMOJI_LIBRARY.map(e => `
    <button type="button" title="Copy ${e}" onclick="copyEmoji('${e}')">${e}</button>
  `).join("");
}

function selectHeadingFont(font) {
  mutate(cfg => { cfg.fontHeading = `'${font}', sans-serif`; });
  document.documentElement.style.setProperty("--font-heading", `'${font}', sans-serif`);
  showToast(`✅ Heading font set to ${font}`);
}

function selectSmallFont(font) {
  mutate(cfg => { cfg.fontSmall = `'${font}', sans-serif`; });
  document.documentElement.style.setProperty("--font-small", `'${font}', sans-serif`);
  showToast(`✅ Body font set to ${font}`);
}

function copyEmoji(emoji) {
  navigator.clipboard?.writeText(emoji);
  showToast(`📋 Copied ${emoji}`);
}

/* ================================================================
   SECURITY
   ================================================================ */
async function changePassword() {
  const pass = document.getElementById("f-newPassword").value;
  const confirm = document.getElementById("f-confirmPassword").value;
  const errEl = document.getElementById("passwordError");
  if (!pass || pass.length < 4) { errEl.textContent = "Password must be at least 4 characters."; return; }
  if (pass !== confirm) { errEl.textContent = "Passwords do not match."; return; }
  const hash = await sha256Hex(pass);
  mutate(cfg => { cfg.adminPasswordHash = hash; });
  errEl.textContent = "";
  document.getElementById("f-newPassword").value = "";
  document.getElementById("f-confirmPassword").value = "";
  showToast("✅ Password updated!");
}
