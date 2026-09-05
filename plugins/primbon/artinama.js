import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const nama = (text || '').trim();
    if (!nama) return m.reply(`⚠️ Masukkan nama yang ingin dicari artinya!\n\nContoh: *${usedPrefix}${command} Lumnztyz*`);

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        let apiKey = global.apikey?.jereapi || global.apiKey;
        let url = `${global.web}/api/primbon/artinama?apikey=${apiKey}&nama=${encodeURIComponent(nama)}`;
        
        let res = await fetch(url);
        let json = await res.json();
        
        if (json.status && (json.result || json.data)) {
            let resData = json.result || json.data;
            let artiText = (typeof resData === 'object' && resData.arti) ? resData.arti : (typeof resData === 'string' ? resData : JSON.stringify(resData, null, 2));

            let card = `╭─「 🔮 *PRIMBON - ARTI NAMA* 」\n`;
            card += `├ 👤 *Nama:* ${nama}\n`;
            card += `╰────────────────────\n\n`;
            card += `📜 *Makna & Karakter Nama:*\n${artiText}\n\n`;
            card += `_Nama adalah doa dan harapan baik dari orang tua._`;

            await m.reply(card.trim());
            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
        } else {
            throw new Error(json.error || json.message || "Arti nama tidak ditemukan.");
        }
    } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        console.error(e);
        m.reply("❌ Error: " + e.message);
    }
};

handler.help = ['artinama <nama>'];
handler.tags = ['primbon'];
handler.command = /^(artinama|maknanama)$/i;
handler.limit = 1;
export default handler;
