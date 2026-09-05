import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const cleanText = (text || '').trim();
    if (!cleanText) return m.reply(`⚠️ Masukkan tanggal lahir Anda!\n\nContoh: *${usedPrefix}${command} 1|1|2000*\nContoh: *${usedPrefix}${command} 15 8 1998*`);

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        let apiKey = global.apikey?.jereapi || global.apiKey;

        let parts = cleanText.split(/[|\s\/-]+/).filter(Boolean);
        if (parts.length < 3) {
            throw new Error(`Format tanggal tidak lengkap!\nGunakan format: *${usedPrefix}${command} <tgl>|<bln>|<thn>*\nContoh: *${usedPrefix}${command} 1|1|2000*`);
        }

        let [tgl, bln, thn] = parts;
        let url = `${global.web}/api/primbon/cek_potensi_penyakit?apikey=${apiKey}&tgl=${encodeURIComponent(tgl)}&bln=${encodeURIComponent(bln)}&thn=${encodeURIComponent(thn)}`;
        
        let res = await fetch(url);
        let json = await res.json();
        
        if (json.status && (json.result || json.data)) {
            let resData = json.result || json.data;

            let card = `╭─「 🔮 *PRIMBON - POTENSI PENYAKIT* 」\n`;
            card += `├ 📅 *Tanggal Lahir:* ${tgl}-${bln}-${thn}\n`;
            card += `╰────────────────────\n\n`;

            if (typeof resData === 'object' && resData !== null) {
                if (resData.analisa || resData.hasil) card += `🩺 *Analisa Potensi Penyakit:*\n${resData.analisa || resData.hasil}\n\n`;
                if (resData.sektor_organ) card += `🫀 *Organ Rentan:*\n${resData.sektor_organ}\n\n`;
                if (resData.pencegahan || resData.saran) card += `💡 *Saran Pencegahan:*\n${resData.pencegahan || resData.saran}\n\n`;
            } else {
                card += `${resData}\n\n`;
            }

            card += `_Catatan: Hasil analisa berdasarkan petung primbon kuno, selalu jaga pola hidup sehat._`;

            await m.reply(card.trim());
            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
        } else {
            throw new Error(json.error || json.message || "Gagal memproses analisa potensi penyakit.");
        }
    } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        console.error(e);
        m.reply("❌ Error: " + e.message);
    }
};

handler.help = ['cekpotensipenyakit <tgl>|<bln>|<thn>'];
handler.tags = ['primbon'];
handler.command = /^(cekpotensipenyakit|cek_potensi_penyakit|potensipenyakit|cekkesehatan)$/i;
handler.limit = 1;
export default handler;
