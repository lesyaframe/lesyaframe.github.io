/* «Мой сезон»: вход покупательницы, проверка доступа и хранение записей в Firebase.
   Трекер ждёт window.SEZON_CLOUD.ready() и сохраняет через window.SEZON_CLOUD.save(json).
   Доступ: документ sezon_access/<почта> добавляет Леся на странице admin.
   Записи: sezon_users/<uid>, поле json со всем состоянием трекера. */
(function(){
  const CFG = window.FIREBASE_CONFIG;
  const DIRECT = "https://ig.me/m/lesya.frame";
  const EMAIL_KEY = "sezon-email-for-link";
  if (!CFG || !window.firebase) return;

  firebase.initializeApp(CFG);
  const auth = firebase.auth();
  const db = firebase.firestore();
  auth.languageCode = "ru";

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));

  /* ---------- экран входа ---------- */
  const css = document.createElement("style");
  css.textContent = `
  .gate{position:fixed;inset:0;z-index:100;display:grid;place-items:center;padding:20px;background:var(--bg,#F3EBDA)}
  .gate[hidden]{display:none}
  .gate-card{position:relative;width:min(440px,100%);background:var(--milk,#FBF6E9);padding:52px 30px 30px;box-shadow:0 18px 40px rgba(59,27,20,.16);text-align:center}
  .gate-card::before{content:"";position:absolute;left:0;right:0;top:0;height:16px;background:var(--pat-tartan)}
  .gate h2{margin:0;font-family:"Yeseva One",Georgia,serif;font-weight:400;font-size:44px;line-height:1;color:var(--bord,#5A2A20)}
  .gate .g-hand{font-family:var(--f-hand);font-size:24px;color:var(--pink-dk,#8E9A3C);margin:8px 0 18px}
  .gate p{margin:0 0 16px;color:var(--ink-soft,#6B5550);font-size:15px;line-height:1.45}
  .gate .g-btn{display:flex;width:100%;align-items:center;justify-content:center;gap:10px;border:0;border-radius:999px;padding:13px 18px;font-weight:700;font-size:15px;
    background:var(--bord,#5A2A20);color:var(--milk,#FBF6E9);cursor:pointer;text-decoration:none}
  .gate .g-btn.ghost{background:transparent;color:var(--choc,#3B1B14);border:1.5px solid var(--choc,#3B1B14)}
  .gate .g-or{display:flex;align-items:center;gap:10px;margin:16px 0;color:var(--ink-soft,#6B5550);font-size:13px}
  .gate .g-or::before,.gate .g-or::after{content:"";flex:1;border-top:1.5px dashed rgba(0,0,0,.15)}
  .gate input{width:100%;border:0;border-bottom:1.5px solid rgba(0,0,0,.3);background:transparent;padding:8px 2px;font-size:16px;margin-bottom:12px;text-align:center;color:var(--ink,#2A140F)}
  .gate input:focus{outline:none;border-bottom-color:var(--pink-dk,#8E9A3C)}
  .gate .g-err{color:#A8432F;font-size:13px;min-height:18px;margin-top:10px}
  .gate .g-small{margin-top:14px;font-size:13px}
  .gate .g-small button{border:0;background:none;padding:0;color:var(--ink-soft,#6B5550);text-decoration:underline;cursor:pointer;font:inherit}
  .cloud-user{display:inline-flex;gap:8px;align-items:center}
  .cloud-user button{border:0;background:none;padding:0;text-decoration:underline;cursor:pointer;font:inherit;color:inherit}`;
  document.head.appendChild(css);

  const gate = document.createElement("div");
  gate.className = "gate";
  gate.innerHTML = '<div class="gate-card" id="gateCard"></div>';
  document.body.appendChild(gate);
  const card = gate.querySelector("#gateCard");
  const head = '<h2>мой сезон</h2><div class="g-hand">трекер маленьких дел</div>';

  function show(html){ gate.hidden = false; card.innerHTML = head + html; }
  function showLoading(text){ show('<p>' + esc(text || "открываю трекер…") + '</p>'); }
  function showLogin(err){
    show('<p>войди, чтобы открыть свой трекер. используй ту почту, которую присылала мне при покупке.</p>' +
      '<button class="g-btn" id="gGoogle">войти через Google</button>' +
      '<div class="g-or">или по ссылке на почту</div>' +
      '<form id="gMailForm"><input id="gMail" type="email" required placeholder="твоя почта" autocomplete="email"><button class="g-btn ghost" type="submit">прислать ссылку для входа</button></form>' +
      '<div class="g-err">' + esc(err || "") + '</div>');
    card.querySelector("#gGoogle").onclick = google;
    card.querySelector("#gMailForm").onsubmit = sendLink;
  }
  function showSent(email){
    show('<p>письмо со ссылкой отправлено на <b>' + esc(email) + '</b>.</p><p>открой ссылку из письма на этом же устройстве. если письма нет пару минут, загляни в «спам».</p>' +
      '<div class="g-small"><button id="gBack">ввести другую почту</button></div>');
    card.querySelector("#gBack").onclick = () => showLogin();
  }
  function showNoAccess(email){
    show('<p>для почты <b>' + esc(email) + '</b> доступ пока не открыт.</p><p>если ты уже оплатила, напиши мне в директ, и я открою доступ. если входила не с той почтой, выйди и войди с другой.</p>' +
      '<a class="g-btn" href="' + DIRECT + '" target="_blank" rel="noopener">написать в директ</a>' +
      '<div class="g-small"><button id="gOut">выйти и войти с другой почтой</button></div>');
    card.querySelector("#gOut").onclick = () => auth.signOut();
  }

  async function google(){
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    try { await auth.signInWithPopup(provider); }
    catch (e) {
      if (e && (e.code === "auth/popup-blocked" || e.code === "auth/operation-not-supported-in-this-environment")) {
        try { await auth.signInWithRedirect(provider); } catch (e2) { showLogin("не получилось войти: " + (e2.code || e2.message)); }
      } else if (!(e && e.code === "auth/popup-closed-by-user")) showLogin("не получилось войти: " + (e.code || e.message));
    }
  }
  async function sendLink(ev){
    ev.preventDefault();
    const email = card.querySelector("#gMail").value.trim().toLowerCase();
    if (!email) return;
    try {
      await auth.sendSignInLinkToEmail(email, { url: location.origin + location.pathname, handleCodeInApp: true });
      try { localStorage.setItem(EMAIL_KEY, email); } catch (e) {}
      showSent(email);
    } catch (e) { showLogin("не получилось отправить письмо: " + (e.code || e.message)); }
  }
  // вход по ссылке из письма
  async function finishLink(){
    if (!auth.isSignInWithEmailLink(location.href)) return;
    let email = "";
    try { email = localStorage.getItem(EMAIL_KEY) || ""; } catch (e) {}
    if (!email) email = (prompt("подтверди почту, на которую пришла ссылка") || "").trim().toLowerCase();
    try {
      await auth.signInWithEmailLink(email, location.href);
      try { localStorage.removeItem(EMAIL_KEY); } catch (e) {}
    } catch (e) { showLogin("ссылка не сработала, возможно, она устарела. запроси новую."); }
    history.replaceState(null, "", location.pathname);
  }

  /* ---------- данные ---------- */
  let resolveReady, uid = null, busy = Promise.resolve();
  const ready = new Promise(r => { resolveReady = r; });
  let started = false;

  auth.onAuthStateChanged(async user => {
    if (!user) { if (!started) showLogin(); else location.reload(); return; }
    if (started) return;
    showLoading();
    const email = (user.email || "").toLowerCase();
    try {
      const acc = await db.collection("sezon_access").doc(email).get();
      if (!acc.exists) { showNoAccess(email); return; }
    } catch (e) { showNoAccess(email); return; }
    try {
      const snap = await db.collection("sezon_users").doc(user.uid).get();
      uid = user.uid; started = true;
      gate.hidden = true;
      resolveReady(snap.exists ? (snap.data().json || null) : null);
      addUserLine(email);
    } catch (e) { show('<p>не получилось загрузить записи: ' + esc(e.code || e.message) + '</p><button class="g-btn" onclick="location.reload()">попробовать ещё раз</button>'); }
  });

  function addUserLine(email){
    const foot = document.querySelector(".foot");
    if (!foot) return;
    const el = document.createElement("span");
    el.className = "cloud-user";
    el.innerHTML = esc(email) + ' · <button type="button">выйти</button>';
    el.querySelector("button").onclick = () => auth.signOut();
    foot.appendChild(el);
  }

  window.SEZON_CLOUD = {
    ready: () => ready,
    // сохранения идут по очереди, чтобы более старое не перезаписало новое
    save: json => {
      if (!uid) return Promise.resolve();
      busy = busy.then(() => db.collection("sezon_users").doc(uid).set({
        json, email: (auth.currentUser && auth.currentUser.email) || "", updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      })).catch(e => { throw e; });
      const p = busy; busy = busy.catch(() => {}); return p;
    }
  };

  showLoading();
  finishLink();
})();
