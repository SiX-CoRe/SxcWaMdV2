import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
    try {
        let apiKey = global.apikey?.jereapi || global.apiKey;
        let page = text ? parseInt(text.trim()) || 1 : 1;
        let url = `${global.web}/api/komik/komikindo-daftar?apikey=${apiKey}&page=${page}`;
        
        let res = await fetch(url);
        let json = await res.json();
        
        if (json.status && json.result) {
            let resData = json.result;
            let list = Array.isArray(resData) ? resData : (resData.comics || []);

            if (!list || list.length === 0) {
                await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } }).catch(() => {});
                return m.reply(`Daftar komik halaman ${page} tidak ditemukan.`);
            }

            const botName = (global.botname || 'BOT').toUpperCase();
            let txt = `📚 *${botName} - DAFTAR KOMIK TERPOPULER*\n\n`;
            txt += `📄 Halaman: *${page}* | Total: *${list.length}* komik\n\n`;

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

            txt += `💡 *Tips:* Ketik *${usedPrefix}komikdetail <slug>* untuk melihat detail & chapter.`;

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
            m.reply(json.error || json.message || 'Gagal memuat daftar komik.');
        }
    } catch (e) {
        console.error('[Komikindo Daftar Error]', e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } }).catch(() => {});
        m.reply('Terjadi kesalahan: ' + (e.message || 'Server error.'));
    }
}

handler.help = ['komikindo-daftar <halaman>']
handler.tags = ['komik']
handler.command = /^(komikindo-daftar|komikindodaftar|daftarkomik)$/i
handler.premium = false
handler.limit = 1;

export default handler;
