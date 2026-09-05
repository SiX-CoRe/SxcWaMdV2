import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`⚠️ Masukkan slug anime atau slug episode!\n\nContoh:\n*${usedPrefix + command} blue-lock*\n*${usedPrefix + command} blue-lock-episode-1-sub-indo*`);
    
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
    try {
        let apiKey = global.apikey?.jereapi || global.apiKey;
        let url = `${global.web}/api/anime/otakudesu-detail-download?apikey=${apiKey}&slug=${encodeURIComponent(text.trim())}`;
        
        let res = await fetch(url);
        let json = await res.json();
        
        if (json.status && (json.result || json.data)) {
            let resData = json.result || json.data;
            const botName = (global.botname || 'BOT').toUpperCase();
            let txt = `🎬 *${botName} - OTAKUDESU DETAIL*\n\n`;

            if (resData.title) txt += `🏷️ *Judul:* ${resData.title}\n`;
            if (resData.type) txt += `📌 *Tipe:* ${resData.type.toUpperCase()}\n`;

            // Detail Metadata
            if (resData.info && typeof resData.info === 'object') {
                txt += `\n📋 *INFORMASI ANIME:*\n`;
                for (let k in resData.info) {
                    if (typeof resData.info[k] !== 'function' && typeof resData.info[k] !== 'object') {
                        const label = k.replace(/_/g, ' ').toUpperCase();
                        txt += `• *${label}:* ${resData.info[k]}\n`;
                    }
                }
            }

            // Sinopsis
            if (resData.sinopsis) {
                txt += `\n📖 *SINOPSIS:*\n${resData.sinopsis}\n`;
            }

            // Episode List
            if (Array.isArray(resData.episodes) && resData.episodes.length > 0) {
                txt += `\n📺 *DAFTAR EPISODE (${resData.episodes.length}):*\n`;
                for (let i = 0; i < Math.min(resData.episodes.length, 15); i++) {
                    let ep = resData.episodes[i];
                    if (!ep || typeof ep === 'function') continue;
                    txt += `• *${ep.title || 'Episode'}*\n  Slug: \`${ep.slug || '-'}\`${ep.releaseDate ? ` | Rilis: ${ep.releaseDate}` : ''}\n`;
                }
                if (resData.episodes.length > 15) {
                    txt += `... dan ${resData.episodes.length - 15} episode lainnya.\n`;
                }
                txt += `\n💡 *Tip:* Ketik *${usedPrefix}${command} <slug-episode>* untuk melihat link download episode.\n`;
            }

            // Streaming mirrors
            if (resData.streams && typeof resData.streams === 'object') {
                let streamKeys = Object.keys(resData.streams).filter(k => typeof resData.streams[k] !== 'function');
                if (streamKeys.length > 0) {
                    txt += `\n▶️ *STREAMING MIRRORS:*\n`;
                    for (let sKey of streamKeys) {
                        txt += `• *${sKey}:* ${resData.streams[sKey]}\n`;
                    }
                }
            }

            // Downloads
            if (Array.isArray(resData.downloads) && resData.downloads.length > 0) {
                txt += `\n📥 *DOWNLOAD LINKS:*\n`;
                for (let dlGroup of resData.downloads) {
                    if (!dlGroup || typeof dlGroup === 'function') continue;
                    txt += `\n*[ ${dlGroup.group || 'Download'} ]*\n`;
                    if (Array.isArray(dlGroup.items)) {
                        for (let item of dlGroup.items) {
                            if (!item || typeof item === 'function') continue;
                            txt += `• *${item.resolution || '-'}* (${item.size || '-'}):\n`;
                            if (Array.isArray(item.links)) {
                                for (let l of item.links) {
                                    if (!l || typeof l === 'function') continue;
                                    txt += `  - ${l.host || 'Link'}: ${l.url || '-'}\n`;
                                }
                            }
                        }
                    }
                }
            }

            let posterUrl = resData.poster || resData.thumb || resData.image;
            if (posterUrl && typeof posterUrl === 'string' && posterUrl.startsWith('http')) {
                try {
                    await conn.sendMessage(m.chat, {
                        image: { url: posterUrl },
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
            m.reply(json.error || json.message || 'Gagal memproses data anime. Cek kembali slug anime.');
        }
    } catch (e) {
        console.error('[Otakudesu Detail Error]', e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } }).catch(() => {});
        m.reply('Terjadi kesalahan: ' + (e.message || 'Server error.'));
    }
}

handler.help = ['otakudesu-detail-download <slug>']
handler.tags = ['anime']
handler.command = /^(otakudesu-detail-download|otakudesudetaildownload|otakudetail|otakudownload|animedetail|animeepisode)$/i
handler.premium = false
handler.limit = 1;

export default handler;
