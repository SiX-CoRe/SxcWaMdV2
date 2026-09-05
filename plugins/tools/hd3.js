import FormData from 'form-data';
import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    if (!mime || !mime.startsWith('image/')) {
        return m.reply(`✨ *SUPER HD ENHANCER (v3 - Deep Vision)*\n\nBalas atau kirim gambar dengan perintah: *${usedPrefix + command}*`);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        m.reply("⏳ Memproses Super HD gambar... Mohon tunggu.");

        let media = await q.download();
        if (!media) throw new Error("Gagal mengunduh gambar.");

        let scale = text && text.trim() === '4' ? '4' : '2';

        let form = new FormData();
        form.append('file', media, { filename: 'image.jpg', contentType: mime });
        form.append('scale', scale);

        let apiKey = global.apikey?.jereapi;
        let apiUrl = `${global.web}/api/tools/hd3?apikey=${apiKey}`;

        let res = await fetch(apiUrl, {
            method: 'POST',
            body: form,
            headers: form.getHeaders()
        });

        let json = await res.json();
        if (!json.status) throw new Error(json.error || "Gagal memproses Super HD gambar.");

        let upscaledUrl = json.result?.upscaled_url;
        if (!upscaledUrl) throw new Error("URL gambar Super HD tidak ditemukan.");

        let imgRes = await fetch(upscaledUrl);
        let imgBuffer = await imgRes.buffer();

        let caption = `✨ *SUPER HD ENHANCER (v3 - ${json.result?.scale_applied || '2x'})*\n\n`;
        caption += `⚙️ *Engine:* Deep Vision HD\n`;
        caption += `✅ *Request by:* ${m.pushName || 'User'}`;

        await conn.sendMessage(m.chat, {
            image: imgBuffer,
            caption: caption
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ *HD3 Gagal*\nError: ${e.message}`);
    }
};

handler.help = ['hd3 (reply gambar)', 'remini3 (reply gambar)', 'superhd (reply gambar)'];
handler.tags = ['tools'];
handler.command = /^(hd3|remini3|superhd|hdv3)$/i;

handler.limit = 1;
export default handler;
