import uploadImage from '../../lib/uploadImage.js';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    try {
        let imageUrl = '';

        if (text && /^https?:\/\//i.test(text.trim())) {
            imageUrl = text.trim();
        } else if (mime && mime.startsWith('image/')) {
            await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
            let media = await q.download();
            if (!media) throw new Error("Gagal mengunduh gambar.");
            imageUrl = await uploadImage(media);
        } else {
            return m.reply(`🎨 *TO STUDIO GHIBLI AI*\n\nBalas gambar foto dengan perintah: *${usedPrefix + command}*\nAtau ketik: *${usedPrefix + command} <url gambar>*`);
        }

        if (!imageUrl) throw new Error("Gagal memproses URL gambar.");

        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

        let apiKey = global.apikey?.jereapi;
        let apiUrl = `${global.web}/api/ai/tocartoon?apikey=${apiKey}&image_url=${encodeURIComponent(imageUrl)}&style=${encodeURIComponent('Studio Ghibli')}`;

        let res = await fetch(apiUrl, { method: 'POST' });
        if (!res.ok) {
            let errText = "Gagal mengubah foto ke kartun Ghibli";
            try {
                let errJson = await res.json();
                errText = errJson.error || errJson.message || errText;
            } catch(e) {}
            throw new Error(errText);
        }

        const contentType = res.headers.get("content-type") || "";
        let imgBuffer;
        if (contentType.includes("image")) {
            imgBuffer = Buffer.from(await res.arrayBuffer());
        } else {
            let json = await res.json();
            let resultUrl = json.data || json.result || json.url;
            if (!resultUrl) throw new Error(json.error || "Gagal mengubah foto ke kartun Ghibli.");
            let imgRes = await fetch(resultUrl);
            imgBuffer = Buffer.from(await imgRes.arrayBuffer());
        }

        await conn.sendMessage(m.chat, {
            image: imgBuffer,
            caption: `🎨 *STUDIO GHIBLI FILTER*\n\n✅ *Request by:* ${m.pushName || 'User'}`
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ *Ghibli Filter Gagal*\nError: ${e.message}`);
    }
};

handler.help = ['toghibli (reply foto)', 'ghibli (reply foto)'];
handler.tags = ['tools', 'ai'];
handler.command = /^(toghibli|ghibli|cartoonfilter)$/i;

handler.limit = 1;
export default handler;
