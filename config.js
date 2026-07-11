/* ============================================================
   Perkmc — Site Configuration & Data Layer
   Everything the Admin Panel edits lives here. Defaults below
   are used the first time the site loads; after that, whatever
   is saved in the Admin Panel (stored in this browser via
   localStorage) takes over.
   ============================================================ */

const PERKMC_STORAGE_KEY = "perkmcConfig_v1";
const PERKMC_ADMIN_KEY = "perkmcAdminAuth_v1";
const PERKMC_CLOUD_COLLECTION = "site";
const PERKMC_CLOUD_DOC = "config";

/* ---- Default configuration (edit here for initial values,
   or just use the Admin Panel after uploading the site) ---- */
const PERKMC_DEFAULTS = {
  // Default admin password is "perkmc123" — CHANGE THIS after first login!
  // (stored as a SHA-256 hash, not plaintext)
  adminPasswordHash: "e4b88aed48d8351dac4d41fcca554a3ae41b479c4da62ce11aa557ec822c9ca4",

  siteName: "Perkmc",
  tagline: "MINECRAFT SURVIVAL REDEFINED",
  heroTitleTop: "Welcome to the",
  heroTitleHighlight: "Perkmc Community",
  heroSubtitle: "Survival, towns, events & a community that actually feels like home.",
  serverIpJava: "play.perkmc.net",
  serverIpBedrock: "play.perkmc.net:19132",
  discordInvite: "https://discord.gg/perkmc",
  storeUrl: "store.html",
  playersOnline: 152,
  playersMax: 500,
  version: "1.21.x",

  socials: {
    discord: "https://discord.gg/perkmc",
    youtube: "https://youtube.com/@perkmc",
    tiktok: "https://tiktok.com/@perkmc",
    instagram: "https://instagram.com/perkmc",
    twitter: "https://x.com/perkmc"
  },

  fontHeading: "'Baloo 2', sans-serif",
  fontSmall: "'Inter', sans-serif",

  fontsHeading: [
    "Baloo 2", "Fredoka", "Bangers", "Luckiest Guy", "Press Start 2P",
    "Orbitron", "Russo One", "Bebas Neue", "Titan One", "Bungee", "Rubik Mono One"
  ],
  fontsSmall: [
    "Inter", "Nunito Sans", "Work Sans", "Mulish", "Rubik"
  ],

  features: [
    { emoji: "⚔️", title: "Survival Worlds", desc: "Fresh survival maps with land claiming, economy & raiding on select worlds." },
    { emoji: "🏰", title: "Towns & Nations", desc: "Build towns, form nations, and go to war or trade in-game." },
    { emoji: "🎁", title: "Weekly Events", desc: "Build battles, PvP tournaments and giveaways every single week." },
    { emoji: "🛡️", title: "Active Staff", desc: "A friendly, active staff team keeping the server fair and fun." },
    { emoji: "🌳", title: "Custom Terrain", desc: "Custom-generated worlds built for exploring and settling." },
    { emoji: "💎", title: "Custom Enchants", desc: "Balanced custom enchantments and gear progression." }
  ],

  staffCategories: ["Owner", "Manager", "Admin", "Moderator", "Helper", "Builder", "Support"],

  staff: [
    { name: "Suresh", category: "Owner", emoji: "👑", note: "Founder & Owner" },
    { name: "Nova", category: "Manager", emoji: "🧭", note: "Community Manager" },
    { name: "Ash", category: "Admin", emoji: "🛡️", note: "Server Administrator" },
    { name: "Kito", category: "Moderator", emoji: "🔨", note: "Keeping chat clean" },
    { name: "Wisp", category: "Helper", emoji: "🌿", note: "Here to help new players" },
    { name: "Rune", category: "Helper", emoji: "🍀", note: "Support & tickets" },
    { name: "Ember", category: "Builder", emoji: "🧱", note: "Spawn & event builds" }
  ],

  announcements: [
    {
      title: "Perkmc 2.0 Season Launch 🎉",
      date: "2026-07-01",
      tag: "Update",
      emoji: "🌱",
      body: "Season 2 is live! New survival world, custom enchants, and a brand new spawn. Wipe complete, economy reset — come stake your claim."
    },
    {
      title: "Double XP Weekend ⚡",
      date: "2026-06-24",
      tag: "Event",
      emoji: "🔥",
      body: "This weekend only: double mob XP and double vote rewards. Grab your gear and grind those levels."
    },
    {
      title: "Store Restock — New Ranks 🛒",
      date: "2026-06-15",
      tag: "Store",
      emoji: "💰",
      body: "Two new ranks added to the store with cosmetic perks, extra homes, and colored chat tags."
    }
  ],

  rules: [
    {
      category: "General Conduct",
      emoji: "📖",
      items: [
        "Be respectful to every player and staff member — no exceptions.",
        "No hate speech, harassment, or discrimination of any kind.",
        "Keep chat appropriate — no NSFW content, spam, or excessive caps.",
        "Follow staff instructions at all times."
      ]
    },
    {
      category: "Building & Griefing",
      emoji: "🧱",
      items: [
        "Griefing, stealing, or destroying other players' builds is strictly banned.",
        "Claim your land as soon as possible using the claim tools provided.",
        "Do not build offensive structures or symbols anywhere on the server."
      ]
    },
    {
      category: "PvP & Combat",
      emoji: "⚔️",
      items: [
        "PvP is allowed only in designated PvP zones and warzones.",
        "Combat logging (disconnecting to avoid a fight) is punishable.",
        "X-ray, kill-aura, or any combat-related hacks are an instant ban."
      ]
    },
    {
      category: "Cheating & Exploits",
      emoji: "🚫",
      items: [
        "No hacked clients, X-ray texture packs, or auto-clickers.",
        "Exploiting bugs must be reported, not abused, immediately.",
        "Alt accounts used to bypass punishments are bannable."
      ]
    },
    {
      category: "Economy & Trading",
      emoji: "💰",
      items: [
        "Scamming other players in trades is strictly forbidden.",
        "Real-money trading (RMT) for in-game items is not allowed.",
        "Store purchases are final — see the Store page for details."
      ]
    }
  ],

  storeItems: [
    { name: "Helper Rank", emoji: "🌿", icon: "leaf", price: "$4.99", tag: "Starter", color: "#2bff9b",
      perks: ["Colored chat tag", "1 extra /home", "Access to /kit helper", "Priority queue"] },
    { name: "Knight Rank", emoji: "⚔️", icon: "swords", price: "$9.99", tag: "Popular", color: "#26e6ff",
      perks: ["Everything in Helper", "3 extra /homes", "Access to /kit knight", "Particle trails"] },
    { name: "Guardian Rank", emoji: "🛡️", icon: "shield", price: "$19.99", tag: "Best Value", color: "#0bd0a6",
      perks: ["Everything in Knight", "5 extra /homes", "/kit guardian monthly", "Custom join message"] },
    { name: "Dragon Rank", emoji: "🐉", icon: "dragon", price: "$34.99", tag: "Ultimate", color: "#a970ff",
      perks: ["Everything in Guardian", "Unlimited /homes", "Exclusive dragon pet", "Early access to events"] },
    { name: "500 Gems", emoji: "💎", icon: "gem", price: "$4.99", tag: "Currency", color: "#26e6ff",
      perks: ["In-game currency for /shop", "Use on cosmetics", "Never expires"] }
  ]
};

/* ---- Config get/save helpers ---- */
function perkmcGetConfig() {
  try {
    const saved = localStorage.getItem(PERKMC_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // shallow-merge so any new default fields still show up after updates
      return Object.assign({}, PERKMC_DEFAULTS, parsed, {
        socials: Object.assign({}, PERKMC_DEFAULTS.socials, parsed.socials || {})
      });
    }
  } catch (e) {
    console.warn("Perkmc: could not read saved config, using defaults.", e);
  }
  return JSON.parse(JSON.stringify(PERKMC_DEFAULTS));
}

function perkmcSaveConfig(config) {
  localStorage.setItem(PERKMC_STORAGE_KEY, JSON.stringify(config));
  perkmcPushCloudConfig(config);
}

function perkmcResetConfig() {
  localStorage.removeItem(PERKMC_STORAGE_KEY);
  if (window.perkmcDb) {
    window.perkmcDb.collection(PERKMC_CLOUD_COLLECTION).doc(PERKMC_CLOUD_DOC).delete()
      .catch(e => console.warn("Perkmc: cloud reset failed", e));
  }
}

/* ================================================================
   CLOUD SYNC (shared database, via Firebase — see firebase-config.js)
   All site content (staff, announcements, store, rules, settings,
   fonts) lives in ONE Firestore document, so every page — and every
   visitor's browser — reads and writes the same shared data instead
   of each browser having its own private copy.

   Until firebase-config.js is filled in, none of this runs and the
   site behaves exactly as before (localStorage-only, per-browser).
   ================================================================ */
function perkmcPushCloudConfig(config) {
  if (!window.perkmcDb) return;
  try {
    window.perkmcDb.collection(PERKMC_CLOUD_COLLECTION).doc(PERKMC_CLOUD_DOC).set(config)
      .catch(e => console.warn("Perkmc: cloud save failed", e));
  } catch (e) {
    console.warn("Perkmc: cloud save error", e);
  }
}

/* Call once per page load. `onInitialChange` fires if the shared cloud
   data is different from what this browser already had cached (so the
   caller can refresh the view). `onLiveChange` fires later if someone
   else changes the data while this page stays open. */
function perkmcSyncCloudConfig(onInitialChange, onLiveChange) {
  if (!window.perkmcDb) return;
  const ref = window.perkmcDb.collection(PERKMC_CLOUD_COLLECTION).doc(PERKMC_CLOUD_DOC);

  ref.get().then(snap => {
    if (!snap.exists) {
      // Nobody has saved to the cloud yet — seed it with whatever this browser has now.
      perkmcPushCloudConfig(perkmcGetConfig());
      return;
    }
    const cloudData = snap.data();
    const before = localStorage.getItem(PERKMC_STORAGE_KEY);
    const after = JSON.stringify(cloudData);
    localStorage.setItem(PERKMC_STORAGE_KEY, after);
    if (before !== after && typeof onInitialChange === "function") onInitialChange(cloudData);
  }).catch(e => console.warn("Perkmc: cloud sync failed", e));

  let firstSnapshot = true;
  ref.onSnapshot(snap => {
    if (!snap.exists) return;
    if (firstSnapshot) { firstSnapshot = false; return; } // that was just the initial load, handled above
    const cloudData = snap.data();
    localStorage.setItem(PERKMC_STORAGE_KEY, JSON.stringify(cloudData));
    if (typeof onLiveChange === "function") onLiveChange(cloudData);
  }, e => console.warn("Perkmc: cloud listener failed", e));
}
