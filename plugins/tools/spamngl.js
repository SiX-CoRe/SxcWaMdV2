import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text || !text.includes('|')) {
        return m.reply(`📨 *SPAM NGL.LINK ANONYMOUS*\n\nFormat: *${usedPrefix + command} <username>|<pesan>|<jumlah>*\nContoh:\n${usedPrefix + command} jerexd|Semangat ngoding bang!|5`);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        let [username, question, limit] = text.split('|').map(s => s.trim());
        let count = parseInt(limit || '5');
        if (isNaN(count) || count < 1) count = 5;
        if (count > 25) count = 25;

        let apiKey = global.apikey?.jereapi;
        let apiUrl = `${global.web}/api/tools/spamngl?apikey=${apiKey}&username=${encodeURIComponent(username)}&question=${encodeURIComponent(question)}&limit=${count}`;

        let res = await fetch(apiUrl);
        let json = await res.json();

        if (!json.status) throw new Error(json.error || json.message || "Gagal mengirim spam NGL.");

        let caption = `📨 *SPAM NGL.LINK BERHASIL*\n\n`;
        caption += `👤 *Target:* @${username}\n`;
        caption += `💬 *Pesan:* ${question}\n`;
        caption += `📊 *Jumlah:* ${count} Pesan\n\n`;
        caption += `✅ *Request by:* ${m.pushName || 'User'}`;

        await m.reply(caption);
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ *Spam NGL Gagal*\nError: ${e.message}`);
    }
};

handler.help = ['spamngl <user>|<pesan>|<jumlah>'];
handler.tags = ['tools'];
handler.command = /^(spamngl|nglspam|ngl)$/i;

handler.limit = 1;
export default handler;
