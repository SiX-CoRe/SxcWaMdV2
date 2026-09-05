import FormData from 'form-data';
import fetch from 'node-fetch';

let handler = async (m, { conn, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';
    
    if (!mime) return m.reply(`⚠️ Balas gambar/video/file dengan perintah *${usedPrefix + command}*`);
    
    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        let media = await q.download();
        if (!media) throw new Error("Gagal mengunduh media");

        let ext = mime.split('/')[1] || 'bin';
        let filename = `file_${Date.now()}.${ext}`;

        let form = new FormData();
        form.append('file', media, { filename, contentType: mime });

        let apiKey = global.apikey?.jereapi;
        let apiUrl = `${global.web}/api/tools/catbox?apikey=${apiKey}`;

        let res = await fetch(apiUrl, {
            method: 'POST',
            body: form,
            headers: form.getHeaders()
        });

        let json = await res.json();
        let link = json.result?.Result_url || json.result || json.data;

        if (!link) throw new Error(json.error || "Gagal mendapatkan tautan URL");

        let sizeFormatted = (media.length / (1024 * 1024)).toFixed(2) + ' MB';
        if (media.length < 1024 * 1024) sizeFormatted = (media.length / 1024).toFixed(2) + ' KB';

        let caption = `📤 *TOURL - UPLOAD BERHASIL*\n\n`;
        caption += `🔗 *URL:* ${link}\n`;
        caption += `📦 *Ukuran:* ${sizeFormatted}\n`;
        caption += `📁 *Format:* ${mime}\n\n`;
        caption += `✅ *Request by:* ${m.pushName || 'User'}`;

        await m.reply(caption);
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ Gagal upload media: ${e.message}`);
    }
};

handler.help = ['tourl (reply media)', 'upload (reply media)'];
handler.tags = ['tools'];
handler.command = /^(tourl|upload|tolink)$/i;

handler.limit = 1;
export default handler;
