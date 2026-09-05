import FormData from 'form-data';
import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        let audioUrl = '';

        if (text && /^https?:\/\//i.test(text.trim())) {
            audioUrl = text.trim();
        } else if (mime && (mime.includes('audio') || mime.includes('video'))) {
            let media = await q.download();
            if (!media) throw new Error("Gagal mengunduh berkas audio/video.");

            let form = new FormData();
            form.append('files[]', media, { filename: 'music.mp3', contentType: mime });

            let upRes = await fetch('https://uguu.se/upload.php', { method: 'POST', body: form });
            let upJson = await upRes.json();
            audioUrl = upJson.files?.[0]?.url;
        } else {
            return m.reply(`🎵 *WHATMUSIC (MUSIC IDENTIFIER)*\n\nBalas audio/video lagu dengan perintah: *${usedPrefix + command}*\nAtau ketik: *${usedPrefix + command} <url audio/video>*`);
        }

        if (!audioUrl) throw new Error("Gagal memproses file audio.");

        let apiKey = global.apikey?.jereapi;
        let apiUrl = `${global.web}/api/tools/whatmusic?apikey=${apiKey}&url=${encodeURIComponent(audioUrl)}`;

        let res = await fetch(apiUrl);
        let json = await res.json();

        if (!json.status) throw new Error(json.error || json.message || "Musik tidak teridentifikasi.");

        let data = json.result || {};
        let caption = `🎵 *MUSIK DITEMUKAN*` + '\n\n';
        caption += `📌 *Judul:* ${data.title || '-'}\n`;
        caption += `👤 *Artis:* ${data.artist || '-'}\n`;
        caption += `💿 *Album:* ${data.album || '-'}\n`;
        caption += `📅 *Rilis:* ${data.release_date || '-'}\n`;
        caption += `⏱️ *Durasi:* ${data.duration || '-'}\n`;
        if (data.genre) caption += `🎶 *Genre:* ${Array.isArray(data.genre) ? data.genre.join(', ') : data.genre}\n`;
        if (data.spotify_url) caption += `🟢 *Spotify:* ${data.spotify_url}\n`;
        if (data.apple_music_url) caption += `🍎 *Apple Music:* ${data.apple_music_url}\n`;
        caption += `\n✅ *Request by:* ${m.pushName || 'User'}`;

        if (data.cover) {
            await conn.sendMessage(m.chat, {
                image: { url: data.cover },
                caption: caption
            }, { quoted: m });
        } else {
            await m.reply(caption);
        }

        if (data.preview_url) {
            await conn.sendMessage(m.chat, {
                audio: { url: data.preview_url },
                mimetype: 'audio/mp4'
            }, { quoted: m });
        }

        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ *WhatMusic Gagal*\nError: ${e.message}`);
    }
};

handler.help = ['whatmusic (reply audio/video)', 'shazam (reply audio)'];
handler.tags = ['tools'];
handler.command = /^(whatmusic|shazam|findmusic|judulmusik|identifymusic)$/i;

handler.limit = 1;
export default handler;
