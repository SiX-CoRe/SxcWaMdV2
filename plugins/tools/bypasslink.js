import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`🔓 *SHORTLINK BYPASS*\n\nLewati tautan iklan dan shortlink (Safelink, Ouou, Shorturl, dll)!\nContoh:\n${usedPrefix + command} https://ouo.io/xxxx`);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        let url = text.trim();
        let apiKey = global.apikey?.jereapi;
        let apiUrl = `${global.web}/api/tools/bypasslink?apikey=${apiKey}`;

        let res = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });

        let json = await res.json();
        if (!json.status) throw new Error(json.error || json.detail || "Gagal melakukan bypass pada link tersebut.");

        let data = json.result || {};
        let caption = `🔓 *BYPASS LINK BERHASIL*\n\n`;
        caption += `🔗 *Original URL:*\n${data.original_url || url}\n\n`;
        caption += `🎯 *Bypassed URL:*\n${data.bypassed_url || '-'}\n\n`;
        caption += `🌐 *Platform:* ${data.platform || 'Unknown'}\n\n`;
        caption += `✅ *Request by:* ${m.pushName || 'User'}`;

        await m.reply(caption);
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ *Bypass Gagal*\nError: ${e.message}`);
    }
};

handler.help = ['bypasslink <url>', 'bypass <url>'];
handler.tags = ['tools'];
handler.command = /^(bypasslink|bypass|shortlinkbypass|safelinkbypass)$/i;

handler.limit = 1;
export default handler;
