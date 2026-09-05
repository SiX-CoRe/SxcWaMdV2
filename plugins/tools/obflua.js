import FormData from 'form-data';
import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        let scriptCode = '';
        let originalName = 'script.lua';

        if (mime && (mime.includes('text') || mime.includes('octet-stream') || mime.includes('document'))) {
            let media = await q.download();
            scriptCode = media.toString('utf8');
            originalName = (q.msg || q).filename || 'script.lua';
        } else if (text) {
            scriptCode = text;
        } else {
            return m.reply(`🔒 *LUA CODE OBFUSCATOR*\n\nBalas file .lua atau ketik teks kode script dengan perintah: *${usedPrefix + command}*`);
        }

        if (!scriptCode.trim()) throw new Error("Kode script kosong.");

        let form = new FormData();
        form.append('file', Buffer.from(scriptCode), { filename: originalName, contentType: 'text/plain' });

        let apiKey = global.apikey?.jereapi;
        let apiUrl = `${global.web}/api/tools/obflua?apikey=${apiKey}`;

        let res = await fetch(apiUrl, {
            method: 'POST',
            body: form,
            headers: form.getHeaders()
        });

        if (!res.ok) {
            let json = await res.json().catch(() => ({}));
            throw new Error(json.error || "Gagal mengobfuscate script.");
        }

        let obfBuffer = await res.buffer();
        let outName = originalName.replace(/\.lua$/i, '') + '_obfuscated.lua';

        let caption = `🔒 *OBFUSCATE SCRIPT BERHASIL*\n\n`;
        caption += `📁 *File:* ${outName}\n`;
        caption += `✅ *Request by:* ${m.pushName || 'User'}`;

        await conn.sendMessage(m.chat, {
            document: obfBuffer,
            fileName: outName,
            mimetype: 'text/plain',
            caption: caption
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ *Obfuscate Gagal*\nError: ${e.message}`);
    }
};

handler.help = ['obflua (reply file / kode)', 'obfuscate (reply file)'];
handler.tags = ['tools'];
handler.command = /^(obflua|obfuscate|encodelua|obfuscatelua)$/i;

handler.limit = 1;
export default handler;
