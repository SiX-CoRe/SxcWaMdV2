import FormData from 'form-data';
import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        let apiKey = global.apikey?.jereapi;
        let apiUrl = `${global.web}/api/tools/facedetect?apikey=${apiKey}`;

        let res;
        if (text && /^https?:\/\//i.test(text.trim())) {
            res = await fetch(`${apiUrl}&url=${encodeURIComponent(text.trim())}`);
        } else if (mime && mime.startsWith('image/')) {
            let media = await q.download();
            if (!media) throw new Error("Gagal mengunduh gambar.");

            let form = new FormData();
            form.append('file', media, { filename: 'face.jpg', contentType: mime });

            res = await fetch(apiUrl, {
                method: 'POST',
                body: form,
                headers: form.getHeaders()
            });
        } else {
            return m.reply(`👤 *DETEKSI WAJAH & UMUR*\n\nBalas gambar wajah manusia dengan perintah: *${usedPrefix + command}*\nAtau ketik: *${usedPrefix + command} <url gambar>*`);
        }

        let json = await res.json();
        if (!json.status) throw new Error(json.message || json.error || "Gagal mendeteksi wajah.");

        let data = json.result || {};
        let genderId = data.gender === 'Male' ? 'Laki-laki 👨' : (data.gender === 'Female' ? 'Perempuan 👩' : data.gender);

        let caption = `👤 *HASIL DETEKSI WAJAH*\n\n`;
        caption += `🎂 *Perkiraan Umur:* ~ ${data.age || '-'} Tahun\n`;
        caption += `⚧️ *Gender:* ${genderId || '-'}\n\n`;
        caption += `✅ *Request by:* ${m.pushName || 'User'}`;

        await m.reply(caption);
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ *Deteksi Wajah Gagal*\nError: ${e.message}`);
    }
};

handler.help = ['facedetect (reply foto wajah)', 'tebakumur (reply foto)'];
handler.tags = ['tools'];
handler.command = /^(facedetect|tebakumur|deteksiwajah|cekumur)$/i;

handler.limit = 1;
export default handler;
