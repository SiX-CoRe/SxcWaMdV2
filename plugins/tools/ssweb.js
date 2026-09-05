import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`📸 *SCREENSHOT WEBSITE*\n\nContoh:\n${usedPrefix + command} https://google.com\n${usedPrefix + command} github.com --mobile\n${usedPrefix + command} youtube.com --full`);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        let url = text.split(' ')[0].trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        let device = text.includes('--mobile') ? 'mobile' : (text.includes('--tablet') ? 'tablet' : 'desktop');
        let fullPage = text.includes('--full') ? 'true' : 'false';
        let theme = text.includes('--dark') ? 'dark' : 'light';

        let apiKey = global.apikey?.jereapi;
        let apiUrl = `${global.web}/api/tools/ssweb?apikey=${apiKey}&url=${encodeURIComponent(url)}&device=${device}&theme=${theme}&fullPage=${fullPage}`;

        let res = await fetch(apiUrl);
        if (!res.ok) throw new Error(`Gagal mengambil screenshot (Status ${res.status})`);

        let buffer = await res.buffer();
        if (!buffer || buffer.length < 100) throw new Error("Hasil gambar screenshot kosong.");

        let caption = `📸 *SCREENSHOT WEBSITE*\n\n`;
        caption += `🔗 *URL:* ${url}\n`;
        caption += `📱 *Device:* ${device}\n`;
        caption += `🎨 *Theme:* ${theme}\n\n`;
        caption += `✅ *Request by:* ${m.pushName || 'User'}`;

        await conn.sendMessage(m.chat, {
            image: buffer,
            caption: caption
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ *Gagal Screenshot Web*\nError: ${e.message}`);
    }
};

handler.help = ['ssweb <url>', 'screenshot <url>'];
handler.tags = ['tools'];
handler.command = /^(ssweb|screenshot|sspc|sshp|ss)$/i;

handler.limit = 1;
export default handler;
