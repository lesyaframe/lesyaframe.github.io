/* Лесин хаб: вход, хранение в Firebase и работа без сети.
   Каждая страница подключает этот файл с data-app="<раздел>".
   Страницы общаются с базой через window.claude.use("db") —
   здесь это тот же интерфейс, только поверх Firestore. */
(function(){
  const APP = document.currentScript?.dataset.app || "hub";
  const CFG = window.FIREBASE_CONFIG || null;
  const OWNER_HASH = window.PORTAL_OWNER_HASH || "";
  const sha256 = async t => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)))].map(b => b.toString(16).padStart(2, "0")).join("");

  /* офлайн-режим и установка как приложение */
  if ("serviceWorker" in navigator) {
    addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }

  if (!CFG || !window.firebase) {
    // Firebase ещё не настроен: страницы работают с памятью браузера
    window.claude = { use: async () => null };
    return;
  }

  firebase.initializeApp(CFG);
  const fs = firebase.firestore();
  try { fs.settings({ ignoreUndefinedProperties: true, merge: true }); } catch (e) {}
  fs.enablePersistence({ synchronizeTabs: true }).catch(() => {});
  const auth = firebase.auth();

  /* та же форма, что у db в артефактах: collection/doc/onSnapshot/set/delete */
  const wrapDoc = s => ({ id: s.id, exists: s.exists, data: () => s.data(), metadata: s.metadata });
  const wrapQuery = s => ({ docs: s.docs.map(wrapDoc), size: s.size, empty: s.empty, metadata: s.metadata, docChanges: () => s.docChanges() });
  const docApi = ref => ({
    id: ref.id, path: ref.path,
    get: async () => wrapDoc(await ref.get()),
    set: data => ref.set(data),
    update: data => ref.update(data),
    delete: () => ref.delete(),
    onSnapshot: (next, err) => ref.onSnapshot(s => next(wrapDoc(s)), err),
    collection: p => colApi(ref.collection(p))
  });
  const queryApi = q => ({
    where: (f, op, v) => queryApi(q.where(f, op, v)),
    orderBy: (f, dir) => queryApi(q.orderBy(f, dir)),
    limit: n => queryApi(q.limit(n)),
    get: async () => wrapQuery(await q.get()),
    onSnapshot: (next, err) => q.onSnapshot(s => next(wrapQuery(s)), err)
  });
  const colApi = ref => Object.assign(queryApi(ref), {
    path: ref.path,
    doc: id => docApi(id ? ref.doc(id) : ref.doc()),
    add: async data => docApi(await ref.add(data))
  });
  const base = "apps/" + APP;
  const db = {
    collection: p => colApi(fs.collection(base + "/" + p)),
    doc: p => docApi(fs.doc(base + "/" + p))
  };
  window.PORTAL = { fs, auth, APP };

  let resolveDb;
  const dbReady = new Promise(r => resolveDb = r);
  window.claude = { use: name => name === "db" ? dbReady : Promise.resolve(null) };

  /* экран входа */
  const css = `
  #gate{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:24px;
    background:repeating-linear-gradient(90deg,rgba(0,0,0,.2) 0 2px,transparent 2px 7px),#3B1B14;color:#F7F0DA;font-family:Inter,"Helvetica Neue",Arial,sans-serif}
  #gate .card{max-width:360px;width:100%;text-align:center;display:flex;flex-direction:column;gap:16px;align-items:center}
  #gate h1{margin:0;font-size:52px;font-weight:900;letter-spacing:-.065em;line-height:.9}
  #gate h1 span{font-family:Vasek,"Segoe Script",cursive;font-weight:400;letter-spacing:0;color:#F1EA91;display:inline-block;rotate:-6deg;margin-left:.15em}
  #gate p{margin:0;font-size:14px;opacity:.75;line-height:1.4}
  #gate button{border:0;border-radius:999px;padding:14px 22px;font:700 15px Inter,Arial,sans-serif;background:#F1EA91;color:#250A0A;cursor:pointer;display:flex;gap:10px;align-items:center}
  #gate .err{color:#F1B7A8;min-height:1.2em}`;
  function showGate(msg){
    if (!document.getElementById("gate-css")) { const s = document.createElement("style"); s.id = "gate-css"; s.textContent = css; document.head.appendChild(s); }
    let g = document.getElementById("gate");
    if (!g) {
      g = document.createElement("div"); g.id = "gate";
      g.innerHTML = `<div class="card"><h1>Привет,<span>Леся</span></h1><p>Войди, чтобы открыть свои разделы. Это нужно сделать один раз на каждом устройстве.</p>
        <button type="button" id="gate-btn"><svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.6 13.3l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.3 5.7c4.3-3.9 7-9.8 7-17.1z"/><path fill="#FBBC05" d="M10.5 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C1 16.6 0 20.2 0 24s1 7.4 2.6 10.7l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.3-5.7c-2 1.4-4.7 2.3-8.6 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.6 42.6 14.6 48 24 48z"/></svg>Войти через Google</button>
        <p class="err" id="gate-err"></p></div>`;
      document.body.appendChild(g);
      document.getElementById("gate-btn").addEventListener("click", signIn);
    }
    document.getElementById("gate-err").textContent = msg || "";
  }
  function hideGate(){ document.getElementById("gate")?.remove(); }
  async function signIn(){
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    try { await auth.signInWithPopup(provider); }
    catch (e) {
      if (["auth/popup-blocked", "auth/operation-not-supported-in-this-environment", "auth/cancelled-popup-request"].includes(e.code)) {
        try { await auth.signInWithRedirect(provider); } catch (e2) { showGate("Не получилось войти: " + (e2.message || e2.code)); }
      } else if (e.code !== "auth/popup-closed-by-user") showGate("Не получилось войти: " + (e.message || e.code));
    }
  }
  auth.getRedirectResult().catch(e => showGate("Не получилось войти: " + (e.message || e.code)));

  let started = false;
  auth.onAuthStateChanged(user => {
    const go = async () => {
      if (!user) { showGate(); return; }
      if (OWNER_HASH && await sha256((user.email || "").toLowerCase()) !== OWNER_HASH) { showGate("Этот аккаунт не подходит. Войди своим Gmail."); auth.signOut(); return; }
      hideGate();
      if (!started) { started = true; resolveDb(db); }
    };
    document.body ? go() : addEventListener("DOMContentLoaded", go);
  });
})();
