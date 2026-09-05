import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command, args }) => {
    try {
        const query = args.join(' ');
        if (!query) return m.reply(`⚠️ Masukkan judul donghua yang dicari!\nContoh: ${usedPrefix + command} soul land`);
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        
        let apiKey = global.apikey?.jereapi || global.apiKey;
        const response = await fetch(`${global.web}/api/donghua/donghub-search?apikey=${apiKey}&query=${encodeURIComponent(query.trim())}`);
        const json = await response.json();
        let rawResult = json.result || json.data;
        let list = rawResult?.results || (Array.isArray(rawResult) ? rawResult : []);
        
        if (!json.status || !list || list.length === 0) {
            await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } }).catch(() => {});
            return m.reply("❌ Donghua tidak ditemukan.");
        }
        
        const botName = (global.botname || 'BOT').toUpperCase();
        let text = `🌸 *${botName} - DONGHUA SEARCH*\n\n`;
        text += `🔍 Keyword: *${query}*\n`;
        text += `📊 Total Ditemukan: *${list.length}*\n\n`;

        for (let i = 0; i < Math.min(list.length, 10); i++) {
            let item = list[i];
            if (!item || typeof item === 'function') continue;
            text += `*${i + 1}. ${item.title || '-' }*\n`;
            if (item.type) text += `🏷️ *Tipe:* ${item.type}\n`;
            if (item.status) text += `📊 *Status:* ${item.status}\n`;
            if (item.episode || item.subStatus) text += `🎬 *Episode:* ${item.episode || '-'} (${item.subStatus || '-' })\n`;
            if (item.slug) text += `🔗 *Slug:* \`${item.slug}\`\n`;
            text += `\n`;
        }

        text += `💡 *Tips:* Ketik *${usedPrefix}donghub-detail <slug>* untuk melihat detail sinopsis & daftar episode.`;
        
        let thumbUrl = list[0]?.cover || list[0]?.image;
        if (thumbUrl && typeof thumbUrl === 'string' && thumbUrl.startsWith('http')) {
            try {
                await conn.sendMessage(m.chat, {
                    image: { url: thumbUrl },
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
        console.error('[Donghub Search in Anime Error]', e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } }).catch(() => {});
        m.reply("❌ Error: " + (e.message || "Gagal mencari donghua"));
    }
};

handler.help = ["donghua <judul>"];
handler.command = ["donghua", "searchdonghua", "donghub"];
handler.tags = ["anime", "donghua"];
handler.limit = 1;
export default handler;
