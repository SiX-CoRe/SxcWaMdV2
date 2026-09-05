import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const mimpi = (text || '').trim();
    if (!mimpi) return m.reply(`⚠️ Masukkan mimpi yang ingin dicari tafsirnya!\n\nContoh: *${usedPrefix}${command} ular*\nContoh: *${usedPrefix}${command} gigi copot*`);

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        let apiKey = global.apikey?.jereapi || global.apiKey;
        let url = `${global.web}/api/primbon/tafsirmimpi?apikey=${apiKey}&mimpi=${encodeURIComponent(mimpi)}`;
        
        let res = await fetch(url);
        let json = await res.json();
        
        if (json.status && (json.result || json.data)) {
            let resData = json.result || json.data;

            let card = `╭─「 🔮 *PRIMBON - TAFSIR MIMPI* 」\n`;
            card += `├ 🔍 *Kata Kunci:* ${resData.keyword || mimpi}\n`;
            if (Array.isArray(resData.hasil)) card += `├ 📑 *Total Ditemukan:* ${resData.hasil.length} Tafsir\n`;
            card += `╰────────────────────\n\n`;

            if (Array.isArray(resData.hasil) && resData.hasil.length > 0) {
                for (let i = 0; i < Math.min(resData.hasil.length, 12); i++) {
                    let item = resData.hasil[i];
                    card += `🌙 *Mimpi:* _${item.mimpi}_\n`;
                    card += `📖 *Tafsir:* ${item.tafsir}\n\n`;
                }
                if (resData.hasil.length > 12) {
                    card += `_...dan ${resData.hasil.length - 12} kemungkinan tafsir lainnya._\n\n`;
                }
            } else if (typeof resData === 'object' && resData.tafsir) {
                card += `📖 *Tafsir:* ${resData.tafsir}\n\n`;
            } else if (typeof resData === 'string') {
                card += `${resData}\n\n`;
            } else {
                card += `${JSON.stringify(resData, null, 2)}\n\n`;
            }

            card += `_Mimpi adalah bunga tidur, jadikan tafsir sebagai bahan mawas diri & introspeksi._`;

            await m.reply(card.trim());
            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
        } else {
            throw new Error(json.error || json.message || `Tafsir tentang mimpi "${mimpi}" tidak ditemukan.`);
        }
    } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        console.error(e);
        m.reply("❌ Error: " + e.message);
    }
};

handler.help = ['tafsirmimpi <mimpi>'];
handler.tags = ['primbon'];
handler.command = /^(tafsirmimpi|artimimpi|mimpi)$/i;
handler.limit = 1;
export default handler;
