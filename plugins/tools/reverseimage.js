import FormData from 'form-data';
import fetch from 'node-fetch';

let handler = async (m, { conn, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    if (!mime || !mime.startsWith('image/')) {
        return m.reply(`🔍 *REVERSE IMAGE SEARCH*\n\nBalas atau kirim gambar untuk mencari sumber aslinya di Google, Yandex, Bing, dll!\nPerintah: *${usedPrefix + command}*`);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        let media = await q.download();
        if (!media) throw new Error("Gagal mengunduh gambar.");

        let form = new FormData();
        form.append('file', media, { filename: 'search.jpg', contentType: mime });

        let apiKey = global.apikey?.jereapi;
        let apiUrl = `${global.web}/api/tools/reverseimage?apikey=${apiKey}`;

        let res = await fetch(apiUrl, {
            method: 'POST',
            body: form,
            headers: form.getHeaders()
        });

        let json = await res.json();
        if (!json.status) throw new Error(json.error || json.detail || "Gagal mencari sumber gambar.");

        let engines = json.result?.engines || {};
        let caption = `🔍 *REVERSE IMAGE SEARCH*\n\n`;

        for (let [name, url] of Object.entries(engines)) {
            let capName = name.charAt(0).toUpperCase() + name.slice(1);
            caption += `🌐 *${capName}:*\n${url}\n\n`;
        }

        caption += `✅ *Request by:* ${m.pushName || 'User'}`;

        await m.reply(caption);
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ *Reverse Search Gagal*\nError: ${e.message}`);
    }
};

handler.help = ['reverseimage (reply gambar)', 'carigambar (reply gambar)'];
handler.tags = ['tools'];
handler.command = /^(reverseimage|carigambar|imagesearch|reverseimg)$/i;

handler.limit = 1;
export default handler;
