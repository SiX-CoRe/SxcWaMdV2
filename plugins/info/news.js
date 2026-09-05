let handler = async (m, { conn, usedPrefix, command, args }) => {
    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        let cmd = (command || '').toLowerCase();
        let portal = ['kompas', 'liputan6', 'cnbc'].includes(cmd) ? cmd : (args[0] ? args[0].toLowerCase() : '');
        
        if (!portal || !['kompas', 'liputan6', 'cnbc'].includes(portal)) {
            return m.reply(
                `📰 *PORTAL BERITA TERKINI*\n\n` +
                `📌 *Pilih sumber berita:*\n` +
                `• ${usedPrefix}kompas\n` +
                `• ${usedPrefix}liputan6\n` +
                `• ${usedPrefix}cnbc\n\n` +
                `👉 *Contoh:* ${usedPrefix}news kompas`
            );
        }

        const apiKey = global.apikey?.jereapi || global.apikey || 'jerexd';
        const url = `${global.web || 'https://api.jere.my.id'}/api/news/${portal}?apikey=${apiKey}`;
        const res = await fetch(url);
        const json = await res.json();

        if (!json.status) throw new Error(json.message || json.error || "Gagal mengambil berita dari server");

        let data = json.result || json.data;
        let articles = Array.isArray(data) ? data : (data?.articles || []);
        articles = articles.filter(a => a && typeof a !== 'function');

        if (!articles.length) throw new Error("Tidak ada berita ditemukan");

        let resText = `📰 *BERITA TERKINI [${portal.toUpperCase()}]*\n\n`;
        for (let i = 0; i < Math.min(articles.length, 5); i++) {
            let a = articles[i];
            if (!a || typeof a === 'function') continue;
            let title = typeof a.title === 'string' ? a.title : (typeof a.judul === 'string' ? a.judul : '');
            let desc = typeof a.description === 'string' ? a.description : (typeof a.berita === 'string' ? a.berita : '');
            let link = typeof a.link === 'string' ? a.link : (typeof a.url === 'string' ? a.url : '');
            
            resText += `📌 *${title}*\n`;
            if (desc) resText += `${desc}\n`;
            if (link) resText += `🔗 ${link}\n`;
            resText += `───────────────\n`;
        }

        await m.reply(resText.trim());
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        console.error(e);
        m.reply("❌ Error: " + (e.message || e || "Gagal memproses berita"));
    }
};

handler.help = ["kompas", "liputan6", "cnbc", "news <portal>"];
handler.command = /^(kompas|liputan6|cnbc|news|berita)$/i;
handler.tags = ["info"];

export default handler;
