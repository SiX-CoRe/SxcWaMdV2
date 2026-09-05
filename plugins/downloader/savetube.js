import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        const API_KEY = global.apikey?.jereapi;
        if (!text) {
            return m.reply(`🎬 *${global.botname || 'BOT'} - SAVETUBE DOWNLOADER*` + '\n\n' +
                `📌 *Cara Pakai:*` + '\n' +
                `> \`${usedPrefix + command} <link youtube>\`` + '\n\n' +
                `💡 *Contoh:*` + '\n' +
                `> \`${usedPrefix + command} https://youtu.be/dQw4w9WgXcQ\``);
        }

        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

        const cleanUrl = text.trim();
        let apiUrl = `${global.web}/api/downloader/savetube?apikey=${API_KEY}&url=${encodeURIComponent(cleanUrl)}`;
        let response = await axios.get(apiUrl, { timeout: 60000 }).catch(() => null);
        let resJson = response?.data;

        if (!resJson || !resJson.status) {
            let fbRes = await axios.get(`${global.web}/api/downloader/ytmp3?apikey=${API_KEY}&url=${encodeURIComponent(cleanUrl)}`, { timeout: 60000 }).catch(() => null);
            if (fbRes?.data?.status) resJson = fbRes.data;
        }

        if (!resJson || !resJson.status) {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return m.reply(`❌ *Gagal mengunduh SaveTube:* ${resJson?.error || resJson?.message || 'Tidak dapat memproses tautan.'}`);
        }

        const data = resJson.result || resJson.data || resJson;
        const title = data.title || 'YouTube Audio';
        const channel = data.channel || data.author || 'YouTube';
        const thumbnailUrl = data.thumbnail || `https://i.ytimg.com/vi/${data.id || ''}/hqdefault.jpg`;
        const downloadUrl = data.download || data.url || data.downloadUrl || data.download_url;

        if (!downloadUrl) {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return m.reply("❌ Tidak ditemukan URL download audio SaveTube.");
        }

        await conn.sendMessage(m.chat, { react: { text: '📥', key: m.key } });

        const audioRes = await axios.get(downloadUrl, {
            responseType: 'arraybuffer',
            timeout: 120000,
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });

        const audioBuffer = Buffer.from(audioRes.data);
        const safeTitle = title.replace(/[\\/:*?"<>|]/g, '').trim() || 'audio';

        await conn.sendMessage(m.chat, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            ptt: false,
            fileName: `${safeTitle}.mp3`}, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error('SaveTube Error:', e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        m.reply(`❌ *SaveTube Error:* ${e.message || 'Terjadi kesalahan internal'}`);
    }
};

handler.help = ['savetube <link>'];
handler.tags = ['downloader'];
handler.command = /^savetube$/i;

handler.limit = true

export default handler;
