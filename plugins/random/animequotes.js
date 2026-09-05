/*
* Gw LumnzTyz Ngasih Credits Thanks jarexd
***/
let handler = async (m, { conn }) => {
    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        const apiKey = global.apikey?.jereapi || global.apikey || "jerexd";
        const response = await fetch(`${global.web || 'https://api.jere.my.id'}/api/random/animequotes?apikey=${apiKey}`);
        const json = await response.json();
        if (!json.status || !json.result) throw new Error(json.error || "Quotes tidak ditemukan");
        
        let res = json.result;
        let quote = res.quote || res.quotes || res.text || '';
        let character = res.character || res.karakter || res.char || '-';
        let anime = res.anime || res.title || '-';
        let episode = res.episode ? `\n📝 *Episode:* ${res.episode}` : '';
        
        let text = `*⛩️ QUOTES ANIME ⛩️*\n\n`;
        text += `_" ${quote} "_\n\n`;
        text += `👤 *Karakter:* ${character}\n`;
        text += `🎬 *Anime:* ${anime}${episode}`;
        
        let imgUrl = res.gambar || res.image;
        if (imgUrl) {
            try {
                await conn.sendMessage(m.chat, { image: { url: imgUrl }, caption: text.trim() }, { quoted: m });
            } catch (err) {
                await conn.reply(m.chat, text.trim(), m);
            }
        } else {
            await conn.reply(m.chat, text.trim(), m);
        }
        
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        console.error(e);
        m.reply("❌ Error: " + (e.message || e));
    }
};

handler.help = ["animequotes", "quotes"];
handler.command = ["animequotes", "quotesanime", "quote", "quotes"];
handler.tags = ["random"];

handler.limit = 1;
export default handler;
