import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Format salah!*` + '\n\n' + `📌 *Contoh:* *${usedPrefix + command} https://pin.it/xxxx*`);
    
    const input = text.trim();
    // Jika input adalah kata kunci (bukan URL), arahkan user ke .pin
    if (!input.startsWith('http://') && !input.startsWith('https://')) {
        return m.reply(`⚠️ Command *${usedPrefix + command}* khusus untuk mendownload dari link/URL Pinterest.\n\nUntuk mencari foto/gambar, gunakan: *${usedPrefix}pin ${input}*`);
    }

    await m.react('⏳').catch(() => {});
    try {
        let apiKey = global.apikey?.jereapi;
        let url = `${global.web}/api/downloader/pin?apikey=${apiKey}&url=${encodeURIComponent(input)}`;
        let res = await fetch(url);
        let json = await res.json();
        
        if (!json.status || !json.result) throw new Error(json.error || 'Gagal memproses tautan Pinterest');
        
        let resData = json.result;
        let mediaUrl = resData.url || resData.download_url || resData.image || resData.video || (typeof resData === 'string' ? resData : null);
        if (!mediaUrl) throw new Error('Link media Pinterest tidak ditemukan');
        
        let isVideo = resData.type === 'video' || /\.(mp4|mov|avi)($|\?)/i.test(mediaUrl);
        let caption = `📌 *${global.botname || 'BOT'} - PINTEREST DOWNLOADER*` + '\n\n' +
            `✨ *Request by:* ${m.pushName || 'User'}`;
        
        if (isVideo) {
            await conn.sendMessage(m.chat, {
                video: { url: mediaUrl },
                caption: caption,
                fileName: `pinterest_${Date.now()}.mp4`
            }, { quoted: m });
        } else {
            await conn.sendMessage(m.chat, {
                image: { url: mediaUrl },
                caption: caption
            }, { quoted: m });
        }
        await m.react('✅').catch(() => {});
    } catch (e) {
        await m.react('❌').catch(() => {});
        m.reply(`❌ *Error:* ${e.message || 'Terjadi kesalahan pada server'}`);
    }
};

handler.help = ['pindl <url>', 'pinterestdl <url>'];
handler.tags = ['downloader'];
handler.command = /^(pindl|pinterestdl|pinvid|pindownload|pindownloader)$/i;

handler.limit = true;

export default handler;
