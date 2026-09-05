import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let nomor = (text || '').replace(/[^0-9]/g, '');
    if (!nomor) return m.reply(`⚠️ Masukkan nomor HP yang ingin dicek energinya!\n\nContoh: *${usedPrefix}${command} 081234567890*`);

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        let apiKey = global.apikey?.jereapi || global.apiKey;
        let url = `${global.web}/api/primbon/nomorhoki?apikey=${apiKey}&nomor=${encodeURIComponent(nomor)}`;
        
        let res = await fetch(url);
        let json = await res.json();
        
        if (json.status && (json.result || json.data)) {
            let resData = json.result || json.data;

            let card = `╭─「 🔮 *PRIMBON - CEK ENERGI NOMOR HOKI* 」\n`;
            card += `├ 📱 *Nomor HP:* ${nomor}\n`;
            if (resData.angka_bagua_shuzi) card += `├ 🔢 *Angka Bagua Shuzi:* ${resData.angka_bagua_shuzi}\n`;
            card += `╰────────────────────\n\n`;

            if (resData.energi_positif && typeof resData.energi_positif === 'object') {
                card += `🌟 *POTENSI ENERGI POSITIF (${resData.energi_positif.total || 0}%):*\n`;
                for (let [k, v] of Object.entries(resData.energi_positif)) {
                    if (k !== 'total' && typeof v !== 'object') {
                        card += `• *${k.replace(/_/g, ' ')}:* ${v}\n`;
                    }
                }
                card += `\n`;
            }

            if (resData.energi_negatif && typeof resData.energi_negatif === 'object') {
                card += `⚡ *POTENSI ENERGI NEGATIF (${resData.energi_negatif.total || 0}%):*\n`;
                for (let [k, v] of Object.entries(resData.energi_negatif)) {
                    if (k !== 'total' && typeof v !== 'object') {
                        card += `• *${k.replace(/_/g, ' ')}:* ${v}\n`;
                    }
                }
                card += `\n`;
            }

            if (!resData.angka_bagua_shuzi && !resData.energi_positif) {
                for (let [k, v] of Object.entries(resData)) {
                    if (typeof v !== 'object') {
                        card += `• *${k}:* ${v}\n`;
                    }
                }
                card += `\n`;
            }

            card += `_Perhitungan berdasarkan rumus metafisika & Bagua Shuzi._`;

            await m.reply(card.trim());
            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
        } else {
            throw new Error(json.error || json.message || "Gagal mengecek nomor hoki. Pastikan nomor berupa angka valid.");
        }
    } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        console.error(e);
        m.reply("❌ Error: " + e.message);
    }
};

handler.help = ['nomorhoki <nomor_hp>'];
handler.tags = ['primbon'];
handler.command = /^(nomorhoki|cekhoki|nomorkeberuntungan)$/i;
handler.limit = 1;
export default handler;
