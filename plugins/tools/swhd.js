import FormData from 'form-data';
import fetch from 'node-fetch';

let handler = async (m, { conn, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    if (!mime || (!mime.includes('video') && !mime.includes('document'))) {
        return m.reply(`📽️ *STATUS WA HD VIDEO (SWHD)*\n\nBalas atau kirim video yang ingin dijadikan HD untuk Status WhatsApp!\nPerintah: *${usedPrefix + command}*`);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        m.reply("⏳ Memproses video Status WhatsApp menjadi HD via JereAPI... Mohon tunggu.");

        let media = await q.download();
        if (!media) throw new Error("Gagal mengunduh berkas video.");

        let apiKey = global.apikey?.jereapi;
        let apiUrl = `${global.web}/api/tools/swhd?apikey=${apiKey}`;

        let form = new FormData();
        form.append('video', media, { filename: 'input.mp4', contentType: 'video/mp4' });

        let res = await fetch(apiUrl, {
            method: 'POST',
            body: form,
            headers: form.getHeaders(),
            timeout: 180000
        });

        if (!res.ok) {
            let json = await res.json().catch(() => ({}));
            throw new Error(json.error || json.message || `Server merespon dengan status ${res.status}`);
        }

        let buffer = await res.buffer();
        if (!buffer || buffer.length < 500) throw new Error("Video HD hasil proses kosong.");

        await conn.sendMessage(m.chat, {
            video: buffer,
            mimetype: 'video/mp4',
            fileName: `SWHD_${Date.now()}.mp4`,
            caption: `📽️ *STATUS WA HD VIDEO BERHASIL*\n\n✅ Silakan teruskan (forward) video ini langsung ke Status WhatsApp kamu!\n✅ *Request by:* ${m.pushName || 'User'}\n\n> 🌐 _Powered by JereAPI | api.jerexd.my.id_`
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error('[SWHD Error]', e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ *SWHD Gagal*\nError: ${e.message}`);
    }
};

handler.help = ['swhd (reply video)', 'statuswa (reply video)', 'hdsw (reply video)'];
handler.tags = ['tools'];
handler.command = /^(swhd|statuswa|hdsw|swvideo)$/i;
handler.premium = true;
handler.limit = 1;

export default handler;
