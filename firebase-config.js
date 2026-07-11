/* ============================================================
   Perkmc — Firebase connection
   Powers three things: the "what's your Minecraft username?"
   popup, the live Admin Console (Console tab) that shows what
   real visitors are doing on your site, and the shared database
   for all your site content (staff, announcements, store, rules,
   settings, fonts) — so every visitor and every device sees the
   same live data instead of each browser having its own copy.

   This uses Firebase Firestore — a free cloud database from
   Google. No backend server code needed, and it's free for a
   small server's traffic (Spark plan, no credit card required).

   ---------------------------------------------------------
   HOW TO SET THIS UP (one time, about 5 minutes):
   ---------------------------------------------------------
   1. Go to https://console.firebase.google.com and sign in with
      any Google account.
   2. Click "Add project" → give it any name (e.g. "perkmc") →
      finish the wizard (you can turn OFF Google Analytics, it's
      not needed).
   3. In the left sidebar: Build → Firestore Database → Create
      database. Choose "Start in test mode" (fastest), pick any
      location close to you, click Enable.
      (Optional but recommended once it's working: replace the
      rules with the safer version at the bottom of this file.)
   4. Go back to Project Overview (gear icon → Project settings,
      or the home icon), scroll to "Your apps", click the "</>"
      (Web) icon to register a new Web App. Any nickname is fine.
      Skip Firebase Hosting — you don't need it.
   5. Firebase shows you a firebaseConfig object with your own
      values. Copy them into PERKMC_FIREBASE_CONFIG below,
      replacing the empty quotes.
   6. Save this file and re-upload/redeploy your site (drag the
      updated folder onto Netlify again). Done — the username
      popup and the admin Console tab will start working.

   Until you fill this in, nothing breaks — the site works
   exactly as before, the username popup, Console tab and shared
   database just stay quietly turned off (each browser keeps using
   its own local data, like before).
   ============================================================ */

const PERKMC_FIREBASE_CONFIG = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

window.perkmcDb = null;

(function initPerkmcFirebase() {
  if (!PERKMC_FIREBASE_CONFIG.apiKey || !PERKMC_FIREBASE_CONFIG.projectId) {
    console.info("Perkmc: Firebase not configured yet — username popup & Console tab are disabled. See firebase-config.js.");
    return;
  }
  if (typeof firebase === "undefined") {
    console.warn("Perkmc: Firebase SDK didn't load (check your internet connection / script tags).");
    return;
  }
  try {
    firebase.initializeApp(PERKMC_FIREBASE_CONFIG);
    window.perkmcDb = firebase.firestore();
  } catch (e) {
    console.warn("Perkmc: Firebase failed to initialize.", e);
  }
})();

/* ---------------------------------------------------------------
   FIRESTORE RULES — paste into Firebase Console → Firestore
   Database → Rules → replace everything → Publish.

   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /activity/{doc} {
         allow create: if request.resource.data.type is string
                       && request.resource.data.page is string;
         allow read: if true;
         allow update, delete: if false;
       }
       match /site/config {
         allow read: if true;
         allow write: if true;
       }
     }
   }

   Good to know / be honest with yourself about:
   - "activity" (the Console feed): reads are open so the admin
     Console page can show it, and anyone can ADD an event (needed
     for tracking without a login system), but nobody can edit or
     delete existing entries. Never log passwords, emails, or
     payment details through perkmcTrack() — usernames and simple
     click events only.
   - "site/config" (your staff/announcements/store/rules/settings):
     both read AND write are open here. That's what makes the admin
     panel able to save without a real server — but it also means
     anyone who inspects your site's public code could technically
     write to this document directly too, bypassing the admin
     password screen entirely (that password screen is just a UI
     gate, it isn't something Firestore's rules can see). This is
     the fast/simple setup. If you want this properly locked down
     so only you can write changes, the real fix is adding Firebase
     Authentication (a real login tied to Firestore rules) — ask
     and it can be added on top of this without starting over.
   --------------------------------------------------------------- */
