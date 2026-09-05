import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const cleanText = (text || '').trim();
    if (!cleanText) {
        return m.reply(`⚠️ Masukkan data lengkap Anda dan Pasangan!\n\nFormat: *${usedPrefix}${command} nama1|tgl1|bln1|thn1|nama2|tgl2|bln2|thn2*\nContoh: *${usedPrefix}${command} Budi|1|1|2000|Ani|2|2|2001*`);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        let apiKey = global.apikey?.jereapi || global.apiKey;

        let parts = cleanText.split(/[|,]/).map(v => v.trim()).filter(Boolean);
        if (parts.length < 8) {
            throw new Error(`Data kurang lengkap! Diperlukan 8 parameter:\n*${usedPrefix}${command} nama1|tgl1|bln1|thn1|nama2|tgl2|bln2|thn2*\nContoh: *${usedPrefix}${command} Budi|1|1|2000|Ani|2|2|2001*`);
        }

        let [nama1, tgl1, bln1, thn1, nama2, tgl2, bln2, thn2] = parts;
        let url = `${global.web}/api/primbon/ramalanjodohbali?apikey=${apiKey}&nama1=${encodeURIComponent(nama1)}&tgl1=${encodeURIComponent(tgl1)}&bln1=${encodeURIComponent(bln1)}&thn1=${encodeURIComponent(thn1)}&nama2=${encodeURIComponent(nama2)}&tgl2=${encodeURIComponent(tgl2)}&bln2=${encodeURIComponent(bln2)}&thn2=${encodeURIComponent(thn2)}`;
        
        let res = await fetch(url);
        let json = await res.json();
        
        if (json.status && (json.result || json.data)) {
            let resData = json.result || json.data;

            let p1 = resData.nama_anda || {};
            let p2 = resData.nama_pasangan || {};
            let hasil = resData.result || resData.deskripsi || (typeof resData === 'string' ? resData : JSON.stringify(resData, null, 2));

            let card = `╭─「 🔮 *PRIMBON - RAMALAN JODOH BALI* 」\n`;
            card += `├ 🤵 *Nama Anda:* ${p1.nama || nama1} (${p1.tgl_lahir || `${tgl1}-${bln1}-${thn1}`})\n`;
            card += `├ 👰 *Nama Pasangan:* ${p2.nama || nama2} (${p2.tgl_lahir || `${tgl2}-${bln2}-${thn2}`})\n`;
            card += `╰────────────────────\n\n`;
            card += `📜 *Hasil Perhitungan Pertemuan (Petemon Bali):*\n${hasil}\n\n`;
            card += `_Perhitungan berdasarkan sistem kalender Pawukon & Wuku adat Bali._`;

            await m.reply(card.trim());
            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
        } else {
            throw new Error(json.error || json.message || "Gagal memproses ramalan jodoh Bali. Pastikan data tanggal lahir benar.");
        }
    } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        console.error(e);
        m.reply("❌ Error: " + e.message);
    }
};

handler.help = ['ramalanjodohbali <nama1|tgl1|bln1|thn1|nama2|tgl2|bln2|thn2>'];
handler.tags = ['primbon'];
handler.command = /^(ramalanjodohbali|jodohbali|petemonbali)$/i;
handler.limit = 1;
export default handler;
