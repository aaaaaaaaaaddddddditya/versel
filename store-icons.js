/* ============================================================
   Perkmc — Custom SVG store icons (3D-style, neon, animated)
   Each icon is a self-contained inline SVG string. Use
   perkmcStoreIcon(name) to get one; unknown names fall back to
   a glowing loot crate. Icons animate via SMIL + CSS (.store-icon).
   ============================================================ */

const PERKMC_STORE_ICONS = {

  /* ---- Isometric loot crate (bundles / generic) ---- */
  crate: `
  <svg class="store-icon" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="crTop" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3affb0"/><stop offset="1" stop-color="#0bd0a6"/></linearGradient>
      <linearGradient id="crL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f8f9a"/><stop offset="1" stop-color="#0a5f7a"/></linearGradient>
      <linearGradient id="crR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a6f86"/><stop offset="1" stop-color="#06364f"/></linearGradient>
      <filter id="crGlow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="3.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <g filter="url(#crGlow)">
      <polygon points="60,22 100,44 60,66 20,44" fill="url(#crTop)" stroke="#eafcff" stroke-width="1.2"/>
      <polygon points="20,44 60,66 60,104 20,82" fill="url(#crL)" stroke="#26e6ff" stroke-width="1"/>
      <polygon points="100,44 60,66 60,104 100,82" fill="url(#crR)" stroke="#26e6ff" stroke-width="1"/>
      <!-- glowing front panel -->
      <polygon points="34,58 60,73 60,92 34,77" fill="#041a1f" stroke="#2bff9b" stroke-width="1.4"/>
      <circle cx="47" cy="76" r="5" fill="#2bff9b"><animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/></circle>
      <!-- lid seam + bolts -->
      <line x1="20" y1="44" x2="60" y2="66" stroke="#eafcff" stroke-width="0.8" opacity="0.6"/>
      <circle cx="26" cy="49" r="2" fill="#26e6ff"/><circle cx="94" cy="49" r="2" fill="#26e6ff"/>
    </g>
  </svg>`,

  /* ---- Leaf / sapling medallion (Helper) ---- */
  leaf: `
  <svg class="store-icon" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    ${'' /* medallion base + spinning ring + leaf glyph */}
    <defs>
      <radialGradient id="lfBase" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#16324a"/><stop offset="1" stop-color="#081726"/></radialGradient>
      <linearGradient id="lfLeaf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5affb0"/><stop offset="1" stop-color="#0bd0a6"/></linearGradient>
      <filter id="lfGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <g filter="url(#lfGlow)">
      <circle cx="60" cy="60" r="40" fill="none" stroke="#2bff9b" stroke-width="2" stroke-dasharray="5 10">
        <animateTransform attributeName="transform" type="rotate" from="0 60 60" to="360 60 60" dur="16s" repeatCount="indefinite"/>
      </circle>
      <circle cx="60" cy="60" r="32" fill="url(#lfBase)" stroke="#2bff9b" stroke-width="1.5"/>
      <path d="M60 40 C74 46 74 66 60 80 C46 66 46 46 60 40 Z" fill="url(#lfLeaf)"/>
      <path d="M60 44 L60 76" stroke="#04120c" stroke-width="1.4" opacity="0.7"/>
    </g>
  </svg>`,

  /* ---- Crossed swords medallion (Knight) ---- */
  swords: `
  <svg class="store-icon" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <radialGradient id="swBase" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#122a4a"/><stop offset="1" stop-color="#06162a"/></radialGradient>
      <linearGradient id="swBlade" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d6faff"/><stop offset="1" stop-color="#26e6ff"/></linearGradient>
      <filter id="swGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <g filter="url(#swGlow)">
      <circle cx="60" cy="60" r="40" fill="none" stroke="#26e6ff" stroke-width="2" stroke-dasharray="5 10">
        <animateTransform attributeName="transform" type="rotate" from="360 60 60" to="0 60 60" dur="18s" repeatCount="indefinite"/>
      </circle>
      <circle cx="60" cy="60" r="32" fill="url(#swBase)" stroke="#26e6ff" stroke-width="1.5"/>
      <g stroke-linecap="round">
        <g transform="rotate(45 60 60)">
          <rect x="58" y="38" width="4" height="40" fill="url(#swBlade)"/>
          <rect x="52" y="74" width="16" height="3.5" fill="#a970ff"/>
          <rect x="58.5" y="78" width="3" height="8" fill="#0bd0a6"/>
        </g>
        <g transform="rotate(-45 60 60)">
          <rect x="58" y="38" width="4" height="40" fill="url(#swBlade)"/>
          <rect x="52" y="74" width="16" height="3.5" fill="#a970ff"/>
          <rect x="58.5" y="78" width="3" height="8" fill="#0bd0a6"/>
        </g>
      </g>
    </g>
  </svg>`,

  /* ---- Shield medallion (Guardian) ---- */
  shield: `
  <svg class="store-icon" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <radialGradient id="shBase" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#0f3340"/><stop offset="1" stop-color="#06202a"/></radialGradient>
      <linearGradient id="shBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3affb0"/><stop offset="1" stop-color="#089c9a"/></linearGradient>
      <filter id="shGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <g filter="url(#shGlow)">
      <circle cx="60" cy="60" r="40" fill="none" stroke="#0bd0a6" stroke-width="2" stroke-dasharray="4 12">
        <animateTransform attributeName="transform" type="rotate" from="0 60 60" to="360 60 60" dur="20s" repeatCount="indefinite"/>
      </circle>
      <circle cx="60" cy="60" r="32" fill="url(#shBase)" stroke="#0bd0a6" stroke-width="1.5"/>
      <path d="M60 38 L80 46 L80 62 C80 76 70 82 60 86 C50 82 40 76 40 62 L40 46 Z" fill="url(#shBody)" stroke="#eafcff" stroke-width="1.2"/>
      <path d="M60 48 L60 78 M50 58 L70 58" stroke="#04120c" stroke-width="2.4" opacity="0.75" stroke-linecap="round"/>
    </g>
  </svg>`,

  /* ---- Dragon / flame medallion (Dragon) ---- */
  dragon: `
  <svg class="store-icon" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <radialGradient id="drBase" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#2a1a4a"/><stop offset="1" stop-color="#140828"/></radialGradient>
      <linearGradient id="drFlame" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#a970ff"/><stop offset="0.5" stop-color="#ff5ed3"/><stop offset="1" stop-color="#26e6ff"/></linearGradient>
      <filter id="drGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <g filter="url(#drGlow)">
      <circle cx="60" cy="60" r="40" fill="none" stroke="#a970ff" stroke-width="2" stroke-dasharray="6 9">
        <animateTransform attributeName="transform" type="rotate" from="360 60 60" to="0 60 60" dur="14s" repeatCount="indefinite"/>
      </circle>
      <circle cx="60" cy="60" r="32" fill="url(#drBase)" stroke="#a970ff" stroke-width="1.5"/>
      <path d="M60 82 C48 74 46 60 54 46 C56 54 60 52 60 44 C68 52 74 62 68 74 C66 68 62 70 62 76 C61 79 60 81 60 82 Z" fill="url(#drFlame)">
        <animate attributeName="opacity" values="0.7;1;0.7" dur="1.8s" repeatCount="indefinite"/>
      </path>
      <circle cx="60" cy="66" r="3" fill="#fff"><animate attributeName="r" values="2;4;2" dur="1.8s" repeatCount="indefinite"/></circle>
    </g>
  </svg>`,

  /* ---- Gem cluster (currency) ---- */
  gem: `
  <svg class="store-icon" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="gmA" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9dffd2"/><stop offset="1" stop-color="#26e6ff"/></linearGradient>
      <linearGradient id="gmB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#26e6ff"/><stop offset="1" stop-color="#0a5f7a"/></linearGradient>
      <filter id="gmGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <g filter="url(#gmGlow)">
      <g>
        <animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="3s" repeatCount="indefinite"/>
        <polygon points="60,34 78,52 60,86 42,52" fill="url(#gmA)" stroke="#eafcff" stroke-width="1.2"/>
        <polygon points="60,34 78,52 60,86" fill="url(#gmB)" opacity="0.85"/>
        <polygon points="42,52 78,52 60,86" fill="#0b3b52" opacity="0.35"/>
        <line x1="60" y1="34" x2="60" y2="86" stroke="#eafcff" stroke-width="0.8" opacity="0.6"/>
      </g>
      <polygon points="34,66 44,74 34,90 24,74" fill="url(#gmA)" stroke="#eafcff" stroke-width="1" opacity="0.9"/>
      <polygon points="86,66 96,74 86,90 76,74" fill="url(#gmA)" stroke="#eafcff" stroke-width="1" opacity="0.9"/>
      <circle cx="52" cy="48" r="2" fill="#fff"><animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/></circle>
    </g>
  </svg>`,

  /* ---- Coin stack (currency alt) ---- */
  coins: `
  <svg class="store-icon" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="cnFace" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3b0"/><stop offset="1" stop-color="#f6c700"/></linearGradient>
      <filter id="cnGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <g filter="url(#cnGlow)">
      <g>
        <animateTransform attributeName="transform" type="translate" values="0 0;0 -2.5;0 0" dur="2.6s" repeatCount="indefinite"/>
        <ellipse cx="60" cy="86" rx="30" ry="11" fill="#b8860b"/>
        <ellipse cx="60" cy="82" rx="30" ry="11" fill="url(#cnFace)" stroke="#7a5c00" stroke-width="1"/>
        <ellipse cx="60" cy="70" rx="30" ry="11" fill="#d9a900"/>
        <ellipse cx="60" cy="66" rx="30" ry="11" fill="url(#cnFace)" stroke="#7a5c00" stroke-width="1"/>
        <ellipse cx="60" cy="52" rx="30" ry="11" fill="#d9a900"/>
        <ellipse cx="60" cy="48" rx="30" ry="11" fill="url(#cnFace)" stroke="#7a5c00" stroke-width="1"/>
        <text x="60" y="53" text-anchor="middle" font-size="15" font-weight="900" fill="#7a5c00" font-family="Arial, sans-serif">$</text>
      </g>
    </g>
  </svg>`
};

/* Names shown in the admin icon picker */
const PERKMC_STORE_ICON_NAMES = ["crate", "leaf", "swords", "shield", "dragon", "gem", "coins"];

function perkmcStoreIcon(name) {
  return PERKMC_STORE_ICONS[name] || PERKMC_STORE_ICONS.crate;
}
