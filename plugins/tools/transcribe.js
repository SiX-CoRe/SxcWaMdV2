import FormData from 'form-data';
import fetch from 'node-fetch';

let handler = async (m, { conn, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    if (!mime || (!mime.includes('audio') && !mime.includes('video') && !mime.includes('ogg'))) {
        return m.reply(`🎙️ *AUDIO TRANSCRIBE (SPEECH TO TEXT)*\n\nBalas audio / pesan suara (VN) dengan perintah: *${usedPrefix + command}*`);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        let media = await q.download();
        if (!media) throw new Error("Gagal mengunduh audio.");

        // Upload to catbox/uguu to get URL for transcribe
        let uploadForm = new FormData();
        uploadForm.append('files[]', media, { filename: 'audio.mp3', contentType: mime });

        let upRes = await fetch('https://uguu.se/upload.php', {
            method: 'POST',
            body: uploadForm
        });
        let upJson = await upRes.json();
        let audioUrl = upJson.files?.[0]?.url;

        if (!audioUrl) throw new Error("Gagal mengunggah sementara audio ke CDN.");

        let apiKey = global.apikey?.jereapi;
        let apiUrl = `${global.web}/api/tools/transcribe?apikey=${apiKey}&audio_url=${encodeURIComponent(audioUrl)}`;

        let res = await fetch(apiUrl);
        let json = await res.json();

        if (!json.status) throw new Error(json.error || json.detail || "Gagal mengubah suara menjadi teks.");

        let transcript = json.data?.text || json.result || "Transkripsi kosong.";
        let transcriptStr = String(transcript).trim();

        let caption = `🎙️ *HASIL TRANSCRIBE (AUDIO TO TEXT)*\n\n`;

        if (transcriptStr.length > 4000) {
            caption += `📝 *Teks transkripsi sangat panjang, dikirim sebagai dokumen.*\n\n`;
            caption += `✅ *Request by:* ${m.pushName || 'User'}`;

            await conn.sendMessage(m.chat, {
                document: Buffer.from(transcriptStr, 'utf8'),
                fileName: `transcribe_${Date.now()}.txt`,
                mimetype: 'text/plain',
                caption: caption
            }, { quoted: m });
        } else {
            caption += `${transcriptStr}\n\n`;
            caption += `✅ *Request by:* ${m.pushName || 'User'}`;
            await m.reply(caption);
        }

        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ *Transcribe Gagal*\nError: ${e.message}`);
    }
};

handler.help = ['transcribe (reply audio/vn)', 'stt (reply audio)'];
handler.tags = ['tools'];
handler.command = /^(transcribe|stt|audiototext|suarateks)$/i;

handler.limit = 1;
export default handler;
