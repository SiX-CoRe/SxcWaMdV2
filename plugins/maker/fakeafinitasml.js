import fetch from 'node-fetch';
import uploadImage from '../../lib/uploadImage.js';

let handler = async (m, { conn, usedPrefix, command }) => {
    try {
        const API_KEY = global.apikey?.jereapi;
        if (!API_KEY || API_KEY === "MASUKAN_API_KEY_KAMU_DISINI") {
            return m.reply("❌ API Key belum dikonfigurasi di config.js!");
        }

        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        const q = m.quoted ? m.quoted : m;
        const mime = q?.msg?.mimetype || q?.mimetype || "";

        let imgUrl = "";
        if (/image/.test(mime)) {
            const media = await q.download();
            imgUrl = await uploadImage(media);
        } else {
            try {
                let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : (m.fromMe ? conn.user.jid : m.sender));
                let ppUrl = await conn.profilePictureUrl(who, 'image');
                let ppRes = await fetch(ppUrl);
                let ppBuffer = Buffer.from(await ppRes.arrayBuffer());
                imgUrl = await uploadImage(ppBuffer);
            } catch {
                imgUrl = 'https://raw.githubusercontent.com/Ditzzx-vibecoder/Assets/main/avatar_contact.png';
            }
        }

        const apiUrl = `${global.web}/api/maker/fakeafinitasml?apikey=${global.apikey.jereapi}&url=${encodeURIComponent(imgUrl)}`;
        
        let res = await fetch(apiUrl);
        if (!res.ok) {
            let errJson = await res.json().catch(() => ({}));
            throw new Error(errJson.message || errJson.error || `HTTP ${res.status}`);
        }

        let buffer = await res.arrayBuffer();
        if (res.headers.get('content-type')?.includes('application/json')) {
            let errJson = JSON.parse(Buffer.from(buffer).toString());
            throw new Error(errJson.message || errJson.error || 'Gagal memproses gambar');
        }

        await conn.sendFile(m.chat, Buffer.from(buffer), 'afinitas.png', `🎮 *Fake Afinitas Mobile Legends*\n\n✨ Request by: ${m.pushName || 'User'}`, m);
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error('FakeAfinitasML Error:', e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ Gagal membuat fake afinitas: ${e.message || e}`);
    }
};

handler.help = ["fakeafinitasml"];
handler.tags = ["maker"];
handler.command = /^(fakeafinitasml|afinitasml)$/i;
handler.limit = true;
export default handler;