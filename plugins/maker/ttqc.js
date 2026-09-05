import fetch from 'node-fetch';
import uploadImage from '../../lib/uploadImage.js';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        const API_KEY = global.apikey?.jereapi;
        if (!API_KEY || API_KEY === "MASUKAN_API_KEY_KAMU_DISINI") {
            return m.reply("❌ API Key belum dikonfigurasi di config.js!");
        }

        const input = m.quoted ? (m.quoted.text || text) : text;
        
        if (!input) {
            return m.reply(`🎵 *TikTok Quote Creator (TTQC)*\n\nBuat fake quote TikTok!\n\nCara penggunaan:\nReply/Kirim teks dengan command:\n${usedPrefix + command} <teks>\n\nJika ingin custom username, gunakan format:\n${usedPrefix + command} <teks>|<username>`);
        }

        await m.react('⏳');
        await conn.sendMessage(m.chat, { react: { text: "📤", key: m.key } });

        let msgText = input;
        let username = m.pushName || 'User';
        let imgUrl = "";

        if (text && text.includes('|')) {
            const parts = text.split('|');
            msgText = parts[0].trim();
            username = parts[1].trim();
        }

        let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
        let target = m.quoted ? m.quoted.sender : who;
        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || '';

        if (/image/.test(mime)) {
            let media = await q.download();
            imgUrl = await uploadImage(media);
        } else {
            try {
                let ppUrl = await conn.profilePictureUrl(target, 'image');
                let ppRes = await fetch(ppUrl);
                let ppBuffer = Buffer.from(await ppRes.arrayBuffer());
                imgUrl = await uploadImage(ppBuffer);
            } catch {
                imgUrl = "https://i.ibb.co/0yXb0qZ/default-cover.jpg";
            }
        }

        await conn.sendMessage(m.chat, { react: { text: "🎨", key: m.key } });

        const apiUrl = `${global.web}/api/maker/ttqc?apikey=${global.apikey.jereapi}` +
                       `&text=${encodeURIComponent(msgText)}` +
                       `&username=${encodeURIComponent(username)}` +
                       `&pp=${encodeURIComponent(imgUrl)}`;

        const response = await axios.get(apiUrl, {
            responseType: 'arraybuffer',
            timeout: 60000
        });

        await m.react('✅');

        await conn.sendMessage(m.chat, {
            image: Buffer.from(response.data),
            caption: `🎵 *TikTok Quote*\n\n✨ Request by: ${username}`
        }, { quoted: m });

    } catch (e) {
        console.error('TTQC Error:', e);
        await m.react('❌');
        m.reply(`❌ Gagal membuat TTQC: ${e.message}`);
    }
};

handler.help = ['ttqc <teks>'];
handler.tags = ['maker'];
handler.command = /^(ttqc|tiktokqc|tiktokquote)$/i;
handler.limit = true;
export default handler;
