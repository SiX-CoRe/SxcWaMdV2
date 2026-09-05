import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`Contoh: ${usedPrefix + command} https://google.com`);
    try {
        let url = text.trim();
        if (!url.startsWith('http')) url = 'https://' + url;
        let res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
        let short = await res.text();
        m.reply(`🔗 *TinyURL:* ${short}`);
    } catch (e) {
        m.reply(`❌ Error: ${e.message}`);
    }
};

handler.help = ['tinyurl <url>'];
handler.tags = ['tools'];
handler.command = /^tinyurl$/i;
handler.limit = 1;
export default handler;
