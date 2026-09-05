import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        const API_KEY = global.apikey?.jereapi;
        if (!text) {
            return m.reply(`🎬 *${global.botname || 'BOT'} - SSYOUTUBE DOWNLOADER*` + '\n\n' +
                `📌 *Cara Pakai:*` + '\n' +
                `> \`${usedPrefix + command} <link youtube> [resolusi]\`` + '\n\n' +
                `💡 *Contoh:*` + '\n' +
                `> \`${usedPrefix + command} https://youtu.be/dQw4w9WgXcQ 720\``);
        }

        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

        const args = text.trim().split(' ');
        const cleanUrl = args[0];
        const resolusi = args[1] || '720';

        let apiUrl = `${global.web}/api/downloader/ssyoutube-ytdl?apikey=${API_KEY}&url=${encodeURIComponent(cleanUrl)}&resolusi=${encodeURIComponent(resolusi)}`;
        let response = await axios.get(apiUrl, { timeout: 90000 }).catch(() => null);
        let resJson = response?.data;

        if (!resJson || !resJson.status) {
            let fbRes = await axios.get(`${global.web}/api/downloader/youtube?apikey=${API_KEY}&url=${encodeURIComponent(cleanUrl)}&format=mp4`, { timeout: 60000 }).catch(() => null);
            if (fbRes?.data?.status) resJson = fbRes.data;
        }

        if (!resJson || !resJson.status) {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return m.reply(`❌ *Gagal mengunduh SSYouTube:* ${resJson?.error || resJson?.message || 'Tidak dapat memproses tautan.'}`);
        }

        const data = resJson.result || resJson.data || resJson;
        const title = data.title || 'YouTube Video';
        const channel = data.channel || data.author || 'YouTube';
        const duration = data.duration || '-';
        const downloadUrl = data.downloadUrl || data.download_url || data.download || data.url;

        if (!downloadUrl) {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return m.reply("❌ Tidak ditemukan URL unduhan video.");
        }

        await conn.sendMessage(m.chat, { react: { text: '📥', key: m.key } });

        const mediaRes = await axios.get(downloadUrl, {
            responseType: 'arraybuffer',
            timeout: 180000,
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });

        const mediaBuffer = Buffer.from(mediaRes.data);
        const safeTitle = title.replace(/[\\/:*?"<>|]/g, '').trim() || 'ssyoutube_video';
        let caption = `🎬 *${global.botname || 'BOT'} - SSYOUTUBE VIDEO*` + '\n\n' +
            `📌 *Judul:* ${title}` + '\n' +
            `👤 *Channel:* ${channel}` + '\n' +
            `📺 *Resolusi:* ${resolusi}p` + '\n' +
            `⏱️ *Durasi:* ${duration}` + '\n' +
            `✨ *Request by:* ${m.pushName || 'User'}`;

        await conn.sendMessage(m.chat, {
            video: mediaBuffer,
            caption: caption,
            fileName: `${safeTitle}.mp4`,
            mimetype: 'video/mp4'
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error('SSYouTube Error:', e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        m.reply(`❌ *SSYouTube Error:* ${e.message || 'Terjadi kesalahan internal'}`);
    }
};

handler.help = ['ssyoutubeytdl <link> [resolusi]', 'ssyt <link> [resolusi]'];
handler.tags = ['downloader'];
handler.command = /^(ssyoutubeytdl|ssyt)$/i;

handler.limit = true

export default handler;
