==========================================
 VELOX CHAT — Deploy Guide (Vercel)
==========================================

FILES
-----
index.html       -> Main app: ChatGPT-style AI chat (login / signup / guest, saved chats,
                    projects, pin, code Copy + Preview)
plans.html       -> Plans page: Free / Smart / Pro / Velox (all Coming Soon) + Community
                    section with Discord join + ticket steps
admin.html       -> Admin panel (set password on first open). Manage plans, Coming Soon
                    badges, Discord link, community steps. Also shows registered users.
config.js        -> Default plans + Discord link (edit this for changes visible to ALL visitors)
animations.html  -> Animation Studio: describe an idea, AI builds a live animation
                    (player + gallery + download). Uses the same /api/chat proxy.
velox-lite.html  -> Bonus: the original simple Velox Lite chatbot page

NEW: api/chat.js  -> Serverless AI proxy. Your OpenRouter key stays HIDDEN on the server.

SETUP THE API KEY (one time, 1 minute)
--------------------------------------
1. Deploy the folder on Vercel (steps below).
2. Vercel dashboard -> your project -> Settings -> Environment Variables -> Add:
      Name : OPENROUTER_API_KEY
      Value: your OpenRouter key (sk-or-v1-...)
3. Deployments tab -> Redeploy. Done - smart AI live, key invisible.
   (If you skip this, the bot still works on the free Pollinations fallback.)

OPTIONAL: USE REAL CLAUDE INSTEAD (paid, higher quality)
----------------------------------------------------------
api/chat.js now also supports a real Anthropic Claude key. If you add it,
every chat request tries Claude FIRST, and only falls back to the free
OpenRouter chain if Claude fails or isn't configured.
  1. Get a key at https://console.anthropic.com (Settings -> API Keys).
     NEVER paste this key into a chat with any AI assistant, including
     Claude itself - only type it directly into the Vercel field below.
  2. Vercel dashboard -> your project -> Settings -> Environment Variables -> Add:
        Name : ANTHROPIC_API_KEY
        Value: your key (sk-ant-api03-...)
  3. Deployments tab -> Redeploy.
  4. Set a spending limit at console.anthropic.com -> Settings -> Limits so
     usage can't run away on you - this key is billed per message, unlike
     the free OpenRouter/Pollinations chain.
  This is entirely optional - skip it and the app keeps working 100% free.

DEPLOY ON VERCEL (2 minutes)
----------------------------
1. Unzip this folder.
2. Go to https://vercel.com -> Log in -> "Add New..." -> "Project"
   (or just drag & drop the folder at https://vercel.com/new)
3. Upload / import the folder. No build settings needed - it's a static site.
4. Deploy. Your site will be live at yourname.vercel.app
   - Chat:   /            (index.html)
   - Plans:  /plans.html
   - Admin:  /admin.html  (keep this URL private!)

IMPORTANT NOTES
---------------
* No backend: accounts, chats, and admin edits are stored in each visitor's
  BROWSER storage. Your admin changes show in YOUR browser.
* To change plans / Discord link for ALL visitors:
  Admin panel -> "Export config.js" -> replace config.js in the folder -> redeploy.
* The AI is free (Pollinations API) - needs internet, no API key.
  Users can also plug their own OpenRouter/Groq key via the gear icon in chat.
* Don't use a real password when testing signup - it's demo-grade storage.

ADMIN PANEL
-----------
* First open of /admin.html asks you to CREATE the admin password.
* You can: edit plan names, prices, taglines, features, toggle "Coming Soon",
  set the "Most Popular" highlight, change the Discord invite link and the
  community ticket steps, view registered users, reset to defaults.


ANDROID APP (2 ways)
--------------------
The site is now a full PWA (installable app).

WAY 1 - Instant install (no APK needed):
  1. Deploy on Vercel as usual.
  2. Open your site in Chrome on any Android phone.
  3. Chrome menu (3 dots) -> "Install app" (ya "Add to Home screen").
  4. Done - Velox opens fullscreen like a real app, with your logo,
     works offline (shell), and shows in the app drawer.

WAY 2 - Real APK file (Play-Store ready), free, ~5 min:
  1. Deploy the site first (PWA must be live).
  2. Go to https://www.pwabuilder.com
  3. Paste your site URL -> Start -> Package for Android.
  4. Download the .apk / .aab. Install the APK on any phone directly,
     or upload the .aab to Google Play Console ($25 one-time) to publish.

Note: sw.js caches the app shell. AI calls always need internet.
