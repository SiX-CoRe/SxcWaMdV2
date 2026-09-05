import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text || !text.trim()) {
        return m.reply(`⚠️ *Masukkan kata kunci foto/gambar yang ingin dicari di Pinterest!*\nContoh: *${usedPrefix + command} windah basudara* atau *${usedPrefix + command} anime aesthetic*`);
    }

    const query = text.trim();

    // Jika input adalah URL Pinterest, arahkan otomatis ke Downloader
    if (/https?:\/\/(www\.)?(id\.)?(pinterest\.(com|co\.[a-z]{2}|[a-z]{2})|pin\.it)/i.test(query)) {
        await m.react('⏳').catch(() => {});
        try {
            const apiKey = global.apikey?.jereapi;
            const res = await fetch(`${global.web}/api/downloader/pin?apikey=${apiKey}&url=${encodeURIComponent(query)}`);
            const json = await res.json();
            if (!json.status || !json.result) throw new Error(json.error || 'Gagal memproses link Pinterest');

            const resData = json.result;
            const mediaUrl = resData.url || resData.download_url || resData.image || resData.video || (typeof resData === 'string' ? resData : null);
            if (!mediaUrl) throw new Error('Media tidak ditemukan');

            const isVideo = resData.type === 'video' || /\.(mp4|mov|avi)($|\?)/i.test(mediaUrl);
            const caption = `📌 *PINTEREST DOWNLOADER*\n\n✨ *Request by:* ${m.pushName || 'User'}`;

            if (isVideo) {
                await conn.sendMessage(m.chat, { video: { url: mediaUrl }, caption }, { quoted: m });
            } else {
                await conn.sendMessage(m.chat, { image: { url: mediaUrl }, caption }, { quoted: m });
            }
            return await m.react('✅').catch(() => {});
        } catch (e) {
            await m.react('❌').catch(() => {});
            return m.reply(`❌ Gagal download: ${e.message}`);
        }
    }

    // Pencarian Multi-Foto / Album Pinterest
    await m.react('⏳').catch(() => {});
    try {
        const apiKey = global.apikey?.jereapi;
        const res = await fetch(`${global.web}/api/search/pin?apikey=${apiKey}&q=${encodeURIComponent(query)}&limit=25`);
        const json = await res.json();

        const pins = json.result?.pins || json.result || json.data || [];
        if (!json.status || !pins.length) {
            await m.react('❌').catch(() => {});
            return m.reply(`❌ Foto Pinterest tidak ditemukan untuk kata kunci: "${query}"`);
        }

        // Ambil 5 foto berkualitas terbaik yang memiliki URL gambar
        const validPins = pins.filter(p => p && (p.image || p.url)).slice(0, 5);
        if (!validPins.length) {
            await m.react('❌').catch(() => {});
            return m.reply("❌ Tidak ditemukan gambar Pinterest yang valid.");
        }

        const albumItems = validPins.map((p, idx) => {
            const imgUrl = p.image || p.url;
            if (idx === 0) {
                return {
                    image: { url: imgUrl },
                    caption: `📌 *PINTEREST ALBUM SEARCH*\n\n` +
                             `• *Pencarian:* ${query}\n` +
                             `• *Hasil Ditemukan:* ${validPins.length} Foto\n` +
                             `• *Judul:* ${p.title || query}\n` +
                             (p.url ? `• 🔗 *Link:* ${p.url}\n` : '') +
                             `\n✨ *Request by:* ${m.pushName || 'User'}`
                };
            }
            return {
                image: { url: imgUrl },
                caption: `📌 *${p.title || `${query} (${idx + 1})`}*\n${p.url ? `🔗 ${p.url}` : ''}`
            };
        });

        // Kirim sebagai WhatsApp Album Message (Grid Album)
        if (typeof conn.sendAlbum === 'function' && albumItems.length > 1) {
            await conn.sendAlbum(m.chat, albumItems, { quoted: m, delay: 350 });
        } else {
            // Fallback kirim foto pertama jika sendAlbum tidak tersedia
            await conn.sendMessage(m.chat, albumItems[0], { quoted: m });
        }

        await m.react('✅').catch(() => {});
    } catch (e) {
        console.error('[Pinterest Album Search Error]', e);
        await m.react('❌').catch(() => {});
        m.reply("❌ Gagal mencari album gambar di Pinterest: " + (e.message || 'Coba lagi nanti.'));
    }
};

handler.help = ['pin <query>', 'pinterest <query>', 'pinalbum <query>'];
handler.tags = ['search'];
handler.command = /^(pin|pinterest|pinalbum|pinsearch)$/i;

handler.limit = 1;
export default handler;
