// GreenSpot · app.js
// Indice: 1 Config · 2 Traduzioni · 3 Stato e utilità · 4 Sessione e header · 5 Login
//         6 Router · 7 Home · 7b Calendario ritiri · 7c Navigazione · 8 Partnership · 9 Premi · 10 Classifica · 11 Medaglie
//         12 Azienda · 13 Admin · 14 PWA · 15 Avvio
// Schema database: sql/database.sql

// ====================================================================
//  1. CONFIGURAZIONE E HELPER
// ====================================================================
const sb = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
const $ = (s, e = document) => e.querySelector(s);
const esc = (s) =>
  String(s ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
const DOM = '@greenspot-app.com';

// ====================================================================
//  2. TRADUZIONI (IT / EN)
// ====================================================================
const TXT = {
  it: {
    pickPhoto: 'Seleziona foto',
    camShoot: 'Scatta',
    camCancel: 'Annulla',
    camDenied:
      'Accesso alla fotocamera negato: abilitalo dall’icona del lucchetto nella barra degli indirizzi e riprova.',
    gps: 'Attiva GPS',
    gpsDenied: 'Posizione negata: abilitala dalle impostazioni del browser e riprova.',
    gpsHint: 'Premi “Attiva GPS” per vedere i punti vicini a te e usare il navigatore.',
    pendingNote: '⏳ In attesa di approvazione',
    photoSpot: 'Scatta foto del punto',
    notSpot: 'Non riconosco un cassonetto o una macchinetta: avvicinati e riprova.',
    spotReqs: 'Segnalazioni da approvare',
    aiOk: 'AI: verificato',
    aiNo: 'AI: non verificato',
    setDir: 'Imposta direzione',
    stopNav: 'Spegni navigatore',
    arrived: 'Sei arrivato! Navigazione spenta.',
    locating: 'Cerco la tua posizione…',
    inDist: 'Tra',
    confirmPt: 'Eliminare questo punto dalla mappa?',
    nextPick: 'Prossimi Ritiri',
    changeCity: 'Cambia città',
    setCity: 'Imposta la tua città',
    setCityMsg: 'Imposta la tua città per vedere i prossimi ritiri',
    city: 'Città',
    hood: 'Quartiere (opzionale)',
    notif: 'Ricevi notifiche',
    noPick: 'Nessun ritiro programmato per {c}. Torna presto!',
    today: 'Oggi',
    tomorrow: 'Domani',
    daysLeft: 'Mancano {n} giorni',
    calAdmin: 'Calendario Raccolta',
    wtype: 'Tipo di rifiuto',
    date: 'Data',
    notes: 'Note',
    edit: 'Modifica',
    allCities: 'Tutte le città',
    calSearch: 'Cerca città, quartiere o tipo',
    confirmRow: 'Eliminare questo ritiro?',
    leaderboard: 'Classifica',
    lbMonth: 'Mese',
    lbYear: 'Anno',
    lbAll: 'Sempre',
    bottles: 'bottiglie',
    you: 'Tu',
    medals: 'Medaglie',
    medalCount: 'Hai collezionato {x} medaglie su {y} disponibili',
    openEnv: 'Apri Busta',
    locked: 'Bloccata',
    desc: 'Descrizione azienda',
    partnersT: 'Partner attive',
    del: 'Elimina',
    confirmDelP: 'Eliminare questa partner con tutti i suoi premi e le sue transazioni?',
    created: 'Partner creata',
    rewards: 'Premi',
    rewardsN: 'premi',
    noRewards: 'Nessun premio disponibile',
    rname: 'Nome premio',
    rpts: 'Punti necessari',
    addReward: 'Aggiungi premio',
    delAcc: 'Elimina account',
    confirmDel: 'Eliminare definitivamente questo account?',
    yourPts: 'I tuoi punti',
    install: 'Installa app',
    relocate: 'Aggiorna posizione',
    pickUser: 'Username',
    instLocal:
      'Per installare GreenSpot sul telefono l’app deve essere online (anche gratis): carica la cartella su Netlify Drop o GitHub Pages, apri il link dal telefono e premi di nuovo questo pulsante.',
    instIos:
      'Su iPhone: apri il sito con Safari, tocca Condividi e poi “Aggiungi alla schermata Home”.',
    instAnd:
      'Su Android: apri il menu del browser (⋮) e scegli “Installa app” o “Aggiungi a schermata Home”.',
    report: 'Segnala un punto',
    repHelp:
      'Standing at a machine or bin? Take a photo: AI checks it and the admin approves it. We place it where you are now.',
    repOk: 'Segnalazione inviata! Sarà visibile dopo l’approvazione.',
    noGps: 'Posizione non disponibile',
    machine: 'Macchinetta',
    bin: 'Cassonetto',
    dirs: 'Indicazioni',
    nearest: 'I più vicini a te',
    noPts: 'Nessun punto trovato in zona',
    cpoints: 'Punti di raccolta',
    cpHelp: 'Clicca sulla mappa per posizionare il punto, poi compila e salva.',
    st_pending: 'In approvazione',
    st_approved: 'Approvata',
    st_rejected: 'Rifiutata',
    myreq: 'Le tue richieste',
    ban: 'Banna',
    unban: 'Sbanna',
    banned: 'Bannato',
    resetpts: 'Azzera punti',
    resetok: 'Punti azzerati',
    confirmReset: 'Azzerare i punti di questo utente?',
    photo: 'Scatta foto',
    photoHelp:
      'Fotografa la bottiglia intera dal lato del codice a barre: il codice deve essere ben visibile e a fuoco.',
    analyzing: 'Analisi in corso…',
    noBottle: 'Non riconosco una bottiglia: inquadrala tutta e riprova.',
    noBarcode: 'Codice a barre non visibile nell’immagine',
    dupBottle: 'Questa bottiglia è già stata scansionata: ogni codice vale una sola volta.',
    fromWeb: 'La foto sembra presa da internet: fotografa la bottiglia vera.',
    noBackground: 'Non vedo uno sfondo reale: fotografa la bottiglia nel suo ambiente.',
    delReq: 'Elimina',
    geoAll: 'Mondo',
    geoCountry: 'Nazione',
    geoTown: 'Paese',
    geoComune: 'Comune',
    geoAdd: 'Aggiungi',
    geoNameCountry: 'Nuova nazione',
    geoNameTown: 'Nuovo paese',
    geoNameComune: 'Nuovo comune',
    geoEmpty: 'Ancora vuoto',
    geoTowns: 'paesi',
    geoComuni: 'comuni',
    geoPickits: 'ritiri',
    geoConfirmDel: 'Eliminare questo elemento e tutto ciò che contiene?',
    geoNone: 'Nessun elemento: aggiungine uno qui sotto.',
    geoUnsorted: 'Comuni non classificati',
    geoNoTable: 'Manca la tabella delle zone nel database: esegui sql/database.sql nell’SQL Editor di Supabase e ricarica la pagina.',
    confirmDelReq: 'Eliminare questa partnership approvata?',
    manageSpots: 'Gestisci macchinette e bidoni',
    confirmDelSpot: 'Eliminare questo punto dalla mappa?',
    isBanned: 'Account bannato',
    isScreen: 'Sembra la foto di uno schermo o di una stampa: fotografa la bottiglia vera.',
    home: 'Home',
    partnership: 'Partnership',
    redeem: 'Premi',
    admin: 'Admin',
    company: 'Azienda',
    login: 'Accedi',
    logout: 'Esci',
    signup: 'Registrati',
    total: 'Riciclaggio Totale',
    totalSub: 'bottiglie medie per utente',
    mine: 'Riciclaggio Personale',
    mineSub: 'del totale della community',
    record: 'Record Personale',
    recordSub: 'bottiglie in un giorno',
    scan: 'Scansiona Bottiglia',
    manual: 'Oppure inserisci il codice',
    add: 'Aggiungi',
    scanned: 'Bottiglia registrata! +0.5 punti',
    map: 'Punti di raccolta vicini',
    ptxt: "Sei un'attività locale e vuoi trasformare i tuoi clienti in eco-eroi? Unisciti a noi. Compila il modulo per entrare nel programma Partnership: offri un premio, noi ti portiamo clienti che riciclano.",
    cname: 'Nome Azienda',
    logo: 'Logo',
    prods: 'Prodotti e punti',
    phone: 'Contatto (tel)',
    send: 'Invia richiesta',
    sent: 'Richiesta inviata!',
    user: 'Username',
    pass: 'Password',
    balance: 'Il tuo saldo',
    pts: 'punti',
    redeemBtn: 'Riscatta',
    log: 'Registro Transazioni',
    needLogin: 'Accedi per continuare',
    approve: 'Approva',
    reject: 'Rifiuta',
    create: 'Crea Partner',
    req: 'Richieste Partnership',
    users: 'Gestione Utenti',
    search: 'Cerca username',
    setco: 'Imposta account azienda',
    ptsReq: 'Punti richiesti',
    save: 'Salva',
    gdaily: 'Bottiglie al giorno',
    gtx: 'Premi riscattati',
    mgmt: 'Gestione premi',
    recycling: 'Parte Riciclo',
    markUsed: 'Segna usato',
    none: 'Niente da mostrare',
    pick: 'Scegli azienda',
  },
  en: {
    pickPhoto: 'Choose photo',
    camShoot: 'Capture',
    camCancel: 'Cancel',
    camDenied: 'Camera access denied: enable it from the lock icon in the address bar and retry.',
    gps: 'Use GPS',
    gpsDenied: 'Location denied: enable it in your browser settings and retry.',
    gpsHint: 'Press “Use GPS” to see spots near you and use navigation.',
    pendingNote: '⏳ Awaiting approval',
    photoSpot: 'Take photo of the spot',
    notSpot: 'No recycling bin or machine recognized: get closer and retry.',
    spotReqs: 'Reports to review',
    aiOk: 'AI: verified',
    aiNo: 'AI: unchecked',
    setDir: 'Set destination',
    stopNav: 'Stop navigation',
    arrived: 'You have arrived! Navigation off.',
    locating: 'Finding your location…',
    inDist: 'In',
    confirmPt: 'Remove this spot from the map?',
    nextPick: 'Upcoming Pickups',
    changeCity: 'Change city',
    setCity: 'Set your city',
    setCityMsg: 'Set your city to see upcoming pickups',
    city: 'City',
    hood: 'Neighborhood (optional)',
    notif: 'Receive notifications',
    noPick: 'No pickups scheduled for {c}. Check back soon!',
    today: 'Today',
    tomorrow: 'Tomorrow',
    daysLeft: '{n} days left',
    calAdmin: 'Collection Calendar',
    wtype: 'Waste type',
    date: 'Date',
    notes: 'Notes',
    edit: 'Edit',
    allCities: 'All cities',
    calSearch: 'Search city, area or type',
    confirmRow: 'Delete this pickup?',
    leaderboard: 'Leaderboard',
    lbMonth: 'Month',
    lbYear: 'Year',
    lbAll: 'All time',
    bottles: 'bottles',
    you: 'You',
    medals: 'Medals',
    medalCount: 'You collected {x} of {y} medals',
    openEnv: 'Open Envelope',
    locked: 'Locked',
    desc: 'Company description',
    partnersT: 'Active partners',
    del: 'Delete',
    confirmDelP: 'Delete this partner with all its rewards and transactions?',
    created: 'Partner created',
    rewards: 'Rewards',
    rewardsN: 'rewards',
    noRewards: 'No rewards available',
    rname: 'Reward name',
    rpts: 'Points required',
    addReward: 'Add reward',
    delAcc: 'Delete account',
    confirmDel: 'Permanently delete this account?',
    yourPts: 'Your points',
    install: 'Install app',
    relocate: 'Update location',
    pickUser: 'Username',
    instLocal:
      'To install GreenSpot on your phone the app must be online (free is fine): upload the folder to Netlify Drop or GitHub Pages, open the link on your phone and press this button again.',
    instIos: 'On iPhone: open the site in Safari, tap Share, then “Add to Home Screen”.',
    instAnd:
      'On Android: open the browser menu (⋮) and choose “Install app” or “Add to Home screen”.',
    report: 'Report a spot',
    repHelp:
      "Standing at a machine or bin? We'll place it where you are now. Everyone sees it after admin review.",
    repOk: 'Report sent! Visible after approval.',
    noGps: 'Location unavailable',
    machine: 'Vending machine',
    bin: 'Recycling bin',
    dirs: 'Directions',
    nearest: 'Closest to you',
    noPts: 'No points found nearby',
    cpoints: 'Collection points',
    cpHelp: 'Click the map to place the point, then fill in and save.',
    st_pending: 'Under review',
    st_approved: 'Approved',
    st_rejected: 'Rejected',
    myreq: 'Your requests',
    ban: 'Ban',
    unban: 'Unban',
    banned: 'Banned',
    resetpts: 'Reset points',
    resetok: 'Points reset',
    confirmReset: "Reset this user's points?",
    photo: 'Take photo',
    photoHelp:
      'Photograph the whole bottle from the barcode side: the barcode must be clear and in focus.',
    analyzing: 'Analyzing…',
    noBottle: 'No bottle recognized: show the whole bottle and retry.',
    noBarcode: 'Barcode not visible in the image',
    dupBottle: 'This bottle was already scanned: each barcode counts only once.',
    fromWeb: 'This photo looks taken from the internet: photograph the real bottle.',
    noBackground: 'No real background detected: photograph the bottle in its surroundings.',
    delReq: 'Delete',
    geoAll: 'World',
    geoCountry: 'Country',
    geoTown: 'Town',
    geoComune: 'Municipality',
    geoAdd: 'Add',
    geoNameCountry: 'New country',
    geoNameTown: 'New town',
    geoNameComune: 'New municipality',
    geoEmpty: 'Still empty',
    geoTowns: 'towns',
    geoComuni: 'municipalities',
    geoPickits: 'pickups',
    geoConfirmDel: 'Delete this item and everything inside it?',
    geoNone: 'Nothing here yet: add one below.',
    geoUnsorted: 'Unsorted municipalities',
    geoNoTable: 'The places table is missing in the database: run sql/database.sql in the Supabase SQL Editor and reload the page.',
    confirmDelReq: 'Delete this approved partnership?',
    manageSpots: 'Manage machines and bins',
    confirmDelSpot: 'Remove this spot from the map?',
    isBanned: 'Account banned',
    isScreen: 'This looks like a screen or printout: photograph the real bottle.',
    home: 'Home',
    partnership: 'Partnership',
    redeem: 'Rewards',
    admin: 'Admin',
    company: 'Business',
    login: 'Log in',
    logout: 'Log out',
    signup: 'Sign up',
    total: 'Total Recycling',
    totalSub: 'average bottles per user',
    mine: 'Personal Recycling',
    mineSub: 'of the community total',
    record: 'Personal Record',
    recordSub: 'bottles in one day',
    scan: 'Scan Bottle',
    manual: 'Or type the code',
    add: 'Add',
    scanned: 'Bottle saved! +0.5 points',
    map: 'Nearby collection points',
    ptxt: 'Are you a local business and want to turn your customers into eco-heroes? Join us. Fill in the form to enter the Partnership program: offer a reward, we bring you customers who recycle.',
    cname: 'Company name',
    logo: 'Logo',
    prods: 'Products and points',
    phone: 'Contact (phone)',
    send: 'Send request',
    sent: 'Request sent!',
    user: 'Username',
    pass: 'Password',
    balance: 'Your balance',
    pts: 'points',
    redeemBtn: 'Redeem',
    log: 'Transaction Log',
    needLogin: 'Log in to continue',
    approve: 'Approve',
    reject: 'Reject',
    create: 'Create Partner',
    req: 'Partnership Requests',
    users: 'User Management',
    search: 'Search username',
    setco: 'Set Company Account',
    ptsReq: 'Points required',
    save: 'Save',
    gdaily: 'Bottles per day',
    gtx: 'Rewards redeemed',
    mgmt: 'Reward management',
    recycling: 'Recycling',
    markUsed: 'Mark used',
    none: 'Nothing to show',
    pick: 'Pick a company',
  },
};
// ====================================================================
//  3. STATO GLOBALE E UTILITÀ UI
// ====================================================================
let lang = localStorage.getItem('gs_lang') || 'it';
const t = (k) => TXT[lang][k] || k;
const stat = (x) => t('st_' + x);
// una richiesta rifiutata da più di 24 ore non si mostra più (il server la cancella definitivamente)
const expiredReq = (r) =>
  r.status === 'rejected' && Date.now() - new Date(r.rejected_at || r.created_at) > 864e5;
let me = null,
  tab = 'home',
  charts = [],
  map = null,
  ST = {},
  posDenied = false,
  rid = 0;
const STALE = {};
let PREF; // preferenze calendario ritiri dell'utente (undefined = da caricare)

function toast(msg, err) {
  const e = $('#toast');
  e.textContent = msg;
  e.className = 'toast' + (err ? ' err' : '');
  setTimeout(() => e.classList.add('hidden'), 3500);
}
function modal(html) {
  $('#modalBody').innerHTML = html;
  $('#modal').classList.remove('hidden');
}
function closeModal() {
  $('#modal').classList.add('hidden');
  window.camStream?.getTracks().forEach((tr) => tr.stop());
  window.camStream = null;
  if (window.scanner) {
    window.scanner.stop().catch(() => {});
    window.scanner = null;
  }
}
$('#modal').addEventListener('click', (e) => {
  if (e.target.id === 'modal') closeModal();
});
const fail = (e) => toast(e.message || String(e), true);

function countUp() {
  document.querySelectorAll('[data-n]').forEach((e) => {
    const n = +e.dataset.n,
      sfx = e.dataset.s || '',
      st = performance.now();
    (function f(now) {
      const p = Math.min((now - st) / 900, 1);
      e.textContent = (n * (1 - Math.pow(1 - p, 3))).toFixed(n % 1 ? 1 : 0) + sfx;
      if (p < 1) requestAnimationFrame(f);
    })(st);
  });
}

// ====================================================================
//  4. SESSIONE, HEADER E NAVIGAZIONE
// ====================================================================
async function loadMe() {
  PREF = undefined;
  const {
    data: { session },
  } = await sb.auth.getSession();
  me = null;
  if (session) {
    const { data } = await sb.from('profiles').select('*').eq('id', session.user.id).single();
    me = data;
  }
  if (me?.banned) {
    await sb.auth.signOut();
    me = null;
    toast(t('isBanned'), true);
  }
}

// Il tasto 📅 serve solo finché la città non è impostata (poi si cambia dalla card "Prossimi Ritiri")
function updateCityBtn() {
  $('#cityBtn').classList.toggle('hidden', !!PREF?.city);
}
function renderChrome() {
  $('#lang').value = lang;
  updateCityBtn();
  const pe = $('#pts');
  pe.textContent = me ? '⭐ ' + (ST.balance ?? 0) : '';
  pe.classList.toggle('hidden', !me);
  $('#authBtn').textContent = me ? `${me.username} · ${t('logout')}` : t('login');
  document.body.classList.toggle('guest', !me);
  const tabs = me
    ? [
        ['home', 'home'],
        ['partnership', 'partnership'],
        ['redeem', 'redeem'],
        ['leaderboard', 'leaderboard'],
        ['medals', 'medals'],
      ]
    : [];
  if (me?.role === 'azienda') tabs.push(['company', 'company']);
  if (me?.role === 'admin') tabs.push(['admin', 'admin']);
  $('#nav').innerHTML = tabs
    .map(([k, l]) => `<a class="${tab === k ? 'on' : ''}" data-t="${k}">${t(l)}</a>`)
    .join('');
}
$('#nav').addEventListener('click', (e) => {
  if (e.target.dataset.t) {
    tab = e.target.dataset.t;
    render();
  }
});
$('#lang').addEventListener('change', (e) => {
  lang = e.target.value;
  localStorage.setItem('gs_lang', lang);
  render();
});
$('#cityBtn').addEventListener('click', () => cityModal());
$('#authBtn').addEventListener('click', async () => {
  if (me) {
    await sb.auth.signOut();
    me = null;
    tab = 'home';
    render();
  } else authModal();
});

function authModal() {
  tab = 'home';
  render();
}

// ====================================================================
//  5. LOGIN / REGISTRAZIONE
// ====================================================================
function viewAuth(v) {
  let mode = 'login';
  const it = lang === 'it';
  v.innerHTML = `<div class="auth"><div class="aside"><span class="blob b1"></span><span class="blob b2"></span><img src="logo.png" alt=""><h1>Green<b>Spot</b></h1>
    <p>${it ? 'Ricicla, accumula punti e ottieni premi dalle attività della tua città.' : 'Recycle, earn points and win rewards from local businesses.'}</p></div>
    <div class="card form"><div class="seg"><a data-m="login" class="on">${t('login')}</a><a data-m="signup">${t('signup')}</a></div>
    <div id="fields"></div><button class="btn wide" id="go"></button>
    <select id="al" style="margin-top:16px"><option value="it">Italiano</option><option value="en">English</option></select></div></div>`;
  $('#al').value = lang;
  $('#al').onchange = (e) => {
    lang = e.target.value;
    localStorage.setItem('gs_lang', lang);
    render();
  };
  function fields() {
    $('#fields').innerHTML =
      mode === 'login'
        ? `<label>${it ? 'Username o email' : 'Username or email'}</label><input id="au" autocomplete="username"><label>${t('pass')}</label><input id="ap" type="password" autocomplete="current-password">`
        : `<label>${it ? 'Nome utente' : 'Username'}</label><input id="au" autocomplete="username"><label>Email</label><input id="ae" type="email" autocomplete="email">
         <label>${t('pass')}</label><input id="ap" type="password" autocomplete="new-password"><label>${it ? 'Conferma password' : 'Confirm password'}</label><input id="ap2" type="password" autocomplete="new-password">`;
    $('#go').textContent = t(mode);
    v.querySelectorAll('#fields input').forEach((i) =>
      i.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') go();
      }),
    );
  }
  async function go() {
    const username = $('#au').value.trim(),
      password = $('#ap').value,
      b = $('#go');
    b.disabled = true;
    try {
      if (!username || password.length < 6)
        throw new Error(
          it
            ? 'Compila tutti i campi (password min 6 caratteri)'
            : 'Fill all fields (password min 6 chars)',
        );
      if (mode === 'login') {
        let email = username;
        if (!username.includes('@')) {
          const { data } = await sb.rpc('email_for_username', { p_username: username });
          email = data || username.toLowerCase() + DOM;
        }
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const email = $('#ae').value.trim();
        if (username.length < 3)
          throw new Error(it ? 'Nome utente: minimo 3 caratteri' : 'Username: min 3 characters');
        if (!/^\S+@\S+\.\S+$/.test(email))
          throw new Error(it ? 'Email non valida' : 'Invalid email');
        if (password !== $('#ap2').value)
          throw new Error(it ? 'Le password non coincidono' : 'Passwords do not match');
        const { data, error } = await sb.auth.signUp({
          email,
          password,
          options: { data: { username } },
        });
        if (error)
          throw new Error(
            /database/i.test(error.message)
              ? it
                ? 'Nome utente già in uso'
                : 'Username already taken'
              : error.message,
          );
        if (!data.session) throw new Error('Disattiva "Confirm email" in Supabase (vedi README)');
      }
      await loadMe();
      tab = 'home';
      render();
    } catch (e) {
      fail(e);
      b.disabled = false;
    }
  }
  $('#go').onclick = go;
  v.querySelectorAll('.seg a').forEach(
    (a) =>
      (a.onclick = () => {
        mode = a.dataset.m;
        v.querySelectorAll('.seg a').forEach((x) => x.classList.toggle('on', x === a));
        fields();
      }),
  );
  fields();
}

// ====================================================================
//  6. ROUTER · cambio pagina
// ====================================================================
async function render() {
  const my = ++rid;
  charts.forEach((c) => c.destroy());
  charts = [];
  if (map) {
    map.remove();
    map = null;
  }
  renderChrome();
  const real = $('#view');
  const v = {
    get innerHTML() {
      return real.innerHTML;
    },
    set innerHTML(x) {
      if (my !== rid) throw STALE;
      real.innerHTML = x;
      real.classList.remove('enter');
      void real.offsetWidth;
      real.classList.add('enter');
    },
    insertAdjacentHTML(...a) {
      if (my !== rid) throw STALE;
      real.insertAdjacentHTML(...a);
    },
    querySelectorAll: (...a) => real.querySelectorAll(...a),
  };
  real.innerHTML = '<div class="loader"><i></i></div>';
  try {
    if (!me) {
      viewAuth(v);
      return;
    }
    const r = await sb.rpc('stats');
    if (my !== rid) return;
    if (r.data) ST = r.data;
    renderChrome();
    if (tab === 'home') await viewHome(v);
    else if (tab === 'partnership') await viewPartnership(v);
    else if (tab === 'redeem') await viewRedeem(v);
    else if (tab === 'leaderboard') await viewLeaderboard(v);
    else if (tab === 'medals') await viewMedals(v);
    else if (tab === 'company') await viewCompany(v);
    else if (tab === 'admin') await viewAdmin(v);
    if (my === rid) countUp();
  } catch (e) {
    if (e !== STALE) fail(e);
  }
}

// ====================================================================
//  7. HOME · scansione bottiglie, mappa, punti di raccolta
// ====================================================================
async function viewHome(v) {
  let s = { total: 0, users: 0, mine: 0, record: 0 };
  if (me) s = ST;
  const avg = s.users ? (s.total / s.users / 0.5).toFixed(1) : '0';
  const pct = s.total ? ((s.mine / s.total) * 100).toFixed(1) : '0';
  v.innerHTML = `<div id="banner"></div><div class="hero"><h1>${lang === 'it' ? 'Ciao' : 'Hi'}, ${esc(me.username)} 👋</h1><p>${lang === 'it' ? 'Ogni bottiglia conta: continua così!' : 'Every bottle counts: keep going!'}</p></div><div class="grid">
    <div class="card stat"><i>♻️</i><h3>${t('total')}</h3><p class="big" data-n="${avg}">0</p><span class="mut">${t('totalSub')}</span></div>
    <div class="card stat"><i>🌍</i><h3>${t('mine')}</h3><p class="big" data-n="${pct}" data-s="%">0</p><span class="mut">${t('mineSub')}</span></div>
    <div class="card stat"><i>🏆</i><h3>${t('record')}</h3><p class="big" data-n="${s.record / 0.5}">0</p><span class="mut">${t('recordSub')}</span></div><div class="card stat"><i>⭐</i><h3>${t('yourPts')}</h3><p class="big" data-n="${s.balance ?? 0}">0</p><span class="mut">${t('pts')}</span></div></div>
    <button class="btn scan" id="scanBtn">📷 ${t('scan')}</button>
    <div id="sched"></div>
    <div class="card"><div class="row" style="justify-content:space-between"><h3>${t('map')}</h3><span class="row"><button class="btn sm ghost" id="loc">📡 ${t('gps')}</button><button class="btn sm ghost" id="rep">📍 ${t('report')}</button></span></div><div id="map"></div><div id="plist"></div></div>`;
  $('#scanBtn').onclick = () => (me ? scanModal() : authModal());
  $('#rep').onclick = reportModal;
  $('#loc').onclick = () =>
    navigator.geolocation.getCurrentPosition(
      (p) => {
        localStorage.setItem(
          'gs_pos',
          JSON.stringify({ lat: p.coords.latitude, lon: p.coords.longitude }),
        );
        posDenied = false;
        render();
      },
      () => toast(t('gpsDenied'), true),
      { enableHighAccuracy: true, timeout: 15000 },
    );
  initMap();
  loadSchedule().catch(fail);
}

// ---- Scansione bottiglia: foto + controllo AI + codice a barre ----
let cocoP = null;
const loadCoco = () => cocoP || (cocoP = cocoSsd.load());
function shrink(file, max = 1280) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height)),
        c = document.createElement('canvas');
      c.width = img.width * k;
      c.height = img.height * k;
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      c.toBlob((blob) => res({ blob, canvas: c }), 'image/jpeg', 0.92);
    };
    img.onerror = rej;
    img.src = URL.createObjectURL(file);
  });
}
const okEan = (c) =>
  /^(\d{8}|\d{12,13})$/.test(c) &&
  (() => {
    const d = [...c].map(Number),
      k = d.pop();
    return (10 - (d.reverse().reduce((a, x, i) => a + x * (i % 2 ? 1 : 3), 0) % 10)) % 10 === k;
  })();
// Chiamata generica a Gemini: foto + prompt -> JSON
async function geminiJSON(canvas, prompt) {
  const key = CONFIG.GEMINI_API_KEY;
  if (!key || key.startsWith('INCOLLA')) return null;
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.GEMINI_MODEL || 'gemini-3.1-flash-lite'}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: canvas.toDataURL('image/jpeg', 0.85).split(',')[1],
                },
              },
            ],
          },
        ],
        generationConfig: { temperature: 0, responseMimeType: 'application/json' },
      }),
    },
  );
  if (!r.ok) throw new Error('Gemini ' + r.status);
  return JSON.parse((await r.json()).candidates[0].content.parts[0].text);
}
// Verifica bottiglia (passo 1): una sola chiamata a Gemini con ricerca Google veloce
const BOTTLE_PROMPT =
  'Analizza la foto di una bottiglia/lattina. Fai UNA ricerca web velocissima per capire se la foto è un\'immagine già presente su internet (stock, e-commerce, pubblicità). Rispondi SOLO con JSON: {\"is_bottle\":true se si vede una bottiglia o lattina di bevanda reale,\"is_screen\":true se è la foto di uno schermo o di una stampa,\"from_web\":true se sembra presa da internet (sfondo bianco/da catalogo, ritocchi da studio, trovata online),\"has_real_background\":true se dietro/attorno si vede un ambiente reale (tavolo, stanza, strada, mano...) e non uno sfondo vuoto o artificiale,\"barcode_visible\":true se si vede un codice a barre,\"barcode_digits\":\"cifre del codice a barre se leggibili, altrimenti stringa vuota\"}';
const SPOT_PROMPT =
  'Analizza la foto. Rispondi SOLO con JSON: {"is_recycling_point":true se si vede un cassonetto, una campana o un bidone per la raccolta differenziata oppure una macchinetta mangia-bottiglie/ecocompattatore,"kind":"bin" oppure "machine" oppure "none","is_screen":true se è la foto di uno schermo o di una stampa,"note":"descrizione in massimo 8 parole"}';
const askGemini = async (canvas) => {
  const key = CONFIG.GEMINI_API_KEY;
  if (!key || key.startsWith('INCOLLA')) return null;
  const body = (tools) =>
    JSON.stringify({
      contents: [
        {
          parts: [
            { text: BOTTLE_PROMPT },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: canvas.toDataURL('image/jpeg', 0.85).split(',')[1],
              },
            },
          ],
        },
      ],
      ...(tools ? { tools: [{ google_search: {} }] } : { generationConfig: { responseMimeType: 'application/json' } }),
    });
  const call = async (tools, ms) => {
    const ctl = new AbortController();
    const to = setTimeout(() => ctl.abort(), ms);
    try {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.GEMINI_MODEL || 'gemini-3.1-flash-lite'}:generateContent`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
          body: body(tools),
          signal: ctl.signal,
        },
      );
      if (!r.ok) throw new Error('Gemini ' + r.status);
      const txt = (await r.json()).candidates[0].content.parts.map((x) => x.text || '').join('');
      return JSON.parse(txt.slice(txt.indexOf('{'), txt.lastIndexOf('}') + 1));
    } finally {
      clearTimeout(to);
    }
  };
  try {
    return await call(true, 9000); // con ricerca web veloce
  } catch (e) {
    console.warn('Ricerca web non disponibile, analisi senza ricerca', e);
    return call(false, 12000);
  }
};
// Fotocamera dal browser: chiede il permesso, mostra l'anteprima e scatta. Passa il File a onFile.
// Se il browser non ha getUserMedia (o non c'è una fotocamera) ripiega sull'input con capture (telefono).
async function camCapture(box, fallbackInput, onFile) {
  if (!navigator.mediaDevices?.getUserMedia) return fallbackInput.click();
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 } },
      audio: false,
    });
  } catch (err) {
    if (err?.name === 'NotAllowedError' || err?.name === 'SecurityError')
      return toast(t('camDenied'), true);
    return fallbackInput.click();
  }
  window.camStream = stream;
  box.classList.remove('hidden');
  box.innerHTML = `<video autoplay playsinline muted style="width:100%;border-radius:12px;background:#000"></video>
    <div class="row" style="gap:12px;margin:12px 0"><button class="btn" id="camShot" style="flex:1">📸 ${t('camShoot')}</button><button class="btn ghost" id="camCancel" style="flex:1">${t('camCancel')}</button></div>`;
  const video = box.querySelector('video');
  video.srcObject = stream;
  const stop = () => {
    stream.getTracks().forEach((tr) => tr.stop());
    video.pause();
    video.srcObject = null; // scollega il flusso: la fotocamera si spegne davvero
    window.camStream = null;
    box.classList.add('hidden');
    box.innerHTML = '';
  };
  box.querySelector('#camCancel').onclick = stop;
  box.querySelector('#camShot').onclick = () => {
    const c = document.createElement('canvas');
    c.width = video.videoWidth || 1280;
    c.height = video.videoHeight || 720;
    c.getContext('2d').drawImage(video, 0, 0, c.width, c.height);
    stop(); // spenta subito dopo lo scatto, prima di qualsiasi analisi
    c.toBlob(
      (blob) => onFile(new File([blob], 'foto.jpg', { type: 'image/jpeg' })),
      'image/jpeg',
      0.92,
    );
  };
}

function scanModal() {
  modal(`<h2>${t('scan')}</h2><p class="mut">${t('photoHelp')}</p><div id="reader" style="display:none"></div>
    <div id="camBox" class="hidden"></div>
    <img id="prev" class="hidden" style="width:100%;border-radius:12px;margin:8px 0"><p id="stat" class="mut"></p>
    <div class="row" style="gap:12px">
      <button class="btn" id="camBtn" style="flex:1;min-width:150px">📷 ${t('photo')}</button>
      <input id="ph" type="file" accept="image/*" capture="environment" hidden>
      <label class="btn ghost" style="flex:1;min-width:150px;text-align:center">🖼️ ${t('pickPhoto')}<input id="ph2" type="file" accept="image/*" hidden></label>
    </div>`);
  // Torna alla homepage mostrando il motivo (passo 3: se i controlli falliscono)
  const backHome = (msg, ok) => {
    closeModal();
    tab = 'home';
    render().then(() => toast(msg, !ok));
  };
  $('#ph').onchange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const st = $('#stat');
    st.textContent = t('analyzing');
    try {
      const { blob, canvas } = await shrink(f);
      $('#prev').src = URL.createObjectURL(blob);
      $('#prev').classList.remove('hidden');
      // PASSO 1 · analisi immagine: reale (non da internet, non schermo) e con sfondo
      let ai = null;
      try {
        ai = await askGemini(canvas);
      } catch (e) {
        console.warn('AI non disponibile, uso il controllo locale', e);
      }
      if (ai) {
        if (!ai.is_bottle) return backHome(t('noBottle'));
        if (ai.is_screen) return backHome(t('isScreen'));
        if (ai.from_web) return backHome(t('fromWeb'));
        if (!ai.has_real_background) return backHome(t('noBackground'));
      } else {
        const preds = await (await loadCoco()).detect(canvas);
        if (!preds.some((p) => p.class === 'bottle' && p.score > 0.3))
          return backHome(t('noBottle'));
      }
      // PASSO 2 · codice a barre: lettura, scomposizione in cifre, blocco dei doppioni
      const F = Html5QrcodeSupportedFormats;
      let code;
      try {
        code = await new Html5Qrcode('reader', {
          formatsToSupport: [F.EAN_13, F.EAN_8, F.UPC_A, F.UPC_E, F.CODE_128, F.CODE_39],
        }).scanFile(new File([blob], 'b.jpg', { type: 'image/jpeg' }), false);
      } catch {
        const d = String(ai?.barcode_digits || '').replace(/\D/g, '');
        code = okEan(d) ? d : null;
      }
      code = String(code || '').replace(/\D/g, '');
      if (!code) return backHome(t('noBarcode'));
      if (code.length === 12) code = '0' + code; // UPC-A = EAN-13 con 0 davanti: stesso codice
      const digits = [...code].map(Number); // scomposto in numeri
      // PASSO 3 · tutto ok: salva il codice (una sola volta) e assegna i punti
      const { error } = await sb.rpc('add_scan_checked', { p_barcode: code, p_digits: digits });
      if (error) {
        if (/barcode_already_scanned|duplicate/i.test(error.message)) return backHome(t('dupBottle'));
        throw error;
      }
      backHome(t('scanned'), true);
    } catch (err) {
      st.textContent = '❌ ' + (err.message || err);
    }
  };
  $('#ph2').onchange = $('#ph').onchange; // stessa funzione di gestione per "Seleziona foto"
  $('#camBtn').onclick = () =>
    camCapture($('#camBox'), $('#ph'), (f) => $('#ph').onchange({ target: { files: [f] } }));
}

// ---- Mappa, punti di raccolta e segnalazioni ----
// Segnalazione di un cassonetto/macchinetta: foto + controllo AI, poi approvazione dell'admin
function removeSpotPhoto(url) {
  return url?.includes('/spots/')
    ? sb.storage.from('spots').remove([url.split('/spots/')[1]])
    : null;
}
function reportModal() {
  modal(`<h2>📍 ${t('report')}</h2><p class="mut">${t('repHelp')}</p>
    <input id="rn" placeholder="${t('cname')}">
    <select id="rk"><option value="machine">🤖 ${t('machine')}</option><option value="bin">🗑️ ${t('bin')}</option></select>
    <img id="rprev" class="hidden" style="width:100%;border-radius:12px;margin-bottom:12px">
    <p id="rstat" class="mut"></p>
    <div id="rcamBox" class="hidden"></div>
    <button class="btn wide" id="rcam">📷 ${t('photoSpot')}</button>
    <input id="rph" type="file" accept="image/*" capture="environment" hidden>`);
  $('#rph').onchange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const st = $('#rstat');
    st.textContent = t('analyzing');
    try {
      const pos = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, {
          enableHighAccuracy: true,
          timeout: 10000,
        }),
      );
      const { blob, canvas } = await shrink(f, 1024);
      $('#rprev').src = URL.createObjectURL(blob);
      $('#rprev').classList.remove('hidden');
      let ai = null;
      try {
        ai = await geminiJSON(canvas, SPOT_PROMPT);
      } catch (err) {
        console.warn('AI non disponibile: la segnalazione andrà all’admin senza verifica', err);
      }
      if (ai?.is_screen) return (st.textContent = '❌ ' + t('isScreen'));
      if (ai && !ai.is_recycling_point) return (st.textContent = '❌ ' + t('notSpot'));
      const path = `${crypto.randomUUID()}.jpg`;
      const up = await sb.storage.from('spots').upload(path, blob, { contentType: 'image/jpeg' });
      if (up.error) throw up.error;
      const kind = $('#rk').value;
      const { error } = await sb.from('collection_points').insert({
        name: $('#rn').value.trim() || t(kind),
        kind,
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
        approved: false,
        photo_url: sb.storage.from('spots').getPublicUrl(path).data.publicUrl,
        ai_verdict: ai ? 'ok' : 'unchecked',
        ai_note: ai ? `${ai.kind}: ${ai.note || ''}` : null,
      });
      if (error) throw error;
      toast(t('repOk'));
      closeModal();
    } catch (err) {
      st.textContent = '❌ ' + (err.code === 1 ? t('noGps') : err.message || err);
    }
  };
  $('#rcam').onclick = () =>
    camCapture($('#rcamBox'), $('#rph'), (f) => $('#rph').onchange({ target: { files: [f] } }));
}
const ICON = { machine: '🤖', bin: '🗑️' };
const pin = (k) =>
  L.divIcon({
    className: '',
    html: `<div class="pin ${k}"><span>${ICON[k]}</span></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -34],
  });
const tiles = () =>
  L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    { maxZoom: 19, attribution: 'Tiles © Esri' },
  );
const km = (a, b) => {
  const r = (x) => (x * Math.PI) / 180,
    h =
      Math.sin(r(b[0] - a[0]) / 2) ** 2 +
      Math.cos(r(a[0])) * Math.cos(r(b[0])) * Math.sin(r(b[1] - a[1]) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
};
const gmaps = (p) => `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lon}`;

function getPos() {
  const def = { lat: 40.8518, lon: 14.2681, located: false };
  try {
    const c = JSON.parse(localStorage.getItem('gs_pos'));
    if (c?.lat) return Promise.resolve({ ...c, located: true });
  } catch {}
  if (posDenied || !navigator.geolocation) return Promise.resolve(def);
  return new Promise((res) =>
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const o = { lat: p.coords.latitude, lon: p.coords.longitude };
        localStorage.setItem('gs_pos', JSON.stringify(o));
        res({ ...o, located: true });
      },
      () => {
        posDenied = true;
        res(def);
      },
      { timeout: 8000 },
    ),
  );
}
// Punti OpenStreetMap: cache 15 minuti, timeout e server di riserva (Overpass a volte è lento o limita le richieste)
const OSM_URLS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];
async function loadOsm(lat, lon) {
  const key = `gs_osm_${lat.toFixed(2)}_${lon.toFixed(2)}`;
  try {
    const c = JSON.parse(localStorage.getItem(key));
    if (c && Date.now() - c.t < 15 * 60e3) return c.d;
  } catch {}
  const q = `[out:json][timeout:25];(nwr(around:8000,${lat},${lon})["amenity"="recycling"];nwr(around:8000,${lat},${lon})["vending"="bottle_return"];nwr(around:8000,${lat},${lon})["name"~"coripet|ecomacchina|compattatore|reverse vending",i];);out center 150;`;
  for (const url of OSM_URLS) {
    try {
      const ctl = new AbortController();
      const to = setTimeout(() => ctl.abort(), 15000);
      const r = await fetch(url, { method: 'POST', body: q, signal: ctl.signal });
      clearTimeout(to);
      const d = await r.json();
      try {
        localStorage.setItem(key, JSON.stringify({ t: Date.now(), d }));
      } catch {}
      return d;
    } catch (e) {
      console.warn('Overpass', url, e);
    }
  }
  return { elements: [] };
}

function initMap() {
  const draw = async (lat, lon, located) => {
    if (!$('#map')) return;
    const m = (map = L.map('map').setView([lat, lon], 14));
    tiles().addTo(m);
    if (located)
      L.circleMarker([lat, lon], { color: '#1F2937', radius: 8 }).addTo(m).bindPopup('Tu');
    else $('#plist').innerHTML = `<p class="mut">${t('gpsHint')}</p>`;
    const pts = [];
    const isAdmin = me?.role === 'admin';
    let preview = null,
      previewFor = null;
    const popup = (p) =>
      `<b>${esc(p.name)}</b><br>${ICON[p.kind]} ${t(p.kind)}${p.addr ? '<br>' + esc(p.addr) : ''}${p.photo ? `<br><img src="${esc(p.photo)}" style="width:180px;border-radius:8px;margin:6px 0">` : ''}${p.pending ? `<br><span class="tag">${t('pendingNote')}</span>` : ''}
       <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">${p.pending ? (isAdmin ? `<button class="btn sm" data-ok>✅ ${t('approve')}</button>` : '') : `<button class="btn sm" data-nav>🧭 ${t('setDir')}</button>`}${isAdmin ? '<button class="btn sm red" data-del>🗑️</button>' : ''}</div>`;
    // Admin: elimina un punto dalla mappa (punti inseriti = cancellati, punti OpenStreetMap = nascosti)
    const removePoint = async (p) => {
      if (!confirm(t('confirmPt'))) return;
      const { error } = p.id
        ? await sb.from('collection_points').delete().eq('id', p.id)
        : await sb.from('hidden_osm_points').insert({ osm_id: p.osm });
      if (error) return fail(error);
      await removeSpotPhoto(p.photo);
      m.removeLayer(p.marker);
      pts.splice(pts.indexOf(p), 1);
      if (p === previewFor && preview) m.removeLayer(preview);
      toast('OK');
      drawList();
    };
    const addPoint = (p) => {
      pts.push(p);
      p.marker = L.marker([p.lat, p.lon], { icon: pin(p.kind), opacity: p.pending ? 0.55 : 1 })
        .addTo(m)
        .bindPopup(popup(p));
      p.marker.on('popupopen', (e) => {
        const el = e.popup.getElement();
        const on = (sel, fn) => {
          const b = el.querySelector(sel);
          if (b) b.onclick = fn;
        };
        on('[data-nav]', () => {
          m.closePopup();
          startNav(p);
        });
        on('[data-del]', () => removePoint(p));
        on('[data-ok]', async () => {
          const { error } = await sb
            .from('collection_points')
            .update({ approved: true })
            .eq('id', p.id);
          if (error) return fail(error);
          p.pending = false;
          p.marker.setOpacity(1);
          p.marker.setPopupContent(popup(p));
          m.closePopup();
          toast('OK');
          drawList();
        });
      });
    };
    function drawList() {
      if (!$('#plist') || !located) return;
      const ok = pts.filter((p) => !p.pending);
      if (!ok.length) {
        $('#plist').innerHTML = `<p class="mut">${t('noPts')}</p>`;
        return;
      }
      ok.forEach((p) => (p.d = km([lat, lon], [p.lat, p.lon])));
      const top = [...ok].sort((a, b) => a.d - b.d).slice(0, 6);
      $('#plist').innerHTML =
        `<h3 style="margin-top:20px">${t('nearest')}</h3>` +
        top
          .map(
            (p, i) =>
              `<div class="pl"><span>${ICON[p.kind]} <b>${esc(p.name)}</b> <span class="mut">· ${p.d.toFixed(1)} km</span></span><button class="btn sm" data-navi="${i}">🧭 ${t('setDir')}</button></div>`,
          )
          .join('');
      $('#plist')
        .querySelectorAll('[data-navi]')
        .forEach((b) => (b.onclick = () => startNav(top[+b.dataset.navi])));
    }
    // 1) punti inseriti dall'app: si vedono subito, senza aspettare OpenStreetMap
    const [{ data: db, error: dbErr }, { data: hid }] = await Promise.all([
      sb.from('collection_points').select('*'),
      sb.from('hidden_osm_points').select('osm_id'),
    ]);
    if (dbErr) fail(dbErr);
    if (map !== m) return;
    (db || []).forEach((p) =>
      addPoint({
        id: p.id,
        lat: p.lat,
        lon: p.lon,
        kind: p.kind,
        name: p.name,
        addr: p.address,
        photo: p.photo_url,
        pending: !p.approved,
      }),
    );
    drawList();
    // 2) punti OpenStreetMap: arrivano dopo
    const hidden = new Set((hid || []).map((h) => h.osm_id));
    const d = await loadOsm(lat, lon);
    if (map !== m) return;
    d.elements
      .filter((e) => (e.lat ?? e.center?.lat) != null && !hidden.has(`${e.type}/${e.id}`))
      .forEach((e) => {
        const tg = e.tags || {},
          mach =
            tg.vending === 'bottle_return' ||
            /coripet|ecomacchina|compattatore|reverse vending|pfand/i.test(
              (tg.name || '') + (tg.operator || ''),
            );
        addPoint({
          osm: `${e.type}/${e.id}`,
          lat: e.lat ?? e.center.lat,
          lon: e.lon ?? e.center.lon,
          kind: mach ? 'machine' : 'bin',
          name: tg.name || (mach ? t('machine') : t('bin')),
          addr: tg['addr:street'] || '',
        });
      });
    drawList();
    // anteprima del percorso verso il punto più vicino (macchinette per prime)
    const cand = pts.filter((p) => !p.pending && p.d != null);
    if (!located || !cand.length) return;
    cand.sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'machine' ? -1 : 1) || a.d - b.d);
    const n = (previewFor = cand[0]);
    fetch(
      `https://router.project-osrm.org/route/v1/foot/${lon},${lat};${n.lon},${n.lat}?overview=full&geometries=geojson`,
    )
      .then((r) => r.json())
      .then((r) => {
        if (map === m && previewFor === n && r.routes?.[0])
          preview = L.geoJSON(r.routes[0].geometry, {
            style: { color: '#10B981', weight: 5 },
          }).addTo(m);
      })
      .catch(() => {});
  };
  getPos().then((p) => setTimeout(() => draw(p.lat, p.lon, p.located), 0));
}

// ====================================================================
//  7b. CALENDARIO RACCOLTA · prossimi ritiri, città, admin
// ====================================================================
const WASTE = {
  plastica: { icon: '♻️', it: 'Plastica', en: 'Plastic', de: 'della plastica' },
  carta: { icon: '📄', it: 'Carta', en: 'Paper', de: 'della carta' },
  vetro: { icon: '🍾', it: 'Vetro', en: 'Glass', de: 'del vetro' },
  organico: { icon: '🍂', it: 'Organico', en: 'Organic', de: 'dell’organico' },
  indifferenziato: {
    icon: '🗑️',
    it: 'Indifferenziato',
    en: 'General waste',
    de: 'dell’indifferenziato',
  },
  RAEE: { icon: '🔌', it: 'RAEE', en: 'WEEE', de: 'dei RAEE' },
};
const wasteName = (k) => WASTE[k]?.[lang] || k;
const parseD = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
const daysTo = (s) => {
  const t0 = new Date();
  t0.setHours(0, 0, 0, 0);
  return Math.round((parseD(s) - t0) / 864e5);
};
const fmtDate = (s) =>
  parseD(s)
    .toLocaleDateString(lang === 'it' ? 'it-IT' : 'en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
    .replace(/^./, (c) => c.toUpperCase());
const countdown = (n) =>
  n <= 0 ? t('today') : n === 1 ? t('tomorrow') : t('daysLeft').replace('{n}', n);
const likeEsc = (s) => s.replace(/[\\%_]/g, '\\$&');
const pickText = (r) => {
  const n = daysTo(r.collection_date);
  if (lang === 'it') {
    const de = WASTE[r.waste_type]?.de || r.waste_type;
    return n <= 0
      ? `Oggi c’è la raccolta ${de}`
      : n === 1
        ? `Domani c’è la raccolta ${de}`
        : `Mancano ${n} giorni alla raccolta ${de}`;
  }
  const nm = wasteName(r.waste_type).toLowerCase();
  return n <= 0
    ? `Today: ${nm} collection`
    : n === 1
      ? `Tomorrow: ${nm} collection`
      : `${n} days until ${nm} collection`;
};
const bannerText = (rows) =>
  lang === 'it'
    ? `Domani passa la raccolta ${rows.map((r) => WASTE[r.waste_type]?.de || r.waste_type).join(' e ')}. Ricordati di esporre il bidone!`
    : `Tomorrow: ${rows.map((r) => wasteName(r.waste_type).toLowerCase()).join(' & ')} collection. Remember to put your bin out!`;

// Card "Prossimi Ritiri" + banner del giorno prima (nella Home)
async function loadSchedule() {
  if (!$('#sched')) return;
  if (PREF === undefined) {
    const { data } = await sb
      .from('user_schedule_preferences')
      .select('*')
      .eq('user_id', me.id)
      .maybeSingle();
    PREF = data || null;
    updateCityBtn();
  }
  if (!$('#sched')) return;
  if (!PREF?.city) {
    $('#sched').innerHTML =
      `<div class="card"><h3>📅 ${t('nextPick')}</h3><p>${t('setCityMsg')}</p><button class="btn" id="chCity">${t('setCity')}</button></div>`;
    $('#chCity').onclick = () => cityModal();
    if (!sessionStorage.getItem('gs_cityAsked')) {
      sessionStorage.setItem('gs_cityAsked', '1');
      cityModal();
    }
    return;
  }
  const { data, error } = await sb
    .from('collection_schedules')
    .select('*')
    .ilike('city', likeEsc(PREF.city))
    .gte('collection_date', new Date().toLocaleDateString('sv-SE'))
    .order('collection_date')
    .limit(60);
  if (!$('#sched')) return; // pagina cambiata nel frattempo
  if (error) throw error;
  const nb = PREF.neighborhood?.toLowerCase();
  const list = (data || []).filter(
    (r) => !nb || !r.neighborhood || r.neighborhood.toLowerCase() === nb,
  );
  const head = `<div class="row" style="justify-content:space-between;margin-bottom:12px"><h3 style="margin:0">📅 ${t('nextPick')}</h3><button class="btn sm ghost" id="chCity">${t('changeCity')}</button></div>`;
  if (!list.length) {
    $('#sched').innerHTML =
      `<div class="card">${head}<p class="mut">${t('noPick').replace('{c}', esc(PREF.city))}</p></div>`;
  } else {
    const first = list[0];
    $('#sched').innerHTML = `<div class="card">${head}
      <div class="nextpick"><span class="em">${WASTE[first.waste_type]?.icon || '📅'}</span>
        <div><b>${pickText(first)}</b><br><span class="mut">${fmtDate(first.collection_date)}</span></div></div>
      ${list
        .slice(0, 5)
        .map(
          (
            r,
          ) => `<div class="pl"><span>${WASTE[r.waste_type]?.icon || ''} <b>${esc(wasteName(r.waste_type))}</b><br>
            <span class="mut">${fmtDate(r.collection_date)} · ${esc([r.neighborhood, r.city].filter(Boolean).join(', '))}</span></span>
            <span class="tag ${daysTo(r.collection_date) === 1 ? 'approved' : ''}">${countdown(daysTo(r.collection_date))}</span></div>`,
        )
        .join('')}</div>`;
  }
  $('#chCity').onclick = () => cityModal();
  const tom = PREF.notifications_enabled ? list.filter((r) => daysTo(r.collection_date) === 1) : [];
  if ($('#banner'))
    $('#banner').innerHTML = tom.length ? `<div class="banner">🔔 ${bannerText(tom)}</div>` : '';
  const key = 'gs_notif_' + new Date().toLocaleDateString('sv-SE');
  if (
    tom.length &&
    typeof Notification !== 'undefined' &&
    Notification.permission === 'granted' &&
    !localStorage.getItem(key)
  ) {
    try {
      new Notification('GreenSpot', { body: bannerText(tom), icon: 'logo.png' });
      localStorage.setItem(key, '1');
    } catch {}
  }
}

// Modale "Imposta la tua città" (anche dall'icona 📅 nell'header)
async function cityModal() {
  const [{ data: pl }, { data }] = await Promise.all([
    sb.from('places').select('name').eq('kind', 'comune'),
    sb.from('collection_schedules').select('city').limit(500),
  ]);
  const cities = [
    ...new Set([...(pl || []).map((r) => r.name), ...(data || []).map((r) => r.city)]),
  ].sort();
  modal(`<h2>📍 ${t('setCity')}</h2>
    <label>${t('city')}</label><input id="cityIn" list="cityOpts" autocomplete="off" value="${esc(PREF?.city || '')}">
    <datalist id="cityOpts">${cities.map((c) => `<option value="${esc(c)}">`).join('')}</datalist>
    <label>${t('hood')}</label><input id="hoodIn" value="${esc(PREF?.neighborhood || '')}">
    <label style="display:flex;gap:10px;align-items:center;cursor:pointer"><input type="checkbox" id="notifIn" style="width:auto;margin:0" ${(PREF?.notifications_enabled ?? true) ? 'checked' : ''}> ${t('notif')}</label>
    <button class="btn wide" id="citySave" style="margin-top:16px">${t('save')}</button>`);
  $('#citySave').onclick = async () => {
    const city = $('#cityIn').value.trim();
    if (!city) return toast(t('city'), true);
    const row = {
      user_id: me.id,
      city,
      neighborhood: $('#hoodIn').value.trim() || null,
      notifications_enabled: $('#notifIn').checked,
    };
    const { error } = await sb
      .from('user_schedule_preferences')
      .upsert(row, { onConflict: 'user_id' });
    if (error) return fail(error);
    PREF = row;
    updateCityBtn();
    closeModal();
    if (
      row.notifications_enabled &&
      typeof Notification !== 'undefined' &&
      Notification.permission === 'default'
    ) {
      try {
        await Notification.requestPermission();
      } catch {}
    }
    if ($('#sched')) loadSchedule().catch(fail);
    else toast('OK');
  };
}

// Admin · calendario ritiri organizzato per zone: Nazione › Paese › Comune › calendario
let calPath = []; // id dei luoghi aperti, in ordine (nazione, paese, comune)
const GEO_KINDS = ['country', 'town', 'comune'];
const GEO_ICON = { country: '🌍', town: '🏘️', comune: '📍' };
// Comuni che hanno già dei ritiri ma non stanno ancora nelle zone: compaiono sotto "Comuni non classificati"
function withUnsorted(places, rows) {
  const known = new Set(places.filter((p) => p.kind === 'comune').map((p) => p.name.toLowerCase()));
  const extra = [...new Set(rows.map((r) => r.city))]
    .filter((c) => c && !known.has(c.toLowerCase()))
    .sort();
  if (!extra.length) return places;
  return [
    ...places,
    { id: 'unsorted', kind: 'country', name: t('geoUnsorted'), parent_id: null, virtual: true },
    ...extra.map((c) => ({ id: 'c:' + c, kind: 'comune', name: c, parent_id: 'unsorted', virtual: true })),
  ];
}
function geoState(places) {
  const byId = new Map(places.map((p) => [p.id, p]));
  const path = [];
  for (const id of calPath) {
    const p = byId.get(id);
    if (!p || (p.parent_id || null) !== (path.at(-1)?.id || null)) break;
    path.push(p);
  }
  calPath = path.map((p) => p.id);
  return { path, cur: path.at(-1) || null, level: path.length };
}
function calAdminHTML(places, rows, noTable) {
  if (noTable)
    return `<div class="card"><h3>🗓️ ${t('calAdmin')}</h3><p class="mut">${t('geoNoTable')}</p></div>`;
  places = withUnsorted(places, rows);
  const { path, cur, level } = geoState(places);
  const crumbs =
    `<a data-gl="0">🌍 ${t('geoAll')}</a>` +
    path.map((p, i) => ` › <a data-gl="${i + 1}">${esc(p.name)}</a>`).join('');
  let body = '';
  if (cur?.kind !== 'comune') {
    const kind = GEO_KINDS[level];
    const kids = places
      .filter((p) => (p.parent_id || null) === (cur?.id || null))
      .sort((a, b) => a.name.localeCompare(b.name));
    const info = (p) => {
      const sub = places.filter((x) => x.parent_id === p.id);
      if (p.kind === 'comune') {
        const n = rows.filter((r) => r.city === p.name).length;
        return n ? `${n} ${t('geoPickits')}` : t('geoEmpty');
      }
      return sub.length
        ? `${sub.length} ${p.kind === 'country' ? t('geoTowns') : t('geoComuni')}`
        : t('geoEmpty');
    };
    body = `${
      kids
        .map(
          (p) => `<div class="pl geo" data-go="${p.id}" style="cursor:pointer"><span>${GEO_ICON[p.kind]} <b>${esc(p.name)}</b> <span class="mut">· ${info(p)}</span></span>
          <span class="row" style="flex-wrap:nowrap">${p.id === 'unsorted' ? '' : `<button class="btn sm red" data-gdel="${p.id}">${t('del')}</button>`}<span>›</span></span></div>`,
        )
        .join('') || `<p class="mut">${t('geoNone')}</p>`
    }
      ${cur?.virtual ? '' : `<div class="row" style="margin-top:16px"><input id="geoName" placeholder="${t('geoName' + kind[0].toUpperCase() + kind.slice(1))}" style="flex:1"><button class="btn" id="geoAdd">${t('geoAdd')}</button></div>`}`;
  } else {
    const types = Object.keys(WASTE)
      .map((k) => `<option value="${k}">${WASTE[k].icon} ${esc(wasteName(k))}</option>`)
      .join('');
    body = `<div class="row"><input id="calHood" placeholder="${t('hood')}" style="flex:1"><select id="calType" style="flex:1">${types}</select><input id="calDate" type="date" style="flex:1"></div>
      <textarea id="calNotes" rows="2" placeholder="${t('notes')}"></textarea>
      <button class="btn" id="calAdd">${t('add')}</button>
      <div class="row" style="margin-top:24px"><input id="calFind" placeholder="${t('calSearch')}" style="flex:1"></div>
      <div style="overflow-x:auto"><table id="calTable"></table></div>`;
  }
  return `<div class="card"><h3>🗓️ ${t('calAdmin')}</h3>
    <p class="mut" id="geoCrumbs" style="margin:0 0 14px">${crumbs}</p>${body}</div>`;
}
function calAdminInit(places, rows, noTable) {
  if (noTable) return;
  places = withUnsorted(places, rows);
  const { cur, level } = geoState(places);
  document.querySelectorAll('#geoCrumbs [data-gl]').forEach((a) => {
    a.style.cursor = 'pointer';
    a.onclick = () => {
      calPath = calPath.slice(0, +a.dataset.gl);
      render();
    };
  });
  if (cur?.kind !== 'comune') {
    document.querySelectorAll('[data-go]').forEach(
      (r) =>
        (r.onclick = (e) => {
          if (e.target.closest('[data-gdel]')) return;
          calPath.push(r.dataset.go);
          render();
        }),
    );
    document.querySelectorAll('[data-gdel]').forEach(
      (b) =>
        (b.onclick = async () => {
          if (!confirm(t('geoConfirmDel'))) return;
          const p = places.find((x) => x.id === b.dataset.gdel);
          if (p.kind === 'comune') await sb.from('collection_schedules').delete().eq('city', p.name);
          if (p.virtual) return render();
          const { error } = await sb.from('places').delete().eq('id', p.id);
          error ? fail(error) : render();
        }),
    );
    if ($('#geoAdd')) $('#geoAdd').onclick = async () => {
      const name = $('#geoName').value.trim();
      if (!name) return;
      const { error } = await sb
        .from('places')
        .insert({ name, kind: GEO_KINDS[level], parent_id: cur?.id || null });
      error ? fail(error) : render();
    };
    return;
  }
  const read = (p) => ({
    city: cur.name, // il comune scelto: è il nome che gli utenti impostano come "città"
    neighborhood: $(`#${p}Hood`).value.trim() || null,
    waste_type: $(`#${p}Type`).value,
    collection_date: $(`#${p}Date`).value,
    notes: $(`#${p}Notes`).value.trim() || null,
  });
  const valid = (x) =>
    x.collection_date ? true : (toast(t('date'), true), false);
  const mine = rows.filter((r) => r.city === cur.name);
  const draw = () => {
    const q = $('#calFind').value.trim().toLowerCase();
    const list = mine.filter(
      (r) => !q || `${r.neighborhood || ''} ${r.waste_type}`.toLowerCase().includes(q),
    );
    $('#calTable').innerHTML =
      `<tr><th>${t('date')}</th><th>${t('hood')}</th><th>${t('wtype')}</th><th></th></tr>` +
      list
        .slice(0, 100)
        .map(
          (r) => `<tr><td>${fmtDate(r.collection_date)}</td>
            <td><span class="mut">${esc(r.neighborhood || '—')}${r.notes ? ' · ' + esc(r.notes) : ''}</span></td>
            <td>${WASTE[r.waste_type]?.icon || ''} ${esc(wasteName(r.waste_type))}</td>
            <td style="white-space:nowrap"><button class="btn sm ghost" data-ce="${r.id}">${t('edit')}</button><button class="btn sm red" data-cd="${r.id}">${t('del')}</button></td></tr>`,
        )
        .join('');
    $('#calTable')
      .querySelectorAll('[data-cd]')
      .forEach(
        (b) =>
          (b.onclick = async () => {
            if (!confirm(t('confirmRow'))) return;
            const { error } = await sb.from('collection_schedules').delete().eq('id', b.dataset.cd);
            error ? fail(error) : render();
          }),
      );
    $('#calTable')
      .querySelectorAll('[data-ce]')
      .forEach((b) => (b.onclick = () => editModal(rows.find((r) => r.id === b.dataset.ce))));
  };
  const editModal = (r) => {
    modal(`<h2>${t('edit')}</h2>
      <label>${t('hood')}</label><input id="ceHood" value="${esc(r.neighborhood || '')}">
      <label>${t('wtype')}</label><select id="ceType">${Object.keys(WASTE)
        .map((k) => `<option value="${k}">${WASTE[k].icon} ${esc(wasteName(k))}</option>`)
        .join('')}</select>
      <label>${t('date')}</label><input id="ceDate" type="date" value="${r.collection_date}">
      <label>${t('notes')}</label><textarea id="ceNotes" rows="2">${esc(r.notes || '')}</textarea>
      <button class="btn wide" id="ceSave">${t('save')}</button>`);
    $('#ceType').value = r.waste_type;
    $('#ceSave').onclick = async () => {
      const x = read('ce');
      if (!valid(x)) return;
      const { error } = await sb.from('collection_schedules').update(x).eq('id', r.id);
      if (error) return fail(error);
      closeModal();
      render();
    };
  };
  $('#calAdd').onclick = async () => {
    const x = read('cal');
    if (!valid(x)) return;
    const { error } = await sb.from('collection_schedules').insert(x);
    error ? fail(error) : (toast('OK'), render());
  };
  $('#calFind').oninput = draw;
  draw();
}

// ====================================================================
//  7c. NAVIGAZIONE · percorso guidato a schermo intero
// ====================================================================
let NAV = null; // sessione di navigazione attiva
const bearing = (a, b) => {
  const r = (x) => (x * Math.PI) / 180;
  const y = Math.sin(r(b[1] - a[1])) * Math.cos(r(b[0]));
  const x =
    Math.cos(r(a[0])) * Math.sin(r(b[0])) -
    Math.sin(r(a[0])) * Math.cos(r(b[0])) * Math.cos(r(b[1] - a[1]));
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
};
const fmtM = (m) =>
  m >= 1000 ? (m / 1000).toFixed(1) + ' km' : Math.max(5, Math.round(m / 5) * 5) + ' m';
const MODS = {
  it: {
    left: 'a sinistra',
    right: 'a destra',
    'slight left': 'leggermente a sinistra',
    'slight right': 'leggermente a destra',
    'sharp left': 'bruscamente a sinistra',
    'sharp right': 'bruscamente a destra',
    uturn: 'con inversione a U',
  },
  en: {
    left: 'left',
    right: 'right',
    'slight left': 'slightly left',
    'slight right': 'slightly right',
    'sharp left': 'sharp left',
    'sharp right': 'sharp right',
    uturn: 'and make a U-turn',
  },
};
const instr = (st) => {
  const it = lang === 'it',
    mt = st.maneuver.type,
    md = st.maneuver.modifier,
    on = st.name ? (it ? ` su ${st.name}` : ` onto ${st.name}`) : '';
  if (mt === 'arrive') return it ? 'Stai per arrivare' : 'Arriving';
  if (MODS[lang][md]) return `${it ? 'Svolta' : 'Turn'} ${MODS[lang][md]}${on}`;
  return `${it ? 'Prosegui dritto' : 'Continue straight'}${on}`;
};

function startNav(dest) {
  stopNav();
  const ov = document.createElement('div');
  ov.className = 'navov';
  ov.innerHTML = `<div id="navMap"></div>
    <div class="navhud"><span class="navarrow"><i id="navArrow">⬆</i></span><div><b id="navTxt">${t('locating')}</b><br><span class="mut" id="navSub"></span></div></div>
    <div class="navbar"><div><b id="navDist">--</b> <span class="mut" id="navEta"></span></div>
      <div class="row" style="flex-wrap:nowrap"><button class="btn sm ghost" id="navCenter">🎯</button><button class="btn red" id="navStop">⏹ ${t('stopNav')}</button></div></div>`;
  document.body.appendChild(ov);
  const nm = L.map('navMap', { zoomControl: false }).setView([dest.lat, dest.lon], 16);
  tiles().addTo(nm);
  setTimeout(() => nm.invalidateSize(), 50);
  const N = (NAV = {
    ov,
    map: nm,
    dest,
    pos: null,
    coords: [],
    steps: [],
    follow: true,
    lastRoute: 0,
    fetching: false,
    first: true,
  });
  L.marker([dest.lat, dest.lon], { icon: pin(dest.kind) }).addTo(nm);
  N.me = L.circleMarker([dest.lat, dest.lon], {
    radius: 10,
    color: '#fff',
    weight: 3,
    fillColor: '#2563EB',
    fillOpacity: 1,
  });
  nm.on('dragstart', () => (N.follow = false));
  $('#navStop').onclick = () => stopNav();
  $('#navCenter').onclick = () => {
    N.follow = true;
    if (N.pos) nm.setView(N.pos, Math.max(nm.getZoom(), 17));
  };
  try {
    const c = JSON.parse(localStorage.getItem('gs_pos')); // ultima posizione nota, in attesa del primo segnale GPS
    if (c?.lat) onNavPos([c.lat, c.lon]);
  } catch {}
  if (!navigator.geolocation) return toast(t('noGps'), true), stopNav();
  N.watch = navigator.geolocation.watchPosition(
    (p) => {
      const pos = [p.coords.latitude, p.coords.longitude];
      localStorage.setItem('gs_pos', JSON.stringify({ lat: pos[0], lon: pos[1] }));
      onNavPos(pos);
    },
    () => {
      if (NAV === N && !N.pos) toast(t('noGps'), true), stopNav();
    },
    { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 },
  );
}

async function fetchNavRoute(N) {
  N.fetching = true;
  N.lastRoute = Date.now();
  try {
    const r = await (
      await fetch(
        `https://router.project-osrm.org/route/v1/foot/${N.pos[1]},${N.pos[0]};${N.dest.lon},${N.dest.lat}?overview=full&geometries=geojson&steps=true`,
      )
    ).json();
    const rt = r.routes?.[0];
    if (NAV !== N || !rt) return;
    N.coords = rt.geometry.coordinates.map(([x, y]) => [y, x]);
    N.steps = rt.legs[0].steps.map((s) => {
      const loc = [s.maneuver.location[1], s.maneuver.location[0]];
      let vi = 0,
        bd = Infinity;
      N.coords.forEach((c, i) => {
        const d = km(loc, c);
        if (d < bd) (bd = d), (vi = i);
      });
      return { ...s, vi };
    });
    N.line?.remove();
    N.line = L.polyline(N.coords, { color: '#10B981', weight: 7, opacity: 0.9 }).addTo(N.map);
    if (N.first) {
      N.first = false;
      N.map.fitBounds(N.line.getBounds(), { padding: [60, 60] });
    }
  } catch (e) {
    console.warn('Percorso', e);
  } finally {
    N.fetching = false;
  }
  if (NAV === N) navProgress();
}

function onNavPos(pos) {
  const N = NAV;
  if (!N) return;
  N.pos = pos;
  N.me.setLatLng(pos);
  if (!N.map.hasLayer(N.me)) N.me.addTo(N.map);
  if (N.follow && !N.first) N.map.setView(pos, Math.max(N.map.getZoom(), 17), { animate: true });
  const stale = !N.coords.length || (N.off > 40 && Date.now() - N.lastRoute > 8000);
  if (stale && !N.fetching) fetchNavRoute(N);
  else navProgress();
}

function navProgress() {
  const N = NAV;
  if (!N || !N.pos || !N.coords.length) return;
  if (km(N.pos, [N.dest.lat, N.dest.lon]) * 1000 < 25) {
    toast(t('arrived'));
    return stopNav(); // arrivati: si elimina tutto e si spegne la direzione
  }
  let bi = 0,
    bd = Infinity;
  N.coords.forEach((c, i) => {
    const d = km(N.pos, c);
    if (d < bd) (bd = d), (bi = i);
  });
  N.off = bd * 1000; // metri di distanza dal percorso
  let rem = N.off;
  for (let i = bi; i < N.coords.length - 1; i++) rem += km(N.coords[i], N.coords[i + 1]) * 1000;
  const st = N.steps.find((s) => s.vi > bi) || N.steps[N.steps.length - 1];
  let toMan = N.off;
  for (let i = bi; i < Math.min(st.vi, N.coords.length - 1); i++)
    toMan += km(N.coords[i], N.coords[i + 1]) * 1000;
  let j = bi,
    acc = 0;
  while (j < N.coords.length - 1 && acc < 25) (acc += km(N.coords[j], N.coords[j + 1]) * 1000), j++;
  $('#navArrow').style.transform = `rotate(${Math.round(bearing(N.pos, N.coords[j]))}deg)`;
  $('#navTxt').textContent = `${t('inDist')} ${fmtM(toMan)} · ${instr(st)}`;
  $('#navSub').textContent = N.dest.name;
  $('#navDist').textContent = fmtM(rem);
  $('#navEta').textContent = `· ~${Math.max(1, Math.round(rem / 80))} min`;
}

function stopNav() {
  const N = NAV;
  if (!N) return;
  NAV = null;
  if (N.watch != null) navigator.geolocation.clearWatch(N.watch);
  N.map.remove();
  N.ov.remove();
}

// ====================================================================
//  8. PARTNERSHIP · richieste aziende
// ====================================================================
async function uploadLogo(file) {
  if (!file) return null;
  const path = `${crypto.randomUUID()}.${file.name.split('.').pop()}`;
  const { error } = await sb.storage.from('logos').upload(path, file);
  if (error) throw error;
  return sb.storage.from('logos').getPublicUrl(path).data.publicUrl;
}
async function viewPartnership(v) {
  await sb.rpc('purge_rejected');
  const { data: mine } = await sb
    .from('partnership_requests')
    .select('*')
    .eq('user_id', me.id)
    .order('num', { ascending: false });
  v.innerHTML = `<div class="card"><h2>${t('partnership')}</h2><p>${t('ptxt')}</p>
    <label>${t('cname')}</label><input id="pn"><label>${t('logo')}</label><input id="pl" type="file" accept="image/*">
    <label>${t('desc')}</label><textarea id="pdesc" rows="3"></textarea><label>${t('prods')}</label><textarea id="pd" rows="4"></textarea><label>${t('phone')}</label><input id="pp" type="tel">
    <button class="btn" id="pSend">${t('send')}</button></div>`;
  const mineOk = (mine || []).filter((r) => !expiredReq(r));
  if (mineOk.length)
    v.insertAdjacentHTML(
      'beforeend',
      `<div class="card"><h3>${t('myreq')}</h3><table>${mineOk.map((r) => `<tr><td><b>#${String(r.num).padStart(3, '0')}</b></td><td>${esc(r.company_name)}</td><td><span class="tag ${r.status}">${stat(r.status)}</span></td></tr>`).join('')}</table></div>`,
    );
  $('#pSend').onclick = async () => {
    try {
      if (!$('#pn').value.trim() || !$('#pdesc').value.trim())
        return toast(t('cname') + ' + ' + t('desc'), true);
      const logo_url = await uploadLogo($('#pl').files[0]);
      const { error } = await sb.from('partnership_requests').insert({
        company_name: $('#pn').value.trim(),
        logo_url,
        products_description: $('#pd').value,
        description: $('#pdesc').value.trim(),
        contact_phone: $('#pp').value,
      });
      if (error) throw error;
      toast(t('sent'));
      render();
    } catch (e) {
      fail(e);
    }
  };
}

// ====================================================================
//  9. PREMI · riscatto presso le aziende
// ====================================================================
async function viewRedeem(v) {
  const [{ data: ps }, { data: rw }, { data: tx }] = await Promise.all([
    sb.from('partners').select('*').order('created_at', { ascending: false }),
    sb.from('rewards').select('*').order('points_required'),
    sb
      .from('transactions')
      .select('*, partners(company_name), rewards(name)')
      .eq('user_id', me.id)
      .order('created_at', { ascending: false }),
  ]);
  const by = (id) => (rw || []).filter((r) => r.partner_id === id);
  v.innerHTML = `<div class="grid">${
    (ps || [])
      .map(
        (
          p,
        ) => `<div class="card co" data-p="${p.id}"><div class="row">${p.logo_url ? `<img class="logo" src="${esc(p.logo_url)}">` : ''}<h3 style="margin:0">${esc(p.company_name)}</h3></div>
      <p class="mut">${esc(p.description || p.products_description)}</p><span class="tag approved">🎁 ${by(p.id).length} ${t('rewardsN')}</span></div>`,
      )
      .join('') || `<p>${t('none')}</p>`
  }</div>
    <div class="card"><h3>${t('log')}</h3><table><tr><th>Token</th><th>Partner</th><th>${t('rewards')}</th><th></th></tr>${(tx || []).map((x) => `<tr><td><b>${esc(x.token)}</b></td><td>${esc(x.partners?.company_name)}</td><td>${esc(x.rewards?.name)}</td><td><span class="tag ${x.status}">${x.status}</span></td></tr>`).join('')}</table></div>`;
  v.querySelectorAll('[data-p]').forEach(
    (c) =>
      (c.onclick = () =>
        openCompany(
          ps.find((p) => p.id === c.dataset.p),
          by(c.dataset.p),
        )),
  );
}
function openCompany(p, list) {
  modal(`<div class="row">${p.logo_url ? `<img class="logo" src="${esc(p.logo_url)}">` : ''}<h2 style="margin:0">${esc(p.company_name)}</h2></div><p class="mut">${esc(p.description || p.products_description)}</p>
    ${list.map((r) => `<div class="pl"><span><b>${esc(r.name)}</b><br><span class="mut">${r.points_required} ${t('pts')}</span></span><button class="btn sm" data-r="${r.id}" ${(ST.balance ?? 0) < r.points_required ? 'disabled' : ''}>${t('redeemBtn')}</button></div>`).join('') || `<p class="mut">${t('noRewards')}</p>`}`);
  $('#modalBody')
    .querySelectorAll('[data-r]')
    .forEach(
      (b) =>
        (b.onclick = async () => {
          const { data, error } = await sb.rpc('redeem', { p_reward: b.dataset.r });
          if (error) return fail(error);
          modal(
            `<h2>Token</h2><div class="token">${esc(data)}</div><button class="btn wide" onclick="closeModal();render()">OK</button>`,
          );
        }),
    );
}

// ====================================================================
//  10. CLASSIFICA · top 10
// ====================================================================
let lbPeriod = 'monthly';
async function viewLeaderboard(v) {
  const { data, error } = await sb.rpc('leaderboard', { p_period: lbPeriod });
  if (error) throw error;
  const rows = data || [];
  const top = rows.filter((r) => r.rank_pos <= 10);
  const own = rows.find((r) => r.uid === me.id && r.rank_pos > 10);
  const rk = (n) => ['🥇', '🥈', '🥉'][n - 1] || n;
  const row = (
    r,
  ) => `<div class="lb ${r.rank_pos <= 3 ? 't' + r.rank_pos : ''} ${r.uid === me.id ? 'me' : ''}">
      <span class="rk">${rk(r.rank_pos)}</span>
      <span class="nm">${esc(r.uname)}${r.uid === me.id ? ` (${t('you')})` : ''}</span>
      <span class="mut">${r.bottles} ${t('bottles')} · ${r.bottles * 0.5} ${t('pts')}</span>
    </div>`;
  const periods = [
    ['monthly', 'lbMonth'],
    ['yearly', 'lbYear'],
    ['all', 'lbAll'],
  ];
  v.innerHTML = `<div class="hero"><h1>🏆 ${t('leaderboard')}</h1><p>Top 10</p></div>
    <div class="card">
      <div class="seg">${periods.map(([k, l]) => `<a data-lb="${k}" class="${lbPeriod === k ? 'on' : ''}">${t(l)}</a>`).join('')}</div>
      ${top.map(row).join('') || `<p class="mut">${t('none')}</p>`}
      ${own ? `<p class="mut" style="text-align:center;margin:4px 0">⋯</p>${row(own)}` : ''}
    </div>`;
  v.querySelectorAll('[data-lb]').forEach(
    (a) =>
      (a.onclick = () => {
        lbPeriod = a.dataset.lb;
        render();
      }),
  );
}

// ====================================================================
//  11. MEDAGLIE · collezione e buste ricompensa
// ====================================================================
const medal = (color, size = 96, locked = false) =>
  `<div class="medal ${color}${locked ? ' locked' : ''}" style="--s:${size}px"><i class="rib"></i><i class="rib b"></i><div class="disc"><div class="ring"><span>♻</span></div></div></div>`;
async function viewMedals(v) {
  const [{ data: cat }, { data: um }] = await Promise.all([
    sb.from('medals').select('*').order('type'),
    sb
      .from('user_medals')
      .select('*, medals(*)')
      .eq('user_id', me.id)
      .order('awarded_at', { ascending: false }),
  ]);
  const won = new Set((um || []).map((x) => x.medal_id));
  const cards = [
    ...(um || []).map((x) => ({ m: x.medals, a: x })),
    ...(cat || []).filter((m) => !won.has(m.id)).map((m) => ({ m, a: null })),
  ];
  const badge = ({ m, a }) =>
    !a
      ? `<span class="tag">🔒 ${t('locked')}</span>`
      : m.has_envelope && !a.envelope_opened
        ? `<button class="btn sm" data-env="${a.id}">✉️ ${t('openEnv')}</button>`
        : `<span class="tag approved">+${m.reward_points} ${t('pts')}</span>`;
  v.innerHTML = `<div class="hero"><h1>🏅 ${t('medals')}</h1><p>${t('medalCount')
    .replace('{x}', won.size)
    .replace('{y}', (cat || []).length)}</p></div>
    <div class="grid">${cards.map((c) => `<div class="card mcard">${medal(c.m.color, 96, !c.a)}<h3>${esc(c.m.name)}</h3><p class="mut">${esc(c.m.description)}</p>${badge(c)}<span class="mut">${c.a ? new Date(c.a.awarded_at).toLocaleDateString() : ''}</span></div>`).join('')}</div>`;
  v.querySelectorAll('[data-env]').forEach(
    (b) =>
      (b.onclick = () => {
        const a = um.find((x) => x.id === b.dataset.env);
        envelopeModal(a, a.medals);
      }),
  );
}
function envelopeModal(um, m) {
  modal(
    `<div class="envelope" id="env"><div class="half l"></div><div class="half r"></div><span class="ico">✉️</span><div class="prize"><b>+${m.reward_points}</b><span>${t('pts')}</span></div></div><button class="btn wide" id="tear">${t('openEnv')}</button>`,
  );
  $('#tear').onclick = async () => {
    $('#tear').disabled = true;
    const { error } = await sb.rpc('open_envelope', { p_id: um.id });
    if (error) {
      $('#tear').disabled = false;
      return fail(error);
    }
    $('#env').classList.add('open');
    setTimeout(
      () =>
        confetti({
          particleCount: 170,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#10B981', '#FDE68A', '#34D399', '#ffffff'],
        }),
      450,
    );
    $('#tear').textContent = 'OK';
    $('#tear').disabled = false;
    $('#tear').onclick = () => {
      closeModal();
      render();
    };
  };
}

// ====================================================================
//  12. AZIENDA · gestione premi e token
// ====================================================================
async function viewCompany(v) {
  const { data: acc, error } = await sb
    .from('partner_accounts')
    .select('partner_id, partners(company_name)')
    .eq('user_id', me.id)
    .maybeSingle();
  if (error) throw error;
  if (!acc) {
    v.innerHTML = `<div class="card"><p>${t('none')}</p></div>`;
    return;
  }
  const [{ data: rw }, { data: tx, error: e2 }] = await Promise.all([
    sb.from('rewards').select('*').eq('partner_id', acc.partner_id).order('points_required'),
    sb.rpc('company_transactions'),
  ]);
  if (e2) throw e2;
  v.innerHTML = `<div class="card"><h2>${esc(acc.partners.company_name)}</h2><details class="dd" open><summary>🎁 ${t('rewards')} ▾</summary>
    ${(rw || []).map((r) => `<div class="pl"><span><b>${esc(r.name)}</b> <span class="mut">· ${r.points_required} ${t('pts')}</span></span><button class="btn sm red" data-rd="${r.id}">✕</button></div>`).join('')}
    <div class="row" style="margin-top:16px"><input id="rn2" placeholder="${t('rname')}" style="flex:2"><input id="rp2" type="number" min="0.5" step="0.5" placeholder="${t('rpts')}" style="flex:1"></div><button class="btn" id="rAdd">${t('addReward')}</button></details></div>
    <div class="card"><h3>${t('mgmt')}</h3><table><tr><th>Token</th><th>User</th><th>${t('rewards')}</th><th></th></tr>${(
      tx || []
    )
      .map(
        (
          x,
        ) => `<tr><td><b>${esc(x.token)}</b></td><td>${esc(x.username)}</td><td>${esc(x.reward)}</td>
      <td>${x.status === 'generated' ? `<button class="btn sm" data-r="${x.id}">${t('markUsed')}</button>` : `<span class="tag redeemed">redeemed</span>`}</td></tr>`,
      )
      .join('')}</table></div>`;
  $('#rAdd').onclick = async () => {
    const name = $('#rn2').value.trim(),
      pts = +$('#rp2').value;
    if (!name || !(pts > 0)) return toast(t('rname') + ' / ' + t('rpts'), true);
    const { error } = await sb
      .from('rewards')
      .insert({ partner_id: acc.partner_id, name, points_required: pts });
    error ? fail(error) : render();
  };
  v.querySelectorAll('[data-rd]').forEach(
    (b) =>
      (b.onclick = async () => {
        const { error } = await sb.from('rewards').delete().eq('id', b.dataset.rd);
        error ? fail(error) : render();
      }),
  );
  v.querySelectorAll('[data-r]').forEach(
    (b) =>
      (b.onclick = async () => {
        await sb.rpc('mark_redeemed', { p_id: b.dataset.r });
        render();
      }),
  );
}

// ====================================================================
//  13. ADMIN · statistiche, richieste, partner, utenti, punti di raccolta
// ====================================================================
async function viewAdmin(v) {
  await sb.rpc('purge_rejected');
  const since = new Date(Date.now() - 14 * 864e5).toISOString();
  const [{ data: sc }, { data: tx }, { data: rq }, { data: us }, { data: ps }, { data: pa }] =
    await Promise.all([
      sb.from('scans').select('created_at').gte('created_at', since),
      sb.from('transactions').select('created_at').gte('created_at', since),
      sb.from('partnership_requests').select('*').order('created_at', { ascending: false }),
      sb.from('profiles').select('*').order('created_at', { ascending: false }),
      sb.from('partners').select('*'),
      sb.from('partner_accounts').select('partner_id, user_id'),
    ]);
  const { data: cps } = await sb
    .from('collection_points')
    .select('*, profiles(username)')
    .order('created_at', { ascending: false });
  const pend = (cps || []).filter((p) => !p.approved);
  const { data: places, error: placesErr } = await sb.from('places').select('*');
  const { data: sched } = await sb
    .from('collection_schedules')
    .select('*')
    .order('collection_date', { ascending: false })
    .limit(500);
  const days = [...Array(14)].map((_, i) =>
    new Date(Date.now() - (13 - i) * 864e5).toISOString().slice(0, 10),
  );
  const count = (a) =>
    days.map((d) => (a || []).filter((x) => x.created_at.slice(0, 10) === d).length);
  const free = (ps || []).filter((p) => !(pa || []).some((a) => a.partner_id === p.id));
  v.innerHTML = `<div class="grid"><div class="card"><h3>${t('gdaily')}</h3><canvas id="c1"></canvas></div><div class="card"><h3>${t('gtx')}</h3><canvas id="c2"></canvas></div></div>
    <div class="card"><h3>${t('req')}</h3><table>${(rq || [])
      .filter((r) => !expiredReq(r))
      .map(
        (
          r,
        ) => `<tr><td>${r.logo_url ? `<img class="logo" src="${esc(r.logo_url)}">` : ''}</td><td><b>${esc(r.company_name)}</b><br><span class="mut">${esc(r.products_description)} · ${esc(r.contact_phone)}</span></td>
      <td><span class="tag ${r.status}">${stat(r.status)}</span></td><td class="row">${r.status === 'pending' ? `<button class="btn sm" data-a="${r.id}">${t('approve')}</button><button class="btn sm red" data-x="${r.id}">${t('reject')}</button>` : ''}
      ${r.status === 'approved' ? (r.partner_id ? `<span class="tag approved">✓ ${t('created')}</span>` : `<button class="btn sm" data-c="${r.id}">${t('create')}</button><button class="btn sm red" data-dr="${r.id}">${t('delReq')}</button>`) : ''}</td></tr>`,
      )
      .join('')}</table></div>
    ${calAdminHTML(places || [], sched || [], !!placesErr)}
    <div class="card"><h3>${t('partnersT')}</h3><table>${(ps || []).map((p) => `<tr><td style="width:70px">${p.logo_url ? `<img class="logo" src="${esc(p.logo_url)}">` : ''}</td><td><b>${esc(p.company_name)}</b></td><td style="text-align:right"><button class="btn sm red" data-dp="${p.id}">${t('del')}</button></td></tr>`).join('') || `<tr><td class="mut">${t('none')}</td></tr>`}</table></div>
    <div class="card"><div class="row" style="justify-content:space-between"><h3>${t('users')}</h3><button class="btn sm" id="setco">${t('setco')}</button></div><input id="us" placeholder="${t('search')}"><table id="ut"></table></div>
    <div class="card"><h3>${t('cpoints')}</h3><p class="mut">${t('cpHelp')}</p><div id="amap" style="height:300px;border-radius:14px;margin-bottom:16px"></div>
    <div class="row"><input id="cn" placeholder="${t('cname')}" style="flex:2"><select id="ck" style="flex:1"><option value="machine">🤖 ${t('machine')}</option><option value="bin">🗑️ ${t('bin')}</option></select></div>
    <input id="ca" placeholder="Via / indirizzo"><button class="btn" id="cAdd">${t('add')}</button>
    <details class="dd" style="margin-top:20px"><summary>🗑️ ${t('manageSpots')} (${(cps || []).filter((p) => p.approved).length})</summary>
      ${
        (cps || [])
          .filter((p) => p.approved)
          .map(
            (p) => `<div class="pl"><span>${ICON[p.kind]} <b>${esc(p.name)}</b>${p.address ? `<br><span class="mut">${esc(p.address)}</span>` : ''}</span><button class="btn sm red" data-dsp="${p.id}">${t('del')}</button></div>`,
          )
          .join('') || `<p class="mut">${t('none')}</p>`
      }</details>
    <details class="dd" style="margin-top:20px"><summary>📥 ${t('spotReqs')} (${pend.length})</summary>
      ${
        pend
          .map(
            (p) => `<div class="pl" style="align-items:flex-start">
          <div class="row" style="flex-wrap:nowrap">${p.photo_url ? `<img src="${esc(p.photo_url)}" data-zoom="${esc(p.photo_url)}" style="width:84px;height:84px;object-fit:cover;border-radius:10px;cursor:zoom-in">` : ''}
            <span><b>${ICON[p.kind]} ${esc(p.name)}</b><br><span class="mut">${esc(p.profiles?.username || '')} · ${new Date(p.created_at).toLocaleDateString()}</span><br>
            <span class="tag ${p.ai_verdict === 'ok' ? 'approved' : ''}">${p.ai_verdict === 'ok' ? t('aiOk') : t('aiNo')}</span>${p.ai_note ? `<br><span class="mut">${esc(p.ai_note)}</span>` : ''}</span></div>
          <div class="row" style="flex-wrap:nowrap"><button class="btn sm" data-ok="${p.id}">${t('approve')}</button><button class="btn sm red" data-no="${p.id}">${t('reject')}</button></div></div>`,
          )
          .join('') || `<p class="mut">${t('none')}</p>`
      }</details></div>`;
  const mk = (id, data, type) =>
    charts.push(
      new Chart($(id), {
        type,
        data: {
          labels: days.map((d) => d.slice(5)),
          datasets: [{ data, backgroundColor: '#10B981', borderColor: '#10B981', label: '' }],
        },
        options: {
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
        },
      }),
    );
  mk('#c1', count(sc), 'bar');
  mk('#c2', count(tx), 'line');
  const upd = async (id, status) => {
    const { error } = await sb.from('partnership_requests').update({ status }).eq('id', id);
    error ? fail(error) : render();
  };
  v.querySelectorAll('[data-a]').forEach((b) => (b.onclick = () => upd(b.dataset.a, 'approved')));
  v.querySelectorAll('[data-x]').forEach((b) => (b.onclick = () => upd(b.dataset.x, 'rejected')));
  v.querySelectorAll('[data-dr]').forEach(
    (b) =>
      (b.onclick = async () => {
        if (!confirm(t('confirmDelReq'))) return;
        const { error } = await sb.from('partnership_requests').delete().eq('id', b.dataset.dr);
        error ? fail(error) : (toast('OK'), render());
      }),
  );
  v.querySelectorAll('[data-c]').forEach(
    (b) =>
      (b.onclick = () => {
        const r = rq.find((x) => x.id === b.dataset.c);
        modal(`<h2>${t('create')}</h2><label>${t('cname')}</label><input id="mn" value="${esc(r.company_name)}"><label>${t('desc')}</label><textarea id="mdesc" rows="3">${esc(r.description)}</textarea><label>${t('prods')}</label><textarea id="md" rows="3">${esc(r.products_description)}</textarea>
      <label>${t('logo')}</label><input id="ml" type="file" accept="image/*"><button class="btn" id="mS">${t('save')}</button>`);
        $('#mS').onclick = async () => {
          $('#mS').disabled = true;
          try {
            const logo_url = (await uploadLogo($('#ml').files[0])) || r.logo_url;
            const { data, error } = await sb
              .from('partners')
              .insert({
                company_name: $('#mn').value,
                logo_url,
                products_description: $('#md').value,
                description: $('#mdesc').value,
              })
              .select('id')
              .single();
            if (error) throw error;
            await sb.from('partnership_requests').update({ partner_id: data.id }).eq('id', r.id);
            if (error) throw error;
            closeModal();
            toast('OK');
            render();
          } catch (e) {
            fail(e);
            $('#mS').disabled = false;
          }
        };
      }),
  );
  const list = (q) => {
    const res = q.trim()
      ? (us || [])
          .filter((u) => u.username.toLowerCase().includes(q.trim().toLowerCase()))
          .slice(0, 8)
      : [];
    $('#ut').innerHTML = res
      .map(
        (u) =>
          `<tr><td>${esc(u.username)} <span class="tag">${u.role}</span></td><td class="row" style="justify-content:flex-end"><button class="btn sm ghost" data-z="${u.id}">${t('resetpts')}</button>${u.id !== me.id ? `<button class="btn sm red" data-x2="${u.id}">${t('delAcc')}</button>` : ''}</td></tr>`,
      )
      .join('');
    $('#ut')
      .querySelectorAll('[data-z]')
      .forEach(
        (b) =>
          (b.onclick = async () => {
            if (!confirm(t('confirmReset'))) return;
            const { error } = await sb.rpc('admin_reset_points', { p_user: b.dataset.z });
            error ? fail(error) : (toast(t('resetok')), render());
          }),
      );
    $('#ut')
      .querySelectorAll('[data-x2]')
      .forEach(
        (b) =>
          (b.onclick = async () => {
            if (!confirm(t('confirmDel'))) return;
            const { error } = await sb.rpc('admin_delete_user', { p_user: b.dataset.x2 });
            error ? fail(error) : (toast('OK'), render());
          }),
      );
  };
  $('#setco').onclick = () => {
    if (!free.length) return toast(t('none'), true);
    modal(`<h2>${t('setco')}</h2><label>${t('pickUser')}</label><input id="sq" list="ul" autocomplete="off"><datalist id="ul">${(
      us || []
    )
      .filter((u) => u.role === 'user')
      .map((u) => `<option value="${esc(u.username)}">`)
      .join('')}</datalist>
      <label>${t('pick')}</label><select id="sp">${free.map((p) => `<option value="${p.id}">${esc(p.company_name)}</option>`).join('')}</select><button class="btn wide" id="sS">${t('save')}</button>`);
    $('#sS').onclick = async () => {
      const u = (us || []).find(
        (x) =>
          x.role === 'user' && x.username.toLowerCase() === $('#sq').value.trim().toLowerCase(),
      );
      if (!u) return toast('Username?', true);
      const a = await sb
        .from('partner_accounts')
        .insert({ user_id: u.id, partner_id: $('#sp').value });
      if (a.error) return fail(a.error);
      const r = await sb.from('profiles').update({ role: 'azienda' }).eq('id', u.id);
      if (r.error) return fail(r.error);
      closeModal();
      render();
    };
  };
  const am = L.map('amap').setView([40.8518, 14.2681], 12);
  tiles().addTo(am);
  getPos().then((p) => p.located && am.setView([p.lat, p.lon], 14));
  let sel = null,
    selM = null;
  am.on('click', (e) => {
    sel = e.latlng;
    selM ? selM.setLatLng(sel) : (selM = L.marker(sel).addTo(am));
  });
  (cps || []).forEach((p) =>
    L.marker([p.lat, p.lon], { icon: pin(p.kind) })
      .addTo(am)
      .bindPopup(esc(p.name)),
  );
  $('#cAdd').onclick = async () => {
    if (!sel || !$('#cn').value.trim()) return toast(t('cpHelp'), true);
    const { error } = await sb.from('collection_points').insert({
      name: $('#cn').value.trim(),
      kind: $('#ck').value,
      address: $('#ca').value,
      lat: sel.lat,
      lon: sel.lng,
      approved: true,
    });
    error ? fail(error) : (toast('OK'), render());
  };
  calAdminInit(places || [], sched || [], !!placesErr);
  v.querySelectorAll('[data-dp]').forEach(
    (b) =>
      (b.onclick = async () => {
        if (!confirm(t('confirmDelP'))) return;
        const acc = (pa || []).find((a) => a.partner_id === b.dataset.dp);
        const { error } = await sb.from('partners').delete().eq('id', b.dataset.dp);
        if (error) return fail(error);
        if (acc) await sb.from('profiles').update({ role: 'user' }).eq('id', acc.user_id);
        render();
      }),
  );
  v.querySelectorAll('[data-ok]').forEach(
    (b) =>
      (b.onclick = async () => {
        const { error } = await sb
          .from('collection_points')
          .update({ approved: true })
          .eq('id', b.dataset.ok);
        error ? fail(error) : render();
      }),
  );
  v.querySelectorAll('[data-no]').forEach(
    (b) =>
      (b.onclick = async () => {
        const p = cps.find((x) => x.id === b.dataset.no);
        await removeSpotPhoto(p?.photo_url);
        const { error } = await sb.from('collection_points').delete().eq('id', b.dataset.no);
        error ? fail(error) : render();
      }),
  );
  v.querySelectorAll('[data-dsp]').forEach(
    (b) =>
      (b.onclick = async () => {
        if (!confirm(t('confirmDelSpot'))) return;
        const p = cps.find((x) => x.id === b.dataset.dsp);
        const { error } = await sb.from('collection_points').delete().eq('id', b.dataset.dsp);
        if (error) return fail(error);
        await removeSpotPhoto(p?.photo_url);
        toast('OK');
        render();
      }),
  );
  v.querySelectorAll('[data-zoom]').forEach(
    (im) =>
      (im.onclick = () =>
        modal(
          `<img src="${im.dataset.zoom}" style="width:100%;border-radius:12px;margin-bottom:12px"><button class="btn wide" onclick="closeModal()">OK</button>`,
        )),
  );
  list('');
  $('#us').oninput = (e) => list(e.target.value);
}

// ====================================================================
//  14. INSTALLAZIONE SU TELEFONO (PWA)
// ====================================================================
let dp = null;
addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  dp = e;
});
if (matchMedia('(display-mode: standalone)').matches || navigator.standalone)
  $('#inst').style.display = 'none';
$('#inst').onclick = async () => {
  if (dp) {
    dp.prompt();
    await dp.userChoice;
    dp = null;
    return;
  }
  const web = location.protocol.startsWith('http'),
    ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  modal(
    `<h2>📲 ${t('install')}</h2><p>${t(!web ? 'instLocal' : ios ? 'instIos' : 'instAnd')}</p><button class="btn wide" onclick="closeModal()">OK</button>`,
  );
};
if ('serviceWorker' in navigator && location.protocol.startsWith('http'))
  navigator.serviceWorker.register('sw.js').catch(() => {});

// ====================================================================
//  15. AVVIO
// ====================================================================
sb.auth.onAuthStateChange(() => {});
(async () => {
  const wait = new Promise((r) => setTimeout(r, 1800));
  await loadMe();
  await render();
  await wait;
  $('#splash').classList.add('out');
  setTimeout(() => $('#splash').remove(), 700);
})();
