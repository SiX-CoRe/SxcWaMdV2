// plugins/play.js
// YTMusic Search + LRCLIB Synced Lyrics + SaveTube + FFmpeg Compress + HTML Player
// ESM Plugin
// Install: npm i ytmusic-api yt-search sharp

'use strict';

import { createDecipheriv, randomUUID } from 'crypto';
import { spawn } from 'child_process';
import yts from 'yt-search';
import YTMusic from 'ytmusic-api';
import sharp from 'sharp';
import { prepareWAMessageMedia } from '@adiwajshing/baileys';

/* =========================================================
 * CONFIG
 * ========================================================= */

const METADATA_DECRYPTION_KEY = Buffer.from('C5D58EF67A7584E4A29F6C35BBC4EB12', 'hex');

const HEADERS = {
  'Content-Type': 'application/json',
  'Origin': 'https://yt.savetube.me',
  'User-Agent': 'Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/130 Mobile Safari/537.36'
};

/* =========================================================
 * FFMPEG
 * ========================================================= */

const FFMPEG_BITRATE = '16k';
const FFMPEG_SAMPLE_RATE = '24000';
const FFMPEG_CHANNELS = '1';
const FFMPEG_CODEC = 'libopus';
const FFMPEG_FORMAT = 'ogg';

const MAX_ORIGINAL_AUDIO_MB = 25;
const MAX_ORIGINAL_AUDIO_SIZE = MAX_ORIGINAL_AUDIO_MB * 1024 * 1024;

const MAX_COMPRESSED_AUDIO_MB = 6;
const MAX_COMPRESSED_AUDIO_SIZE = MAX_COMPRESSED_AUDIO_MB * 1024 * 1024;

/* =========================================================
 * LRCLIB
 * ========================================================= */

const LRCLIB_API = 'https://lrclib.net/api';
const LRCLIB_USER_AGENT = 'SxcWaMD-Play2/1.0 (https://github.com/)';

async function getLRCLyrics({ title, artist, duration = 0, album = '' }) {
  try {
    if (!title || !artist) return null;

    const params = new URLSearchParams({
      track_name: String(title).trim(),
      artist_name: String(artist).trim()
    });

    if (album) params.set('album_name', String(album).trim());

    const durationNumber = Number(duration);
    if (Number.isFinite(durationNumber) && durationNumber >= 1 && durationNumber <= 3600) {
      params.set('duration', String(Math.round(durationNumber)));
    }

    const res = await fetch(`${LRCLIB_API}/get?${params.toString()}`, {
      headers: {
        Accept: 'application/json',
        'User-Agent': LRCLIB_USER_AGENT
      }
    });

    if (res.status === 404 || res.status === 429 || !res.ok) return null;

    const data = await res.json();
    if (!data) return null;

    return {
      id: data.id || null,
      trackName: data.trackName || title,
      artistName: data.artistName || artist,
      albumName: data.albumName || '',
      duration: Number(data.duration || duration || 0),
      instrumental: Boolean(data.instrumental),
      plainLyrics: typeof data.plainLyrics === 'string' ? data.plainLyrics : '',
      syncedLyrics: typeof data.syncedLyrics === 'string' ? data.syncedLyrics : ''
    };
  } catch {
    return null;
  }
}

/* =========================================================
 * LRC PARSER
 * ========================================================= */

function parseLrcTimestamp(match) {
  if (!match) return null;

  const minutes = Number(match[1]);
  const seconds = Number(match[2]);
  const fractionText = match[3] || '';

  if (!Number.isFinite(minutes) || !Number.isFinite(seconds) || seconds < 0 || seconds >= 60) {
    return null;
  }

  let milliseconds = 0;
  if (fractionText) {
    if (fractionText.length === 1) {
      milliseconds = Number(fractionText) * 100;
    } else if (fractionText.length === 2) {
      milliseconds = Number(fractionText) * 10;
    } else {
      milliseconds = Number(fractionText.slice(0, 3));
    }
  }

  return minutes * 60 + seconds + milliseconds / 1000;
}

function parseSyncedLyrics(lrc = '') {
  if (!lrc || typeof lrc !== 'string') return [];

  const result = [];
  const lines = lrc.split(/\r?\n/);
  const timestampRegex = /\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g;

  for (const rawLine of lines) {
    if (!rawLine.trim()) continue;

    const matches = [...rawLine.matchAll(timestampRegex)];
    if (!matches.length) continue;

    const text = rawLine.replace(timestampRegex, '').trim();
    if (!text) continue;

    for (const match of matches) {
      const time = parseLrcTimestamp(match);
      if (time === null || !Number.isFinite(time) || time < 0) continue;

      result.push({ time, text });
    }
  }

  result.sort((a, b) => a.time - b.time);

  const cleaned = [];
  for (const item of result) {
    const last = cleaned[cleaned.length - 1];
    if (last && Math.abs(last.time - item.time) < 0.001 && last.text === item.text) continue;
    cleaned.push(item);
  }

  return cleaned;
}

/* =========================================================
 * PLAIN LYRICS FALLBACK
 * ========================================================= */

function plainLyricsToSynced(lyrics = '', duration = 0) {
  if (!lyrics || typeof lyrics !== 'string') return [];

  const lines = lyrics.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if (!lines.length) return [];

  const totalDuration = Number(duration);
  let interval = 5;

  if (Number.isFinite(totalDuration) && totalDuration > 0 && lines.length > 1) {
    interval = Math.max(2, Math.min(8, totalDuration / lines.length));
  }

  return lines.map((text, index) => ({
    time: index * interval,
    text
  }));
}

/* =========================================================
 * NORMALIZE LYRICS
 * ========================================================= */

function normalizeLyrics(lyrics = []) {
  if (!Array.isArray(lyrics)) return [];

  return lyrics
    .filter(item => item && Number.isFinite(Number(item.time)) && typeof item.text === 'string')
    .map(item => ({
      time: Number(item.time),
      text: String(item.text).trim()
    }))
    .filter(item => item.text)
    .sort((a, b) => a.time - b.time);
}

/* =========================================================
 * YT MUSIC
 * ========================================================= */

let ytMusicInstance = null;

async function getYTMusic() {
  if (!ytMusicInstance) {
    ytMusicInstance = new YTMusic();
    await ytMusicInstance.initialize();
  }
  return ytMusicInstance;
}

/* =========================================================
 * HELPERS
 * ========================================================= */

function escapeHtml(text = '') {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttr(text = '') {
  return escapeHtml(text);
}

function secondsFromTimestamp(timestamp = '') {
  if (!timestamp) return 0;

  const parts = String(timestamp).split(':').map(Number);
  if (parts.some(Number.isNaN)) return 0;

  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];

  return 0;
}

function formatDuration(seconds = 0) {
  seconds = Number(seconds);
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return h + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }

  return m + ':' + String(s).padStart(2, '0');
}

/* =========================================================
 * SAVETUBE
 * ========================================================= */

async function savetube(url, { downloadType = 'audio', quality = '128kbps' } = {}) {
  const idMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([a-zA-Z0-9_-]{11})/);
  if (!idMatch) throw new Error('URL YouTube tidak valid');

  const videoId = idMatch[1];

  const cdnRes = await fetch('https://media.savetube.vip/api/random-cdn', { headers: HEADERS })
    .then(v => v.json())
    .catch(() => null);

  if (!cdnRes?.cdn) throw new Error('CDN tidak tersedia');
  const cdn = cdnRes.cdn;

  const info = await fetch(`https://${cdn}/v2/info`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ url: `https://www.youtube.com/watch?v=${videoId}` })
  })
    .then(v => v.json())
    .catch(() => null);

  if (!info?.data) throw new Error('Metadata kosong');

  let metadata;
  try {
    const encrypted = Buffer.from(info.data, 'base64');
    const decipher = createDecipheriv(
      'aes-128-cbc',
      METADATA_DECRYPTION_KEY,
      encrypted.subarray(0, 16)
    );

    const decrypted = Buffer.concat([
      decipher.update(encrypted.subarray(16)),
      decipher.final()
    ]);

    metadata = JSON.parse(decrypted.toString('utf8'));
  } catch {
    throw new Error('Decrypt metadata gagal');
  }

  if (!metadata?.key) throw new Error('Key download tidak ditemukan');

  const dl = await fetch(`https://${cdn}/download`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      id: videoId,
      downloadType,
      quality,
      key: metadata.key
    })
  })
    .then(v => v.json())
    .catch(() => null);

  if (!dl?.data?.downloadUrl) {
    throw new Error(dl?.message || 'Download gagal');
  }

  return {
    title: metadata.title,
    duration: metadata.durationLabel,
    thumbnail: metadata.thumbnail,
    url: dl.data.downloadUrl
  };
}

async function savetubeRetry(url, opts, retry = 3) {
  let lastErr;
  for (let i = 0; i < retry; i++) {
    try {
      return await savetube(url, opts);
    } catch (e) {
      lastErr = e;
      if (i < retry - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  throw lastErr;
}

/* =========================================================
 * DOWNLOAD AUDIO
 * ========================================================= */

async function downloadAudioBuffer(url) {
  if (!url) throw new Error('URL audio kosong');

  const res = await fetch(url, { headers: { 'User-Agent': HEADERS['User-Agent'] } });
  if (!res.ok) throw new Error(`Download audio gagal (${res.status})`);

  const buffer = Buffer.from(await res.arrayBuffer());
  if (!buffer.length || buffer.length > MAX_ORIGINAL_AUDIO_SIZE) {
    throw new Error('Buffer audio bermasalah');
  }

  return buffer;
}

/* =========================================================
 * FFMPEG COMPRESS
 * ========================================================= */

async function compressAudio(inputBuffer) {
  if (!Buffer.isBuffer(inputBuffer) || !inputBuffer.length) {
    throw new Error('Input buffer kosong');
  }

  return new Promise((resolve, reject) => {
    let ffmpeg;
    try {
      ffmpeg = spawn('ffmpeg', [
        '-hide_banner',
        '-loglevel', 'error',
        '-i', 'pipe:0',
        '-vn',
        '-c:a', FFMPEG_CODEC,
        '-b:a', FFMPEG_BITRATE,
        '-ar', FFMPEG_SAMPLE_RATE,
        '-ac', FFMPEG_CHANNELS,
        '-application', 'audio',
        '-f', FFMPEG_FORMAT,
        'pipe:1'
      ], {
        stdio: ['pipe', 'pipe', 'pipe']
      });
    } catch (error) {
      return reject(error);
    }

    const chunks = [];
    let outputSize = 0;
    let finished = false;

    const fail = error => {
      if (finished) return;
      finished = true;
      try { ffmpeg.kill('SIGKILL'); } catch {}
      reject(error);
    };

    ffmpeg.stdout.on('data', chunk => {
      outputSize += chunk.length;
      if (outputSize > MAX_COMPRESSED_AUDIO_SIZE) {
        return fail(new Error('Audio compress terlalu besar'));
      }
      chunks.push(chunk);
    });

    ffmpeg.stderr.on('data', () => {});

    ffmpeg.on('error', error => {
      fail(error?.code === 'ENOENT' ? new Error('FFmpeg tidak ditemukan.') : error);
    });

    ffmpeg.on('close', code => {
      if (finished) return;
      if (code !== 0) return fail(new Error(`FFmpeg gagal (${code})`));

      const output = Buffer.concat(chunks);
      if (!output.length) return fail(new Error('FFmpeg menghasilkan audio kosong'));

      finished = true;
      resolve(output);
    });

    ffmpeg.stdin.on('error', error => {
      if (error?.code !== 'EPIPE') fail(error);
    });

    ffmpeg.stdin.end(inputBuffer);
  });
}

/* =========================================================
 * THUMBNAIL
 * ========================================================= */

async function getThumb(url) {
  try {
    if (!url) return Buffer.alloc(0);

    const res = await fetch(url);
    if (!res.ok) throw new Error('Thumbnail gagal diambil');

    const raw = Buffer.from(await res.arrayBuffer());
    return await sharp(raw)
      .resize(250, 250, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 50 })
      .toBuffer();
  } catch {
    return Buffer.alloc(0);
  }
}

async function createHighQualityThumbnail(conn, thumb) {
  try {
    if (!thumb?.length) return null;

    const { imageMessage } = await prepareWAMessageMedia(
      { image: thumb },
      { upload: conn.waUploadToServer, mediaTypeOverride: 'thumbnail-link' }
    );

    if (imageMessage) {
      imageMessage.width = 1280;
      imageMessage.height = 720;
    }

    return imageMessage || null;
  } catch {
    return null;
  }
}

/* =========================================================
 * HTML MUSIC PLAYER
 * ========================================================= */

function createMusicPlayer({ title, artist, duration, audioSrc, imageSrc, lyrics }) {
  const safeTitle = escapeHtml(title);
  const safeArtist = escapeHtml(artist);
  const safeDuration = escapeHtml(duration || '0:00');
  const safeImage = imageSrc || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzFhMGQxMiIvPjx0ZXh0IHg9IjIwMCIgeT0iMjEwIiBmb250LXNpemU9IjM0IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TUFJTiBQQ0xAYVlFUlI8L3RleHQ+PC9zdmc+';

  const lyricsJson = Buffer.from(
    JSON.stringify(Array.isArray(lyrics) ? lyrics : []),
    'utf8'
  ).toString('base64');

  return `
<style>
  :root {
    --ink: #ffffff;
    --muted: #b9b1b6;
    --sys: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  html, body { background: transparent; color: var(--ink); font-family: var(--sys); -webkit-font-smoothing: antialiased; }
  .wrap { display: flex; align-items: center; justify-content: center; padding: 10px; }
  .player { position: relative; width: 100%; max-width: 330px; border-radius: 18px; overflow: hidden; background: #1a0d12; box-shadow: 0 18px 40px rgba(0,0,0,.5); }
  .bg { position: absolute; inset: -30%; width: 160%; height: 160%; object-fit: cover; filter: blur(38px) saturate(1.5); opacity: .85; z-index: 0; }
  .veil { position: absolute; inset: 0; z-index: 1; background: linear-gradient(180deg, rgba(20,8,12,.65) 0%, rgba(20,8,12,.8) 45%, rgba(12,5,8,.96) 100%); }
  .content { position: relative; z-index: 2; padding: 16px 18px 18px; }
  .head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 14px; }
  .head__icon { width: 18px; height: 18px; color: var(--ink); opacity: .85; flex: none; }
  .head__mid { text-align: center; flex: 1; min-width: 0; }
  .head__from { font-size: 9px; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); }
  .head__album { font-size: 12px; font-weight: 600; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .poster { width: 100%; aspect-ratio: 1; border-radius: 10px; overflow: hidden; background: rgba(255,255,255,.06); box-shadow: 0 12px 26px rgba(0,0,0,.45); margin-bottom: 14px; }
  .poster img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .info { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
  .info__names { min-width: 0; }
  .info__title { font-size: 17px; font-weight: 600; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .info__artist { font-size: 12px; color: var(--muted); margin-top: 3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .info__heart { width: 34px; height: 34px; flex: none; display: flex; align-items: center; justify-content: center; background: none; border: none; color: var(--muted); cursor: pointer; padding: 0; }
  .info__heart.is-on { color: #ff5c8a; }
  .mini-lyrics { position: relative; height: 82px; overflow-x: hidden; overflow-y: auto; scrollbar-width: none; -ms-overflow-style: none; margin-bottom: 10px; overscroll-behavior: contain; scroll-behavior: auto; mask-image: linear-gradient(180deg, transparent 0%, black 18%, black 82%, transparent 100%); -webkit-mask-image: linear-gradient(180deg, transparent 0%, black 18%, black 82%, transparent 100%); }
  .mini-lyrics::-webkit-scrollbar { display: none; }
  .lyrics-text { width: 100%; padding: 32px 0; display: flex; flex-direction: column; gap: 5px; }
  .lyric-line { font-size: 10.5px; color: rgba(255,255,255,.4); line-height: 1.4; transition: color .25s ease, font-size .25s ease, opacity .25s ease, transform .25s ease; text-align: left; white-space: normal; word-wrap: break-word; overflow-wrap: anywhere; font-weight: 500; opacity: .75; transform: translateX(0) scale(1); transform-origin: left center; }
  .lyric-line.is-active { font-size: 12px; color: #fff; font-weight: 700; opacity: 1; transform: translateX(2px) scale(1.01); }
  .lyrics-empty { font-size: 10.5px; color: var(--muted); text-align: left; padding: 16px 0; }
  .bar { position: relative; height: 4px; border-radius: 4px; background: rgba(255,255,255,.22); cursor: pointer; margin-bottom: 6px; touch-action: none; }
  .bar__fill { position: absolute; left: 0; top: 0; bottom: 0; width: 0; border-radius: 4px; background: #fff; pointer-events: none; }
  .bar__dot { position: absolute; top: 50%; left: 0; width: 11px; height: 11px; border-radius: 50%; background: #fff; transform: translate(-50%,-50%); pointer-events: none; }
  .time { display: flex; justify-content: space-between; font-size: 11px; color: var(--muted); margin-bottom: 12px; font-variant-numeric: tabular-nums; }
  .controls { display: flex; align-items: center; justify-content: space-between; }
  .ctrl { width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; color: var(--ink); background: none; border: none; cursor: pointer; padding: 0; transition: opacity .2s ease, transform .15s ease; }
  .ctrl:active { opacity: .6; transform: scale(.92); }
  .play { width: 52px; height: 52px; border-radius: 50%; background: #fff; color: #12070b; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; flex: none; padding: 0; box-shadow: 0 6px 16px rgba(0,0,0,.4); transition: transform .15s ease; }
  .play:active { transform: scale(.93); }
  .note { margin-top: 12px; text-align: center; font-size: 10px; color: var(--muted); line-height: 1.6; }
</style>

<div class="wrap">
  <div class="player">
    <img class="bg" src="${escapeAttr(safeImage)}" alt="">
    <div class="veil"></div>
    <div class="content">
      <div class="head">
        <svg class="head__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        <div class="head__mid">
          <div class="head__from">YT Music Audio</div>
          <div class="head__album">${safeArtist}</div>
        </div>
        <svg class="head__icon" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="19" r="1.8"/></svg>
      </div>

      <div class="poster">
        <img src="${escapeAttr(safeImage)}" alt="${escapeAttr(safeTitle)}">
      </div>

      <div class="info">
        <div class="info__names">
          <div class="info__title">${safeTitle}</div>
          <div class="info__artist">${safeArtist}</div>
        </div>
        <button class="info__heart" id="heart" aria-label="Favorite">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="19" height="19"><path d="M20.8 5.6 a5.1 5.1 0 0 0-7.2 0 L12 7.2 l-1.6-1.6 a5.1 5.1 0 0 0-7.2 7.2 l1.6 1.6 L12 21.6 l7.2-7.2 1.6-1.6 a5.1 5.1 0 0 0 0-7.2z"/></svg>
        </button>
      </div>

      <div class="mini-lyrics" id="mini-lyrics">
        <div class="lyrics-text" id="lyrics-text"></div>
      </div>

      <div class="bar" id="bar">
        <div class="bar__fill" id="fill"></div>
        <div class="bar__dot" id="dot"></div>
      </div>

      <div class="time">
        <span id="cur">0:00</span>
        <span id="dur">${safeDuration}</span>
      </div>

      <div class="controls">
        <button class="ctrl" style="opacity:.5; cursor:default;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
        </button>

        <button class="ctrl" id="btn-rw" aria-label="Mundur 10 detik">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="22" height="22"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><text x="12" y="16.5" font-size="7.5" font-family="sans-serif" font-weight="bold" stroke="none" fill="currentColor" text-anchor="middle">10</text></svg>
        </button>

        <button class="play" id="play" aria-label="Play">
          <svg id="icon-play" viewBox="0 0 24 24" fill="currentColor" width="26" height="26"><path d="M8 5.6 v12.8 a.6.6 0 0 0 .92.5 l10-6.4 a.6.6 0 0 0 0-1 l-10-6.4 a.6.6 0 0 0-.92.5z"/></svg>
          <svg id="icon-pause" viewBox="0 0 24 24" fill="currentColor" width="26" height="26" style="display:none"><rect x="6.5" y="5" width="3.8" height="14" rx="1"/><rect x="13.7" y="5" width="3.8" height="14" rx="1"/></svg>
        </button>

        <button class="ctrl" id="btn-fw" aria-label="Maju 10 detik">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="22" height="22"><path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><text x="12" y="16.5" font-size="7.5" font-family="sans-serif" font-weight="bold" stroke="none" fill="currentColor" text-anchor="middle">10</text></svg>
        </button>

        <button class="ctrl" style="opacity:.5; cursor:default;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1 a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1 a4 4 0 0 1-4 4H3"/></svg>
        </button>
      </div>

      <div class="note">support terus kami yaaa</div>
    </div>
  </div>
</div>

<audio id="audio" preload="metadata" src="${escapeAttr(audioSrc)}"></audio>

<script>
(function() {
  'use strict';

  const audio = document.getElementById('audio');
  const play = document.getElementById('play');
  const bar = document.getElementById('bar');
  const fill = document.getElementById('fill');
  const dot = document.getElementById('dot');
  const cur = document.getElementById('cur');
  const dur = document.getElementById('dur');
  const heart = document.getElementById('heart');
  const iconPlay = document.getElementById('icon-play');
  const iconPause = document.getElementById('icon-pause');
  const lyricsContainer = document.getElementById('mini-lyrics');
  const lyricsText = document.getElementById('lyrics-text');
  const btnRw = document.getElementById('btn-rw');
  const btnFw = document.getElementById('btn-fw');

  let lyrics = [];
  try {
    const encoded = '${lyricsJson}';
    const binary = atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const json = new TextDecoder('utf-8').decode(bytes);
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed)) {
      lyrics = parsed
        .filter(item => item && Number.isFinite(Number(item.time)))
        .map(item => ({ time: Number(item.time), text: String(item.text || '♪') }))
        .sort((a, b) => a.time - b.time);
    }
  } catch {
    lyrics = [];
  }

  const lyricElements = [];
  function renderLyrics() {
    lyricsText.innerHTML = '';
    lyricElements.length = 0;

    if (!Array.isArray(lyrics) || !lyrics.length) {
      lyricsText.innerHTML = '<div class="lyrics-empty">Lirik belum tersedia untuk lagu ini.</div>';
      return;
    }

    const fragment = document.createDocumentFragment();
    lyrics.forEach((line, index) => {
      const el = document.createElement('div');
      el.className = 'lyric-line';
      el.dataset.time = String(line.time);
      el.dataset.index = String(index);
      el.textContent = line.text || '♪';
      fragment.appendChild(el);
      lyricElements.push(el);
    });
    lyricsText.appendChild(fragment);
  }
  renderLyrics();

  let activeLyricIndex = -1;
  function findLyricIndex(time) {
    if (!lyrics.length) return -1;
    let low = 0, high = lyrics.length - 1, result = -1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (Number(lyrics[mid].time) <= time) {
        result = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    return result;
  }

  let targetScrollTop = 0, currentScrollTop = 0, scrollAnimationFrame = null;
  const SCROLL_SMOOTHNESS = 0.18;

  function calculateLyricScroll(element) {
    if (!element || !lyricsContainer) return 0;
    const elementTop = element.offsetTop;
    const elementHeight = element.offsetHeight;
    const containerHeight = lyricsContainer.clientHeight;
    let target = elementTop - (containerHeight / 2) + (elementHeight / 2);
    const maxScroll = Math.max(0, lyricsContainer.scrollHeight - containerHeight);
    return Math.max(0, Math.min(target, maxScroll));
  }

  function setLyricScrollTarget(element, immediate = false) {
    if (!element || !lyricsContainer) return;
    targetScrollTop = calculateLyricScroll(element);
    if (immediate) {
      currentScrollTop = targetScrollTop;
      lyricsContainer.scrollTop = targetScrollTop;
      return;
    }
    startScrollAnimation();
  }

  function startScrollAnimation() {
    if (scrollAnimationFrame !== null) return;
    function animate() {
      const difference = targetScrollTop - currentScrollTop;
      if (Math.abs(difference) < 0.5) {
        currentScrollTop = targetScrollTop;
        lyricsContainer.scrollTop = currentScrollTop;
        scrollAnimationFrame = null;
        return;
      }
      currentScrollTop += difference * SCROLL_SMOOTHNESS;
      lyricsContainer.scrollTop = currentScrollTop;
      scrollAnimationFrame = requestAnimationFrame(animate);
    }
    scrollAnimationFrame = requestAnimationFrame(animate);
  }

  function updateLyrics(currentTime, { immediate = false } = {}) {
    if (!lyrics.length || !lyricElements.length) return;
    const time = Number(currentTime) || 0;
    const index = findLyricIndex(time);

    if (index < 0) {
      if (activeLyricIndex !== -1) {
        activeLyricIndex = -1;
        lyricElements.forEach(el => el.classList.remove('is-active'));
      }
      return;
    }

    if (index === activeLyricIndex && !immediate) return;

    activeLyricIndex = index;
    lyricElements.forEach((el, i) => el.classList.toggle('is-active', i === index));
    const active = lyricElements[index];
    if (active) setLyricScrollTarget(active, immediate);
  }

  function resetLyrics() {
    activeLyricIndex = -1;
    lyricElements.forEach(el => el.classList.remove('is-active'));
    targetScrollTop = 0;
    currentScrollTop = 0;
    if (lyricsContainer) lyricsContainer.scrollTop = 0;
  }

  function formatTime(sec) {
    sec = Number(sec);
    if (!Number.isFinite(sec) || sec < 0) return '0:00';
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    
    // PERBAIKAN DI SINI: Tidak lagi menggunakan backtick yang membuat konflik string
    if (h > 0) return h + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    return m + ':' + String(s).padStart(2, '0');
  }

  function updateProgress() {
    const duration = Number(audio.duration);
    if (!Number.isFinite(duration) || duration <= 0) return;
    const current = Math.max(0, Math.min(duration, Number(audio.currentTime) || 0));
    const percent = (current / duration) * 100;
    fill.style.width = percent + '%';
    dot.style.left = percent + '%';
    cur.textContent = formatTime(current);
    updateLyrics(current);
  }

  function setPlaying() {
    iconPlay.style.display = 'none';
    iconPause.style.display = 'block';
    startScrollAnimation();
  }

  function setPaused() {
    iconPlay.style.display = 'block';
    iconPause.style.display = 'none';
  }

  play.addEventListener('click', async () => {
    try {
      if (audio.paused) {
        await audio.play();
        setPlaying();
      } else {
        audio.pause();
        setPaused();
      }
    } catch {
      setPaused();
    }
  });

  heart.addEventListener('click', () => heart.classList.toggle('is-on'));

  btnRw.addEventListener('click', () => {
    const duration = Number(audio.duration);
    if (!Number.isFinite(duration) || duration <= 0) return;
    audio.currentTime = Math.max(0, (Number(audio.currentTime) || 0) - 10);
    updateLyrics(audio.currentTime, { immediate: true });
    updateProgress();
  });

  btnFw.addEventListener('click', () => {
    const duration = Number(audio.duration);
    if (!Number.isFinite(duration) || duration <= 0) return;
    audio.currentTime = Math.min(duration, (Number(audio.currentTime) || 0) + 10);
    updateLyrics(audio.currentTime, { immediate: true });
    updateProgress();
  });

  function seekFromPointer(clientX) {
    const duration = Number(audio.duration);
    if (!Number.isFinite(duration) || duration <= 0) return;
    const rect = bar.getBoundingClientRect();
    if (!rect.width) return;
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    audio.currentTime = (x / rect.width) * duration;
    updateLyrics(audio.currentTime, { immediate: true });
    updateProgress();
  }

  bar.addEventListener('pointerdown', event => seekFromPointer(event.clientX));

  audio.addEventListener('loadedmetadata', () => {
    if (Number.isFinite(audio.duration)) dur.textContent = formatTime(audio.duration);
    updateProgress();
  });

  audio.addEventListener('durationchange', () => {
    if (Number.isFinite(audio.duration)) dur.textContent = formatTime(audio.duration);
  });

  audio.addEventListener('timeupdate', updateProgress);
  audio.addEventListener('play', setPlaying);
  audio.addEventListener('pause', () => { if (!audio.ended) setPaused(); });
  audio.addEventListener('ended', () => {
    setPaused();
    fill.style.width = '0%';
    dot.style.left = '0%';
    cur.textContent = '0:00';
    resetLyrics();
  });
  audio.addEventListener('error', setPaused);

  setPaused();
})();
</script>
`;
}

/* =========================================================
 * MESSAGE SENDER
 * ========================================================= */

async function sendMusicPlayer(conn, m, html) {
  const responseId = randomUUID();

  await conn.relayMessage(
    m.chat,
    {
      messageContextInfo: {
        deviceListMetadata: {},
        deviceListMetadataVersion: 2,
        botMetadata: {
          messageDisclaimerText: '',
          botResponseId: responseId
        }
      },
      botForwardedMessage: {
        message: {
          richResponseMessage: {
            messageType: 1,
            submessages: [{ messageType: 2, messageText: 'Music Player' }],
            unifiedResponse: {
              data: Buffer.from(
                JSON.stringify({
                  response_id: responseId,
                  sections: [
                    {
                      view_model: {
                        primitive: {
                          __typename: 'GenAIaeacdsnwHtmlPrimitive',
                          payload: html,
                          trusted_sources: []
                        },
                        __typename: 'GenAISingleLayoutViewModel'
                      }
                    }
                  ]
                })
              ).toString('base64')
            },
            contextInfo: {
              forwardingScore: 1,
              isForwarded: true,
              forwardedAiBotMessageInfo: { botJid: '867051314767696@bot' },
              forwardOrigin: 4
            }
          }
        }
      }
    },
    { messageId: responseId }
  );
}

/* =========================================================
 * HANDLER
 * ========================================================= */

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    throw `Contoh:\n${usedPrefix + command} another love tom odell`;
  }

  await m.react('🎧');

  try {
    let ytUrl = text.trim();
    let title = 'Unknown';
    let artist = 'Unknown Artist';
    let duration = '0:00';
    let durationSec = 0;
    let thumbUrl = '';
    let trackIdForLyrics = null;
    let album = '';

    if (!/youtube\.com|youtu\.be/i.test(text)) {
      const ytm = await getYTMusic();
      const songs = await ytm.search(text);
      const track = songs.find(s => s.type === 'SONG') || songs[0];

      if (!track || !track.videoId) {
        throw new Error('Lagu tidak ditemukan di YT Music');
      }

      trackIdForLyrics = track.videoId;
      ytUrl = `https://www.youtube.com/watch?v=${track.videoId}`;
      title = track.name || track.title || 'Unknown';
      artist = track.artists?.length
        ? track.artists.map(a => a.name).join(', ')
        : (track.artist?.name || 'Unknown Artist');

      durationSec = Number(track.duration || 0);
      duration = formatDuration(durationSec);

      if (track.thumbnails?.length) {
        thumbUrl = track.thumbnails[track.thumbnails.length - 1].url;
      }

      album = track.album?.name || track.album?.title || '';
    } else {
      const detail = await yts(ytUrl);
      const vid = detail?.videos?.[0];

      if (!vid) throw new Error('Video tidak ditemukan');

      title = vid.title || 'Unknown';
      artist = vid.author?.name || 'YouTube';
      duration = vid.timestamp || '0:00';
      durationSec = secondsFromTimestamp(duration);
      thumbUrl = vid.thumbnail;

      const match = ytUrl.match(/(?:v=|shorts\/|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
      if (match) trackIdForLyrics = match[1];
    }

    let syncedLyrics = [];
    const lrclib = await getLRCLyrics({ title, artist, duration: durationSec, album });

    if (lrclib?.syncedLyrics) {
      syncedLyrics = parseSyncedLyrics(lrclib.syncedLyrics);
    }

    if (!syncedLyrics.length && lrclib?.plainLyrics) {
      syncedLyrics = plainLyricsToSynced(lrclib.plainLyrics, durationSec);
    }

    if (!syncedLyrics.length && trackIdForLyrics) {
      try {
        const ytm = await getYTMusic();
        const lyricsData = await ytm.getLyrics(trackIdForLyrics);
        let fallbackLyrics = '';

        if (typeof lyricsData === 'string') {
          fallbackLyrics = lyricsData;
        } else if (Array.isArray(lyricsData)) {
          fallbackLyrics = lyricsData
            .map(item => (typeof item === 'string' ? item : item?.lyrics || item?.text || item?.content || ''))
            .filter(Boolean)
            .join('\n');
        } else {
          fallbackLyrics = lyricsData?.lyrics || lyricsData?.text || lyricsData?.content || '';
        }

        if (fallbackLyrics) {
          syncedLyrics = parseSyncedLyrics(fallbackLyrics);
          if (!syncedLyrics.length) {
            syncedLyrics = plainLyricsToSynced(fallbackLyrics, durationSec);
          }
        }
      } catch {}
    }

    syncedLyrics = normalizeLyrics(syncedLyrics);

    const thumb = await getThumb(thumbUrl);
    await createHighQualityThumbnail(conn, thumb);

    const imageSrc = thumb?.length ? `data:image/jpeg;base64,${thumb.toString('base64')}` : '';

    const audio = await savetubeRetry(ytUrl, { downloadType: 'audio', quality: '128kbps' });
    if (!audio?.url) throw new Error('URL audio tidak tersedia');

    const originalBuffer = await downloadAudioBuffer(audio.url);
    const compressedBuffer = await compressAudio(originalBuffer);
    const audioSrc = `data:audio/ogg;base64,${compressedBuffer.toString('base64')}`;

    if (Buffer.byteLength(audioSrc, 'utf8') > 8 * 1024 * 1024) {
      throw new Error('Audio Base64 masih terlalu besar, kurangi bitrate FFMPEG.');
    }

    const html = createMusicPlayer({
      title,
      artist,
      duration,
      audioSrc,
      imageSrc,
      lyrics: syncedLyrics
    });

    await sendMusicPlayer(conn, m, html);
    await m.react('✅');
  } catch (error) {
    await m.react('❌');
    await conn.sendMessage(
      m.chat,
      {
        text: `❌ Gagal memproses lagu.\n\n> ${error?.message || 'Unknown error'}`
      },
      { quoted: m }
    );
  }
};

/* =========================================================
 * HANDLER CONFIG
 * ========================================================= */

handler.help = ['play2'];
handler.tags = ['downloader'];
handler.command = /^play2$/i;
handler.limit = true;

export default handler;