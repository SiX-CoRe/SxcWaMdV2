import FormData from 'form-data';
import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        let apiKey = global.apikey?.jereapi;

        // SCAN MODE (If image is replied or sent)
        if (mime && mime.startsWith('image/')) {
            let media = await q.download();
            if (!media) throw new Error("Gagal mengunduh gambar QR.");

            let form = new FormData();
            form.append('action', 'read');
            form.append('file', media, { filename: 'qr.jpg', contentType: mime });

            let apiUrl = `${global.web}/api/tools/qrcode?apikey=${apiKey}`;
            let res = await fetch(apiUrl, {
                method: 'POST',
                body: form,
                headers: form.getHeaders()
            });

            let json = await res.json();
            if (!json.status || !json.result) {
                throw new Error(json.message || json.error || "Tidak ada QR Code yang terdeteksi.");
            }

            let caption = `📷 *HASIL SCAN QR CODE*\n\n`;
            caption += `📝 *Isi QR:*\n${json.result}\n\n`;
            caption += `✅ *Request by:* ${m.pushName || 'User'}`;

            await m.reply(caption);
            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
            return;
        }

        // CREATE MODE (If text is given)
        if (!text) {
            return m.reply(`🔲 *QR CODE GENERATOR & SCANNER*\n\n1. *Buat QR Code:*\n${usedPrefix + command} https://google.com\n\n2. *Pindai (Scan) QR Code:*\nBalas gambar QR Code dengan perintah *${usedPrefix + command}*`);
        }

        let apiUrl = `${global.web}/api/tools/qrcode?apikey=${apiKey}&action=create&text=${encodeURIComponent(text.trim())}`;
        let res = await fetch(apiUrl, { method: 'POST' });

        if (!res.ok) {
            let json = await res.json().catch(() => ({}));
            throw new Error(json.error || "Gagal membuat gambar QR Code.");
        }

        let qrBuffer = await res.buffer();

        let caption = `🔲 *QR CODE BERHASIL DIBUAT*\n\n`;
        caption += `📝 *Teks:* ${text.trim()}\n\n`;
        caption += `✅ *Request by:* ${m.pushName || 'User'}`;

        await conn.sendMessage(m.chat, {
            image: qrBuffer,
            caption: caption
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ *QR Code Gagal*\nError: ${e.message}`);
    }
};

handler.help = ['qrcode <teks>', 'qr (reply gambar)', 'scanqr (reply gambar)'];
handler.tags = ['tools'];
handler.command = /^(qrcode|qr|scanqr|readqr|bacaqr)$/i;

handler.limit = 1;
export default handler;
