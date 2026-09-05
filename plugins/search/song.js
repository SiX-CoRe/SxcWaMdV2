let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`🎵 *SXCWA-MD - CARI LAGU / LIRIK*\n\n📌 *Cara penggunaan:*\n> \`${usedPrefix + command} <judul lagu / artis / lirik>\`\n\n📝 *Contoh:*\n> \`${usedPrefix + command} daniel caesar who knows\``);
    }
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
    try {
        const API_KEY = global.apikey?.jereapi;
        if (!API_KEY || API_KEY === "MASUKAN_API_KEY_KAMU_DISINI") {
            return m.reply("❌ API Key belum dikonfigurasi di config.js!");
        }
        const res = await fetch(`${global.web}/api/search/lirik?apikey=${API_KEY}&q=${encodeURIComponent(text)}`);
        const json = await res.json();
        if (!json.status || !json.data) {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return m.reply(`❌ *Tidak ditemukan lirik untuk:* "${text}"`);
        }
        const p = json.data;
        let caption = `🎵 *SXCWA-MD - HASIL PENCARIAN LAGU*\n\n` +
            `📌 *Judul:* ${p.title || '-'}\n` +
            `👤 *Artis:* ${p.artist || '-'}\n` +
            `💿 *Album:* ${p.album || '-'}\n` +
            `📅 *Rilis:* ${p.release_date || '-'}\n\n` +
            `📝 *Lirik:*\n${p.lyrics}\n\n` +
            `✨ *SxcWaMd Music*`;

        if (p.cover) {
            await conn.sendMessage(m.chat, {
                image: { url: p.cover },
                caption: caption
            }, { quoted: m }).catch(() => m.reply(caption));
        } else {
            await m.reply(caption);
        }
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } catch (error) {
        console.error('Error search song:', error);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        m.reply(`❌ *Gagal mencari lirik lagu:* ${error.message}`);
    }
};

handler.help = ['song <judul>'];
handler.tags = ['search'];
handler.command = ['song', 'carilagu'];

handler.limit = 1;
export default handler;
