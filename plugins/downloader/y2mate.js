import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        const API_KEY = global.apikey?.jereapi;
        if (!text) {
            return m.reply(`🎬 *${global.botname || 'BOT'} - Y2MATE DOWNLOADER*` + '\n\n' +
                `📌 *Cara Pakai:*` + '\n' +
                `> \`${usedPrefix + command} <link youtube> [mp3/mp4]\`` + '\n\n' +
                `💡 *Contoh:*` + '\n' +
                `> \`${usedPrefix + command} https://youtu.be/dQw4w9WgXcQ mp3\``);
        }

        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

        const args = text.trim().split(' ');
        const cleanUrl = args[0];
        const format = (args[1] || 'mp3').toLowerCase() === 'mp4' ? 'mp4' : 'mp3';

        let apiUrl = `${global.web}/api/downloader/y2mate?apikey=${API_KEY}&url=${encodeURIComponent(cleanUrl)}&format=${format}`;
        let response = await axios.get(apiUrl, { timeout: 60000 }).catch(() => null);
        let resJson = response?.data;

        if (!resJson || !resJson.status) {
            let fbUrl = `${global.web}/api/downloader/${format === 'mp3' ? 'ytmp3' : 'ytmp4'}?apikey=${API_KEY}&url=${encodeURIComponent(cleanUrl)}`;
            let fbRes = await axios.get(fbUrl, { timeout: 60000 }).catch(() => null);
            if (fbRes?.data?.status) resJson = fbRes.data;
        }

        if (!resJson || !resJson.status) {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return m.reply(`❌ *Gagal mengunduh Y2Mate:* ${resJson?.message || resJson?.error || 'Tidak dapat memproses tautan.'}`);
        }

        const data = resJson.result || resJson.data || resJson;
        const title = data.title || 'YouTube Media';
        const channel = data.channel || data.author || 'YouTube';
        const duration = data.duration || '-';
        const thumbnailUrl = data.thumbnail || `https://i.ytimg.com/vi/${data.id || ''}/hqdefault.jpg`;
        const downloadUrl = data.download || data.url || data.downloadUrl || data.download_url;

        if (!downloadUrl) {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return m.reply("❌ Tidak ditemukan URL download Y2Mate.");
        }

        await conn.sendMessage(m.chat, { react: { text: '📥', key: m.key } });

        const mediaRes = await axios.get(downloadUrl, {
            responseType: 'arraybuffer',
            timeout: 120000,
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });

        const mediaBuffer = Buffer.from(mediaRes.data);
        const safeTitle = title.replace(/[\\/:*?"<>|]/g, '').trim() || 'media';

        if (format === 'mp3') {
            await conn.sendMessage(m.chat, {
                audio: mediaBuffer,
                mimetype: 'audio/mpeg',
                ptt: false,
                fileName: `${safeTitle}.mp3`}, { quoted: m });
        } else {
            let caption = `🎬 *${global.botname || 'BOT'} - Y2MATE VIDEO*` + '\n\n' +
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
        console.error('Y2Mate Error:', e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        m.reply(`❌ *Y2Mate Error:* ${e.message || 'Terjadi kesalahan internal'}`);
    }
};

handler.help = ['y2mate <link> [mp3/mp4]'];
handler.tags = ['downloader'];
handler.command = /^y2mate$/i;

handler.limit = true

export default handler;
