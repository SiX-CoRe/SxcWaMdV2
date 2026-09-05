import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`⚠️ Masukkan manga_id komik!\n\nContoh: *${usedPrefix}${command} 12345*`);
    
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
    try {
        let apiKey = global.apikey?.jereapi || global.apiKey;
        let url = `${global.web}/api/komik/shinigami-detail?apikey=${apiKey}&manga_id=${encodeURIComponent(text.trim())}`;
        
        let res = await fetch(url);
        let json = await res.json();
        
        if (json.status && json.result) {
            let data = json.result;
            const botName = (global.botname || 'BOT').toUpperCase();
            let txt = `📚 *${botName} - SHINIGAMI DETAIL*\n\n`;

            txt += `🎬 *Judul:* ${data.title || '-'}\n`;
            if (data.alternativeTitle) txt += `📌 *Judul Lain:* ${data.alternativeTitle}\n`;
            if (data.type) txt += `🏷️ *Tipe:* ${data.type}\n`;
            if (data.status) txt += `📊 *Status:* ${data.status}\n`;
            if (data.author) txt += `✍️ *Penulis:* ${data.author}\n`;
            if (data.artist) txt += `🎨 *Artis:* ${data.artist}\n`;

            // Genres
            if (Array.isArray(data.genres) && data.genres.length > 0) {
                txt += `🏷️ *Genre:* ${data.genres.map(g => g.name || g).join(', ')}\n`;
            }

            // Synopsis
            if (data.synopsis) {
                txt += `\n📖 *SINOPSIS:*\n${data.synopsis}\n`;
            }

            // Chapters
            if (Array.isArray(data.chapters) && data.chapters.length > 0) {
                txt += `\n📺 *DAFTAR CHAPTER (${data.chapters.length}):*\n`;
                data.chapters.slice(0, 15).forEach((ch) => {
                    txt += `• *${ch.title || 'Chapter'}*\n  ID: \`${ch.chapter_id || '-'}\`${ch.releaseDate ? ` | ${ch.releaseDate}` : ''}\n`;
                });
                if (data.chapters.length > 15) {
                    txt += `... dan ${data.chapters.length - 15} chapter lainnya.\n`;
                }
                txt += `\n💡 *Tip:* Ketik *${usedPrefix}shinigami-stream <chapter_id>* untuk membaca chapter.\n`;
            }

            let cover = data.coverImage || data.thumbnailUrl;
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
            m.reply(json.error || 'Detail komik tidak ditemukan. Cek kembali manga_id target.');
        }
    } catch (e) {
        console.error('[Shinigami Detail Error]', e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } }).catch(() => {});
        m.reply('Terjadi kesalahan: ' + (e.message || 'Server error.'));
    }
}

handler.help = ['shinigami-detail <manga_id>']
handler.tags = ['komik']
handler.command = /^(shinigami-detail|shinigamidetail)$/i
handler.premium = false
handler.limit = 1;

export default handler;
