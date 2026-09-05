import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`⚠️ Format salah!\n\nContoh: *${usedPrefix}${command} soul-land-2-episode-70-sub-indo*`);
    
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
    try {
        let apiKey = global.apikey?.jereapi || global.apiKey;
        let url = `${global.web}/api/donghua/donghub-episode?apikey=${apiKey}&slug=${encodeURIComponent(text.trim())}`;
        
        let res = await fetch(url);
        let json = await res.json();
        
        if (json.status && json.result) {
            let data = json.result;
            const botName = (global.botname || 'BOT').toUpperCase();
            let txt = `🐉 *${botName} - DONGHUA STREAMING*\n\n`;

            txt += `🎬 *Episode:* ${data.title || '-'}\n`;
            if (data.series?.name) txt += `📺 *Series:* ${data.series.name}\n`;
            if (data.prev) txt += `⏮️ *Prev Episode:* \`${data.prev}\`\n`;
            if (data.next) txt += `⏭️ *Next Episode:* \`${data.next}\`\n`;

            // Mirrors
            if (Array.isArray(data.mirrors) && data.mirrors.length > 0) {
                txt += `\n▶️ *STREAMING MIRRORS:*\n`;
                data.mirrors.forEach((mItem, idx) => {
                    txt += `*${idx + 1}. ${mItem.name}*\n`;
                    if (mItem.streamUrl) txt += `🔗 Link: ${mItem.streamUrl}\n`;
                });
            }

            // Related episodes
            if (Array.isArray(data.relatedEpisodes) && data.relatedEpisodes.length > 0) {
                txt += `\n🎞️ *EPISODE LAINNYA:*\n`;
                data.relatedEpisodes.slice(0, 5).forEach((rep) => {
                    txt += `• *${rep.title}*\n  Slug: \`${rep.slug}\`\n`;
                });
            }

            await m.reply(txt.trim());
            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
        } else {
            await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } }).catch(() => {});
            m.reply(json.error || 'Gagal memuat streaming episode donghua.');
        }
    } catch (e) {
        console.error('[Donghub Episode Error]', e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } }).catch(() => {});
        m.reply('Terjadi kesalahan: ' + (e.message || 'Server error.'));
    }
}

handler.help = ['donghub-episode <slug>']
handler.tags = ['donghua']
handler.command = /^(donghub-episode|donghubepisode|donghuaepisode|donghubstream)$/i
handler.premium = false
handler.limit = 1;

export default handler;
