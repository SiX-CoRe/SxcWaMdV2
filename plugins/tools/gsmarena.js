import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`📱 *GSMARENA PHONE SPECS*\n\nLihat & bandingkan spesifikasi smartphone!\nContoh:\n${usedPrefix + command} iPhone 15 Pro\n${usedPrefix + command} iPhone 15 Pro|Samsung S24 Ultra`);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        let [hp1, hp2] = text.split('|').map(s => s.trim());
        let apiKey = global.apikey?.jereapi;
        let apiUrl = `${global.web}/api/search/gsmarena?apikey=${apiKey}&hp1=${encodeURIComponent(hp1)}`;
        if (hp2) apiUrl += `&hp2=${encodeURIComponent(hp2)}`;

        let res = await fetch(apiUrl);
        let json = await res.json();

        if (!json.status) throw new Error(json.error || json.message || "Spesifikasi ponsel tidak ditemukan.");

        let result = json.result || {};
        let caption = `📱 *SPESIFIKASI HP GSMARENA*\n\n`;

        if (typeof result === 'string') {
            caption += result;
        } else if (Array.isArray(result)) {
            result.forEach(hp => {
                caption += `🔹 *Nama:* ${hp.name || hp.title || '-'}\n`;
                caption += `📅 *Rilis:* ${hp.released || hp.launch || '-'}\n`;
                caption += `💾 *Storage/RAM:* ${hp.storage || '-'}\n`;
                caption += `🔋 *Baterai:* ${hp.battery || '-'}\n`;
                caption += `📷 *Kamera:* ${hp.camera || '-'}\n\n`;
            });
        } else {
            for (let [k, v] of Object.entries(result)) {
                if (typeof v !== 'object') caption += `• *${k}:* ${v}\n`;
            }
        }

        caption += `\n✅ *Request by:* ${m.pushName || 'User'}`;
        await m.reply(caption);
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ *GSMArena Gagal*\nError: ${e.message}`);
    }
};

handler.help = ['gsmarena <nama hp>', 'speshp <hp1>|<hp2>'];
handler.tags = ['tools'];
handler.command = /^(gsmarena|speshp|hpspec|spekhp)$/i;

handler.limit = 1;
export default handler;
