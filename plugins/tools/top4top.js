import FormData from 'form-data';
import fetch from 'node-fetch';

let handler = async (m, { conn, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    if (!mime) {
        return m.reply(`⚠️ *Balas atau kirim file/media* yang ingin diunggah!\n\nContoh:\n${usedPrefix + command} (sambil reply media)`);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        let media = await q.download();
        if (!media) throw new Error("Gagal mengunduh berkas media.");

        let ext = mime.split('/')[1] || 'bin';
        let filename = `upload_${Date.now()}.${ext}`;

        let form = new FormData();
        form.append('file', media, { filename, contentType: mime });

        let apiKey = global.apikey?.jereapi;
        let apiUrl = `${global.web}/api/tools/top4top?apikey=${apiKey}`;

        let res = await fetch(apiUrl, {
            method: 'POST',
            body: form,
            headers: form.getHeaders()
        });

        let json = await res.json();
        if (!json.status) {
            throw new Error(json.error || json.message || "Gagal mengunggah file.");
        }

        let resData = json.result || json.data || {};
        let fileUrl = '';
        if (typeof resData === 'string') {
            fileUrl = resData;
        } else {
            fileUrl = resData.Result_url || resData.result_url || resData.url || resData.download_url || resData.Link || resData.link || resData.raw_url || resData.direct_url || (resData.files && resData.files[0]?.url) || '';
        }

        if (!fileUrl && typeof resData === 'object') {
            for (let k of ['url', 'link', 'download', 'Result_url', 'result_url', 'direct_link']) {
                if (resData[k]) { fileUrl = resData[k]; break; }
            }
        }

        let sizeFormatted = (media.length / (1024 * 1024)).toFixed(2) + ' MB';
        if (media.length < 1024 * 1024) {
            sizeFormatted = (media.length / 1024).toFixed(2) + ' KB';
        }

        let caption = `📤 *UPLOAD BERHASIL (Top4Top)*\n\n`;
        caption += `🔗 *URL:* ${fileUrl || 'Lihat respon API'}\n`;
        caption += `📦 *Ukuran:* ${sizeFormatted}\n`;
        caption += `📁 *Tipe:* ${mime}\n`;
        caption += `🌐 *Server:* Top4Top\n\n`;
        caption += `✅ *Request by:* ${m.pushName || 'User'}`;

        await m.reply(caption);
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ *Gagal Upload (Top4Top)*\nError: ${e.message}`);
    } finally {
        setTimeout(() => {
            conn.sendMessage(m.chat, { react: { text: "", key: m.key } }).catch(() => {});
        }, 3000);
    }
};

handler.help = ["top4top (reply media)"];
handler.command = ["top4top"];
handler.tags = ['tools'];

handler.limit = 1;
export default handler;
