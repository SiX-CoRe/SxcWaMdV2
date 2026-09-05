import FormData from 'form-data';
import fetch from 'node-fetch';

let handler = async (m, { conn, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    if (!mime || !mime.startsWith('image/')) {
        return m.reply(`📝 *OCR (IMAGE TO TEXT)*\n\nBalas atau kirim gambar yang ada teksnya dengan perintah: *${usedPrefix + command}*`);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        let media = await q.download();
        if (!media) throw new Error("Gagal mengunduh gambar.");

        let form = new FormData();
        form.append('file', media, { filename: 'ocr.jpg', contentType: mime });

        let apiKey = global.apikey?.jereapi;
        let apiUrl = `${global.web}/api/tools/ocr?apikey=${apiKey}`;

        let res = await fetch(apiUrl, {
            method: 'POST',
            body: form,
            headers: form.getHeaders()
        });

        let json = await res.json();
        if (!json.status) throw new Error(json.error || json.message || "Gagal mengekstrak teks dari gambar.");

        let extractedText = json.result || json.data?.text || (typeof json.data === 'string' ? json.data : "Teks tidak ditemukan.");
        let cleanText = String(extractedText).trim();

        if (!cleanText) cleanText = "Teks tidak ditemukan dalam gambar.";

        let caption = `📝 *HASIL OCR (IMAGE TO TEXT)*\n\n`;

        if (cleanText.length > 4000) {
            caption += `📄 *Teks hasil OCR sangat panjang, dikirim sebagai dokumen teks.*\n\n`;
            caption += `✅ *Request by:* ${m.pushName || 'User'}`;

            await conn.sendMessage(m.chat, {
                document: Buffer.from(cleanText, 'utf8'),
                fileName: `ocr_${Date.now()}.txt`,
                mimetype: 'text/plain',
                caption: caption
            }, { quoted: m });
        } else {
            caption += `${cleanText}\n\n`;
            caption += `✅ *Request by:* ${m.pushName || 'User'}`;
            await m.reply(caption);
        }

        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ *OCR Gagal*\nError: ${e.message}`);
    }
};

handler.help = ['ocr (reply gambar)', 'totext (reply gambar)'];
handler.tags = ['tools'];
handler.command = /^(ocr|totext|imagetotext|bacagambar)$/i;

handler.limit = 1;
export default handler;
