import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
    try {
        let apiKey = global.apikey?.jereapi || global.apiKey;
        let type = 'latest';
        let query = '';
        let genre = '';
        let page = 1;

        if (text && text.includes('|')) {
            let parts = text.split('|').map(s => s.trim());
            type = parts[0] || 'latest';
            query = parts[1] || '';
            genre = parts[2] || '';
            page = parseInt(parts[3]) || 1;
        } else if (text) {
            let t = text.trim();
            if (['latest', 'popular'].includes(t.toLowerCase())) {
                type = t.toLowerCase();
            } else {
                type = 'search';
                query = t;
            }
        }

        let params = new URLSearchParams({ apikey: apiKey, type, page: page.toString() });
        if (query) params.append('query', query);
        if (genre) params.append('genre', genre);

        let url = `${global.web}/api/komik/shinigami-list?${params.toString()}`;
        let res = await fetch(url);
        let json = await res.json();
        
        if (json.status && json.result) {
            let resData = json.result;
            let list = resData.comics || (Array.isArray(resData) ? resData : []);

            if (!list || list.length === 0) {
                await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } }).catch(() => {});
                return m.reply(`Komik tidak ditemukan pada kriteria tersebut.`);
            }

            const botName = (global.botname || 'BOT').toUpperCase();
            let txt = `📚 *${botName} - SHINIGAMI COMICS*\n\n`;
            txt += `📌 Filter: *${resData.filter_type || type}*`;
            if (query) txt += ` | Query: *${query}*`;
            if (genre) txt += ` | Genre: *${genre}*`;
            txt += ` (Hal ${resData.page || page})\n`;
            txt += `📊 Total: *${resData.total_results || list.length}*\n\n`;

            for (let i = 0; i < Math.min(list.length, 10); i++) {
                let it = list[i];
                if (!it || typeof it === 'function') continue;
                txt += `*${i + 1}. ${it.title || 'Komik'}*\n`;
                if (it.type) txt += `🏷️ *Tipe:* ${it.type}\n`;
                if (it.latestChapter) txt += `📖 *Chapter Terbaru:* ${it.latestChapter}\n`;
                if (it.shortDescription) txt += `📝 *Deskripsi:* ${it.shortDescription.trim()}...\n`;
                if (it.manga_id) txt += `🔗 *ID Komik:* \`${it.manga_id}\`\n`;
                txt += `\n`;
            }

            txt += `💡 *Tips:* Ketik *${usedPrefix}shinigami-detail <manga_id>* untuk melihat detail & chapter.\nContoh format lengkap: *${usedPrefix}${command} genre||action|1*`;

            let coverUrl = list[0]?.thumbnailUrl;
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
            m.reply(json.error || json.message || 'Gagal memproses daftar komik Shinigami.');
        }
    } catch (e) {
        console.error('[Shinigami List Error]', e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } }).catch(() => {});
        m.reply('Terjadi kesalahan: ' + (e.message || 'Server error.'));
    }
}

handler.help = ['shinigami-list <type|query|genre|page>']
handler.tags = ['komik']
handler.command = /^(shinigami-list|shinigamilist|shinigami)$/i
handler.premium = false
handler.limit = 1;

export default handler;
