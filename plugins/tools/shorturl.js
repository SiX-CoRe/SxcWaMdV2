import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`🔗 *SHORTEN URL TOOL*\n\nPerpendek link panjang!\nContoh:\n${usedPrefix + command} https://google.com/search?q=verylongurl`);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        let url = text.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;

        let tinyRes = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
        let tinyUrl = await tinyRes.text();

        let isgdRes = await fetch(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`).catch(() => null);
        let isgdUrl = isgdRes ? await isgdRes.text() : '';

        let caption = `🔗 *SHORT URL BERHASIL*\n\n`;
        caption += `🌐 *Link Asal:* ${url}\n\n`;
        caption += `📌 *TinyURL:* ${tinyUrl}\n`;
        if (isgdUrl && !isgdUrl.includes('Error')) caption += `📌 *Is.gd:* ${isgdUrl}\n`;
        caption += `\n✅ *Request by:* ${m.pushName || 'User'}`;

        await m.reply(caption);
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ *ShortURL Gagal*\nError: ${e.message}`);
    }
};

handler.help = ['shorturl <url>', 'tinyurl <url>'];
handler.tags = ['tools'];
handler.command = /^(shorturl|tinyurl|shortlink|pendeklink|isgd)$/i;

handler.limit = 1;
export default handler;
