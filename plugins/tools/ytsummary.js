import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`📺 *YOUTUBE AI SUMMARY & TRANSCRIPT*\n\nMasukkan link video YouTube yang ingin diringkas atau ditranskrip!\n*Format:* ${usedPrefix + command} <url> [summary/transcript]\nContoh:\n${usedPrefix + command} https://www.youtube.com/watch?v=dQw4w9WgXcQ\n${usedPrefix + command} https://youtu.be/dQw4w9WgXcQ transcript`);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        let parts = text.trim().split(/\s+/);
        let url = parts[0];
        let mode = parts.slice(1).join(' ').toLowerCase().includes('transcript') ? 'transcript' : 'summary';

        let apiKey = global.apikey?.jereapi;
        let apiUrl = `${global.web}/api/tools/ytsummary?apikey=${apiKey}&url=${encodeURIComponent(url)}&mode=${mode}`;

        let res = await fetch(apiUrl);
        let json = await res.json();

        if (!json.status) throw new Error(json.error || json.detail || "Gagal memproses video YouTube.");

        let title = json.title || 'YouTube Video';
        let resultText = String(json.result || '');

        let caption = `📺 *${mode === 'transcript' ? 'TRANSKRIP YOUTUBE' : 'RINGKASAN YOUTUBE AI'}*\n\n`;
        caption += `🎬 *Judul:* ${title}\n`;
        caption += `🔗 *Link:* ${url}\n\n`;

        if (resultText.length > 4000) {
            caption += `📝 *Hasil terlalu panjang, dikirim sebagai dokumen lampiran.*\n\n`;
            caption += `✅ *Request by:* ${m.pushName || 'User'}`;

            await conn.sendMessage(m.chat, {
                document: Buffer.from(resultText, 'utf8'),
                fileName: `YT_${mode}_${Date.now()}.txt`,
                mimetype: 'text/plain',
                caption: caption
            }, { quoted: m });
        } else {
            caption += `📝 *${mode === 'transcript' ? 'Transkrip' : 'Ringkasan'}:*\n${resultText}\n\n`;
            caption += `✅ *Request by:* ${m.pushName || 'User'}`;
            await m.reply(caption);
        }

        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ *YouTube Summary Gagal*\nError: ${e.message}`);
    }
};

handler.help = ['ytsummary <url youtube>', 'ytsum <url youtube> [transcript]'];
handler.tags = ['tools'];
handler.command = /^(ytsummary|ytsum|ringkasyoutube|ytringkas|yttranscript)$/i;

handler.limit = 1;
export default handler;
