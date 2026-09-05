import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`🌙 *TAFSIR ARTI MIMPI*\n\nContoh:\n${usedPrefix + command} melihat ular besar`);
    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        let apiKey = global.apikey?.jereapi;
        let res = await fetch(`${global.web}/api/primbon/tafsirmimpi?apikey=${apiKey}&mimpi=${encodeURIComponent(text.trim())}`);
        let json = await res.json();
        if (!json.status) throw new Error(json.error || "Tafsir mimpi tidak ditemukan.");
        let data = json.data || json.result || {};
        let caption = `🌙 *TAFSIR ARTI MIMPI*\n\n`;
        caption += `💭 *Mimpi:* ${text}\n`;
        caption += `📖 *Artinya:*\n${data.arti || data.tafsir || data.solusi || JSON.stringify(data)}\n\n`;
        caption += `✅ *Request by:* ${m.pushName || 'User'}`;
        await m.reply(caption);
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ Error: ${e.message}`);
    }
};

handler.help = ['artimimpitool <mimpi>'];
handler.tags = ['tools'];
handler.command = /^(artimimpitool)$/i;
handler.limit = 1;
export default handler;
