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
        let url = `${global.web}/api/primbon/ramalanjodoh?apikey=${apiKey}&nama1=${encodeURIComponent(nama1)}&tgl1=${encodeURIComponent(tgl1)}&bln1=${encodeURIComponent(bln1)}&thn1=${encodeURIComponent(thn1)}&nama2=${encodeURIComponent(nama2)}&tgl2=${encodeURIComponent(tgl2)}&bln2=${encodeURIComponent(bln2)}&thn2=${encodeURIComponent(thn2)}`;
        
        let res = await fetch(url);
        let json = await res.json();
        
        if (json.status && (json.result || json.data)) {
            let resData = json.result || json.data;
            let resultObj = resData.result || resData;

            let p1 = resultObj.orang_pertama || resultObj.nama_anda || {};
            let p2 = resultObj.orang_kedua || resultObj.nama_pasangan || {};
            let deskripsi = resultObj.deskripsi || resultObj.result || (typeof resultObj === 'string' ? resultObj : JSON.stringify(resultObj, null, 2));

            let card = `╭─「 🔮 *PRIMBON - RAMALAN JODOH JAWA* 」\n`;
            card += `├ 🤵 *Pria:* ${p1.nama || nama1} (${p1.tanggal_lahir || `${tgl1}-${bln1}-${thn1}`})\n`;
            card += `├ 👰 *Wanita:* ${p2.nama || nama2} (${p2.tanggal_lahir || `${tgl2}-${bln2}-${thn2}`})\n`;
            card += `╰────────────────────\n\n`;
            card += `📜 *Hasil Ramalan Petung Jodoh:*\n${deskripsi}\n\n`;
            card += `_Perhitungan berdasarkan kitab primbon perjodohan Jawa (Weton & Neptu)._`;

            await m.reply(card.trim());
            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
        } else {
            throw new Error(json.error || json.message || "Gagal memproses ramalan jodoh. Pastikan tanggal dan tahun lahir berupa angka valid.");
        }
    } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        console.error(e);
        m.reply("❌ Error: " + e.message);
    }
};

handler.help = ['ramalanjodoh <nama1|tgl1|bln1|thn1|nama2|tgl2|bln2|thn2>'];
handler.tags = ['primbon'];
handler.command = /^(ramalanjodoh|ramaljodoh|petungjodoh)$/i;
handler.limit = 1;
export default handler;
