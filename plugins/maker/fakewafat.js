import fetch from 'node-fetch'
import uploadImage from '../../lib/uploadImage.js'

let handler = async (m, { conn, usedPrefix, command, args }) => {
    try {
        let text = args.join(' ');
        if (!text) return m.reply(`⚠️ Format salah!\nContoh: ${usedPrefix + command} nama | lahir | wafat\nContoh: ${usedPrefix + command} MINCU | 2000 | 2026`);
        
        let [nama, lahir, wafat] = text.split('|').map(v => v.trim());
        if (!nama || !lahir || !wafat) return m.reply(`⚠️ Format harus lengkap: nama | lahir | wafat`);

        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        const q = m.quoted ? m.quoted : m;
        const mime = q?.msg?.mimetype || q?.mimetype || "";

        let pp = '';
        if (/image/.test(mime)) {
            let media = await q.download();
            pp = await uploadImage(media);
        } else {
            try {
                let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : (m.fromMe ? conn.user.jid : m.sender));
                let ppUrl = await conn.profilePictureUrl(who, 'image');
                let ppRes = await fetch(ppUrl);
                let ppBuffer = Buffer.from(await ppRes.arrayBuffer());
                pp = await uploadImage(ppBuffer);
            } catch {
                pp = 'https://raw.githubusercontent.com/Ditzzx-vibecoder/Assets/main/avatar_contact.png';
            }
        }

        const apiUrl = `${global.web}/api/maker/fakewafat?apikey=${global.apikey.jereapi}&pp=${encodeURIComponent(pp)}&nama=${encodeURIComponent(nama)}&lahir=${encodeURIComponent(lahir)}&wafat=${encodeURIComponent(wafat)}`;
        
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

        await conn.sendFile(m.chat, Buffer.from(buffer), 'fakewafat.png', `🥀 Turut berduka cita atas berpulangnya ${nama}...`, m);
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        console.error('FakeWafat Error:', e);
        m.reply("❌ Error: " + (e.message || e));
    }
};

handler.help = ["fakewafat <nama>|<lahir>|<wafat>"];
handler.command = ["fakewafat", "bukuyasin"];
handler.tags = ["maker"];
handler.limit = true;
export default handler;
