#!/usr/bin/env node
// Выпуск токена разработчика Apple Music для «Саундтрека».
// Ключ .p8 остаётся на сервере вне папки расширения; рядом с расширением кладётся только готовый токен (token.json).
//
//   node token.mjs --team ABCDE12345 --key-id 1A2B3C4D5E --key-stdin   первый раз: ключ вставляется в терминал
//   node token.mjs                                                     перевыпуск (раз в полгода), всё уже запомнено
//   node token.mjs --check                                             что лежит сейчас и до какого числа
//
// Необязательное: --key путь/к/AuthKey.p8, --days 180, --origin https://мой-домен (токен будет работать только с него;
// --origin none — снять ограничение), --no-test (не спрашивать Apple, принят ли токен).

import { createPrivateKey, createPublicKey, sign, verify } from 'node:crypto';
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const HOME = process.env.SOUNDTRACK_HOME || join(homedir(), '.soundtrack');
const CFG = join(HOME, 'config.json');
const KEY = join(HOME, 'AuthKey.p8');
const OUT = process.env.SOUNDTRACK_OUT || join(HERE, 'token.json');
const MAX_SEC = 15777000; // предел Apple — полгода

const die = (msg) => { console.error(`✗ ${msg}`); process.exit(1); };
const b64 = (v) => Buffer.from(v).toString('base64url');
const day = (sec) => new Date(sec * 1000).toLocaleDateString('ru-RU');

function args() {
    const a = process.argv.slice(2);
    const o = {};
    for (let i = 0; i < a.length; i++) {
        if (!a[i].startsWith('--')) continue;
        const name = a[i].slice(2);
        const next = a[i + 1];
        if (next === undefined || next.startsWith('--')) o[name] = true;
        else { o[name] = next; i++; }
    }
    return o;
}

function readJson(path) {
    try { return JSON.parse(readFileSync(path, 'utf8')); } catch { return null; }
}

function decode(token) {
    try {
        const [h, p] = String(token).split('.');
        return { header: JSON.parse(Buffer.from(h, 'base64url').toString()), payload: JSON.parse(Buffer.from(p, 'base64url').toString()) };
    } catch { return null; }
}

function check() {
    const j = readJson(OUT);
    if (!j?.token) die(`токена нет: ${OUT}`);
    const d = decode(j.token);
    if (!d) die('token.json повреждён');
    const left = Math.floor((d.payload.exp - Date.now() / 1000) / 86400);
    console.log(`Токен: команда ${d.payload.iss}, ключ ${d.header.kid}, до ${day(d.payload.exp)} (${left >= 0 ? `ещё ${left} дн.` : 'ИСТЁК'})${d.payload.origin ? `, только для ${d.payload.origin.join(', ')}` : ''}`);
    process.exit(left >= 0 ? 0 : 2);
}

async function askApple(token, origin) {
    try {
        const headers = { Authorization: `Bearer ${token}` };
        if (origin.length) headers.Origin = origin[0];
        const r = await fetch('https://api.music.apple.com/v1/test', { headers, signal: AbortSignal.timeout(12000) });
        if (r.ok) return '✓ Apple принял токен.';
        if (r.status === 401 || r.status === 403) return `✗ Apple отверг токен (${r.status}). Проверь Team ID и Key ID и что ключ создан с галочкой Media Services (MusicKit).`;
        return `? Apple ответил ${r.status} — токен записан, проверь в таверне.`;
    } catch (e) {
        return `? Не смог спросить Apple (${e?.cause?.code || e?.name || 'сеть'}) — токен записан, проверь в таверне.`;
    }
}

async function main() {
    const a = args();
    if (a.help || a.h) { console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 11).map(l => l.replace(/^\/\/ ?/, '')).join('\n')); return; }
    if (a.check) check();

    const cfg = readJson(CFG) || {};
    const team = String(a.team || cfg.team || '').trim();
    const kid = String(a['key-id'] || cfg.keyId || '').trim();
    if (!team || !kid) die('нужны --team (Team ID) и --key-id (Key ID) — по 10 символов, из кабинета разработчика Apple');
    if (!/^[A-Z0-9]{10}$/.test(team)) console.warn(`! Team ID обычно 10 заглавных букв и цифр, а тут «${team}»`);
    if (!/^[A-Z0-9]{10}$/.test(kid)) console.warn(`! Key ID обычно 10 заглавных букв и цифр, а тут «${kid}»`);

    mkdirSync(HOME, { recursive: true, mode: 0o700 });

    let keyPath = String(a.key && a.key !== true ? a.key : (cfg.key || KEY));
    if (a['key-stdin']) {
        const pem = readFileSync(0, 'utf8').replace(/\r/g, '').trim();
        if (!/-----BEGIN PRIVATE KEY-----[\s\S]+-----END PRIVATE KEY-----/.test(pem)) die('в терминал вставлен не ключ: нужен весь текст файла .p8, от -----BEGIN PRIVATE KEY----- до -----END PRIVATE KEY-----');
        writeFileSync(KEY, `${pem}\n`, { mode: 0o600 });
        chmodSync(KEY, 0o600);
        keyPath = KEY;
        console.log(`✓ Ключ сохранён: ${KEY}`);
    }
    if (!existsSync(keyPath)) die(`ключа нет: ${keyPath}. Вставь его через --key-stdin или укажи --key путь`);

    let key;
    try { key = createPrivateKey(readFileSync(keyPath, 'utf8')); } catch (e) { die(`ключ не читается (${e.message})`); }
    if (key.asymmetricKeyType !== 'ec' || key.asymmetricKeyDetails?.namedCurve !== 'prime256v1') die('это не ключ Apple (нужен EC P-256 из файла AuthKey_….p8)');

    let origin = Array.isArray(cfg.origin) ? cfg.origin : [];
    if (a.origin !== undefined) origin = a.origin === true || a.origin === 'none' ? [] : String(a.origin).split(',').map(x => x.trim().replace(/\/+$/, '')).filter(Boolean);
    const days = Math.max(1, Math.min(182, Number(a.days && a.days !== true ? a.days : cfg.days) || 180));

    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + Math.min(MAX_SEC, days * 86400);
    const payload = { iss: team, iat, exp };
    if (origin.length) payload.origin = origin;
    const head = `${b64(JSON.stringify({ alg: 'ES256', kid }))}.${b64(JSON.stringify(payload))}`;
    const sig = sign('sha256', Buffer.from(head), { key, dsaEncoding: 'ieee-p1363' });
    if (!verify('sha256', Buffer.from(head), { key: createPublicKey(key), dsaEncoding: 'ieee-p1363' }, sig)) die('подпись не сошлась — токен не записан');
    const token = `${head}.${sig.toString('base64url')}`;

    writeFileSync(OUT, `${JSON.stringify({ token, iat, exp }, null, 2)}\n`);
    writeFileSync(CFG, `${JSON.stringify({ team, keyId: kid, key: keyPath, origin, days }, null, 2)}\n`, { mode: 0o600 });
    console.log(`✓ Токен записан: ${OUT}`);
    console.log(`  действует до ${day(exp)}${origin.length ? `, только для ${origin.join(', ')}` : ''}. Перевыпуск — та же команда без параметров.`);
    if (!a['no-test']) console.log(await askApple(token, origin));
    console.log('Теперь обнови страницу таверны.');
}

main().catch(e => die(e?.message || String(e)));
