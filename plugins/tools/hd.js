import FormData from 'form-data';
import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    if (!mime || !mime.startsWith('image/')) {
        return m.reply(`✨ *HD ENHANCER / REMINI (v1)*\n\nBalas atau kirim gambar yang buram dengan perintah: *${usedPrefix + command}*\n\nOpsi skala:\n*${usedPrefix + command} 4* (Skala 4x)`);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        m.reply("⏳ Meningkatkan resolusi gambar... Mohon tunggu sebentar.");

        let media = await q.download();
        if (!media) throw new Error("Gagal mengunduh gambar.");

        let scale = text && text.trim() === '4' ? '4' : '2';

        let form = new FormData();
        form.append('file', media, { filename: 'image.jpg', contentType: mime });
        form.append('scale', scale);

        let apiKey = global.apikey?.jereapi;
        let apiUrl = `${global.web}/api/tools/hd?apikey=${apiKey}`;

        let res = await fetch(apiUrl, {
            method: 'POST',
            body: form,
            headers: form.getHeaders()
        });

        let json = await res.json();
        if (!json.status) throw new Error(json.error || "Gagal memproses HD gambar.");

        let upscaledUrl = json.result?.upscaled_url;
        if (!upscaledUrl) throw new Error("URL gambar HD tidak ditemukan.");

        let imgRes = await fetch(upscaledUrl);
        let imgBuffer = await imgRes.buffer();

        let caption = `✨ *HD ENHANCER (v1 - ${json.result?.scale_applied || scale + 'x'})*\n\n`;
        caption += `✅ *Request by:* ${m.pushName || 'User'}`;

        await conn.sendMessage(m.chat, {
            image: imgBuffer,
            caption: caption
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ *HD Gagal*\nError: ${e.message}`);
    }
};

handler.help = ['hd (reply gambar)', 'remini (reply gambar)', 'hdr (reply gambar)'];
handler.tags = ['tools'];
handler.command = /^(hd|remini|hdr|upscale|jernih)$/i;

handler.limit = 1;
export default handler;
