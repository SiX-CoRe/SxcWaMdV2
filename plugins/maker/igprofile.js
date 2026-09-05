import fetch from 'node-fetch';
import uploadImage from '../../lib/uploadImage.js';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        const API_KEY = global.apikey?.jereapi;
        if (!API_KEY || API_KEY === "MASUKAN_API_KEY_KAMU_DISINI") {
            return m.reply("❌ API Key belum dikonfigurasi di config.js!");
        }

        const input = m.quoted && m.quoted.text && !text ? m.quoted.text : text;
        
        if (!input || !input.includes('|')) {
            return m.reply(`📸 *Fake IG Profile*\n\nCara penggunaan:\n${usedPrefix + command} <username>|<bio>|<postingan>|<pengikut>|<mengikuti>\n\nContoh:\n${usedPrefix + command} lumnztyz6x|I am programmer|12|100M|2\n\n*(Bisa reply gambar untuk custom PP atau otomatis menggunakan foto profil WhatsApp)*`);
        }

        const [username, bio, postingan, pengikut, mengikuti] = input.split('|');

        if (!username || !bio || !postingan || !pengikut || !mengikuti) {
            return m.reply("⚠️ Format salah! Pastikan semua diisi dipisah dengan tanda |");
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

        const apiUrl = `${global.web}/api/maker/fakeigprofile?apikey=${global.apikey.jereapi}` + 
                       `&pp=${encodeURIComponent(imgUrl)}` +
                       `&username=${encodeURIComponent(username.trim())}` +
                       `&bio=${encodeURIComponent(bio.trim())}` +
                       `&postingan=${encodeURIComponent(postingan.trim())}` +
                       `&pengikut=${encodeURIComponent(pengikut.trim())}` +
                       `&mengikuti=${encodeURIComponent(mengikuti.trim())}`;

        const response = await fetch(apiUrl);
        if (!response.ok) {
            let errMsg = `Gagal membuat Fake IG Profile (Status HTTP ${response.status})`;
            try {
                const text = await response.text();
                const errJson = JSON.parse(text);
                if (errJson.error || errJson.message) errMsg = errJson.error || errJson.message;
            } catch (e) {}
            throw new Error(errMsg);
        }

        const buffer = await response.arrayBuffer();
        if (response.headers.get('content-type')?.includes('application/json')) {
            let errJson = JSON.parse(Buffer.from(buffer).toString());
            throw new Error(errJson.message || errJson.error || 'Gagal memproses gambar');
        }

        await conn.sendFile(m.chat, Buffer.from(buffer), 'igprofile.png', `📸 *Fake IG Profile*\n\n✨ Request by: ${m.pushName || 'User'}`, m);
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error('Fake IG Profile Error:', e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ Gagal membuat gambar: ${e.message || e}`);
    }
};

handler.help = ['igprofile <username>|<bio>|<postingan>|<pengikut>|<mengikuti>'];
handler.tags = ['maker'];
handler.command = /^(igprofile|fakeig)$/i;
handler.limit = true;
export default handler;
