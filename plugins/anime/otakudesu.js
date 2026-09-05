import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const botName = (global.botname || 'BOT').toUpperCase();
    if (command === 'animesearch' || command === 'otakusearch') {
        if (!text) return m.reply(`❌ Masukkan keyword anime!\n\nContoh:\n${usedPrefix + command} naruto`);
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        try {
            let apiKey = global.apikey?.jereapi || global.apiKey;
            let response = await fetch(`${global.web}/api/anime/otakudesu-search?apikey=${apiKey}&query=${encodeURIComponent(text.trim())}`);
            let json = await response.json();
            let resData = json.result || json.data;
            let items = resData?.items || (Array.isArray(resData) ? resData : []);
            
            if (!json.status || !items || items.length === 0) {
                await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } }).catch(() => {});
                return m.reply('❌ Anime tidak ditemukan.');
            }

            let resMsg = `🌸 *${botName} - OTAKUDESU SEARCH*\n\n`;
            resMsg += `🔍 Keyword: *${text}*\n\n`;
            items.slice(0, 10).forEach((anime, i) => {
                let slugMatch = (anime.url || '').match(/\/(anime|episode|lengkap)\/([^\/]+)\/?$/);
                let slug = slugMatch ? slugMatch[2] : (anime.slug || anime.url || '-');
                resMsg += `*${i + 1}. ${anime.title || anime.name}*\n`;
                if (anime.rating) resMsg += `⭐ Rating: ${anime.rating}\n`;
                if (anime.status) resMsg += `📊 Status: ${anime.status}\n`;
                if (anime.genres) resMsg += `🏷️ Genre: ${Array.isArray(anime.genres) ? anime.genres.join(', ') : anime.genres}\n`;
                resMsg += `🔗 Slug: \`${slug}\`\n\n`;
            });

            resMsg += `💡 *Tips:* Ketik *${usedPrefix}animedetail <slug>* untuk melihat detail episode & link download.`;

            let thumb = items[0]?.poster || items[0]?.thumb || items[0]?.image;
            if (thumb && typeof thumb === 'string' && thumb.startsWith('http')) {
                try {
                    await conn.sendMessage(m.chat, {
                        image: { url: thumb },
                        caption: resMsg.trim()
                    }, { quoted: m });
                } catch (e) {
                    await m.reply(resMsg.trim());
                }
            } else {
                await m.reply(resMsg.trim());
            }
            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
        } catch (e) {
            console.error(e);
            await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } }).catch(() => {});
            m.reply(`❌ Error: ${e.message}`);
        }
    } else if (command === 'animedetail' || command === 'otakudetail' || command === 'animeepisode' || command === 'otakudownload') {
        if (!text) return m.reply(`❌ Masukkan slug anime / episode!\n\nContoh:\n${usedPrefix + command} blue-lock`);
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        try {
            let apiKey = global.apikey?.jereapi || global.apiKey;
            let response = await fetch(`${global.web}/api/anime/otakudesu-detail-download?apikey=${apiKey}&slug=${encodeURIComponent(text.trim())}`);
            let json = await response.json();
            let detail = json.result || json.data;
            if (!json.status || !detail) {
                await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } }).catch(() => {});
                return m.reply('❌ Detail anime tidak ditemukan.');
            }

            let caption = `🎬 *${botName} - ${detail.title || 'OtakuDesu Anime Detail'}*\n\n`;
            if (detail.info && typeof detail.info === 'object') {
                for (let k in detail.info) {
                    if (typeof detail.info[k] !== 'function' && typeof detail.info[k] !== 'object') {
                        caption += `• *${k.replace(/_/g, ' ').toUpperCase()}:* ${detail.info[k]}\n`;
                    }
                }
            }
            if (detail.sinopsis) caption += `\n📖 *Sinopsis:*\n${detail.sinopsis}\n`;

            if (Array.isArray(detail.episodes) && detail.episodes.length > 0) {
                caption += `\n📺 *Daftar Episode (${detail.episodes.length}):*\n`;
                detail.episodes.slice(0, 15).forEach((ep) => {
                    caption += `• *${ep.title || 'Episode'}*\n  Slug: \`${ep.slug || '-'}\`\n`;
                });
                if (detail.episodes.length > 15) {
                    caption += `... dan ${detail.episodes.length - 15} episode lainnya.\n`;
                }
                caption += `\n💡 *Tip:* Ketik *${usedPrefix}otakudownload <slug-episode>* untuk download.\n`;
            }

            if (Array.isArray(detail.downloads) && detail.downloads.length > 0) {
                caption += `\n📥 *Download Links:*\n`;
                detail.downloads.forEach(dl => {
                    caption += `\n*[ ${dl.group || 'Download'} ]*\n`;
                    (dl.items || []).forEach(item => {
                        caption += `• *${item.resolution || '-'}* (${item.size || '-'}):\n`;
                        (item.links || []).forEach(l => {
                            caption += `  - ${l.host || 'Link'}: ${l.url || '-'}\n`;
                        });
                    });
                });
            }

            let poster = detail.poster || detail.thumb || detail.image;
            if (poster && typeof poster === 'string' && poster.startsWith('http')) {
                try {
                    await conn.sendMessage(m.chat, {
                        image: { url: poster },
                        caption: caption.trim()
                    }, { quoted: m });
                } catch (e) {
                    await m.reply(caption.trim());
                }
            } else {
                await m.reply(caption.trim());
            }
            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
        } catch (e) {
            console.error(e);
            await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } }).catch(() => {});
            m.reply(`❌ Error: ${e.message}`);
        }
    }
};

handler.command = ['animesearch', 'otakusearch', 'animedetail', 'otakudetail', 'animeepisode', 'otakudownload'];
handler.help = ['animesearch <query>', 'animedetail <slug>'];
handler.tags = ['anime'];
handler.limit = 1;
export default handler;
