import FormData from 'form-data';
import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    if (!mime || !mime.startsWith('image/')) {
        return m.reply(`✨ *ULTRA HD ENHANCER (v2 - Picsart AI)*\n\nBalas atau kirim gambar dengan perintah: *${usedPrefix + command}*`);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        m.reply("⏳ Meningkatkan resolusi gambar ke Ultra HD... Mohon tunggu.");

        let media = await q.download();
        if (!media) throw new Error("Gagal mengunduh gambar.");

        let scale = text && text.trim() === '4' ? '4' : '2';

        let form = new FormData();
        form.append('file', media, { filename: 'image.jpg', contentType: mime });
        form.append('scale', scale);

        let apiKey = global.apikey?.jereapi;
        let apiUrl = `${global.web}/api/tools/hd2?apikey=${apiKey}`;

        let res = await fetch(apiUrl, {
            method: 'POST',
            body: form,
            headers: form.getHeaders()
        });

        let json = await res.json();
        if (!json.status) throw new Error(json.error || "Gagal memproses Ultra HD gambar.");

        let upscaledUrl = json.result?.upscaled_url;
        if (!upscaledUrl) throw new Error("URL gambar Ultra HD tidak ditemukan.");

        let imgRes = await fetch(upscaledUrl);
        let imgBuffer = await imgRes.buffer();

        let caption = `✨ *ULTRA HD ENHANCER (v2 - ${json.result?.scale_applied || '2x'})*\n\n`;
        caption += `⚙️ *Engine:* PicsArt Deep AI\n`;
        caption += `✅ *Request by:* ${m.pushName || 'User'}`;

        await conn.sendMessage(m.chat, {
            image: imgBuffer,
            caption: caption
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ *HD2 Gagal*\nError: ${e.message}`);
    }
};

handler.help = ['hd2 (reply gambar)', 'remini2 (reply gambar)', 'ultrahd (reply gambar)'];
handler.tags = ['tools'];
handler.command = /^(hd2|remini2|ultrahd|hdv2)$/i;

handler.limit = 1;
export default handler;
