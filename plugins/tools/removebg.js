import FormData from 'form-data';
import fetch from 'node-fetch';

let handler = async (m, { conn, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    if (!mime || !mime.startsWith('image/')) {
        return m.reply(`✂️ *REMOVE BACKGROUND*\n\nBalas atau kirim gambar dengan perintah: *${usedPrefix + command}*`);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        let media = await q.download();
        if (!media) throw new Error("Gagal mengunduh gambar.");

        let form = new FormData();
        form.append('file', media, { filename: 'image.png', contentType: mime });

        let apiKey = global.apikey?.jereapi;
        let apiUrl = `${global.web}/api/tools/removebg?apikey=${apiKey}`;

        let res = await fetch(apiUrl, {
            method: 'POST',
            body: form,
            headers: form.getHeaders()
        });

        if (!res.ok) {
            let json = await res.json().catch(() => ({}));
            throw new Error(json.error || `Status ${res.status}`);
        }

        let buffer = await res.buffer();
        if (!buffer || buffer.length < 100) throw new Error("Hasil gambar transparan kosong.");

        await conn.sendMessage(m.chat, {
            image: buffer,
            caption: `✂️ *BACKGROUND BERHASIL DIHAPUS*\n\n✅ *Request by:* ${m.pushName || 'User'}`
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ *RemoveBG Gagal*\nError: ${e.message}`);
    }
};

handler.help = ['removebg (reply gambar)', 'nobg (reply gambar)'];
handler.tags = ['tools'];
handler.command = /^(removebg|nobg|hapusbg|transparan)$/i;

handler.limit = 1;
export default handler;
