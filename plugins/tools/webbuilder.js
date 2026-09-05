import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`🌐 *PREMIUM WEB BUILDER (SOURCE CODE GENERATOR)*\n\nBuat Source Code Website Siap Deploy (HTML/CSS/JS) lengkap dengan 5 tema desain premium!\n\n*Format:*\n${usedPrefix + command} <type>|<theme>\n\n*Pilihan Type:*\n• portfolio (Web Portofolio Pribadi)\n• downloader (Web Media Downloader)\n\n*Pilihan Tema (1-5):*\n1. Midnight Aurora (Glassmorphism & Gradients)\n2. Neo Tokyo (Cyberpunk Neon)\n3. Ocean Depth (Fluid Deep Ocean)\n4. Sakura Dark (Japanese Aesthetic)\n5. Emerald Matrix (Modern Clean Tech)\n\n*Contoh:*\n${usedPrefix + command} portfolio|1\n${usedPrefix + command} downloader|2`);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        m.reply("⏳ Merakit template source code website dan mengemas ke ZIP... Mohon tunggu.");

        let [type, theme] = text.split('|').map(s => s.trim().toLowerCase());
        if (!type || !['portfolio', 'downloader'].includes(type)) type = 'portfolio';
        let themeNum = parseInt(theme || '1');
        if (isNaN(themeNum) || themeNum < 1 || themeNum > 5) themeNum = 1;

        let apiKey = global.apikey?.jereapi;
        let apiUrl = `${global.web}/api/tools/webbuilder?apikey=${apiKey}&type=${type}&theme=${themeNum}`;

        let res = await fetch(apiUrl);
        let json = await res.json();

        if (!json.status) throw new Error(json.error || "Gagal menghasilkan source code website.");

        let data = json.result || {};
        let downloadUrl = data.download_url;

        let caption = `🌐 *SOURCE CODE WEBSITE SIAP DEPLOY*\n\n`;
        caption += `📦 *Tipe Web:* ${data.type || type}\n`;
        caption += `🎨 *Tema:* ${data.theme || themeNum}\n`;
        caption += `✨ *Style:* ${data.style || '-'}\n`;
        caption += `📄 *Jumlah Berkas:* ${data.total_files || '-'} file\n`;
        caption += `🔗 *Download URL:* ${downloadUrl || '-'}\n\n`;
        caption += `💡 *Instruksi:* Ekstrak ZIP lalu deploy ke Vercel/Netlify/GitHub Pages.\n\n`;
        caption += `✅ *Request by:* ${m.pushName || 'User'}`;

        if (downloadUrl) {
            try {
                let zipRes = await fetch(downloadUrl);
                let zipBuffer = await zipRes.buffer();

                await conn.sendMessage(m.chat, {
                    document: zipBuffer,
                    fileName: `web_${type}_theme${themeNum}.zip`,
                    mimetype: 'application/zip',
                    caption: caption
                }, { quoted: m });
            } catch (err) {
                await m.reply(caption);
            }
        } else {
            await m.reply(caption);
        }

        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`❌ *WebBuilder Gagal*\nError: ${e.message}`);
    }
};

handler.help = ['webbuilder <portfolio|downloader>|<1-5>', 'buildweb <type>|<theme>'];
handler.tags = ['tools'];
handler.command = /^(webbuilder|buildweb|sourcesite|buatweb)$/i;

handler.limit = 1;
export default handler;
