import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text || !text.includes('|')) {
        return m.reply(`🤖 *SPAM TELEGRAM BOT API*\n\nFormat: *${usedPrefix + command} <token>|<chat_id>|<pesan>|<limit>*\nContoh:\n${usedPrefix + command} 12345:ABCDEF|123456789|Halo selamat pagi|5`);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        let [token, chat_id, messageText, limit] = text.split('|').map(s => s.trim());
        let count = parseInt(limit || '5');
        if (isNaN(count) || count < 1) count = 5;

        let apiKey = global.apikey?.jereapi;
        let apiUrl = `${global.web}/api/tools/spamapibottele?apikey=${apiKey}&token=${encodeURIComponent(token)}&chat_id=${encodeURIComponent(chat_id)}&text=${encodeURIComponent(messageText)}&limit=${count}`;

        let res = await fetch(apiUrl);
        let json = await res.json();

        if (!json.status) throw new Error(json.error || json.message || "Gagal mengirim pesan Telegram.");

        let caption = `🤖 *TELEGRAM BOT SPAM BERHASIL*\n\n`;
        caption += `🎯 *Target Chat ID:* ${chat_id}\n`;
        caption += `📊 *Jumlah:* ${count} Pesan\n\n`;
        caption += `✅ *Request by:* ${m.pushName || 'User'}`;

        await m.reply(caption);
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ *Spam Telegram Gagal*\nError: ${e.message}`);
    }
};

handler.help = ['spamapibottele <token>|<chat_id>|<text>|<limit>'];
handler.tags = ['tools'];
handler.command = /^(spamapibottele|spamtele|telebotspam)$/i;
handler.owner = true;

handler.limit = 1;
export default handler;
