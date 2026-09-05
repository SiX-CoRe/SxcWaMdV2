import FormData from 'form-data';
import fetch from 'node-fetch';

let handler = async (m, { conn, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    if (!mime || (!mime.includes('video') && !mime.includes('document'))) {
        return m.reply(`🎬 *HD VIDEO ENHANCER*\n\nBalas atau kirim video yang buram dengan perintah: *${usedPrefix + command}*`);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        m.reply("⏳ Memproses peningkat resolusi video HD... Proses ini memakan waktu beberapa saat.");

        let media = await q.download();
        if (!media) throw new Error("Gagal mengunduh video.");

        let form = new FormData();
        form.append('file', media, { filename: 'video.mp4', contentType: 'video/mp4' });

        let apiKey = global.apikey?.jereapi;
        let apiUrl = `${global.web}/api/tools/hdvideo?apikey=${apiKey}`;

        let res = await fetch(apiUrl, {
            method: 'POST',
            body: form,
            headers: form.getHeaders()
        });

        let json = await res.json();
        if (!json.status) throw new Error(json.error || json.detail || "Gagal memproses video HD.");

        let resultUrl = json.resultUrl;
        if (!resultUrl) throw new Error("Tautan video HD tidak ditemukan.");

        let vidRes = await fetch(resultUrl);
        let vidBuffer = await vidRes.buffer();

        await conn.sendMessage(m.chat, {
            video: vidBuffer,
            mimetype: 'video/mp4',
            caption: `🎬 *HD VIDEO ENHANCER BERHASIL*\n\n✅ *Request by:* ${m.pushName || 'User'}`
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ *HD Video Gagal*\nError: ${e.message}`);
    }
};

handler.help = ['hdvideo (reply video)', 'videoenhancer (reply video)'];
handler.tags = ['tools'];
handler.command = /^(hdvideo|videoenhancer|jernihvideo|videohd)$/i;

handler.limit = 1;
export default handler;
