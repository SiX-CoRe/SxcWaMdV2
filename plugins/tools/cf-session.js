import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`🛡️ *CLOUDFLARE SESSION EXTRACTOR*\n\nContoh:\n${usedPrefix + command} https://target.com`);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        let url = text.trim();
        let apiKey = global.apikey?.jereapi;
        let apiUrl = `${global.web}/api/tools/cf-session?apikey=${apiKey}&url=${encodeURIComponent(url)}`;

        let res = await fetch(apiUrl);
        let json = await res.json();

        if (!json.status) throw new Error(json.error || "Gagal mendapatkan session cookies.");

        let caption = `🛡️ *CLOUDFLARE SESSION COOKIES*\n\n`;
        caption += `🔗 *Target:* ${url}\n`;
        caption += "🍪 *Cookies:*\n\`\`\`" + JSON.stringify(json.data?.cookies || json.result?.cookies || json.data, null, 2, null, 2) + "\`\`\`\n\n";
        caption += `✅ *Request by:* ${m.pushName || 'User'}`;

        await m.reply(caption);
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ *CF Session Gagal*\nError: ${e.message}`);
    }
};

handler.help = ['cf-session <url>', 'cfsession <url>'];
handler.tags = ['tools'];
handler.command = /^(cf-session|cfsession|cfcookies)$/i;

handler.limit = 1;
export default handler;
