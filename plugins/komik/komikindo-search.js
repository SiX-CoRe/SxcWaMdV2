import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`⚠️ Masukkan judul komik yang dicari!\n\nContoh: *${usedPrefix}${command} solo leveling*`);
    
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
    try {
        let apiKey = global.apikey?.jereapi || global.apiKey;
        let url = `${global.web}/api/komik/komikindo-search?apikey=${apiKey}&query=${encodeURIComponent(text.trim())}`;
        
        let res = await fetch(url);
        let json = await res.json();
        
        if (json.status && json.result) {
            let list = Array.isArray(json.result) ? json.result : (json.result.comics || []);

            if (!list || list.length === 0) {
                await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } }).catch(() => {});
                return m.reply(`Komik tidak ditemukan untuk pencarian: *${text.trim()}*`);
            }

            const botName = (global.botname || 'BOT').toUpperCase();
            let txt = `📚 *${botName} - KOMIKINDO SEARCH*\n\n`;
            txt += `🔍 Keyword: *${text.trim()}*\n`;
            txt += `📊 Ditemukan: *${list.length}* komik\n\n`;

            for (let i = 0; i < Math.min(list.length, 10); i++) {
                let it = list[i];
                if (!it || typeof it === 'function') continue;
                txt += `*${i + 1}. ${it.title || 'Komik'}*\n`;
                if (it.type) txt += `🏷️ *Tipe:* ${it.type}\n`;
                if (it.chapter || it.latestChapter) txt += `📖 *Chapter:* ${it.chapter || it.latestChapter}\n`;
                if (it.score || it.rating) txt += `⭐ *Rating:* ${it.score || it.rating}\n`;
                if (it.slug) txt += `🔗 *Slug:* \`${it.slug}\`\n`;
                txt += `\n`;
            }

            txt += `💡 *Tips:* Ketik *${usedPrefix}komikdetail <slug>* untuk melihat sinopsis & daftar chapter.`;

            let coverUrl = list[0]?.thumb || list[0]?.image || list[0]?.thumbnailUrl;
            if (coverUrl && typeof coverUrl === 'string' && coverUrl.startsWith('http')) {
                try {
                    await conn.sendMessage(m.chat, {
                        image: { url: coverUrl },
                        caption: txt.trim()
                    }, { quoted: m });
                } catch (errImg) {
                    await m.reply(txt.trim());
                }
            } else {
                await m.reply(txt.trim());
            }

            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
        } else {
            await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } }).catch(() => {});
            m.reply(json.error || json.message || 'Gagal memproses pencarian komik.');
        }
    } catch (e) {
        console.error('[Komikindo Search Error]', e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } }).catch(() => {});
        m.reply('Terjadi kesalahan: ' + (e.message || 'Server error.'));
    }
}

handler.help = ['komikindo-search <judul>']
handler.tags = ['komik']
handler.command = /^(komikindo-search|komikindosearch|komiksearch|carikomik)$/i
handler.premium = false
handler.limit = 1;

export default handler;
