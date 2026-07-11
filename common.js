/* ============================================================
   Perkmc — Shared Header / Footer / Theme injector
   Include this on every page AFTER config.js.
   Requires: <div id="site-header"></div> and <div id="site-footer"></div>
   ============================================================ */

/* ---------------- Animated neon background (all pages) ---------------- */
function perkmcInjectNeonBg() {
  if (document.getElementById("perkmc-neon-bg")) return;
  const bg = document.createElement("div");
  bg.id = "perkmc-neon-bg";
  bg.setAttribute("aria-hidden", "true");
  bg.innerHTML = `
    <div class="grid"></div>
    <div class="blob b1"></div>
    <div class="blob b2"></div>
    <div class="blob b3"></div>
    <div class="stars"></div>
  `;
  document.body.prepend(bg);
}

/* ---------------- Cloud content update banner ----------------
   Shown if the shared database content changes while a visitor is
   already on the page (e.g. an admin edits something elsewhere). */
function perkmcShowUpdateBanner() {
  if (document.getElementById("perkmcUpdateBanner")) return;
  const bar = document.createElement("div");
  bar.id = "perkmcUpdateBanner";
  bar.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:3000;background:var(--green-600,#22c55e);color:#052210;padding:10px 16px;text-align:center;font-weight:700;font-family:var(--font-small);";
  bar.innerHTML = `🔄 This page was just updated — <a href="#" id="perkmcUpdateBannerRefresh" style="text-decoration:underline;color:#052210;">refresh to see the latest</a> <span id="perkmcUpdateBannerClose" style="cursor:pointer;margin-left:12px;">✖</span>`;
  document.body.prepend(bar);
  document.getElementById("perkmcUpdateBannerRefresh").addEventListener("click", (e) => { e.preventDefault(); location.reload(); });
  document.getElementById("perkmcUpdateBannerClose").addEventListener("click", () => bar.remove());
}

/* ---------------- Activity tracking (Firebase, optional) ----------------
   No-ops quietly until firebase-config.js is filled in — see that file. */
function perkmcVisitorId() {
  let id = localStorage.getItem("perkmcVisitorId");
  if (!id) {
    id = (window.crypto && crypto.randomUUID)
      ? crypto.randomUUID()
      : ("v-" + Date.now() + "-" + Math.random().toString(36).slice(2));
    localStorage.setItem("perkmcVisitorId", id);
  }
  return id;
}

function perkmcTrack(type, details) {
  if (!window.perkmcDb) return; // Firebase not configured yet — silently do nothing
  try {
    window.perkmcDb.collection("activity").add({
      type,
      details: details || {},
      username: localStorage.getItem("perkmcUsername") || null,
      visitorId: perkmcVisitorId(),
      page: (location.pathname.split("/").pop() || "index.html").toLowerCase(),
      ts: firebase.firestore.FieldValue.serverTimestamp(),
      tsClient: Date.now()
    }).catch(e => console.warn("Perkmc: track failed", e));
  } catch (e) {
    console.warn("Perkmc: track error", e);
  }
}

/* ---------------- "What's your Minecraft username?" popup ----------------
   Username only — never a password. Used to label store purchases /
   activity in the admin Console, not to authenticate anyone. */
function perkmcUpdateFooterUsername() {
  const el = document.getElementById("footerUsernameDisplay");
  if (!el) return;
  el.textContent = localStorage.getItem("perkmcUsername") || "Guest";
}

function perkmcShowUsernameModal() {
  if (document.getElementById("perkmcUsernameOverlay")) return;
  const existing = localStorage.getItem("perkmcUsername") || "";
  const overlay = document.createElement("div");
  overlay.id = "perkmcUsernameOverlay";
  overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:2000;display:flex;align-items:center;justify-content:center;padding:20px;";
  overlay.innerHTML = `
    <div class="card" style="max-width:380px;width:100%;text-align:center;">
      <div class="emoji-badge" style="width:56px;height:56px;font-size:1.8rem;margin:0 auto 14px;">🎮</div>
      <h3 style="margin-bottom:6px;">What's your Minecraft username?</h3>
      <p class="muted" style="margin-top:0;font-size:0.88rem;">So store purchases can be matched to your in-game account. No password needed — ever.</p>
      <input id="perkmcUsernameInput" placeholder="e.g. Steve123" value="${existing.replace(/"/g, "&quot;")}"
        style="width:100%;padding:11px 14px;margin:14px 0 8px;border-radius:10px;border:1px solid var(--border-soft);background:rgba(255,255,255,0.05);color:var(--text-main);font-size:1rem;text-align:center;">
      <div id="perkmcUsernameError" style="color:#f87171;font-size:0.82rem;min-height:18px;"></div>
      <button class="btn btn-primary btn-block" id="perkmcUsernameSave">✅ Continue</button>
      <button class="btn btn-ghost btn-block" id="perkmcUsernameSkip" style="margin-top:8px;">Skip for now</button>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById("perkmcUsernameSave").addEventListener("click", () => {
    const val = document.getElementById("perkmcUsernameInput").value.trim();
    if (!val || val.length < 3 || val.length > 16 || !/^[A-Za-z0-9_]+$/.test(val)) {
      document.getElementById("perkmcUsernameError").textContent = "Enter a valid Minecraft username (3-16 letters/numbers/underscore).";
      return;
    }
    localStorage.setItem("perkmcUsername", val);
    localStorage.setItem("perkmcUsernameSkipped", "");
    overlay.remove();
    perkmcTrack("username_set", { username: val });
    perkmcUpdateFooterUsername();
  });

  document.getElementById("perkmcUsernameSkip").addEventListener("click", () => {
    localStorage.setItem("perkmcUsernameSkipped", String(Date.now()));
    overlay.remove();
  });
}

(function () {
  const cfg = perkmcGetConfig();

  /* Apply fonts as CSS variables so admin panel choices show everywhere */
  document.documentElement.style.setProperty("--font-heading", cfg.fontHeading || PERKMC_DEFAULTS.fontHeading);
  document.documentElement.style.setProperty("--font-small", cfg.fontSmall || PERKMC_DEFAULTS.fontSmall);

  /* Update every element with data-site-name / data-server-ip etc. */
  function fillTokens(root) {
    root.querySelectorAll("[data-site-name]").forEach(el => el.textContent = cfg.siteName);
    root.querySelectorAll("[data-server-ip]").forEach(el => el.textContent = cfg.serverIpJava);
    root.querySelectorAll("[data-server-ip-bedrock]").forEach(el => el.textContent = cfg.serverIpBedrock);
    root.querySelectorAll("[data-players-online]").forEach(el => el.textContent = cfg.playersOnline);
    root.querySelectorAll("[data-players-max]").forEach(el => el.textContent = cfg.playersMax);
    root.querySelectorAll("[data-version]").forEach(el => el.textContent = cfg.version);
    root.querySelectorAll("[data-discord-link]").forEach(el => el.href = cfg.discordInvite);
    root.querySelectorAll("[data-store-link]").forEach(el => el.href = cfg.storeUrl);
  }

  const currentPage = (location.pathname.split("/").pop() || "index.html").toLowerCase();

  const navLinks = [
    { href: "index.html", label: "Home", emoji: "🏠" },
    { href: "rules.html", label: "Rules", emoji: "📖" },
    { href: "staff.html", label: "Staff", emoji: "🛡️" },
    { href: "announcements.html", label: "Announcements", emoji: "📢" },
    { href: "discord.html", label: "Discord", emoji: "💬" },
    { href: "store.html", label: "Store", emoji: "🛒" }
  ];

  function renderHeader() {
    const target = document.getElementById("site-header");
    if (!target) return;

    const linksHtml = navLinks.map(l => `
      <a class="nav-link ${currentPage === l.href ? "active" : ""}" href="${l.href}">
        <span class="nav-emoji" aria-hidden="true">${l.emoji}</span>${l.label}
      </a>`).join("");

    target.innerHTML = `
      <header class="site-header">
        <div class="header-inner">
          <a href="index.html" class="brand">
            <span class="brand-mark">🌲</span>
            <span class="brand-name">${cfg.siteName}</span>
          </a>

          <nav class="main-nav" id="mainNav">
            ${linksHtml}
          </nav>

          <div class="header-actions">
            <a href="${cfg.discordInvite}" target="_blank" rel="noopener" class="btn btn-ghost" id="headerDiscordBtn">💬 Discord</a>
            <a href="${cfg.storeUrl}" class="btn btn-primary" id="headerStoreBtn">🛒 Store</a>
          </div>

          <button class="nav-toggle" id="navToggle" aria-label="Toggle menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </header>
    `;

    const discordBtn = document.getElementById("headerDiscordBtn");
    if (discordBtn) discordBtn.addEventListener("click", () => perkmcTrack("outbound_click", { target: "discord_header" }));
    const storeBtn = document.getElementById("headerStoreBtn");
    if (storeBtn) storeBtn.addEventListener("click", () => perkmcTrack("outbound_click", { target: "store_header" }));

    const toggle = document.getElementById("navToggle");
    const nav = document.getElementById("mainNav");
    toggle.addEventListener("click", () => {
      nav.classList.toggle("open");
      toggle.classList.toggle("open");
    });
  }

  function renderFooter() {
    const target = document.getElementById("site-footer");
    if (!target) return;

    target.innerHTML = `
      <footer class="site-footer">
        <div class="footer-inner">
          <div class="footer-col footer-brand">
            <div class="brand">
              <span class="brand-mark">🌲</span>
              <span class="brand-name">${cfg.siteName}</span>
            </div>
            <p>${cfg.tagline}</p>
            <div class="footer-socials">
              <a href="${cfg.socials.discord}" target="_blank" rel="noopener" title="Discord">💬</a>
              <a href="${cfg.socials.youtube}" target="_blank" rel="noopener" title="YouTube">📺</a>
              <a href="${cfg.socials.tiktok}" target="_blank" rel="noopener" title="TikTok">🎵</a>
              <a href="${cfg.socials.instagram}" target="_blank" rel="noopener" title="Instagram">📸</a>
              <a href="${cfg.socials.twitter}" target="_blank" rel="noopener" title="Twitter / X">🐦</a>
            </div>
          </div>

          <div class="footer-col">
            <h4>🧭 Explore</h4>
            <a href="index.html">🏠 Home</a>
            <a href="rules.html">📖 Rules</a>
            <a href="staff.html">🛡️ Staff</a>
            <a href="announcements.html">📢 Announcements</a>
          </div>

          <div class="footer-col">
            <h4>🔗 Community</h4>
            <a href="${cfg.discordInvite}" target="_blank" rel="noopener">💬 Discord</a>
            <a href="${cfg.storeUrl}">🛒 Store</a>
            <a href="admin.html">🔒 Admin</a>
          </div>

          <div class="footer-col">
            <h4>🖥️ Server IP</h4>
            <button class="ip-copy" id="footerIpCopy" title="Click to copy">
              <span data-server-ip>${cfg.serverIpJava}</span> 📋
            </button>
            <button class="ip-copy" id="footerUsernameChange" title="Click to set/change your Minecraft username" style="margin-top:8px;">
              🎮 <span id="footerUsernameDisplay">Guest</span> ✏️
            </button>
            <p class="muted">🧱 Java &amp; Bedrock supported</p>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© <span id="footerYear"></span> ${cfg.siteName}. Not affiliated with Mojang or Microsoft. 🍃</span>
        </div>
      </footer>
    `;

    document.getElementById("footerYear").textContent = new Date().getFullYear();

    const copyBtn = document.getElementById("footerIpCopy");
    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        navigator.clipboard?.writeText(cfg.serverIpJava).then(() => {
          const original = copyBtn.innerHTML;
          copyBtn.innerHTML = "✅ Copied!";
          setTimeout(() => (copyBtn.innerHTML = original), 1500);
          perkmcTrack("ip_copy", { ip: cfg.serverIpJava, location: "footer" });
        });
      });
    }

    const userBtn = document.getElementById("footerUsernameChange");
    if (userBtn) {
      perkmcUpdateFooterUsername();
      userBtn.addEventListener("click", () => perkmcShowUsernameModal());
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    perkmcInjectNeonBg();
    renderHeader();
    renderFooter();
    fillTokens(document);

    // Player tracking + username popup — skipped on the admin panel itself.
    if (currentPage !== "admin.html") {
      perkmcTrack("page_view", {});
      if (!localStorage.getItem("perkmcUsername") && !localStorage.getItem("perkmcUsernameSkipped")) {
        perkmcShowUsernameModal();
      }
    }

    // Pull the shared database content (if configured) so every visitor
    // sees the same live site data, not just whatever this browser cached.
    perkmcSyncCloudConfig(
      () => {
        // Cloud has different data than this browser's cache — reload once to show it.
        if (!sessionStorage.getItem("perkmcCloudSyncedOnce")) {
          sessionStorage.setItem("perkmcCloudSyncedOnce", "1");
          location.reload();
        }
      },
      () => perkmcShowUpdateBanner()
    );
  });

  window.PERKMC_CFG = cfg;
})();
