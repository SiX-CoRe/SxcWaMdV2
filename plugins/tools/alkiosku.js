import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text || !text.includes('|')) {
        return m.reply(`🏪 *ALKIOSKU AUTOMATION*\n\nFormat: *${usedPrefix + command} <email>|<password>|<amount>*\nContoh:\n${usedPrefix + command} akun@mail.com|Pass123!|10`);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        let [email, password, amount] = text.split('|').map(s => s.trim());
        let apiKey = global.apikey?.jereapi;
        let apiUrl = `${global.web}/api/tools/alkiosku?apikey=${apiKey}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&amount=${encodeURIComponent(amount || '1')}`;

        let res = await fetch(apiUrl);
        let json = await res.json();

        if (!json.status) throw new Error(json.error || json.message || "Gagal memproses request Alkiosku.");

        let caption = `🏪 *ALKIOSKU BERHASIL*\n\n`;
        caption += "\`\`\`" + JSON.stringify(json.result || json.data || json, null, 2, null, 2) + "\`\`\`\n\n";
        caption += `✅ *Request by:* ${m.pushName || 'User'}`;

        await m.reply(caption);
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ *Alkiosku Gagal*\nError: ${e.message}`);
    }
};

handler.help = ['alkiosku <email>|<pass>|<amount>'];
handler.tags = ['tools'];
handler.command = /^(alkiosku|kioskudigital)$/i;

handler.limit = 1;
export default handler;
