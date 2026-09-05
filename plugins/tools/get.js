import fetch from 'node-fetch';

let handler = async (m, { text, usedPrefix, command }) => {
    if (!text) return m.reply(`Contoh: ${usedPrefix + command} https://api.ipify.org?format=json`);

    try {
        let url = text.trim();
        if (!url.startsWith('http')) url = 'https://' + url;

        let res = await fetch(url);
        let contentType = res.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
            let json = await res.json();
            await m.reply(```${JSON.stringify(json, null, 2).slice(0, 4000)}```);
        } else if (contentType.includes('text/')) {
            let txt = await res.text();
            await m.reply(txt.slice(0, 4000));
        } else {
            let buffer = await res.buffer();
            await m.reply(`📦 Respon biner (${buffer.length} bytes) dari ${url}`);
        }
    } catch (e) {
        m.reply(`❌ Error: ${e.message}`);
    }
};

handler.help = ['get <url>', 'fetch <url>'];
handler.tags = ['tools'];
handler.command = /^(get|fetch|request)$/i;

handler.limit = 1;
export default handler;
