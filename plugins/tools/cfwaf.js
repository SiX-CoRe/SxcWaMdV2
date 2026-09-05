import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`🛡️ *CLOUDFLARE WAF BYPASS*\n\nContoh:\n${usedPrefix + command} https://target-waf.com`);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        let url = text.trim();
        let apiKey = global.apikey?.jereapi;
        let apiUrl = `${global.web}/api/tools/cfwaf?apikey=${apiKey}`;

        let res = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, mode: 'waf' })
        });

        let json = await res.json();
        if (!json.status) throw new Error(json.error || json.message || "Gagal membypass Cloudflare WAF.");

        let caption = `🛡️ *CLOUDFLARE WAF BYPASS BERHASIL*\n\n`;
        caption += `🔗 *Target:* ${url}\n`;
        caption += `📊 *Respon:* ${JSON.stringify(json.result || json.data, null, 2)}\n\n`;
        caption += `✅ *Request by:* ${m.pushName || 'User'}`;

        await m.reply(caption);
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ *CF WAF Gagal*\nError: ${e.message}`);
    }
};

handler.help = ['cfwaf <url>', 'bypasswaf <url>'];
handler.tags = ['tools'];
handler.command = /^(cfwaf|bypasswaf|cloudflaresolver)$/i;

handler.limit = 1;
export default handler;
