import FormData from 'form-data';
import fetch from 'node-fetch';

let handler = async (m, { conn, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    if (!mime || !mime.startsWith('image/')) {
        return m.reply(`🗜️ *COMPRESS PHOTO (TINYPNG LOSSLESS)*\n\nBalas atau kirim gambar yang ingin dikompres dengan perintah: *${usedPrefix + command}*`);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        let media = await q.download();
        if (!media) throw new Error("Gagal mengunduh gambar.");

        let ext = mime.split('/')[1] || 'png';
        let form = new FormData();
        form.append('file', media, { filename: `image.${ext}`, contentType: mime });

        let apiKey = global.apikey?.jereapi;
        let apiUrl = `${global.web}/api/tools/compressphoto?apikey=${apiKey}`;

        let res = await fetch(apiUrl, {
            method: 'POST',
            body: form,
            headers: form.getHeaders()
        });

        let json = await res.json();
        if (!json.status) throw new Error(json.error || json.detail || "Gagal mengompres gambar.");

        let data = json.result || {};
        let originalSize = (data.original_size_bytes / 1024).toFixed(2) + ' KB';
        let compressedSize = (data.compressed_size_bytes / 1024).toFixed(2) + ' KB';

        let caption = `🗜️ *KOMPRESI GAMBAR BERHASIL*\n\n`;
        caption += `📦 *Ukuran Awal:* ${originalSize}\n`;
        caption += `📉 *Ukuran Akhir:* ${compressedSize}\n`;
        caption += `💡 *Hemat:* ${data.ratio_saved || '-'}\n\n`;
        caption += `✅ *Request by:* ${m.pushName || 'User'}`;

        if (data.url) {
            let imgRes = await fetch(data.url);
            let imgBuffer = await imgRes.buffer();
            await conn.sendMessage(m.chat, {
                image: imgBuffer,
                caption: caption
            }, { quoted: m });
        } else {
            await m.reply(caption);
        }

        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ *Kompres Foto Gagal*\nError: ${e.message}`);
    }
};

handler.help = ['compressphoto (reply gambar)', 'compressimg (reply gambar)'];
handler.tags = ['tools'];
handler.command = /^(compressphoto|compressimg|tinypng|kompresfoto)$/i;

handler.limit = 1;
export default handler;
