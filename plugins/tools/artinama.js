import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`🔮 *PRIMBON ARTI NAMA*\n\nContoh:\n${usedPrefix + command} Jere`);
    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        let apiKey = global.apikey?.jereapi;
        let res = await fetch(`${global.web}/api/primbon/artinama?apikey=${apiKey}&nama=${encodeURIComponent(text.trim())}`);
        let json = await res.json();
        if (!json.status) throw new Error(json.error || "Arti nama tidak ditemukan.");
        let data = json.data || json.result || {};
        let caption = `🔮 *ARTI NAMA*\n\n`;
        caption += `👤 *Nama:* ${text}\n`;
        caption += `📖 *Makna:*\n${data.arti || data.makna || JSON.stringify(data)}\n\n`;
        caption += `✅ *Request by:* ${m.pushName || 'User'}`;
        await m.reply(caption);
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } catch (e) {
        m.reply(`❌ Error: ${e.message}`);
    }
};

handler.help = ['artinama <nama>'];
handler.tags = ['tools'];
handler.command = /^(artinama|maknanama)$/i;
handler.limit = 1;
export default handler;
