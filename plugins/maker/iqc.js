import fetch from 'node-fetch';
import uploadImage from '../../lib/uploadImage.js';


let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        const API_KEY = global.apikey?.jereapi;
        if (!API_KEY || API_KEY === "MASUKAN_API_KEY_KAMU_DISINI") {
            return m.reply("❌ API Key belum dikonfigurasi di config.js!");
        }

        let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : (m.fromMe ? conn.user.jid : m.sender));
        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || '';

        const input = m.quoted && m.quoted.text ? m.quoted.text : text;
        
        if (!input && !/image/.test(mime)) {
            return m.reply(`⚠️ Masukkan Teks atau reply teks/gambar!\n\nContoh: ${usedPrefix + command} Earth without art is just eh|light`);
        }

        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        let msgText = input || '';
        let theme = "dark";
        
        if (text && text.includes('|')) {
            const parts = text.split('|');
            msgText = parts[0].trim();
            theme = parts[1].trim();
        }

        const timeNow = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()).replace(":", ".");

        let imgUrl = "";
        if (/image/.test(mime)) {
            const media = await q.download();
            imgUrl = await uploadImage(media);
        } else {
            try {
                let ppUrl = await conn.profilePictureUrl(who, 'image');
                let ppRes = await fetch(ppUrl);
                let ppBuffer = Buffer.from(await ppRes.arrayBuffer());
                imgUrl = await uploadImage(ppBuffer);
            } catch {
                imgUrl = 'https://raw.githubusercontent.com/Ditzzx-vibecoder/Assets/main/avatar_contact.png';
            }
        }

        const apiUrl = `${global.web}/api/maker/iqc?apikey=${global.apikey.jereapi}&text=${encodeURIComponent(msgText)}&time=${encodeURIComponent(timeNow)}&theme=${encodeURIComponent(theme)}${imgUrl ? `&url=${encodeURIComponent(imgUrl)}` : ''}`;

        const response = await fetch(apiUrl);
        if (!response.ok) {
            let errMsg = `Gagal membuat IQC (Status HTTP ${response.status})`;
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

        await conn.sendFile(m.chat, Buffer.from(buffer), 'iqc.png', `✅ *IQC Berhasil Dibuat!*\n\n✉️ Chat: ${msgText}\n🎨 Tema: ${theme}\n✨ Request by: ${m.pushName || 'User'}`, m);
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error('IQC Error:', e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply("❌ Gagal membuat gambar IQC: " + (e.message || e));
    }
};

handler.help = ["iqc", "iphone-qc"];
handler.tags = ["maker"];
handler.command = /^(iqc|iphone-qc)$/i;
handler.limit = true;
export default handler;