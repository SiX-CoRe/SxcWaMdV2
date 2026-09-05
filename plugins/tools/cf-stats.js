import fetch from 'node-fetch';

let handler = async (m, { conn }) => {
    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        let apiKey = global.apikey?.jereapi;
        let res = await fetch(`${global.web}/api/tools/cf-stats?apikey=${apiKey}`);
        let json = await res.json();

        let txt = `📊 *CLOUDFLARE BYPASS ENGINE STATS*\n\n`;
        txt += "\`\`\`" + JSON.stringify(json.data || json.result || json, null, 2, null, 2) + "\`\`\`\n\n";
        txt += `✅ *Request by:* ${m.pushName || 'User'}`;

        await m.reply(txt);
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } catch (e) {
        m.reply(`❌ Error: ${e.message}`);
    }
};

handler.help = ['cf-stats', 'cfstats'];
handler.tags = ['tools'];
handler.command = /^(cf-stats|cfstats|bycfstats)$/i;

handler.limit = 1;
export default handler;
