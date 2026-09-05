import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command, args }) => {
    try {
        const query = args.join(' ');
        if (!query) return m.reply(`⚠️ Masukkan judul komik/manga!\nContoh: ${usedPrefix + command} one piece`);
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        
        let apiKey = global.apikey?.jereapi || global.apiKey;
        const response = await fetch(`${global.web}/api/komik/komikindo-search?apikey=${apiKey}&query=${encodeURIComponent(query.trim())}`);
        const json = await response.json();
        let listData = json.results || json.result || json.data;
        if (!Array.isArray(listData)) listData = listData?.comics || listData?.results || [];

        if (!json.status || !listData || listData.length === 0) {
            await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } }).catch(() => {});
            return m.reply("❌ Komik tidak ditemukan");
        }

        const botName = (global.botname || 'BOT').toUpperCase();
        let text = `📚 *${botName} - MANGA & KOMIK SEARCH*\n\n`;
        text += `🔍 Keyword: *${query}*\n\n`;
        for (let i = 0; i < Math.min(listData.length, 8); i++) {
            let komik = listData[i];
            text += `*${i + 1}. ${komik.title || 'Komik'}*\n`;
            if (komik.score || komik.rating) text += `⭐ *Rating:* ${komik.score || komik.rating}\n`;
            if (komik.type) text += `🏷️ *Tipe:* ${komik.type}\n`;
            if (komik.chapter || komik.latestChapter) text += `📖 *Chapter:* ${komik.chapter || komik.latestChapter}\n`;
            if (komik.slug) text += `🔗 *Slug:* \`${komik.slug}\`\n`;
            text += `\n`;
        }

        text += `💡 *Tips:* Ketik *${usedPrefix}komikindo-detail <slug>* untuk melihat detail komik.`;

        let cover = listData[0]?.thumb || listData[0]?.image || listData[0]?.cover;
        if (cover && typeof cover === 'string' && cover.startsWith('http')) {
            try {
                await conn.sendMessage(m.chat, {
                    image: { url: cover },
                    caption: text.trim()
                }, { quoted: m });
            } catch (e) {
                await m.reply(text.trim());
            }
        } else {
            await m.reply(text.trim());
        }
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } }).catch(() => {});
        m.reply("❌ Error: " + (e.message || 'Gagal mencari komik'));
    }
};

handler.help = ["komikindo <judul>", "manga <judul>"];
handler.command = ["komikindo", "searchkomik", "manga"];
handler.tags = ["manga", "komik"];
handler.limit = 1;
export default handler;
