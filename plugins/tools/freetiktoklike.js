import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`❤️ *FREE TIKTOK LIKE INJECTION*\n\nSuntik like gratis ke video TikTok!\nContoh:\n${usedPrefix + command} https://vt.tiktok.com/xxxx`);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        let url = text.trim();
        let apiKey = global.apikey?.jereapi;
        let apiUrl = `${global.web}/api/tools/freetiktoklike?apikey=${apiKey}&url=${encodeURIComponent(url)}`;

        let res = await fetch(apiUrl, { method: 'POST' });
        let json = await res.json();

        if (!json.status) throw new Error(json.error || json.message || "Gagal menyuntikkan like TikTok.");

        let caption = `❤️ *TIKTOK LIKE INJECTION BERHASIL*\n\n`;
        caption += `🔗 *Target Video:* ${url}\n`;
        caption += `✨ *Status:* Berhasil dikirim ke queue hulu\n\n`;
        caption += `✅ *Request by:* ${m.pushName || 'User'}`;

        await m.reply(caption);
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ *TikTok Like Gagal*\nError: ${e.message}`);
    }
};

handler.help = ['freetiktoklike <url tiktok>'];
handler.tags = ['tools'];
handler.command = /^(freetiktoklike|injectlike|liketiktok)$/i;

handler.limit = 1;
export default handler;
