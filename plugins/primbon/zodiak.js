import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const zodiak = (text || '').trim();
    if (!zodiak) {
        return m.reply(`⚠️ Masukkan nama zodiak Anda!\n\nContoh: *${usedPrefix}${command} aries*\n\n*Daftar Zodiak:*\n• Aries, Taurus, Gemini, Cancer\n• Leo, Virgo, Libra, Scorpio\n• Sagittarius, Capricorn, Aquarius, Pisces`);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        let apiKey = global.apikey?.jereapi || global.apiKey;
        let url = `${global.web}/api/primbon/zodiak?apikey=${apiKey}&zodiak=${encodeURIComponent(zodiak.toLowerCase())}`;
        
        let res = await fetch(url);
        let json = await res.json();
        
        if (json.status && (json.result || json.data)) {
            let resData = json.result || json.data;
            let zodiakText = (typeof resData === 'object' && resData.zodiak) 
                ? resData.zodiak 
                : (typeof resData === 'string' ? resData : JSON.stringify(resData, null, 2));

            let card = `╭─「 🔮 *PRIMBON - RAMALAN ZODIAK* 」\n`;
            card += `├ ✨ *Bintang:* ${zodiak.toUpperCase()}\n`;
            card += `╰────────────────────\n\n`;
            card += `📜 *Ramalan, Elemen & Keberuntungan:*\n${zodiakText}\n\n`;
            card += `_Jadikan ramalan zodiak sebagai hiburan dan motivasi hidup positif._`;

            await m.reply(card.trim());
            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
        } else {
            throw new Error(json.error || json.message || `Ramalan untuk zodiak "${zodiak}" tidak ditemukan. Pastikan ejaan zodiak benar.`);
        }
    } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        console.error(e);
        m.reply("❌ Error: " + e.message);
    }
};

handler.help = ['zodiak <nama_zodiak>'];
handler.tags = ['primbon'];
handler.command = /^(zodiak|ramalanzodiak|horoskop)$/i;
handler.limit = 1;
export default handler;
