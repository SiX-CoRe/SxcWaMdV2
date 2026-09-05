import fetch from 'node-fetch';

let handler = async (m, { conn }) => {
    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        let apiKey = global.apikey?.jereapi;
        let res = await fetch(`${global.web}/api/tools/bycf_keys?apikey=${apiKey}`);
        let json = await res.json();

        let txt = `🔑 *BYCF AVAILABLE KEYS*\n\n`;
        txt += "\`\`\`" + JSON.stringify(json.keys || json.result || json, null, 2, null, 2) + "\`\`\`\n\n";
        txt += `✅ *Request by:* ${m.pushName || 'User'}`;

        await m.reply(txt);
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } catch (e) {
        m.reply(`❌ Error: ${e.message}`);
    }
};

handler.help = ['bycf_keys'];
handler.tags = ['tools'];
handler.command = /^(bycf_keys|bycfkeys)$/i;

handler.limit = 1;
export default handler;
