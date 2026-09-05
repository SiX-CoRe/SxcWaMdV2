import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const cleanText = (text || '').trim();
    if (!cleanText) return m.reply(`⚠️ Masukkan nama Anda dan Pasangan!\n\nContoh: *${usedPrefix}${command} Romeo | Juliet*\nContoh: *${usedPrefix}${command} Budi, Ani*`);

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        let apiKey = global.apikey?.jereapi || global.apiKey;

        let parts = cleanText.split(/[|,]/).map(v => v.trim()).filter(Boolean);
        if (parts.length < 2) {
            throw new Error(`Gunakan pemisah (|) atau (,)\nContoh: *${usedPrefix}${command} Romeo | Juliet*`);
        }

        let [nama1, nama2] = parts;
        let url = `${global.web}/api/primbon/kecocokan_nama_pasangan?apikey=${apiKey}&nama1=${encodeURIComponent(nama1)}&nama2=${encodeURIComponent(nama2)}`;
        
        let res = await fetch(url);
        let json = await res.json();
        
        if (json.status && (json.result || json.data)) {
            let resData = json.result || json.data;

            let card = `╭─「 🔮 *PRIMBON - KECOCOKAN NAMA PASANGAN* 」\n`;
            card += `├ 🤵 *Pasangan 1:* ${resData.nama_anda || nama1}\n`;
            card += `├ 👰 *Pasangan 2:* ${resData.nama_pasangan || nama2}\n`;
            if (resData.persentase || resData.skor) card += `├ 💖 *Persentase Kecocokan:* ${resData.persentase || resData.skor}%\n`;
            card += `╰────────────────────\n\n`;

            if (typeof resData === 'object' && resData !== null) {
                if (resData.sisi_positif) card += `✨ *Sisi Positif Hubungan:*\n${resData.sisi_positif}\n\n`;
                if (resData.sisi_negatif) card += `⚠️ *Sisi Negatif / Tantangan:*\n${resData.sisi_negatif}\n\n`;
                if (resData.catatan || resData.deskripsi) card += `📝 *Ulasan:*\n${resData.catatan || resData.deskripsi}\n\n`;
            } else {
                card += `${resData}\n\n`;
            }

            card += `_Kunci hubungan harmonis adalah komunikasi, komitmen, dan saling percaya._`;

            await m.reply(card.trim());
            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
        } else {
            throw new Error(json.error || json.message || "Gagal memproses analisa kecocokan nama pasangan.");
        }
    } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        console.error(e);
        m.reply("❌ Error: " + e.message);
    }
};

handler.help = ['kecocokannama <nama1> | <nama2>'];
handler.tags = ['primbon'];
handler.command = /^(kecocokannama|kecocokan_nama_pasangan|cocoknama|jodohnama)$/i;
handler.limit = 1;
export default handler;
