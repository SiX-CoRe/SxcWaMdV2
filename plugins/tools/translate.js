import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m;
    let targetText = text;
    let lang = 'id';

    if (m.quoted && m.quoted.text) {
        targetText = m.quoted.text;
        if (text) lang = text.trim();
    } else if (text && text.includes('|')) {
        let parts = text.split('|');
        lang = parts[0].trim();
        targetText = parts.slice(1).join('|').trim();
    } else if (!text) {
        return m.reply(`🌐 *TRANSLATE / PENERJEMAH*\n\n*Cara Pakai:*\n1. *${usedPrefix + command} <lang>|<teks>*\n2. Reply teks pesan dengan *${usedPrefix + command} <lang>*\n\n*Contoh:*\n${usedPrefix + command} en|Selamat pagi semuanya\n${usedPrefix + command} id|Good morning everyone`);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        let apiUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(lang)}&dt=t&q=${encodeURIComponent(targetText)}`;
        let res = await fetch(apiUrl);
        let json = await res.json();

        let translated = json[0].map(item => item[0]).join('');
        let detectedLang = json[2] || 'auto';

        let caption = `🌐 *HASIL TERJEMAHAN*\n\n`;
        caption += `🔤 *Deteksi Bahasa:* ${detectedLang.toUpperCase()} ➔ ${lang.toUpperCase()}\n\n`;
        caption += `📝 *Teks:*\n${translated}\n\n`;
        caption += `✅ *Request by:* ${m.pushName || 'User'}`;

        await m.reply(caption);
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ *Translate Gagal*\nError: ${e.message}`);
    }
};

handler.help = ['translate <lang>|<teks>', 'tr <lang>|<teks>'];
handler.tags = ['tools'];
handler.command = /^(translate|tr|terjemah|artikan)$/i;

handler.limit = 1;
export default handler;
