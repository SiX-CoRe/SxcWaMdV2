import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`Contoh: ${usedPrefix + command} 089512345678`);
    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        let apiKey = global.apikey?.jereapi;
        let res = await fetch(`${global.web}/api/tools/cekkartutri?apikey=${apiKey}&nomor=${encodeURIComponent(text.replace(/\D/g, ''))}`);
        let json = await res.json();
        if (!json.status) throw new Error(json.error || "Gagal cek kartu Tri");
        let caption = `📱 *INFO KARTU TRI*\n\n${JSON.stringify(json.data || json.result || json, null, 2)}`;
        await m.reply(caption);
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } catch (e) {
        m.reply(`❌ Error: ${e.message}`);
    }
};

handler.help = ['cektri <nomor>'];
handler.tags = ['tools'];
handler.command = /^(cektri2|triinfo)$/i;
handler.limit = 1;
export default handler;
