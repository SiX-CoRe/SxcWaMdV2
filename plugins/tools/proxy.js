import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`🌐 *PROXY CONNECTION CHECKER*\n\nPeriksa respon website melalui proxy tunnel global!\nContoh:\n${usedPrefix + command} https://google.com\n${usedPrefix + command} https://binance.com|US`);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        let [url, country] = text.split('|').map(s => s.trim());
        let countryCode = country || 'US';

        let apiKey = global.apikey?.jereapi;
        let apiUrl = `${global.web}/api/tools/proxy?apikey=${apiKey}&url=${encodeURIComponent(url)}&country=${encodeURIComponent(countryCode)}`;

        let res = await fetch(apiUrl);
        let json = await res.json();

        if (!json.status) throw new Error(json.error || json.detail || "Gagal melakukan proxy tunnel request.");

        let data = json.result || {};
        let caption = `🌐 *HASIL PROXY TUNNEL*\n\n`;
        caption += `🔗 *Target:* ${data.target_url || url}\n`;
        caption += `📍 *Node Country:* ${data.proxy_node || countryCode}\n`;
        caption += `📊 *HTTP Status:* ${data.proxy_status_code || '-'}\n`;
        caption += `📝 *Catatan:* ${data.note || '-'}\n\n`;
        caption += `✅ *Request by:* ${m.pushName || 'User'}`;

        await m.reply(caption);
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ *Proxy Test Gagal*\nError: ${e.message}`);
    }
};

handler.help = ['proxy <url>|<negara>', 'checkproxy <url>'];
handler.tags = ['tools'];
handler.command = /^(proxy|checkproxy|proxytest)$/i;

handler.limit = 1;
export default handler;
