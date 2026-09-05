import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`Contoh: ${usedPrefix + command} https://sfl.gl/xxxx`);
    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        let apiKey = global.apikey?.jereapi;
        let res = await fetch(`${global.web}/api/tools/bypas-sfl?apikey=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: text.trim() })
        });
        let json = await res.json();
        if (!json.status) throw new Error(json.error || "Gagal bypass sfl");
        let data = json.result || {};
        m.reply(`🔓 *SFL BYPASS*\n\n🎯 *Tujuan:* ${data.bypassed_url || '-'}`);
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } catch (e) {
        m.reply(`❌ Error: ${e.message}`);
    }
};

handler.help = ['sfl <url>'];
handler.tags = ['tools'];
handler.command = /^sfl$/i;
handler.limit = 1;
export default handler;
