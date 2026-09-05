import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`🛡️ *URL SCAN & SECURITY ANALYZER*\n\nPeriksa keamanan tautan dari phising, malware, dan virus!\nContoh:\n${usedPrefix + command} https://example.com`);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        let url = text.trim();
        let apiKey = global.apikey?.jereapi;
        let apiUrl = `${global.web}/api/tools/urlscan?apikey=${apiKey}`;

        let res = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });

        let json = await res.json();
        if (!json.status) throw new Error(json.error || json.detail || "Gagal menganalisis URL.");

        let data = json.result || {};
        let caption = `🛡️ *HASIL SCAN KEAMANAN URL*\n\n`;
        caption += `🔗 *Target:* ${url}\n`;
        caption += `📊 *Status:* ${data.status || 'Aman / Terverifikasi'}\n`;
        if (data.ip) caption += `🌐 *IP Server:* ${data.ip}\n`;
        if (data.country) caption += `📍 *Negara:* ${data.country}\n`;
        if (data.verdict) caption += `⚠️ *Verdict:* ${data.verdict}\n`;
        caption += `\n✅ *Request by:* ${m.pushName || 'User'}`;

        await m.reply(caption);
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ *Scan URL Gagal*\nError: ${e.message}`);
    }
};

handler.help = ['urlscan <url>', 'ceklink <url>'];
handler.tags = ['tools'];
handler.command = /^(urlscan|ceklink|scanlink|safelink)$/i;

handler.limit = 1;
export default handler;
