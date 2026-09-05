import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text || !text.includes('|')) {
        return m.reply(`📱 *WEB TO APK CONVERTER*\n\nUbah website menjadi aplikasi APK Android!\nFormat: *${usedPrefix + command} <url>|<nama app>*\n\nContoh:\n${usedPrefix + command} https://jerexd.my.id|JereApp`);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        m.reply("⏳ Mengompilasi website menjadi file APK Android... Mohon tunggu.");

        let [url, name] = text.split('|').map(s => s.trim());
        if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;

        let apiKey = global.apikey?.jereapi;
        let apiUrl = `${global.web}/api/tools/web2apk?apikey=${apiKey}`;

        let res = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, name })
        });

        let json = await res.json();
        if (!json.status) throw new Error(json.error || "Gagal membuat APK.");

        let data = json.result || {};
        let downloadUrl = data.download_url;

        let caption = `📱 *APK BERHASIL DIBUAT*\n\n`;
        caption += `📛 *Nama App:* ${data.app_name || name}\n`;
        caption += `📦 *Package:* ${data.package_name || '-'}\n`;
        caption += `🔗 *Download URL:* ${downloadUrl || '-'}\n\n`;
        caption += `✅ *Request by:* ${m.pushName || 'User'}`;

        if (downloadUrl) {
            try {
                let apkRes = await fetch(downloadUrl);
                let apkBuffer = await apkRes.buffer();

                await conn.sendMessage(m.chat, {
                    document: apkBuffer,
                    fileName: `${name.replace(/\s+/g, '_')}.apk`,
                    mimetype: 'application/vnd.android.package-archive',
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
        m.reply(`❌ *Web2APK Gagal*\nError: ${e.message}`);
    }
};

handler.help = ['web2apk <url>|<nama app>', 'buatapk <url>|<nama app>'];
handler.tags = ['tools'];
handler.command = /^(web2apk|buatapk|linktoapk)$/i;

handler.limit = 1;
export default handler;
