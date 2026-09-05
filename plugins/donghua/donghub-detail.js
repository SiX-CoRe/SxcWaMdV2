import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`⚠️ Masukkan slug donghua!\n\nContoh: *${usedPrefix}${command} soul-land-2* atau *${usedPrefix}${command} btth*`);
    
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
    try {
        let apiKey = global.apikey?.jereapi || global.apiKey;
        let url = `${global.web}/api/donghua/donghub-detail?apikey=${apiKey}&slug=${encodeURIComponent(text.trim())}`;
        
        let res = await fetch(url);
        let json = await res.json();
        
        if (json.status && json.result) {
            let data = json.result;
            const botName = (global.botname || 'BOT').toUpperCase();
            let txt = `🐉 *${botName} - DONGHUA DETAIL*\n\n`;

            txt += `🎬 *Judul:* ${data.title || '-'}\n`;

            // Metadata
            if (data.metadata && typeof data.metadata === 'object') {
                txt += `\n📋 *INFORMASI DONGHUA:*\n`;
                for (let k in data.metadata) {
                    txt += `• *${k}:* ${data.metadata[k]}\n`;
                }
            }

            // Genres
            if (Array.isArray(data.genres) && data.genres.length > 0) {
                txt += `🏷️ *Genre:* ${data.genres.map(g => g.name || g).join(', ')}\n`;
            }

            // Synopsis
            if (data.synopsis) {
                txt += `\n📖 *SINOPSIS:*\n${data.synopsis}\n`;
            }

            // Episodes
            if (Array.isArray(data.episodes) && data.episodes.length > 0) {
                txt += `\n📺 *DAFTAR EPISODE (${data.episodes.length}):*\n`;
                data.episodes.slice(0, 15).forEach((ep) => {
                    txt += `• *${ep.title || 'Episode'}* (${ep.subStatus || '-' })\n  Slug: \`${ep.slug || '-'}\` | ${ep.date || '-'}\n`;
                });
                if (data.episodes.length > 15) {
                    txt += `... dan ${data.episodes.length - 15} episode lainnya.\n`;
                }
                txt += `\n💡 *Tip:* Ketik *${usedPrefix}donghub-episode <slug-episode>* untuk streaming episode.\n`;
            }

            let cover = data.cover || data.image;
            if (cover && typeof cover === 'string' && cover.startsWith('http')) {
                try {
                    await conn.sendMessage(m.chat, {
                        image: { url: cover },
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
            m.reply(json.error || 'Detail donghua tidak ditemukan. Cek kembali slug target.');
        }
    } catch (e) {
        console.error('[Donghub Detail Error]', e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } }).catch(() => {});
        m.reply('Terjadi kesalahan: ' + (e.message || 'Server error.'));
    }
}

handler.help = ['donghub-detail <slug>']
handler.tags = ['donghua']
handler.command = /^(donghub-detail|donghubdetail|donghuadetail)$/i
handler.premium = false
handler.limit = 1;

export default handler;
