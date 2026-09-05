import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        const API_KEY = global.apikey?.jereapi;
        if (!text) {
            return m.reply(`🎵 *${global.botname || 'BOT'} - YTMP3 V2 DOWNLOADER*` + '\n\n' +
                `📌 *Cara Pakai:*` + '\n' +
                `> \`${usedPrefix + command} <link youtube>\`` + '\n\n' +
                `💡 *Contoh:*` + '\n' +
                `> \`${usedPrefix + command} https://youtu.be/dQw4w9WgXcQ\``);
        }

        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

        const cleanUrl = text.trim();
        let apiUrl = `${global.web}/api/downloader/ytmp3v2?apikey=${API_KEY}&url=${encodeURIComponent(cleanUrl)}`;
        let response = await axios.get(apiUrl, { timeout: 60000 }).catch(() => null);
        let resJson = response?.data;

        if (!resJson || !resJson.status) {
            let fbRes = await axios.get(`${global.web}/api/downloader/ytmp3?apikey=${API_KEY}&url=${encodeURIComponent(cleanUrl)}`, { timeout: 60000 }).catch(() => null);
            if (fbRes?.data?.status) resJson = fbRes.data;
        }

        if (!resJson || !resJson.status) {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return m.reply(`❌ *Gagal mengunduh audio:* ${resJson?.error || resJson?.message || 'Tidak dapat memproses tautan.'}`);
        }

        const data = resJson.result || resJson.data || resJson;
        const title = data.title || 'YouTube Audio';
        const channel = data.channel || data.author || 'YouTube';
        const thumbnailUrl = data.thumbnail || `https://i.ytimg.com/vi/${data.video_id || ''}/hqdefault.jpg`;
        const downloadUrl = data.download_url || data.downloadUrl || data.download || data.url;

        if (!downloadUrl) {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return m.reply("❌ Tidak ditemukan URL download audio.");
        }

        await conn.sendMessage(m.chat, { react: { text: '📥', key: m.key } });

        const audioRes = await axios.get(downloadUrl, {
            responseType: 'arraybuffer',
            timeout: 180000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        });

        const audioBuffer = Buffer.from(audioRes.data);
        const safeTitle = title.replace(/[\\/:*?"<>|]/g, '').trim() || 'audio';
        const filename = `${safeTitle}.mp3`;
        const caption = `🎵 *${global.botname || 'BOT'} - YTMP3 V2 DOWNLOADER*\n\n📌 *Judul:* ${title}\n👤 *Channel:* ${channel}\n✨ *Request by:* ${m.pushName || 'User'}`;
        const sizeMB = (audioBuffer.length / (1024 * 1024)).toFixed(1);

        let sent = false;

        // 1. Coba mode audio biasa (jika <= 20MB)
        if (audioBuffer.length <= 20 * 1024 * 1024) {
            try {
                await conn.sendMessage(m.chat, {
                    audio: audioBuffer,
                    mimetype: 'audio/mpeg',
                    ptt: false,
                    fileName: filename
                }, { quoted: m });
                sent = true;
            } catch (errAudio) {
                console.warn('[YTMP3V2] Gagal kirim mode audio, fallback ke dokumen:', errAudio.message);
            }
        }

        // 2. Fallback mode dokumen (sampai 100MB)
        if (!sent && audioBuffer.length <= 100 * 1024 * 1024) {
            try {
                await conn.sendMessage(m.chat, {
                    document: audioBuffer,
                    mimetype: 'audio/mpeg',
                    fileName: filename,
                    caption: caption
                }, { quoted: m });
                sent = true;
            } catch (errDoc) {
                console.warn('[YTMP3V2] Gagal kirim dokumen:', errDoc.message);
            }
        }

        // 3. Fallback direct link jika file terlalu besar (> 100MB)
        if (!sent) {
            await conn.sendMessage(m.chat, {
                text: `${caption}\n\n⚠️ *Ukuran audio (${sizeMB} MB) terlalu besar untuk diunggah langsung ke WhatsApp.*\n📥 *Link Download Langsung:*\n${downloadUrl}`
            }, { quoted: m });
        }

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error('YTMP3V2 Error:', e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        m.reply(`❌ *YTMP3V2 Error:* ${e.message || 'Terjadi kesalahan internal'}`);
    }
};

handler.help = ['ytmp3v2 <link>', 'yta2 <link>', 'ytaudio2 <link>'];
handler.tags = ['downloader'];
handler.command = /^(ytmp3v2|yta2|ytaudio2)$/i;

handler.limit = true

export default handler;
