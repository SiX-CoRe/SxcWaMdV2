import FormData from 'form-data';
import fetch from 'node-fetch';

let handler = async (m, { conn, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    if (!mime || !mime.startsWith('image/')) {
        return m.reply(`🧼 *REMOVE WATERMARK*\n\nBalas atau kirim gambar yang memiliki watermark dengan perintah: *${usedPrefix + command}*`);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        let media = await q.download();
        if (!media) throw new Error("Gagal mengunduh gambar.");

        let form = new FormData();
        form.append('file', media, { filename: 'image.png', contentType: mime });

        let apiKey = global.apikey?.jereapi;
        let apiUrl = `${global.web}/api/tools/removewm?apikey=${apiKey}`;

        let res = await fetch(apiUrl, {
            method: 'POST',
            body: form,
            headers: form.getHeaders()
        });

        let json = await res.json();
        if (!json.status) throw new Error(json.error || "Gagal menghapus watermark.");

        let resultUrl = json.resultUrl;
        if (!resultUrl) throw new Error("Gambar hasil pembersihan watermark tidak ditemukan.");

        let imgRes = await fetch(resultUrl);
        let imgBuffer = await imgRes.buffer();

        await conn.sendMessage(m.chat, {
            image: imgBuffer,
            caption: `🧼 *WATERMARK BERHASIL DIHAPUS*\n\n✅ *Request by:* ${m.pushName || 'User'}`
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ *RemoveWM Gagal*\nError: ${e.message}`);
    }
};

handler.help = ['removewm (reply gambar)', 'hapuswm (reply gambar)'];
handler.tags = ['tools'];
handler.command = /^(removewm|hapuswm|nowm)$/i;

handler.limit = 1;
export default handler;
