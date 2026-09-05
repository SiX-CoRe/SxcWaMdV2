import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        const API_KEY = global.apikey?.jereapi;
        if (!text) {
            return m.reply(`🎬 *${global.botname || 'BOT'} - YOUTUBE DOWNLOADER*` + '\n\n' +
                `📌 *Cara Pakai:*` + '\n' +
                `> \`${usedPrefix + command} <link youtube>\`` + '\n\n' +
                `💡 *Contoh:*` + '\n' +
                `> \`${usedPrefix + command} https://youtu.be/dQw4w9WgXcQ\``);
        }

        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

        const cleanUrl = text.trim();
        const isMp3 = /mp3|yta/i.test(command);
        const format = isMp3 ? 'mp3' : 'mp4';

        let apiUrl = `${global.web}/api/downloader/youtube?apikey=${API_KEY}&url=${encodeURIComponent(cleanUrl)}&format=${format}`;
        let response = await axios.get(apiUrl, { timeout: 60000 }).catch(() => null);
        let resJson = response?.data;

        if (!resJson || !resJson.status) {
            let fb = format === 'mp3' ? 'ytmp3' : 'ytmp4';
            let fbRes = await axios.get(`${global.web}/api/downloader/${fb}?apikey=${API_KEY}&url=${encodeURIComponent(cleanUrl)}`, { timeout: 60000 }).catch(() => null);
            if (fbRes?.data?.status) resJson = fbRes.data;
        }

        if (!resJson || !resJson.status) {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return m.reply(`❌ *Gagal mengunduh YouTube:* ${resJson?.message || resJson?.error || 'Link tidak valid.'}`);
        }

        const data = resJson.result || resJson.data || resJson;
        const title = data.title || 'YouTube Media';
        const channel = data.channel || data.author || 'YouTube';
        const duration = data.duration || '-';
        const thumbnailUrl = data.thumbnail || `https://i.ytimg.com/vi/${data.id || ''}/hqdefault.jpg`;
        const downloadUrl = data.download || data.url || data.downloadUrl || data.download_url;

        if (!downloadUrl) {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return m.reply("❌ Tidak ditemukan tautan download YouTube.");
        }

        await conn.sendMessage(m.chat, { react: { text: '📥', key: m.key } });

        const mediaRes = await axios.get(downloadUrl, {
            responseType: 'arraybuffer',
            timeout: 120000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const mediaBuffer = Buffer.from(mediaRes.data);
        const safeTitle = title.replace(/[\\/:*?"<>|]/g, '').trim() || 'youtube_media';

        if (format === 'mp3') {
            await conn.sendMessage(m.chat, {
                audio: mediaBuffer,
                mimetype: 'audio/mpeg',
                ptt: false,
                fileName: `${safeTitle}.mp3`}, { quoted: m });
        } else {
            let caption = `🎬 *${global.botname || 'BOT'} - YOUTUBE ${format.toUpperCase()}*` + '\n\n' +
                `📌 *Judul:* ${title}` + '\n' +
                `👤 *Channel:* ${channel}` + '\n' +
                `⏱️ *Durasi:* ${duration}` + '\n' +
                `✨ *Request by:* ${m.pushName || 'User'}`;

            await conn.sendMessage(m.chat, {
                video: mediaBuffer,
                caption: caption,
                fileName: `${safeTitle}.mp4`,
                mimetype: 'video/mp4'
            }, { quoted: m });
        }

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error('YTDL Error:', e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        m.reply(`❌ *Error:* ${e.message || 'Terjadi kesalahan sistem'}`);
    }
};

handler.help = ['ytdl <link>', 'ytdlmp3 <link>', 'ytdlmp4 <link>'];
handler.tags = ['downloader'];
handler.command = /^(ytdl|ytdlmp3|ytdlmp4)$/i;

handler.limit = true

export default handler;
