import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text || !text.includes('|')) {
        return m.reply(`💥 *RUSUH PANEL (PTERODACTYL MASS CREATE)*\n\nFormat:\n*${usedPrefix + command} jumlah|nama|namaserver|egg|nestid|locationid|domain|apiptla|apiptlc|ram*\n\nContoh:\n${usedPrefix + command} 5|user|srv|15|5|1|https://panel.com|ptla_xxx|ptlc_xxx|1gb`);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        m.reply("⏳ Membuat server massal di Pterodactyl panel... Mohon tunggu.");

        let parts = text.split('|').map(s => s.trim());
        if (parts.length < 10) throw new Error("Format parameter kurang lengkap (10 parameter wajib dipisah garis lurus |)");

        let [jumlah, nama, namaserver, egg, nestid, locationid, domain, apiptla, apiptlc, ram] = parts;

        let apiKey = global.apikey?.jereapi;
        let queryParams = new URLSearchParams({
            apikey: apiKey,
            jumlah, nama, namaserver, egg, nestid, locationid, domain, apiptla, apiptlc, ram
        });

        let res = await fetch(`${global.web}/api/tools/rusuhpanel?${queryParams.toString()}`);
        let json = await res.json();

        if (!json.status) throw new Error(json.error || json.message || "Gagal membuat server di panel.");

        let data = json.data || json.result || json;
        let caption = `💥 *RUSUH PANEL BERHASIL*\n\n`;
        caption += `🌐 *Domain:* ${domain}\n`;
        caption += `📊 *Jumlah Dibuat:* ${jumlah}\n`;
        caption += `💾 *RAM:* ${ram}\n`;
        caption += "\`\`\`" + JSON.stringify(data, null, 2, null, 2).slice(0, 2000) + "\`\`\`\n\n";
        caption += `✅ *Request by:* ${m.pushName || 'User'}`;

        await m.reply(caption);
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ *Rusuh Panel Gagal*\nError: ${e.message}`);
    }
};

handler.help = ['rusuhpanel <params>'];
handler.tags = ['tools'];
handler.command = /^(rusuhpanel|spampanel|masscreatepanel)$/i;
handler.owner = true;

handler.limit = 1;
export default handler;
