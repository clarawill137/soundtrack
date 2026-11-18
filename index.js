// 🎵 Саундтрек — Apple Music под настроение сцены.
// Настроение последнего фрагмента определяет маленькая модель (профиль подключения) или словарь,
// а у каждого настроения свой плейлист. Два режима:
//  • MusicKit — когда рядом лежит token.json (его выпускает token.mjs ключом разработчика Apple):
//    музыка играет прямо в таверне и плейлист меняется сам.
//  • Ссылки — без токена: нота подсвечивается при смене настроения, тап открывает плейлист
//    в приложении «Музыка» или во встроенном плеере Apple.

const MODULE = 'soundtrack';
const VERSION = '0.1.0';
const TAG = '[Саундтрек]';
const META_KEY = 'soundtrack';
const MK_SRC = 'https://js-cdn.music.apple.com/musickit/v3/musickit.js';

const DEFAULT_MOODS = [
    { key: 'battle', icon: '⚔️', name: 'Бой', hint: 'драка, перестрелка, погоня, прямая схватка' },
    { key: 'tense', icon: '🫀', name: 'Напряжение', hint: 'опасность рядом, слежка, допрос, ожидание удара' },
    { key: 'dark', icon: '🌑', name: 'Мрак', hint: 'жуть, кошмар, насилие, безысходность' },
    { key: 'mystery', icon: '🕯️', name: 'Тайна', hint: 'загадка, расследование, что-то не сходится' },
    { key: 'epic', icon: '🏔️', name: 'Эпик', hint: 'большой момент, победа, размах' },
    { key: 'drive', icon: '⚡', name: 'Драйв', hint: 'азарт, веселье, движение, вечеринка' },
    { key: 'romance', icon: '🌹', name: 'Романтика', hint: 'нежность, близость, признания' },
    { key: 'passion', icon: '🔥', name: 'Страсть', hint: 'желание, откровенная сцена' },
    { key: 'cozy', icon: '☕', name: 'Уют', hint: 'дом, быт, тепло, спокойный разговор' },
    { key: 'calm', icon: '🌿', name: 'Покой', hint: 'тишина, отдых, ничего не происходит' },
    { key: 'sad', icon: '🌧️', name: 'Грусть', hint: 'горе, слёзы, потеря, одиночество' },
    { key: 'nostalgia', icon: '🍂', name: 'Меланхолия', hint: 'воспоминания, задумчивость, светлая печаль' },
    { key: 'hope', icon: '🌅', name: 'Надежда', hint: 'после бури, облегчение, новый шаг' },
];

// Словарь для режима «по словам»: начало слова (ё уже заменена на е).
const WORDS = {
    battle: ['бой', 'битв', 'драк', 'дерутся', 'дерется', 'удар', 'выстрел', 'стреля', 'атак', 'враг', 'кровь', 'кровью', 'крови', 'кровав', 'схватк', 'fight', 'battle', 'attack', 'gunfire', 'shoot', 'punch'],
    tense: ['напряж', 'тревог', 'опасн', 'угроз', 'слежк', 'засад', 'замер', 'затаи', 'риск', 'подозр', 'насторож', 'tense', 'danger', 'threat', 'ambush'],
    dark: ['тьма', 'тьме', 'тьму', 'мрак', 'мрачн', 'ужас', 'кошмар', 'жутк', 'страх', 'пытк', 'труп', 'мертв', 'смерт', 'dark', 'horror', 'nightmare', 'dread', 'corpse'],
    mystery: ['тайн', 'загадк', 'секрет', 'улик', 'расследов', 'шифр', 'странн', 'mystery', 'secret', 'clue', 'riddle'],
    epic: ['эпич', 'величеств', 'грандиоз', 'героич', 'побед', 'триумф', 'легендарн', 'epic', 'heroic', 'triumph', 'victory'],
    drive: ['весел', 'смех', 'смеял', 'смеет', 'хохот', 'танц', 'вечеринк', 'азарт', 'гонк', 'погон', 'бегом', 'laugh', 'dance', 'party', 'chase'],
    romance: ['любл', 'любов', 'любим', 'нежн', 'поцел', 'обнял', 'обнима', 'объят', 'ласк', 'love', 'kiss', 'tender', 'embrace', 'darling'],
    passion: ['страст', 'желани', 'возбужд', 'стон', 'жар', 'горяч', 'обнажен', 'desire', 'moan', 'naked', 'lust'],
    cozy: ['уют', 'тепл', 'плед', 'чай', 'кофе', 'кухн', 'завтрак', 'ужин', 'диван', 'домашн', 'cozy', 'warm', 'blanket', 'coffee', 'breakfast'],
    calm: ['спокой', 'тихо', 'тишин', 'покой', 'безмятеж', 'умиротвор', 'отдых', 'сонн', 'дремал', 'calm', 'quiet', 'peace', 'serene'],
    sad: ['груст', 'печал', 'слез', 'плака', 'плач', 'рыда', 'тоск', 'одинок', 'горев', 'скорб', 'потер', 'больно', 'sad', 'tears', 'cry', 'grief', 'lonely', 'sorrow'],
    nostalgia: ['меланхол', 'задумч', 'ностальг', 'воспомин', 'вспомн', 'вспомин', 'прошл', 'melanchol', 'nostalg', 'memor', 'wistful', 'remember'],
    hope: ['надежд', 'надея', 'облегч', 'рассвет', 'улыбнул', 'выдохнул', 'hope', 'relief', 'dawn', 'smile'],
};

const DEFAULTS = {
    enabled: true,
    auto: true,          // подбирать настроение после каждого поста
    detect: 'model',     // model — профиль подключения, words — словарь
    profile: '',
    effort: 'low',
    tokens: 2000,
    timeoutSec: 60,
    ctxMsgs: 3,
    ctxChars: 3500,
    note: '',
    shuffle: true,
    volume: 70,
    pill: true,
    pillPos: null,       // {x, y} — доли экрана, если ноту перетаскивали
    embed: true,         // встроенный плеер Apple в режиме ссылок
    moods: null,
};

const ctx = () => SillyTavern.getContext();
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const msgOf = (e) => String(e?.message || e?.errorCode || e?.name || e || 'ошибка').slice(0, 140);
const IOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

function toast(kind, msg, opts = {}) {
    try { window.toastr?.[kind]?.(msg, '🎵 Саундтрек', { timeOut: 3500, ...opts }); } catch { /* */ }
}

function settings() {
    const ext = ctx().extensionSettings;
    if (!ext[MODULE] || typeof ext[MODULE] !== 'object') ext[MODULE] = {};
    const s = ext[MODULE];
    for (const [k, v] of Object.entries(DEFAULTS)) if (s[k] === undefined) s[k] = v;
    if (!Array.isArray(s.moods)) s.moods = DEFAULT_MOODS.map(m => ({ ...m, pl: null }));
    return s;
}
const save = () => { try { ctx().saveSettingsDebounced(); } catch { /* */ } };

const moods = () => settings().moods;
const moodBy = (key) => moods().find(m => m.key === key) || null;
const ready = () => moods().filter(m => m.pl?.id);
const label = (m) => (m ? `${m.icon ? `${m.icon} ` : ''}${m.name || m.key}` : '');

// ───────────── состояние ─────────────

const st = {
    engine: 'link',      // kit — MusicKit готов; link — режим ссылок
    token: '', tokenExp: 0, kitErr: '',
    mk: null,
    mood: null,          // ключ текущего настроения
    queued: null,        // чьё настроение сейчас стоит в очереди MusicKit
    live: false,         // музыку включили и не ставили на паузу
    loading: false, needTap: false, seq: 0,
    analyzing: false, again: false, lastFp: '', detectErr: '',
    now: null, err: '',
    lib: null,           // плейлисты медиатеки
    openMood: null,      // какое настроение раскрыто в настройках
};

// ───────────── текст сцены ─────────────

const BLOCK_TAGS = 'think|thinking|details|art|diary|matrix|preg|compass|horae|horaeevent|hud|tracker|style|script|summary';

/** Пост без плашек, тегов и картинок. */
function plain(mes) {
    let t = String(mes || '');
    t = t.replace(new RegExp(`<(${BLOCK_TAGS})\\b[\\s\\S]*?<\\/\\1>`, 'gi'), '\n');
    t = t.replace(/<div\b[^>]*data-gc[\s\S]*?<\/div>/gi, '\n');
    t = t.replace(/<!--[\s\S]*?-->/g, '');
    t = t.replace(/<img\b[^>]*>/gi, '');
    t = t.replace(/<[^>]+>/g, '');
    return t.replace(/\n{3,}/g, '\n\n').trim();
}

const usable = (m) => !!m && !m.is_system && m.extra?.type !== 'comment';

function lastAi() {
    const a = ctx().chat || [];
    for (let i = a.length - 1; i >= 0; i--) if (usable(a[i]) && !a[i].is_user) return { i, m: a[i] };
    return null;
}

function fingerprint() {
    const c = ctx();
    const last = lastAi();
    if (!last || String(last.m.mes || '').length < 40) return '';
    return `${c.chatId || c.getCurrentChatId?.() || ''}|${last.i}|${last.m.send_date || ''}|${last.m.swipe_id ?? 0}|${String(last.m.mes).length}`;
}

function recentText() {
    const s = settings();
    const a = ctx().chat || [];
    const want = Math.max(1, Number(s.ctxMsgs) || 3);
    const out = [];
    for (let i = a.length - 1; i >= 0 && out.length < want; i--) {
        if (!usable(a[i])) continue;
        const t = plain(a[i].mes);
        if (t.length > 20) out.unshift(t);
    }
    const all = out.join('\n\n');
    const max = Math.max(500, Number(s.ctxChars) || 3500);
    return all.length > max ? `…${all.slice(-max)}` : all;
}

/** Только последний пост — словарю хватает его: старые посты иначе перевешивают новую сцену. */
function lastText() {
    const a = ctx().chat || [];
    for (let i = a.length - 1; i >= 0; i--) {
        if (!usable(a[i])) continue;
        const t = plain(a[i].mes);
        if (t.length > 20) return t;
    }
    return '';
}

// ───────────── настроение: модель ─────────────

function profiles() { return ctx().extensionSettings?.connectionManager?.profiles || []; }
function pickProfile() {
    const s = settings();
    const list = profiles();
    let p = list.find(x => x.name === s.profile) || list.find(x => x.id === s.profile);
    if (!p && !s.profile) {
        p = list.find(x => /carbon|карбон/i.test(x.name || '')) || list.find(x => /argon|аргон/i.test(x.name || ''));
        if (p) { s.profile = p.name; save(); }
    }
    return p || null;
}

async function ask(messages) {
    const c = ctx();
    const s = settings();
    if (!c.ConnectionManagerRequestService?.sendRequest) throw new Error('в таверне нет Connection Manager');
    const p = pickProfile();
    if (!p) throw new Error('не выбран профиль модели');
    const override = s.effort ? { reasoning_effort: s.effort } : {};
    const r = await Promise.race([
        c.ConnectionManagerRequestService.sendRequest(p.id, messages, Number(s.tokens) || 2000, { stream: false, extractData: true, includePreset: false, includeInstruct: false }, override),
        new Promise((_, rej) => setTimeout(() => rej(new Error('модель не ответила вовремя')), (Number(s.timeoutSec) || 60) * 1000)),
    ]);
    const text = typeof r === 'string' ? r : (r?.content ?? r?.choices?.[0]?.message?.content ?? '');
    if (!String(text).trim()) throw new Error('пустой ответ (возможно, фильтр модели)');
    return String(text);
}

function sysPrompt(list, cur) {
    const s = settings();
    return `Ты — музыкальный редактор ролевой истории. Прочитай последний фрагмент сцены и реши, какая музыка должна звучать прямо сейчас.

Доступные настроения (ключ — название: когда включать):
${list.map(m => `- ${m.key} — ${m.name}${m.hint ? `: ${m.hint}` : ''}`).join('\n')}

Сейчас играет: ${cur ? `${cur.key} (${cur.name})` : 'ничего'}.

Правила:
- Суди по тому, чем фрагмент заканчивается и куда идёт сцена, а не по отдельным словам.
- Музыку меняй, только если настроение сцены действительно сменилось. Если оно то же или перемена мелкая — верни ключ того, что играет сейчас.
- Если ни одно настроение из списка не подходит — верни "keep".${s.note?.trim() ? `\n\nДополнительно от игрока:\n${s.note.trim()}` : ''}

Ответ — только JSON, без пояснений и без markdown: {"mood":"ключ"}`;
}

/** Ответ модели → ключ настроения из списка или null («оставить как есть»). */
function parseMood(text, list) {
    const raw = String(text ?? '').replace(/```(?:json)?/gi, '');
    let key = '';
    const a = raw.indexOf('{'), b = raw.lastIndexOf('}');
    if (a >= 0 && b > a) { try { key = String(JSON.parse(raw.slice(a, b + 1)).mood ?? ''); } catch { /* */ } }
    if (!key) { const m = raw.match(/"mood"\s*:\s*"([^"]+)"/i); key = m ? m[1] : raw; }
    key = key.trim().replace(/^["'«]+|["'».]+$/g, '').toLowerCase();
    if (!key || key === 'keep') return null;
    const hit = list.find(m => m.key.toLowerCase() === key) || list.find(m => String(m.name).toLowerCase() === key);
    return hit ? hit.key : null;
}

// ───────────── настроение: словарь ─────────────

function stemsOf(m) {
    if (WORDS[m.key]) return WORDS[m.key];
    return `${m.name || ''}, ${m.hint || ''}`.toLowerCase().replace(/ё/g, 'е').split(/[^a-zа-я]+/).filter(w => w.length >= 4).map(w => (w.length > 6 ? w.slice(0, -2) : w));
}

/** Сколько слов текста начинается с корней настроения. Меняем только при явном перевесе. */
function byWords(text, list, curKey) {
    const words = String(text || '').toLowerCase().replace(/ё/g, 'е').split(/[^a-zа-я]+/).filter(w => w.length > 2);
    const score = {};
    for (const m of list) {
        const stems = stemsOf(m);
        let n = 0;
        for (const w of words) if (stems.some(sm => w.startsWith(sm))) n++;
        score[m.key] = n;
    }
    let best = null;
    for (const m of list) if (!best || score[m.key] > score[best]) best = m.key;
    if (!best || score[best] < 2) return null;
    if (curKey && curKey !== best && score[curKey] !== undefined && score[best] < score[curKey] + 2) return null;
    return best;
}

// ───────────── разбор сцены ─────────────

let timer = 0, waited = 0;
const generating = () => document.body?.dataset?.generating === 'true';

function schedule(ms = 2500) {
    clearTimeout(timer);
    timer = setTimeout(() => {
        // в группе персонажи пишут по очереди — ждём, пока допишут все (но не дольше трёх минут)
        if (generating() && waited < 180000) { waited += 3000; schedule(3000); return; }
        waited = 0;
        analyze().catch(e => console.warn(TAG, e));
    }, ms);
}

async function analyze({ manual = false } = {}) {
    const s = settings();
    if (!s.enabled || (!manual && !s.auto)) return;
    const list = ready();
    if (!list.length) { if (manual) toast('info', 'Сначала задай плейлисты: Расширения → 🎵 Саундтрек'); return; }
    if (st.analyzing) { st.again = true; return; }
    const fp = fingerprint();
    if (!manual && (!fp || fp === st.lastFp)) return;
    const text = recentText();
    if (!text) { if (manual) toast('info', 'В чате пока нечего слушать'); return; }
    st.analyzing = true;
    renderPill();
    let key = null;
    try {
        const cur = moodBy(st.mood);
        if (s.detect === 'model') {
            try {
                key = parseMood(await ask([{ role: 'system', content: sysPrompt(list, cur?.pl?.id ? cur : null) }, { role: 'user', content: text }]), list);
                st.detectErr = '';
            } catch (e) {
                console.warn(TAG, 'модель:', e);
                const first = !st.detectErr;
                st.detectErr = msgOf(e);
                key = byWords(lastText(), list, st.mood);
                if (manual || first) toast('warning', `Модель не определила настроение (${st.detectErr}) — считаю по словам`);
            }
        } else {
            key = byWords(lastText(), list, st.mood);
        }
        if (fp) st.lastFp = fp;
    } finally {
        st.analyzing = false;
    }
    if (key && key !== st.mood) await switchMood(key, { auto: !manual });
    else if (manual) toast('info', key ? `Всё то же: ${label(moodBy(key))}` : 'Сцена не просит другой музыки');
    renderAll();
    if (st.again) { st.again = false; schedule(); }
}

// ───────────── ссылки Apple Music ─────────────

const isLibId = (id) => /^[pli]\./.test(String(id || ''));

/** Ссылка на плейлист или альбом Apple Music → { id, kind, name, url, sf }. */
function parseAppleUrl(raw) {
    let u;
    try { u = new URL(String(raw || '').trim()); } catch { return null; }
    if (!/^((embed|geo)\.)?music\.apple\.com$/i.test(u.hostname)) return null;
    const parts = u.pathname.split('/').filter(Boolean);
    const ki = parts.findIndex(p => p === 'playlist' || p === 'album');
    if (ki < 0 || ki === parts.length - 1) return null;
    const kind = parts[ki];
    const id = parts[parts.length - 1];
    if (kind === 'playlist' && !/^(pl\.[\w-]+|p\.[\w-]+)$/.test(id)) return null;
    if (kind === 'album' && !/^(\d+|l\.[\w-]+)$/.test(id)) return null;
    let slug = '';
    if (parts.length - ki > 2) { try { slug = decodeURIComponent(parts[ki + 1]).replace(/-/g, ' ').trim(); } catch { /* */ } }
    const sf = /^[a-z]{2}$/i.test(parts[0]) ? parts[0].toLowerCase() : '';
    const name = slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : (kind === 'album' ? 'Альбом' : 'Плейлист');
    return { id, kind, name, sf, url: `https://music.apple.com${u.pathname}` };
}

function openUrl(pl) {
    if (!pl?.id) return '';
    if (pl.url) return pl.url;
    if (isLibId(pl.id)) return `https://music.apple.com/library/${pl.kind || 'playlist'}/${pl.id}`;
    return `https://music.apple.com/${pl.sf || 'us'}/${pl.kind || 'playlist'}/${pl.id}`;
}

/** Встроенный плеер Apple умеет только каталог и общие плейлисты — личная медиатека в него не грузится. */
function embedUrl(pl) {
    if (!pl?.id || isLibId(pl.id)) return '';
    return openUrl(pl).replace('://music.apple.com', '://embed.music.apple.com');
}

// ───────────── MusicKit ─────────────

function jwtExp(token) {
    try {
        const p = String(token).split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        return Number(JSON.parse(atob(p + '='.repeat((4 - (p.length % 4)) % 4))).exp) || 0;
    } catch { return 0; }
}

async function loadToken() {
    try {
        const r = await fetch(`${new URL('token.json', import.meta.url).href}?t=${Date.now()}`, { cache: 'no-store' });
        if (!r.ok) return '';
        const j = await r.json();
        return typeof j?.token === 'string' ? j.token.trim() : '';
    } catch { return ''; }
}

let kitP = null;
function loadKit() {
    if (kitP) return kitP;
    kitP = (async () => {
        if (!window.MusicKit) {
            await new Promise((res, rej) => {
                const t = setTimeout(() => rej(new Error('MusicKit не загрузился')), 25000);
                const ok = () => { clearTimeout(t); res(); };
                document.addEventListener('musickitloaded', ok, { once: true });
                const el = document.createElement('script');
                el.src = MK_SRC;
                el.async = true;
                el.onload = () => { if (window.MusicKit) ok(); };
                el.onerror = () => { clearTimeout(t); rej(new Error('MusicKit не загрузился')); };
                document.head.appendChild(el);
            });
        }
        const MK = window.MusicKit;
        await MK.configure({ developerToken: st.token, app: { name: 'Soundtrack', build: VERSION } });
        const mk = MK.getInstance();
        const E = MK.Events || {};
        const on = (name, fn) => { try { mk.addEventListener(E[name] || name, fn); } catch (e) { console.warn(TAG, name, e); } };
        on('playbackStateDidChange', () => renderAll());
        on('nowPlayingItemDidChange', () => { syncNow(); renderAll(); });
        on('authorizationStatusDidChange', () => { st.lib = null; renderAll(); renderSettings(); });
        on('mediaPlaybackError', (e) => { console.warn(TAG, 'ошибка воспроизведения', e); });
        return mk;
    })();
    kitP.catch(() => { kitP = null; });
    return kitP;
}

const psName = () => {
    const mk = st.mk, PS = window.MusicKit?.PlaybackStates;
    if (!mk || !PS) return '';
    const v = mk.playbackState;
    return typeof v === 'string' ? v : (typeof PS[v] === 'string' ? PS[v] : Object.keys(PS).find(k => PS[k] === v) || '');
};
const isPlayingNow = () => !!st.mk && (st.mk.isPlaying === true || psName() === 'playing');
const isBusyNow = () => ['loading', 'waiting', 'stalled', 'seeking'].includes(psName());
const authed = () => !!st.mk?.isAuthorized;

function queueLen() {
    const q = st.mk?.queue;
    if (!q) return 0;
    if (Array.isArray(q.items)) return q.items.length;
    return Number(q.length) || (q.isEmpty === false ? 1 : 0);
}

function syncNow() {
    const it = st.mk?.nowPlayingItem;
    if (!it) { st.now = null; return; }
    const a = it.attributes || {};
    let art = '';
    try {
        const aw = a.artwork || it.artwork;
        if (aw?.url) art = String(aw.url).replace('{w}', '160').replace('{h}', '160').replace('{f}', 'jpg').replace('{c}', 'bb');
        else if (typeof it.artworkURL === 'string') art = it.artworkURL;
    } catch { /* */ }
    st.now = { title: it.title || a.name || '', artist: it.artistName || a.artistName || '', art };
}

const targetVol = () => Math.max(0, Math.min(1, (Number(settings().volume) || 0) / 100));
function setVol(v) { try { if (st.mk) st.mk.volume = Math.max(0, Math.min(1, v)); } catch { /* */ } }

let fadeT = 0;
/** На айфоне громкость из кода не меняется (только кнопками телефона), поэтому там без затухания. */
function fadeTo(to, ms) {
    return new Promise((res) => {
        clearInterval(fadeT);
        if (IOS || !st.mk) return res();
        const from = Number(st.mk.volume) || 0;
        const steps = 14;
        let k = 0;
        fadeT = setInterval(() => {
            k++;
            setVol(from + (to - from) * k / steps);
            if (k >= steps) { clearInterval(fadeT); res(); }
        }, ms / steps);
    });
}

function applyModes() {
    const mk = st.mk, MK = window.MusicKit;
    try { mk.shuffleMode = settings().shuffle ? (MK.PlayerShuffleMode?.songs ?? 1) : (MK.PlayerShuffleMode?.off ?? 0); } catch { /* */ }
    try { mk.repeatMode = MK.PlayerRepeatMode?.all ?? 2; } catch { /* */ }
}

async function trackIds(pl) {
    const mk = st.mk;
    const type = pl.kind === 'album' ? 'albums' : 'playlists';
    const sf = mk.storefrontId || mk.storefrontCountryCode || pl.sf || 'us';
    let path = isLibId(pl.id) ? `/v1/me/library/${type}/${pl.id}/tracks` : `/v1/catalog/${sf}/${type}/${pl.id}/tracks`;
    const ids = [];
    for (let page = 0; page < 3 && path; page++) {
        const r = await mk.api.music(path, page === 0 ? { limit: 100 } : undefined);
        const d = r?.data || {};
        for (const x of d.data || []) {
            const pp = x.attributes?.playParams || {};
            const id = pp.catalogId || pp.id || x.id;
            if (id) ids.push(String(id));
        }
        path = d.next || null;
    }
    return ids;
}

async function setQueueFor(pl) {
    const mk = st.mk;
    const desc = pl.kind === 'album' ? { album: pl.id } : { playlist: pl.id };
    try {
        await mk.setQueue({ ...desc, startPlaying: false });
        if (queueLen() > 0) return;
        throw new Error('в плейлисте нет треков, которые можно включить');
    } catch (e) {
        // запасной путь: взять треки запросом и поставить их очередью песен
        let ids = [];
        try { ids = await trackIds(pl); } catch (e2) { console.warn(TAG, 'треки:', e2); }
        if (!ids.length) throw e;
        await mk.setQueue({ songs: ids, startPlaying: false });
    }
}

/** Тихо поставить плейлист в очередь, не включая: тогда первый же тап по ▶ даёт звук сразу, без ожидания сети. */
let prep = Promise.resolve();
function kitPrepare(m) {
    if (st.engine !== 'kit' || !authed() || !m?.pl?.id || st.live) return prep;
    const seq = ++st.seq;
    prep = prep.then(async () => {
        if (seq !== st.seq) return;
        try {
            applyModes();
            await setQueueFor(m.pl);
            if (seq === st.seq) st.queued = m.key;
        } catch (e) { console.warn(TAG, 'очередь:', e); }
        if (seq === st.seq) st.loading = false;
        renderAll();
    });
    return prep;
}

/** Поставить плейлист настроения и включить. Если звук не стартовал (айфону нужен тап) — ждём тап по ноте. */
async function kitStart(m, { auto = false } = {}) {
    const mk = st.mk, s = settings();
    const seq = ++st.seq;
    st.loading = true;
    st.err = '';
    renderAll();
    const fade = !IOS && isPlayingNow();
    try {
        await prep;   // не наперегонки с тихой подготовкой очереди
        if (seq !== st.seq) return;
        if (fade) await fadeTo(0, 600);
        if (seq !== st.seq) return;
        applyModes();
        await setQueueFor(m.pl);
        if (seq !== st.seq) return;
        st.queued = m.key;
        setVol(fade ? 0 : targetVol());
        const n = queueLen();
        if (s.shuffle && n > 1 && typeof mk.changeToMediaAtIndex === 'function') await mk.changeToMediaAtIndex(Math.floor(Math.random() * n));
        else await mk.play();
        if (seq !== st.seq) return;
        st.live = true;
        st.needTap = false;
        if (fade) fadeTo(targetVol(), 900);
        setTimeout(() => {
            if (seq === st.seq && st.live && !isPlayingNow() && !isBusyNow()) { st.needTap = true; renderAll(); }
        }, 6000);
    } catch (e) {
        console.warn(TAG, 'не включилось:', e);
        if (seq !== st.seq) return;
        setVol(targetVol());
        st.err = msgOf(e);
        st.needTap = true;
        if (!auto) toast('warning', st.queued === m.key ? 'Нажми «играть» ещё раз — телефону нужен тап для звука' : `Не включилось: ${st.err}`);
    } finally {
        if (seq === st.seq) { st.loading = false; renderAll(); }
    }
}

async function signIn() {
    if (!st.mk) return;
    try { await st.mk.authorize(); toast('success', 'Apple Music подключён'); }
    catch (e) { console.warn(TAG, 'вход:', e); toast('error', `Вход не удался: ${msgOf(e)}`); }
    renderAll();
    renderSettings();
}

async function signOut() {
    try { await st.mk?.stop?.(); } catch { /* */ }
    try { await st.mk?.unauthorize(); } catch { /* */ }
    st.live = false; st.queued = null; st.lib = null; st.now = null;
    renderAll();
    renderSettings();
}

/** Кнопка ▶/⏸ — всегда из тапа. */
async function togglePlay() {
    if (st.engine !== 'kit') { openSheet(); return; }
    const mk = st.mk;
    if (!authed()) { await signIn(); if (!authed()) return; }
    const m = moodBy(st.mood);
    if (!m?.pl?.id) { toast('info', 'Выбери настроение'); openSheet(); return; }
    if (st.queued !== st.mood || queueLen() === 0) { await kitStart(m); return; }
    if (isPlayingNow() && !st.needTap) {
        st.live = false;
        try { await mk.pause(); } catch { /* */ }
    } else {
        try { await mk.play(); st.live = true; st.needTap = false; st.err = ''; }
        catch (e) { st.err = msgOf(e); st.needTap = true; toast('warning', `Не включилось: ${st.err}`); }
    }
    renderAll();
}

async function skip(dir) {
    if (st.engine !== 'kit' || !st.mk) return;
    try { await (dir < 0 ? st.mk.skipToPreviousItem() : st.mk.skipToNextItem()); } catch (e) { console.warn(TAG, e); }
}

async function stopAll() {
    st.live = false;
    st.needTap = false;
    st.seq++;
    st.loading = false;
    try { await st.mk?.pause?.(); } catch { /* */ }
    renderAll();
}

/** Смена настроения. auto — пришло от разбора сцены, а не от тапа. */
async function switchMood(key, { auto = false } = {}) {
    const m = moodBy(key);
    if (!m) return;
    if (!m.pl?.id) { if (!auto) toast('info', `У «${m.name}» нет плейлиста: Расширения → 🎵 Саундтрек`); return; }
    st.mood = key;
    try { const md = ctx().chatMetadata; if (md) { md[META_KEY] = { mood: key }; ctx().saveMetadataDebounced?.(); } } catch { /* */ }
    if (st.engine === 'kit' && authed()) {
        // сами включаем только если музыка уже идёт; с паузы — запоминаем настроение и тихо готовим очередь
        if (auto && !st.live) { renderAll(); kitPrepare(m); return; }
        await kitStart(m, { auto });
    } else {
        st.needTap = auto || !sheetOpen();
        renderAll();
    }
}

async function libraryPlaylists() {
    if (st.lib) return st.lib;
    const out = [];
    let path = '/v1/me/library/playlists';
    for (let page = 0; page < 6 && path; page++) {
        const r = await st.mk.api.music(path, page === 0 ? { limit: 100 } : undefined);
        const d = r?.data || {};
        for (const x of d.data || []) out.push({ id: x.id, kind: 'playlist', name: x.attributes?.name || x.id });
        path = d.next || null;
    }
    out.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
    st.lib = out;
    return out;
}

async function boot() {
    const s = settings();
    st.token = await loadToken();
    st.tokenExp = st.token ? jwtExp(st.token) : 0;
    st.kitErr = '';
    const fresh = st.token && (!st.tokenExp || st.tokenExp * 1000 > Date.now());
    if (st.token && !fresh) st.kitErr = 'токен разработчика истёк — перевыпусти его (token.mjs)';
    if (fresh && s.enabled) {
        try {
            st.mk = await loadKit();
            st.engine = 'kit';
            syncNow();
            const left = st.tokenExp ? Math.floor((st.tokenExp * 1000 - Date.now()) / 86400000) : 999;
            if (left <= 14) toast('warning', `Токен Apple Music истекает через ${left} дн. — перевыпусти его (token.mjs)`, { timeOut: 8000 });
            kitPrepare(moodBy(st.mood));
        } catch (e) {
            console.warn(TAG, 'MusicKit:', e);
            st.kitErr = msgOf(e);
            st.engine = 'link';
        }
    } else {
        st.engine = 'link';
    }
    renderAll();
    renderSettings();
}

// ───────────── нота ─────────────

function pillState() {
    if (st.loading || st.analyzing) return 'load';
    if (st.engine === 'kit') {
        if (isPlayingNow()) return 'play';
        if (st.needTap) return 'tap';
        return 'idle';
    }
    return st.needTap ? 'tap' : 'idle';
}

function placePill(el) {
    const p = settings().pillPos;
    if (p && Number.isFinite(p.x) && Number.isFinite(p.y)) {
        const x = Math.max(4, Math.min(window.innerWidth - 48, p.x * window.innerWidth - 22));
        const y = Math.max(4, Math.min(window.innerHeight - 48, p.y * window.innerHeight - 22));
        el.style.left = `${x}px`; el.style.top = `${y}px`; el.style.right = 'auto'; el.style.bottom = 'auto';
    } else {
        el.style.left = ''; el.style.top = ''; el.style.right = ''; el.style.bottom = '';
    }
}

function mountPill() {
    if (document.getElementById('snd_pill')) return;
    const el = document.createElement('div');
    el.id = 'snd_pill';
    el.className = 'snd-pill';
    el.innerHTML = '<span class="snd-pill-ico">🎵</span><span class="snd-pill-eq"><i></i><i></i><i></i></span><span class="snd-pill-dot"></span>';
    document.body.appendChild(el);
    placePill(el);
    let drag = null;
    el.addEventListener('pointerdown', (ev) => {
        drag = { x: ev.clientX, y: ev.clientY, moved: false, r: el.getBoundingClientRect() };
        try { el.setPointerCapture(ev.pointerId); } catch { /* */ }
    });
    el.addEventListener('pointermove', (ev) => {
        if (!drag) return;
        const dx = ev.clientX - drag.x, dy = ev.clientY - drag.y;
        if (!drag.moved && Math.hypot(dx, dy) < 8) return;
        drag.moved = true;
        const x = Math.max(4, Math.min(window.innerWidth - drag.r.width - 4, drag.r.left + dx));
        const y = Math.max(4, Math.min(window.innerHeight - drag.r.height - 4, drag.r.top + dy));
        el.style.left = `${x}px`; el.style.top = `${y}px`; el.style.right = 'auto'; el.style.bottom = 'auto';
    });
    let draggedAt = 0;
    const end = (ev) => {
        if (!drag) return;
        const d = drag;
        drag = null;
        try { el.releasePointerCapture(ev.pointerId); } catch { /* */ }
        if (!d.moved) return;
        draggedAt = Date.now();
        const r = el.getBoundingClientRect();
        settings().pillPos = { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight };
        save();
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    // сам тап — по click: Safari считает его настоящим жестом и разрешает звук
    el.addEventListener('click', () => { if (Date.now() - draggedAt > 400) onPillTap(); });
    window.addEventListener('resize', () => placePill(el));
}

/** Тап по ноте: если музыка ждёт тапа — включаем сразу (это и есть нужный телефону тап), иначе открываем пульт. */
function onPillTap() {
    if (st.engine === 'kit' && st.needTap && authed() && st.queued === st.mood && queueLen() > 0) { togglePlay(); return; }
    toggleSheet();
}

function renderPill() {
    const el = document.getElementById('snd_pill');
    if (!el) return;
    const s = settings();
    el.hidden = !(s.enabled && s.pill);
    const m = moodBy(st.mood);
    el.dataset.state = pillState();
    el.querySelector('.snd-pill-ico').textContent = m?.icon || '🎵';
    el.title = m ? `Саундтрек: ${m.name}` : 'Саундтрек';
}

// ───────────── пульт ─────────────

const sheetOpen = () => { const w = document.getElementById('snd_sheet'); return !!w && !w.hidden; };

function mountSheet() {
    let w = document.getElementById('snd_sheet');
    if (w) return w;
    w = document.createElement('div');
    w.id = 'snd_sheet';
    w.className = 'snd-wrap';
    w.hidden = true;
    w.innerHTML = `
      <div class="snd-backdrop" data-snd="close"></div>
      <div class="snd-sheet" role="dialog" aria-label="Саундтрек">
        <div class="snd-top"></div>
        <div class="snd-embed" hidden></div>
        <div class="snd-chips"></div>
        <div class="snd-foot"></div>
      </div>`;
    document.body.appendChild(w);
    w.addEventListener('click', onSheetClick);
    w.addEventListener('input', (ev) => {
        if (ev.target.matches('[data-snd="vol"]')) { settings().volume = Number(ev.target.value) || 0; setVol(targetVol()); save(); }
    });
    return w;
}

function openSheet() {
    const w = mountSheet();
    w.hidden = false;
    if (st.engine !== 'kit') st.needTap = false;
    renderAll();
}
function closeSheet() {
    const w = document.getElementById('snd_sheet');
    if (!w) return;
    w.hidden = true;
    const box = w.querySelector('.snd-embed');
    box.hidden = true;
    box.innerHTML = '';   // плеер Apple не держим в фоне
    box.dataset.src = '';
}
const toggleSheet = () => (sheetOpen() ? closeSheet() : openSheet());

function statusLine() {
    const m = moodBy(st.mood);
    if (st.engine === 'kit') {
        if (!authed()) return 'Войди в Apple Music, чтобы музыка играла здесь';
        if (st.loading) return 'Ставлю плейлист…';
        if (st.needTap) return 'Нажми «играть» — телефону нужен тап, чтобы пошёл звук';
        if (!m) return 'Выбери настроение ниже или жди следующего поста';
        if (st.err) return st.err;
        return isPlayingNow() ? '' : 'На паузе';
    }
    if (!m) return 'Выбери настроение ниже или жди следующего поста';
    return 'Режим ссылок: музыка играет в приложении «Музыка»';
}

function renderSheet() {
    const w = document.getElementById('snd_sheet');
    if (!w || w.hidden) return;
    const s = settings();
    const m = moodBy(st.mood);
    const kit = st.engine === 'kit';
    const now = kit ? st.now : null;
    const art = `<span>${esc(m?.icon || '🎵')}</span>${now?.art ? `<img src="${esc(now.art)}" alt="" onerror="this.remove()">` : ''}`;
    const title = now?.title || m?.pl?.name || 'Саундтрек';
    const sub = now?.artist || (m ? '' : 'настроение не выбрано');
    const note = statusLine();
    let ctl = '';
    if (kit && !authed()) {
        ctl = '<div class="snd-ctl"><div class="menu_button snd-wide" data-snd="signin">Войти в Apple Music</div></div>';
    } else if (kit) {
        ctl = `<div class="snd-ctl">
            <div class="snd-btn" data-snd="prev" title="Назад"><i class="fa-solid fa-backward-step"></i></div>
            <div class="snd-btn snd-btn-main${st.needTap ? ' snd-pulse' : ''}" data-snd="play" title="Играть / пауза">${st.loading ? '<span class="snd-spin"></span>' : `<i class="fa-solid ${isPlayingNow() && !st.needTap ? 'fa-pause' : 'fa-play'}"></i>`}</div>
            <div class="snd-btn" data-snd="next" title="Дальше"><i class="fa-solid fa-forward-step"></i></div>
          </div>${IOS ? '' : `<input class="snd-vol" type="range" min="0" max="100" value="${esc(s.volume)}" data-snd="vol" title="Громкость">`}`;
    } else if (m?.pl?.id) {
        ctl = `<div class="snd-ctl"><a class="menu_button snd-wide" href="${esc(openUrl(m.pl))}" target="_blank" rel="noopener" data-snd="open">Открыть «${esc(m.pl.name)}» в Музыке ↗</a></div>`;
    }
    w.querySelector('.snd-top').innerHTML = `
      <div class="snd-head">
        <div class="snd-art">${art}</div>
        <div class="snd-meta">
          <div class="snd-mood">${m ? esc(label(m)) : 'Саундтрек'}</div>
          <div class="snd-title">${esc(title)}</div>
          ${sub ? `<div class="snd-artist">${esc(sub)}</div>` : ''}
        </div>
        <div class="snd-x" data-snd="close" title="Закрыть"><i class="fa-solid fa-xmark"></i></div>
      </div>
      ${ctl}
      ${note ? `<div class="snd-note">${esc(note)}</div>` : ''}`;

    // встроенный плеер Apple — только в режиме ссылок и только для плейлистов из каталога
    const box = w.querySelector('.snd-embed');
    const src = !kit && s.embed && m?.pl ? embedUrl(m.pl) : '';
    if (src !== (box.dataset.src || '')) {
        box.dataset.src = src;
        box.innerHTML = src ? `<iframe src="${esc(src)}" height="300" frameborder="0" allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write" sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"></iframe><small>Без входа внутри плеера играют отрывки по 30 секунд.</small>` : '';
    }
    box.hidden = !src;

    const list = ready();
    w.querySelector('.snd-chips').innerHTML = list.length
        ? list.map(x => `<div class="snd-chip${x.key === st.mood ? ' snd-on' : ''}" data-snd="mood" data-key="${esc(x.key)}">${esc(label(x))}</div>`).join('')
        : '<div class="snd-note">Плейлисты ещё не заданы: Расширения → 🎵 Саундтрек.</div>';
    w.querySelector('.snd-foot').innerHTML = `
      <label class="checkbox_label"><input type="checkbox" data-snd="auto" ${s.auto ? 'checked' : ''}> сам по сцене</label>
      <div class="menu_button${st.analyzing ? ' disabled' : ''}" data-snd="scan">${st.analyzing ? 'Слушаю сцену…' : '🎧 Какая сейчас сцена?'}</div>`;
}

function onSheetClick(ev) {
    const el = ev.target.closest('[data-snd]');
    if (!el) return;
    const act = el.dataset.snd;
    if (act === 'close') closeSheet();
    else if (act === 'play') togglePlay();
    else if (act === 'prev') skip(-1);
    else if (act === 'next') skip(1);
    else if (act === 'signin') signIn();
    else if (act === 'open') { st.needTap = false; renderPill(); }
    else if (act === 'mood') switchMood(el.dataset.key);
    else if (act === 'auto') { settings().auto = el.checked; save(); renderSettings(); }
    else if (act === 'scan') { if (!st.analyzing) analyze({ manual: true }).catch(e => console.warn(TAG, e)); }
}

function renderAll() {
    renderPill();
    renderSheet();
}

// ───────────── настройки ─────────────

function plLabel(m) {
    if (!m.pl?.id) return 'плейлист не задан';
    return `${isLibId(m.pl.id) ? '📚 ' : ''}${m.pl.name || m.pl.id}`;
}

function engineHtml() {
    if (st.engine === 'kit') {
        const until = st.tokenExp ? ` Токен до ${new Date(st.tokenExp * 1000).toLocaleDateString('ru-RU')}.` : '';
        return authed()
            ? `<div class="snd-status snd-ok">Apple Music подключён — музыка играет прямо здесь.${until} <a href="#" data-snd-act="signout">Выйти</a></div>`
            : `<div class="snd-status">MusicKit готов.${until}</div><div class="menu_button" data-snd-act="signin">Войти в Apple Music</div>`;
    }
    return `<div class="snd-status">Режим ссылок: токена разработчика Apple рядом нет${st.kitErr ? ` (${esc(st.kitErr)})` : ''}. Нота подсвечивается при смене настроения, тап открывает плейлист в «Музыке». Как включить полный автомат — в README (token.mjs).</div>`;
}

function renderSettings() {
    const host = document.getElementById('extensions_settings2');
    if (!host) return;
    const s = settings();
    let box = document.getElementById('snd_settings');
    const open = box?.querySelector('.inline-drawer-content')?.style.display === 'block';
    const profs = profiles();
    pickProfile();
    const kit = st.engine === 'kit' && authed();
    const html = `
      <div class="inline-drawer">
        <div class="inline-drawer-toggle inline-drawer-header"><b>🎵 Саундтрек</b><div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div></div>
        <div class="inline-drawer-content"${open ? ' style="display:block"' : ''}>
          <label class="checkbox_label"><input type="checkbox" data-snd-set="enabled" ${s.enabled ? 'checked' : ''}> Включено</label>
          <label class="checkbox_label"><input type="checkbox" data-snd-set="auto" ${s.auto ? 'checked' : ''}> Подбирать настроение после каждого поста</label>
          ${engineHtml()}
          <label>Как понимать сцену</label>
          <select class="text_pole" data-snd-set="detect">
            <option value="model" ${s.detect === 'model' ? 'selected' : ''}>модель читает сцену (один короткий запрос на пост)</option>
            <option value="words" ${s.detect === 'words' ? 'selected' : ''}>по словам (бесплатно, грубо)</option>
          </select>
          <label>Модель (профиль подключения)</label>
          <select class="text_pole" data-snd-set="profile"><option value="">— выбери —</option>${profs.map(p => `<option value="${esc(p.name)}" ${p.name === s.profile ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select>
          ${st.detectErr ? `<small class="snd-warn">Модель в последний раз не ответила: ${esc(st.detectErr)}</small>` : ''}
          <label>Настроения и плейлисты <small>(тап — раскрыть; ссылка: «Поделиться → Скопировать ссылку» в Музыке)</small></label>
          <div class="snd-moods">${s.moods.map((m, i) => `
            <details class="snd-m" data-i="${i}" ${st.openMood === m.key ? 'open' : ''}>
              <summary><span class="snd-m-name">${esc(label(m))}</span><span class="snd-m-pl${m.pl?.id ? '' : ' snd-dim'}">${esc(plLabel(m))}</span></summary>
              <div class="snd-m-body">
                <div class="snd-m-line">
                  <input class="text_pole snd-m-icon" data-snd-m="icon" value="${esc(m.icon)}" placeholder="🎵">
                  <input class="text_pole" data-snd-m="name" value="${esc(m.name)}" placeholder="название">
                </div>
                <input class="text_pole" data-snd-m="hint" value="${esc(m.hint)}" placeholder="когда включать — подсказка модели">
                <input class="text_pole" data-snd-m="url" value="${esc(m.pl?.url || '')}" placeholder="ссылка на плейлист или альбом Apple Music" inputmode="url" autocapitalize="off" autocorrect="off">
                <div class="snd-m-line">
                  ${kit ? '<div class="menu_button" data-snd-act="lib">📚 Из медиатеки</div>' : ''}
                  <div class="menu_button" data-snd-act="try">Включить</div>
                  <div class="menu_button" data-snd-act="clear">Без плейлиста</div>
                  <div class="menu_button" data-snd-act="del">Удалить</div>
                </div>
              </div>
            </details>`).join('')}
          </div>
          <div class="menu_button" data-snd-act="add">＋ Настроение</div>
          <label class="checkbox_label"><input type="checkbox" data-snd-set="shuffle" ${s.shuffle ? 'checked' : ''}> Вперемешку</label>
          <label class="checkbox_label"><input type="checkbox" data-snd-set="pill" ${s.pill ? 'checked' : ''}> Нота на экране</label>
          <small>Ноту можно перетащить. Без неё пульт открывается из меню расширений («Саундтрек») и командой /soundtrack.</small>
          <label class="checkbox_label"><input type="checkbox" data-snd-set="embed" ${s.embed ? 'checked' : ''}> Встроенный плеер Apple в режиме ссылок</label>
          <label>Свои указания модели</label>
          <textarea class="text_pole" rows="2" data-snd-set="note" placeholder="например: в сценах сороковых — только «Меланхолия» и «Драйв»">${esc(s.note)}</textarea>
          <div class="flex-container">
            <div class="flex1"><label>Постов контекста</label><input class="text_pole" type="number" min="1" max="8" data-snd-set="ctxMsgs" value="${esc(s.ctxMsgs)}"></div>
            <div class="flex1"><label>Размышления</label><select class="text_pole" data-snd-set="effort">${['', 'low', 'medium', 'high'].map(v => `<option value="${v}" ${v === s.effort ? 'selected' : ''}>${v || 'не трогать'}</option>`).join('')}</select></div>
            <div class="flex1"><label>Токены</label><input class="text_pole" type="number" min="200" max="16000" step="100" data-snd-set="tokens" value="${esc(s.tokens)}"></div>
          </div>
          <small>Команда <code>/soundtrack</code>: без слов — пульт, название настроения — включить его, <code>?</code> — послушать сцену, <code>pause</code>, <code>next</code>, <code>on</code>/<code>off</code>. Саундтрек v${VERSION}</small>
        </div>
      </div>`;
    if (!box) {
        box = document.createElement('div');
        box.id = 'snd_settings';
        host.appendChild(box);
        box.addEventListener('change', onSettingsChange);
        box.addEventListener('click', onSettingsClick);
        box.addEventListener('toggle', (ev) => {
            const d = ev.target.closest?.('.snd-m');
            if (!d) return;
            const m = settings().moods[Number(d.dataset.i)];
            if (d.open) st.openMood = m?.key || null; else if (st.openMood === m?.key) st.openMood = null;
        }, true);
    }
    box.innerHTML = html;
}

function rowMood(el) {
    const d = el.closest('.snd-m');
    if (!d) return null;
    const m = settings().moods[Number(d.dataset.i)];
    return m ? { d, m } : null;
}

function refreshRow(d, m) {
    d.querySelector('.snd-m-name').textContent = label(m);
    const pl = d.querySelector('.snd-m-pl');
    pl.textContent = plLabel(m);
    pl.classList.toggle('snd-dim', !m.pl?.id);
}

function onSettingsChange(ev) {
    const el = ev.target;
    const s = settings();
    if (el.dataset.sndM) {
        const row = rowMood(el);
        if (!row) return;
        const { d, m } = row;
        const k = el.dataset.sndM;
        if (k === 'url') {
            const v = el.value.trim();
            if (!v) { if (m.pl?.url) m.pl = null; }
            else {
                const pl = parseAppleUrl(v);
                if (!pl) { toast('warning', 'Это не похоже на ссылку плейлиста или альбома Apple Music'); return; }
                m.pl = pl;
                el.value = pl.url;
            }
        } else {
            m[k] = el.value.trim();
        }
        save();
        refreshRow(d, m);
        renderAll();
        return;
    }
    const k = el.dataset.sndSet;
    if (!k) return;
    if (el.type === 'checkbox') s[k] = el.checked;
    else if (el.type === 'number') s[k] = Number(el.value) || DEFAULTS[k];
    else s[k] = el.value;
    save();
    if (k === 'enabled') {
        if (!s.enabled) stopAll();
        else if (st.engine !== 'kit' && st.token) boot();
    }
    renderAll();
}

function onSettingsClick(ev) {
    const el = ev.target.closest('[data-snd-act]');
    if (!el) return;
    const act = el.dataset.sndAct;
    const s = settings();
    if (act === 'signin') { signIn(); return; }
    if (act === 'signout') { ev.preventDefault(); signOut(); return; }
    if (act === 'add') {
        const m = { key: `m${Date.now().toString(36)}`, icon: '🎵', name: 'Новое', hint: '', pl: null };
        s.moods.push(m);
        st.openMood = m.key;
        save();
        renderSettings();
        return;
    }
    const row = rowMood(el);
    if (!row) return;
    const { d, m } = row;
    if (act === 'del') {
        s.moods.splice(Number(d.dataset.i), 1);
        if (st.mood === m.key) st.mood = null;
        save();
        renderSettings();
        renderAll();
    } else if (act === 'clear') {
        m.pl = null;
        d.querySelector('[data-snd-m="url"]').value = '';
        save();
        refreshRow(d, m);
        renderAll();
    } else if (act === 'try') {
        if (m.pl?.id) { switchMood(m.key); if (st.engine !== 'kit') openSheet(); }
        else toast('info', 'Сначала дай этому настроению плейлист');
    } else if (act === 'lib') {
        pickFromLibrary(m, d);
    }
}

async function pickFromLibrary(m, d) {
    let list;
    try { toast('info', 'Смотрю медиатеку…', { timeOut: 1500 }); list = await libraryPlaylists(); }
    catch (e) { toast('error', `Медиатека не открылась: ${msgOf(e)}`); return; }
    if (!list.length) { toast('info', 'В медиатеке нет плейлистов'); return; }
    document.getElementById('snd_pick')?.remove();
    const w = document.createElement('div');
    w.id = 'snd_pick';
    w.className = 'snd-wrap';
    w.innerHTML = `
      <div class="snd-backdrop" data-pick="close"></div>
      <div class="snd-sheet">
        <div class="snd-head"><div class="snd-meta"><div class="snd-title">Плейлист для «${esc(m.name)}»</div></div><div class="snd-x" data-pick="close"><i class="fa-solid fa-xmark"></i></div></div>
        <div class="snd-picklist">${list.map((p, i) => `<div class="snd-pickrow" data-pick="${i}">${esc(p.name)}</div>`).join('')}</div>
      </div>`;
    document.body.appendChild(w);
    w.addEventListener('click', (ev) => {
        const el = ev.target.closest('[data-pick]');
        if (!el) return;
        if (el.dataset.pick !== 'close') {
            const p = list[Number(el.dataset.pick)];
            if (p) {
                m.pl = { id: p.id, kind: 'playlist', name: p.name, url: '', sf: '' };
                save();
                if (d.isConnected) { d.querySelector('[data-snd-m="url"]').value = ''; refreshRow(d, m); }
                renderAll();
            }
        }
        w.remove();
    });
}

// ───────────── меню и команда ─────────────

function mountWand() {
    const menu = document.getElementById('extensionsMenu');
    if (!menu || document.getElementById('snd_wand')) return;
    const el = document.createElement('div');
    el.id = 'snd_wand';
    el.className = 'list-group-item flex-container flexGap5 interactable';
    el.tabIndex = 0;
    el.innerHTML = '<div class="fa-solid fa-music extensionsMenuExtensionButton"></div><span>Саундтрек</span>';
    el.addEventListener('click', () => openSheet());
    menu.appendChild(el);
}

function findMood(text) {
    const q = String(text || '').trim().toLowerCase();
    if (!q) return null;
    const list = moods();
    return list.find(m => m.key.toLowerCase() === q || String(m.name).toLowerCase() === q) || list.find(m => String(m.name).toLowerCase().startsWith(q)) || null;
}

function registerSlash() {
    try {
        const { SlashCommandParser, SlashCommand, SlashCommandArgument, ARGUMENT_TYPE } = ctx();
        SlashCommandParser.addCommandObject(SlashCommand.fromProps({
            name: 'soundtrack',
            callback: async (_a, v) => {
                const arg = String(v ?? '').trim().toLowerCase();
                const s = settings();
                if (!arg) { openSheet(); return ''; }
                if (arg === 'on' || arg === 'off') {
                    s.enabled = arg === 'on';
                    save();
                    if (!s.enabled) await stopAll(); else if (st.engine !== 'kit' && st.token) await boot();
                    renderSettings(); renderAll();
                    toast('info', s.enabled ? 'Включён' : 'Выключен');
                    return '';
                }
                if (arg === '?') { await analyze({ manual: true }); return ''; }
                if (arg === 'pause' || arg === 'stop') { await stopAll(); return ''; }
                if (arg === 'play') { await togglePlay(); return ''; }
                if (arg === 'next') { await skip(1); return ''; }
                const m = findMood(arg);
                if (m) await switchMood(m.key); else toast('info', `Нет настроения «${arg}»`);
                return '';
            },
            unnamedArgumentList: [SlashCommandArgument.fromProps({ description: 'настроение | ? | pause | play | next | on | off', typeList: [ARGUMENT_TYPE.STRING], isRequired: false })],
            helpString: 'Саундтрек: музыка Apple Music под настроение сцены.',
        }));
    } catch (e) { console.warn(TAG, 'команда', e); }
}

// ───────────── старт ─────────────

function onChatChanged() {
    st.lastFp = fingerprint();
    if (!st.live) {
        const saved = ctx().chatMetadata?.[META_KEY]?.mood;
        st.mood = saved && moodBy(saved)?.pl?.id ? saved : null;
        st.needTap = false;
        kitPrepare(moodBy(st.mood));
    }
    renderAll();
}

jQuery(async () => {
    settings();
    renderSettings();
    mountPill();
    mountWand();
    registerSlash();
    renderAll();
    const { eventSource, eventTypes: E } = ctx();
    const onAi = (_id, type) => { if (type !== 'impersonate') schedule(); };
    if (E.CHARACTER_MESSAGE_RENDERED) eventSource.on(E.CHARACTER_MESSAGE_RENDERED, onAi);
    else if (E.MESSAGE_RECEIVED) eventSource.on(E.MESSAGE_RECEIVED, onAi);
    if (E.CHAT_CHANGED) eventSource.on(E.CHAT_CHANGED, onChatChanged);
    if (E.APP_READY) eventSource.on(E.APP_READY, () => { renderSettings(); mountWand(); onChatChanged(); });
    // вернулась в Safari после сна или другой вкладки — пост мог прийти без события
    document.addEventListener('visibilitychange', () => { if (!document.hidden) schedule(1500); });
    document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape' && sheetOpen()) closeSheet(); });
    setTimeout(() => boot().catch(e => console.warn(TAG, e)), 2500);
    // для других расширений и отладки из консоли
    window.Soundtrack = { version: VERSION, state: st, analyze, switchMood, open: openSheet, parseAppleUrl, parseMood, byWords, plain };
    console.log(`${TAG} загружен ${VERSION}`);
});
