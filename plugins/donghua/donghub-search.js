import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`⚠️ Format salah!\n\nContoh: *${usedPrefix}${command} soul land* atau *${usedPrefix}${command} soul land|1*`);
    
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
    try {
        let apiKey = global.apikey?.jereapi || global.apiKey;
        let [query, page] = (text || '').split('|');
        let pageParam = page ? `&page=${encodeURIComponent(page.trim())}` : '';
        let url = `${global.web}/api/donghua/donghub-search?apikey=${apiKey}&query=${encodeURIComponent(query ? query.trim() : '')}${pageParam}`;
        
        let res = await fetch(url);
        let json = await res.json();
        
        if (json.status && json.result) {
            let resData = json.result;
            let list = resData.results || (Array.isArray(resData) ? resData : []);
            let pagination = resData.pagination || {};

            if (!list || list.length === 0) {
                await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } }).catch(() => {});
                return m.reply(`Donghua tidak ditemukan untuk pencarian: *${query.trim()}*`);
            }

            const botName = (global.botname || 'BOT').toUpperCase();
            let txt = `🐉 *${botName} - DONGHUA SEARCH*\n\n`;
            txt += `🔍 Keyword: *${query.trim()}*`;
            if (pagination.currentPage) txt += ` (Hal ${pagination.currentPage}/${pagination.totalPages || 1})`;
            txt += `\n📊 Total Ditemukan: *${list.length}*\n\n`;

            for (let i = 0; i < Math.min(list.length, 10); i++) {
                let it = list[i];
                if (!it || typeof it === 'function') continue;
                txt += `*${i + 1}. ${it.title || 'Donghua'}*\n`;
                if (it.type) txt += `🏷️ *Tipe:* ${it.type}\n`;
                if (it.status) txt += `📊 *Status:* ${it.status}\n`;
                if (it.episode || it.subStatus) txt += `🎬 *Episode:* ${it.episode || '-'} (${it.subStatus || '-' })\n`;
                if (it.slug) txt += `🔗 *Slug:* \`${it.slug}\`\n`;
                txt += `\n`;
            }

            txt += `💡 *Tips:* Ketik *${usedPrefix}donghub-detail <slug>* untuk melihat sinopsis & daftar episode.`;

            let coverUrl = list[0]?.cover || list[0]?.image;
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
            m.reply(json.error || json.message || 'Gagal memproses pencarian donghua.');
        }
    } catch (e) {
        console.error('[Donghub Search Error]', e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } }).catch(() => {});
        m.reply('Terjadi kesalahan: ' + (e.message || 'Server error.'));
    }
}

handler.help = ['donghub-search <query>|<page>']
handler.tags = ['donghua']
handler.command = /^(donghub-search|donghubsearch|donghuasearch|searchdonghua)$/i
handler.premium = false
handler.limit = 1;

export default handler;
