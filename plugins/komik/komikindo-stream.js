import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`⚠️ Masukkan slug chapter komik!\n\nContoh: *${usedPrefix}${command} solo-leveling-chapter-01*`);
    
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
    try {
        let apiKey = global.apikey?.jereapi || global.apiKey;
        let url = `${global.web}/api/komik/komikindo-stream?apikey=${apiKey}&slug=${encodeURIComponent(text.trim())}`;
        
        let res = await fetch(url);
        let json = await res.json();
        
        if (json.status && json.result) {
            let data = json.result;
            const botName = (global.botname || 'BOT').toUpperCase();
            let txt = `📖 *${botName} - KOMIKINDO BACA CHAPTER*\n\n`;

            txt += `🎬 *Chapter:* ${data.title || text.trim()}\n`;
            if (data.comicTitle) txt += `📚 *Komik:* ${data.comicTitle}\n`;
            if (data.prev) txt += `⏮️ *Prev Chapter:* \`${data.prev}\`\n`;
            if (data.next) txt += `⏭️ *Next Chapter:* \`${data.next}\`\n`;
            txt += `📑 *Total Panel Halaman:* ${data.totalPages || data.images?.length || 0}\n`;

            if (Array.isArray(data.images) && data.images.length > 0) {
                txt += `\n🖼️ *Daftar Panel Gambar:*
`;
                data.images.slice(0, 10).forEach((urlStr, idx) => {
                    txt += `• Hal ${idx + 1}: ${urlStr}\n`;
                });
                if (data.images.length > 10) {
                    txt += `... dan ${data.images.length - 10} halaman lainnya.\n`;
                }
            }

            let firstImg = data.images?.[0];
            if (firstImg && typeof firstImg === 'string' && firstImg.startsWith('http')) {
                try {
                    await conn.sendMessage(m.chat, {
                        image: { url: firstImg },
                        caption: txt.trim()
                    }, { quoted: m });
                } catch (e) {
                    await m.reply(txt.trim());
                }
            } else {
                await m.reply(txt.trim());
            }

            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
        } else {
            await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } }).catch(() => {});
            m.reply(json.error || 'Gagal memuat panel gambar streaming chapter.');
        }
    } catch (e) {
        console.error('[Komikindo Stream Error]', e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } }).catch(() => {});
        m.reply('Terjadi kesalahan: ' + (e.message || 'Server error.'));
    }
}

handler.help = ['komikindo-stream <slug>']
handler.tags = ['komik']
handler.command = /^(komikindo-stream|komikindostream|komikstream|bacakomik)$/i
handler.premium = false
handler.limit = 1;

export default handler;
