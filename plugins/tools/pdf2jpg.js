import FormData from 'form-data';
import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    if (!mime || (!mime.includes('pdf') && !mime.includes('document'))) {
        return m.reply(`📄 *PDF TO JPG CONVERTER*\n\nBalas file dokumen PDF dengan perintah: *${usedPrefix + command}*\n\nOpsi DPI:\n*${usedPrefix + command} 300* (Kualitas tinggi 300 DPI)`);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        m.reply("⏳ Mengonversi seluruh halaman PDF menjadi file gambar JPG... Mohon tunggu.");

        let media = await q.download();
        if (!media) throw new Error("Gagal mengunduh berkas PDF.");

        let dpi = text && text.trim() === '300' ? '300' : '150';

        let form = new FormData();
        form.append('file', media, { filename: 'document.pdf', contentType: 'application/pdf' });
        form.append('dpi', dpi);

        let apiKey = global.apikey?.jereapi;
        let apiUrl = `${global.web}/api/tools/pdf2jpg?apikey=${apiKey}`;

        let res = await fetch(apiUrl, {
            method: 'POST',
            body: form,
            headers: form.getHeaders()
        });

        let json = await res.json();
        if (!json.status) throw new Error(json.error || json.detail || "Gagal mengonversi PDF ke JPG.");

        let result = json.result || {};
        let downloadUrl = result.download_url;
        if (!downloadUrl) throw new Error("Link unduhan file ZIP tidak ditemukan.");

        let caption = `📄 *PDF TO JPG BERHASIL*\n\n`;
        caption += `📁 *File Asal:* ${result.original_file || 'document.pdf'}\n`;
        caption += `🔍 *DPI:* ${result.dpi_applied || dpi}\n`;
        caption += `🔗 *Download Link:* ${downloadUrl}\n\n`;
        caption += `✅ *Request by:* ${m.pushName || 'User'}`;

        let zipRes = await fetch(downloadUrl);
        let zipBuffer = await zipRes.buffer();

        await conn.sendMessage(m.chat, {
            document: zipBuffer,
            fileName: (result.original_file || 'document').replace(/\.pdf$/i, '') + '_jpg.zip',
            mimetype: 'application/zip',
            caption: caption
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ *PDF2JPG Gagal*\nError: ${e.message}`);
    }
};

handler.help = ['pdf2jpg (reply pdf)', 'pdf2image (reply pdf)'];
handler.tags = ['tools'];
handler.command = /^(pdf2jpg|pdf2image|pdftojpg|pdf2img)$/i;

handler.limit = 1;
export default handler;
