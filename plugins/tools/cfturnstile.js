import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`🛡️ *CLOUDFLARE TURNSTILE BYPASS*\n\nBypass Cloudflare Turnstile CAPTCHA untuk mendapatkan token valid!\n\n*Format:*\n${usedPrefix + command} <url>|<sitekey>\n\n*Contoh:*\n${usedPrefix + command} https://target.com|0x4AAAAAA...`);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        m.reply("⏳ Menyelesaikan challenge Cloudflare Turnstile... Mohon tunggu.");

        let [url, sitekey] = text.split('|').map(s => s.trim());
        let apiKey = global.apikey?.jereapi;
        let apiUrl = `${global.web}/api/tools/cfturnstile?apikey=${apiKey}`;

        let res = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, sitekey, mode: 'max' })
        });

        let json = await res.json();
        if (!json.status) throw new Error(json.error || json.message || "Gagal membypass Turnstile.");

        let token = json.result || json.token || json.data?.token || JSON.stringify(json.result);

        let caption = `🛡️ *CLOUDFLARE TURNSTILE BYPASS BERHASIL*\n\n`;
        caption += `🔗 *Target:* ${url}\n`;
        caption += "🔑 *Turnstile Token:*\n\`\`\`" + token + "\`\`\`\n\n";
        caption += `✅ *Request by:* ${m.pushName || 'User'}`;

        await m.reply(caption);
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ *Turnstile Bypass Gagal*\nError: ${e.message}`);
    }
};

handler.help = ['cfturnstile <url>|<sitekey>', 'turnstilebypass <url>|<sitekey>'];
handler.tags = ['tools'];
handler.command = /^(cfturnstile|turnstilebypass|bypassturnstile)$/i;

handler.limit = 1;
export default handler;
