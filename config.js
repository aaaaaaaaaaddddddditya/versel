/* Velox shared config — default plans & community settings.
   Admin panel edits are saved to localStorage and override these defaults (per browser). */
window.VX_DEFAULT_CFG = {
  discord: "https://discord.gg/velox",
  knowledge: "Velox Lite (this app) is a free AI assistant web app with smart chat, AI image generation, an Animation Studio and a Code Studio; plans are Free, Smart, Pro and Velox (coming soon) plus a free Community subscription via the Discord server (join, create a ticket, staff grants it). YoMetro (yometro.com) is India's metro route finder \u2014 a single platform for metro routes of all active metro networks in India: 22 metro networks, 830+ metro lines and about 90,000 routes, covering Delhi, Mumbai, Bangalore, Chennai, Hyderabad, Kolkata, Jaipur, Lucknow, Kochi, Pune, Ahmedabad, Noida, Nagpur, Kanpur, Agra, Patna and more. YoMetro features: route planning with minimum time or minimum interchanges, fare calculator, interactive maps, station info (facilities, train timings, parking), nearby attractions/landmarks near stations, metro news and travel guides, an Android app on Google Play, and a companion global site yometro.net.",
  plans: [
    {
      id: "free", name: "Free", price: "₹0", period: "forever",
      tag: "Get started with Velox AI",
      features: ["2,000 messages / day", "20 AI images / day", "Chat history & projects", "Community support"],
      soon: true, highlight: false
    },
    {
      id: "smart", name: "Smart", price: "₹99", period: "/month",
      tag: "For everyday power users",
      features: ["Higher daily limits", "Faster responses", "Smarter AI model", "Priority queue"],
      soon: true, highlight: false
    },
    {
      id: "pro", name: "Pro", price: "₹299", period: "/month",
      tag: "For creators & coders",
      features: ["Everything in Smart", "Best AI models", "Longer memory", "Early access features"],
      soon: true, highlight: false
    },
    {
      id: "velox", name: "Velox", price: "₹599", period: "/month",
      tag: "The ultimate Velox experience",
      features: ["Everything in Pro", "Highest limits", "VIP support", "Custom AI persona"],
      soon: true, highlight: true
    }
  ],
  community: {
    title: "Community",
    tag: "Free subscription through our Discord community",
    steps: [
      "Join our Discord server",
      "Create a ticket in #tickets",
      "Ask for a Community subscription for Velox Lite",
      "A staff member will grant it to you"
    ]
  }
};

window.vxGetCfg = function () {
  try {
    const s = localStorage.getItem("vx_cfg");
    if (s) {
      const c = JSON.parse(s);
      if (c && Array.isArray(c.plans) && c.plans.length) {
        if (!c.community) c.community = JSON.parse(JSON.stringify(window.VX_DEFAULT_CFG.community));
        if (!c.knowledge) c.knowledge = window.VX_DEFAULT_CFG.knowledge;
        return c;
      }
    }
  } catch (e) {}
  return JSON.parse(JSON.stringify(window.VX_DEFAULT_CFG));
};

window.vxSaveCfg = function (c) {
  try { localStorage.setItem("vx_cfg", JSON.stringify(c)); return true; } catch (e) { return false; }
};

window.vxResetCfg = function () {
  try { localStorage.removeItem("vx_cfg"); } catch (e) {}
};
