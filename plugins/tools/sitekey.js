import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`🔑 *SITEKEY EXTRACTOR*\n\nEkstrak SiteKey Cloudflare Turnstile / reCaptcha dari website!\nContoh:\n${usedPrefix + command} https://example.com`);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        let url = text.trim();
        let apiKey = global.apikey?.jereapi;
        let apiUrl = `${global.web}/api/tools/sitekey?apikey=${apiKey}&url=${encodeURIComponent(url)}`;

        let res = await fetch(apiUrl);
        let json = await res.json();

        if (!json.status) throw new Error(json.error || json.detail || "Sitekey tidak ditemukan.");

        let data = json.result || json.data || {};
        let caption = `🔑 *SITEKEY BERHASIL DITEMUKAN*\n\n`;
        caption += `🔗 *Target:* ${url}\n`;
        caption += `🛡️ *Tipe:* ${data.type || 'Cloudflare / Captcha'}\n`;
        caption += "🔐 *Sitekey:*\n\`\`\`" + (data.sitekey || data.key || json.sitekey || '-') + "\`\`\`\n\n";
        if (data.source) caption += `📜 *Sumber:* ${data.source}\n\n`;
        caption += `✅ *Request by:* ${m.pushName || 'User'}`;

        await m.reply(caption);
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ *Ekstrak Sitekey Gagal*\nError: ${e.message}`);
    }
};

handler.help = ['sitekey <url>', 'getsitekey <url>'];
handler.tags = ['tools'];
handler.command = /^(sitekey|getsitekey|extractsitekey)$/i;

handler.limit = 1;
export default handler;
