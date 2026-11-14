/* ============================================================
   ameizing client portal  ·  front-end
   Talks only to the Google Apps Script web app (CONFIG.API).
   No file is ever stored on this site; uploads post straight
   to the Apps Script, which drops them in Google Drive.
   ============================================================ */

const CONFIG = {
  // PASTE your deployed Apps Script web-app URL here (ends in /exec).
  // See O-output/08-client-portal/backend/SETUP.md.
  API: "https://script.google.com/macros/s/AKfycbxU-FodzITQibHjIeDXcKOtG9aiXVYA2Dlbk-48aSWUm1CaXcrTXsa6Gbk11u0LL_cEgQ/exec",

  // Client-side guard rails. The backend enforces these again.
  ACCEPT: {
    image: { ext: ["jpg","jpeg","png","webp","heic","heif"], max: 15 * 1024 * 1024 },
    video: { ext: ["mp4","mov"],                              max: 25 * 1024 * 1024 },
    pdf:   { ext: ["pdf"],                                    max: 15 * 1024 * 1024 },
  },
  TOTAL_MAX: 40 * 1024 * 1024,   // Apps Script POST ceiling, with headroom
  POLL_MS: 8000,
};

/* ---------- tiny i18n ---------- */
const T = {
  he: {
    loginTitle:"הפורטל שלך", loginSub:"הזינו את הקוד הפרטי שקיבלתם כדי להיכנס.",
    enter:"כניסה", logout:"יציאה", yourRequests:"הבקשות שלך", newReq:"בקשה חדשה",
    welcomeHi:"היי, אני מאיה, סוכנת התמיכה האישית שלך לאתר.", welcomeBody:"כל שינוי שתרצו לעשות באתר, פשוט כתבו לי כאן, הדביקו מה שצריך והעלו תמונות, סרטונים או PDF. אני כבר אדאג לשאר.",
    back:"חזרה", whatTitle:"מה תרצו לשנות? (כותרת קצרה)", pageLabel:"קישור לעמוד שמדובר בו (לא חובה)", whatDetail:"פירוט",
    dropHint:"לחצו להעלאת תמונות, סרטונים או PDF (או גררו לכאן במחשב)", choose:"בחירת קבצים", send:"שליחה", attach:"קובץ",
    fileHelp:"תמונות וקבצי PDF עד 15MB, סרטונים עד 25MB. לסרטון גדול יותר, כתבו לנו ונסדר דרך אחרת.",
    empty:"אין עדיין בקשות. לחצו על ⁦בקשה חדשה⁩ כדי להתחיל.",
    badLogin:"הקוד לא נכון. נסו שוב.", inactive:"המנוי אינו פעיל כרגע. נשמח לחדש אותו, כתבו לנו.",
    locked:"יותר מדי ניסיונות. המתינו כמה דקות ונסו שוב.",
    needText:"כתבו בבקשה מה תרצו לשנות.", sending:"שולח...", sent:"נשלח, תודה!",
    tooBig:"גדול מדי", badType:"סוג לא נתמך", network:"בעיית חיבור, נסו שוב.",
    st_new:"התקבלה", st_work:"בטיפול", st_ready:"מוכן, רעננו", st_done:"הושלם",
    refreshHint:"השינוי עלה לאתר. רעננו את העמוד כדי לראות אותו.", pageTag:"העמוד",
    placeTitle:"למשל: החלפת התמונה הראשית", placeDetail:"ספרו לנו בדיוק מה לשנות. אפשר לצרף קבצים למטה.",
    placeMsg:"כתבו הודעה...",
    mayaName:"מאיה",
    ackMaya:"קיבלתי את הבקשה, תודה! העברתי אותה לצוות ואני כאן איתכם לאורך כל הדרך. אפשר לעקוב אחרי ההתקדמות למעלה, ואעדכן אתכם כאן בכל שלב.",
    stReceived:"התקבלה", stWork:"בטיפול", stReady:"מוכן", stDone:"הושלם",
    desc_new:"קיבלנו את הבקשה. מאיה והצוות עוברים עליה ויחזרו אליכם כאן.",
    desc_work:"עובדים על השינוי עכשיו. נעדכן אתכם כאן ברגע שיהיה מוכן.",
    desc_ready:"השינוי עלה לאתר. רעננו את העמוד כדי לראות אותו.",
    desc_done:"הבקשה הושלמה. תודה!",
  },
  en: {
    loginTitle:"Your portal", loginSub:"Enter the private code you were given to sign in.",
    enter:"Enter", logout:"Sign out", yourRequests:"Your requests", newReq:"New request",
    welcomeHi:"Hi, I'm Maya, your dedicated website support agent.", welcomeBody:"Whatever you'd like to change on your site, just write it to me here, paste anything in, and upload your photos, videos or PDFs. I'll take it from there.",
    back:"Back", whatTitle:"What would you like to change? (short title)", pageLabel:"Link to the page in question (optional)", whatDetail:"Details",
    dropHint:"Tap to upload pictures, videos or PDFs (or drag here on desktop)", choose:"Choose files", send:"Send", attach:"File",
    fileHelp:"Pictures and PDFs up to 15MB, videos up to 25MB. For a bigger video, write to us and we'll sort it another way.",
    empty:"No requests yet. Tap “New request” to start.",
    badLogin:"That code is not right. Try again.", inactive:"This subscription is not active right now. We'd love to renew it, just write to us.",
    locked:"Too many tries. Please wait a few minutes and try again.",
    needText:"Please tell us what you'd like to change.", sending:"Sending...", sent:"Sent, thank you!",
    tooBig:"too big", badType:"unsupported type", network:"Connection problem, try again.",
    st_new:"Received", st_work:"In progress", st_ready:"Ready, refresh", st_done:"Done",
    refreshHint:"The change is live. Refresh your page to see it.", pageTag:"Page",
    placeTitle:"e.g. Replace the main photo", placeDetail:"Tell us exactly what to change. You can attach files below.",
    placeMsg:"Write a message...",
    mayaName:"Maya",
    ackMaya:"I've got your request, thank you! I've passed it to the team and I'm here with you the whole way. You can follow the progress above, and I'll update you here at every step.",
    stReceived:"Received", stWork:"In progress", stReady:"Ready", stDone:"Done",
    desc_new:"We've received your request. Maya and the team are reviewing it and will reply here.",
    desc_work:"We're working on the change now. We'll update you here as soon as it's ready.",
    desc_ready:"The change is live. Refresh your page to see it.",
    desc_done:"This request is complete. Thank you!",
  }
};
let LANG = localStorage.getItem("amz_lang") || "he";
const tr = k => (T[LANG][k] ?? k);

/* ---------- state ---------- */
const S = { code:"", client:null, requests:[], current:null, newFiles:[], tFiles:[], pollTimer:null };
const $ = id => document.getElementById(id);

/* ---------- language ---------- */
function applyLang(){
  const he = LANG === "he";
  document.documentElement.lang = he ? "he" : "en";
  document.documentElement.dir  = he ? "rtl" : "ltr";
  document.querySelectorAll("[data-t]").forEach(el => el.textContent = tr(el.dataset.t));
  $("code").placeholder = he ? "••••••" : "••••••";
  $("rTitle").placeholder = tr("placeTitle");
  $("rText").placeholder  = tr("placeDetail");
  $("tText").placeholder  = tr("placeMsg");
  $("lang").textContent = he ? "EN" : "עב";          // short, to save room in the app bar
  $("langLogin").textContent = he ? "English" : "עברית";  // full label on the login screen
  if (S.client) renderList();
  if (S.current) renderThread();
}
function toggleLang(){ LANG = LANG === "he" ? "en" : "he"; localStorage.setItem("amz_lang", LANG); applyLang(); }
$("lang").onclick = toggleLang; $("langLogin").onclick = toggleLang;

/* ---------- api ---------- */
async function api(action, payload={}){
  if (CONFIG.API.startsWith("PASTE")) throw new Error("API not configured");
  const res = await fetch(CONFIG.API, {
    method:"POST",
    // text/plain keeps it a "simple" request: no CORS preflight.
    headers:{ "Content-Type":"text/plain;charset=utf-8" },
    body: JSON.stringify({ action, code:S.code, ...payload }),
  });
  const data = await res.json();
  if (data && data.error === "inactive") { showNote(tr("inactive")); throw new Error("inactive"); }
  return data;
}

/* ---------- login ---------- */
$("loginBtn").onclick = doLogin;
$("code").addEventListener("keydown", e => { if (e.key === "Enter") doLogin(); });
async function doLogin(){
  const code = $("code").value.trim();
  $("loginErr").textContent = "";
  if (!code) return;
  S.code = code;
  setBusy($("loginBtn"), true);
  try {
    const d = await api("login");
    if (!d.ok) { $("loginErr").textContent = tr(d.error === "inactive" ? "inactive" : d.error === "locked" ? "locked" : "badLogin"); S.code=""; return; }
    S.client = d.client; S.requests = d.requests || [];
    sessionStorage.setItem("amz_code", code);
    enterApp();
  } catch(e){
    if (e.message !== "inactive") $("loginErr").textContent = tr("network");
    S.code = "";
  } finally { setBusy($("loginBtn"), false); }
}
function showNote(msg){ $("loginErr").innerHTML = '<div class="note">'+esc(msg)+'</div>'; }

function enterApp(){
  $("login").classList.add("hidden");
  $("app").classList.remove("hidden");
  const site = S.client.website || S.client.name || "";   // their website address, shown top of page
  $("siteName").textContent = site;
  $("sep").style.display = site ? "" : "none";
  showList();
}
$("logout").onclick = () => {
  sessionStorage.removeItem("amz_code");
  S.code=""; S.client=null; S.requests=[]; S.current=null;
  stopPoll();
  $("app").classList.add("hidden"); $("login").classList.remove("hidden");
  $("code").value=""; $("loginErr").textContent="";
};

/* ---------- views ---------- */
function show(view){ ["listView","newView","threadView"].forEach(v => $(v).classList.toggle("hidden", v!==view)); }
function showList(){ stopPoll(); S.current=null; show("listView"); renderList(); }
$("newBtn").onclick = () => { S.newFiles=[]; $("rTitle").value=""; $("rPage").value=""; $("rText").value=""; renderFiles("files", S.newFiles); $("newErr").textContent=""; show("newView"); };
$("newBack").onclick = showList; $("thrBack").onclick = showList;

function statusPill(st){
  const map = { new:["new","st_new"], work:["work","st_work"], ready:["ready","st_ready"], done:["done","st_done"] };
  const [cls,key] = map[st] || map.new;
  return '<span class="pill '+cls+'">'+esc(tr(key))+'</span>';
}
const STEP_ORDER = ["new","work","ready","done"];
const STEP_LABEL = ["stReceived","stWork","stReady","stDone"];
const STEP_DESC  = { new:"desc_new", work:"desc_work", ready:"desc_ready", done:"desc_done" };
function renderTrack(status){
  const idx = Math.max(0, STEP_ORDER.indexOf(status));
  const steps = STEP_ORDER.map((s,i) => {
    const cls = i < idx ? "done" : (i === idx ? "current" : "");
    const mark = i < idx ? "✓" : String(i+1);
    return '<div class="step '+cls+'"><div class="dot">'+mark+'</div><div class="lbl2">'+esc(tr(STEP_LABEL[i]))+'</div></div>';
  }).join("");
  const descCls = status === "ready" ? " ready" : "";
  return '<div class="track"><div class="steps">'+steps+'</div>'+
         '<div class="desc'+descCls+'">'+esc(tr(STEP_DESC[status] || "desc_new"))+'</div></div>';
}
function renderList(){
  const el = $("list");
  if (!S.requests.length){
    el.innerHTML = '<div class="empty"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.6"><path d="M4 6h16M4 12h16M4 18h10"/></svg><div>'+esc(tr("empty"))+'</div></div>';
    return;
  }
  el.innerHTML = S.requests.map(r =>
    '<div class="card req" data-id="'+esc(r.id)+'">'+
      '<div><p class="t">'+esc(r.title||"")+'</p><p class="sub">'+esc(lastLine(r))+'</p></div>'+
      statusPill(r.status)+
    '</div>').join("");
  el.querySelectorAll(".req").forEach(c => c.onclick = () => openThread(c.dataset.id));
}
function lastLine(r){
  const m = (r.messages||[]).slice(-1)[0];
  if (!m) return "";
  return (m.text||"").replace(/\s+/g," ").slice(0,70);
}

/* ---------- thread ---------- */
async function openThread(id){
  S.current = S.requests.find(r => r.id === id);
  if (!S.current) return;
  S.tFiles=[]; renderFiles("tFiles", S.tFiles); $("tText").value="";
  show("threadView"); renderThread();
  await refreshThread();
  startPoll();
}
function renderThread(){
  const r = S.current; if (!r) return;
  $("thrTitle").textContent = r.title || "";
  $("thrPill").innerHTML = statusPill(r.status);
  const box = $("thread");
  const track = renderTrack(r.status);
  const pg = r.page ? (/^https?:\/\//i.test(r.page)
      ? '<a href="'+esc(r.page)+'" target="_blank" rel="noopener" dir="ltr">'+esc(r.page)+'</a>'
      : '<span dir="ltr">'+esc(r.page)+'</span>') : "";
  const pageRow = pg ? '<div class="att" style="margin-bottom:14px"><span style="color:var(--muted);font-size:13px;margin-inline-end:4px">'+esc(tr("pageTag"))+':</span>'+pg+'</div>' : "";
  const msgs = (r.messages||[]).map(m => {
    const mine = m.from === "client";
    const files = (m.files||[]).map(f =>
      '<a href="'+esc(f.url||"#")+'" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg>'+esc(f.name||"file")+'</a>').join("");
    const who = mine ? "" : '<div class="who">'+esc(tr("mayaName"))+'</div>';
    return '<div class="msg '+(mine?"me":"them")+'">'+who+'<div class="b">'+esc(m.text||"")+
      (files?'<div class="att">'+files+'</div>':"")+'</div><div class="meta">'+esc(fmtTime(m.ts))+'</div></div>';
  }).join("");
  // Instant acknowledgment from Maya, shown until a real reply arrives. View-only, never stored.
  const hasReply = (r.messages||[]).some(m => m.from && m.from !== "client");
  const ack = hasReply ? "" :
    '<div class="msg them"><div class="who">'+esc(tr("mayaName"))+'</div><div class="b">'+esc(tr("ackMaya"))+'</div></div>';
  box.innerHTML = track + pageRow + msgs + ack;
  box.scrollTop = box.scrollHeight;
}
async function refreshThread(){
  try {
    const d = await api("poll", { requestId: S.current.id });
    if (d && d.request){
      S.current = d.request;
      const i = S.requests.findIndex(r => r.id === d.request.id);
      if (i>=0) S.requests[i] = d.request;
      renderThread();
    }
  } catch(e){}
}
function startPoll(){ stopPoll(); S.pollTimer = setInterval(refreshThread, CONFIG.POLL_MS); }
function stopPoll(){ if (S.pollTimer){ clearInterval(S.pollTimer); S.pollTimer=null; } }

/* ---------- file handling ---------- */
function classify(name){
  const ext = (name.split(".").pop()||"").toLowerCase();
  for (const [kind,spec] of Object.entries(CONFIG.ACCEPT)) if (spec.ext.includes(ext)) return {kind,spec,ext};
  return null;
}
function addFiles(fileList, bucket, containerId){
  const files = Array.from(fileList||[]);
  for (const f of files){
    const c = classify(f.name);
    if (!c){ bucket.push({ name:f.name, bad:tr("badType") }); continue; }
    if (f.size > c.spec.max){ bucket.push({ name:f.name, bad:tr("tooBig") }); continue; }
    bucket.push({ name:f.name, size:f.size, file:f });
  }
  renderFiles(containerId, bucket);
}
function renderFiles(containerId, bucket){
  const el = $(containerId);
  el.innerHTML = bucket.map((f,i) =>
    '<div class="fitem'+(f.bad?" bad":"")+'"><span class="nm">'+esc(f.name)+
      (f.bad?" · "+esc(f.bad):(f.size?" · "+fmtSize(f.size):""))+
      '</span><button class="rm" data-i="'+i+'" aria-label="remove">×</button></div>').join("");
  el.querySelectorAll(".rm").forEach(b => b.onclick = () => { bucket.splice(+b.dataset.i,1); renderFiles(containerId,bucket); });
}
async function packFiles(bucket){
  const out = [];
  for (const f of bucket){
    if (f.bad || !f.file) continue;
    out.push({ name:f.name, type:f.file.type, size:f.size, data: await toBase64(f.file) });
  }
  return out;
}
function totalSize(bucket){ return bucket.reduce((s,f)=> s + (f.size||0), 0); }
function toBase64(file){
  return new Promise((res,rej) => { const r = new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(file); });
}

/* new-request drop zone */
const drop = $("drop"), fileIn = $("file");
drop.onclick = () => fileIn.click();
$("choose").onclick = (e) => { e.stopPropagation(); fileIn.click(); };  // explicit button for phones
fileIn.onchange = () => { addFiles(fileIn.files, S.newFiles, "files"); fileIn.value=""; };
["dragover","dragenter"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add("over"); }));
["dragleave","drop"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove("over"); }));
drop.addEventListener("drop", e => addFiles(e.dataTransfer.files, S.newFiles, "files"));

/* thread attach */
const tFileIn = $("tFile");
$("tAttach").onclick = () => tFileIn.click();
tFileIn.onchange = () => { addFiles(tFileIn.files, S.tFiles, "tFiles"); tFileIn.value=""; };

/* ---------- submit new request ---------- */
$("submitBtn").onclick = async () => {
  const title = $("rTitle").value.trim();
  const page  = $("rPage").value.trim();
  const text  = $("rText").value.trim();
  $("newErr").textContent = "";
  if (!text && !title){ $("newErr").textContent = tr("needText"); return; }
  if (totalSize(S.newFiles) > CONFIG.TOTAL_MAX){ $("newErr").textContent = tr("tooBig"); return; }
  setBusy($("submitBtn"), true, tr("sending"));
  try {
    const files = await packFiles(S.newFiles);
    const d = await api("submit", { title: title || text.slice(0,40), page, text, files });
    if (!d.ok) throw new Error(d.error||"err");
    S.requests.unshift(d.request);
    toast(tr("sent"));
    openThread(d.request.id);   // land them in the conversation: they see Maya's acknowledgment + the progress trail at once
  } catch(e){ $("newErr").textContent = tr("network"); }
  finally { setBusy($("submitBtn"), false); }
};

/* ---------- send thread message ---------- */
$("tSend").onclick = async () => {
  const text = $("tText").value.trim();
  if (!text && !S.tFiles.some(f=>!f.bad)) return;
  if (totalSize(S.tFiles) > CONFIG.TOTAL_MAX){ toast(tr("tooBig")); return; }
  setBusy($("tSend"), true);
  try {
    const files = await packFiles(S.tFiles);
    const d = await api("message", { requestId: S.current.id, text, files });
    if (!d.ok) throw new Error(d.error||"err");
    S.tFiles=[]; renderFiles("tFiles", S.tFiles); $("tText").value="";
    if (d.request){ S.current = d.request; renderThread(); }
    else await refreshThread();
  } catch(e){ toast(tr("network")); }
  finally { setBusy($("tSend"), false); }
};

/* ---------- helpers ---------- */
function setBusy(btn, busy, label){
  btn.disabled = busy;
  if (busy){ btn.dataset.html = btn.innerHTML; btn.innerHTML = '<span class="spin"></span>' + (label?" "+esc(label):""); }
  else if (btn.dataset.html){ btn.innerHTML = btn.dataset.html; }
}
function esc(s){ return String(s??"").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function fmtSize(b){ return b>1048576 ? (b/1048576).toFixed(1)+"MB" : Math.max(1,Math.round(b/1024))+"KB"; }
function fmtTime(ts){ if(!ts) return ""; const d=new Date(ts); if(isNaN(d)) return ""; const p=n=>String(n).padStart(2,"0");
  return p(d.getDate())+"."+p(d.getMonth()+1)+"."+String(d.getFullYear()).slice(2)+" "+p(d.getHours())+":"+p(d.getMinutes()); }
function toast(msg){ const t=document.createElement("div"); t.className="toast"; t.textContent=msg; document.body.appendChild(t); setTimeout(()=>t.remove(),2600); }

/* ---------- boot ---------- */
(function boot(){
  applyLang();
  const saved = sessionStorage.getItem("amz_code");
  if (saved){ $("code").value = saved; S.code = saved; doLogin(); }
})();
