import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`🔓 *SFL.GL BYPASS*\n\nLewati tautan Safelink sfl.gl / sfile!\nContoh:\n${usedPrefix + command} https://sfl.gl/xxxx`);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        let url = text.trim();
        let apiKey = global.apikey?.jereapi;
        let apiUrl = `${global.web}/api/tools/bypas-sfl?apikey=${apiKey}`;

        let res = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });

        let json = await res.json();
        if (!json.status) throw new Error(json.error || json.detail || "Gagal membypass link sfl.");

        let data = json.result || {};
        let caption = `🔓 *SFL BYPASS BERHASIL*\n\n`;
        caption += `🔗 *Link Asal:*\n${data.original_url || url}\n\n`;
        caption += `🎯 *Link Tujuan:*\n${data.bypassed_url || '-'}\n\n`;
        caption += `⏱️ *Waktu Proses:* ${json.time_taken || data.time_taken || '-'}s\n\n`;
        caption += `✅ *Request by:* ${m.pushName || 'User'}`;

        await m.reply(caption);
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ *Bypass SFL Gagal*\nError: ${e.message}`);
    }
};

handler.help = ['bypas-sfl <url>', 'bypasssfl <url>'];
handler.tags = ['tools'];
handler.command = /^(bypas-sfl|bypasssfl|sflbypass)$/i;

handler.limit = 1;
export default handler;
