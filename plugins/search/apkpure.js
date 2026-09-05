import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`⚠️ *Masukkan nama aplikasi yang ingin dicari!*\nContoh: ${usedPrefix + command} whatsapp`);
  
  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
  try {
    const apiKey = global.apikey?.jereapi;
    const res = await fetch(`${global.web}/api/search/apkpure?apikey=${apiKey}&query=${encodeURIComponent(text)}&limit=10`);
    const json = await res.json();

    if (!json.status || !json.result || json.result.length === 0) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply(`❌ Tidak ditemukan aplikasi untuk query: "${text}"`);
    }

    const apps = json.result.slice(0, 5);
    let caption = `📱 *APKPURE SEARCH*\n🔍 *Query:* ${text}\n\n`;

    apps.forEach((app, i) => {
      caption += `*${i + 1}. ${app.title || app.name || '-' }*\n`;
      if (app.developer) caption += `• 👨‍💻 *Developer:* ${app.developer}\n`;
      if (app.version) caption += `• 📦 *Versi:* ${app.version}\n`;
      if (app.rating) caption += `• ⭐ *Rating:* ${app.rating}\n`;
      caption += `• 🔗 *Link:* ${app.link || app.download_url || '-'}\n\n`;
    });

    caption += `✨ *Search*`;

    const icon = apps.find(a => a.icon)?.icon;
    if (icon) {
      await conn.sendMessage(m.chat, {
        image: { url: icon },
        caption: caption.trim()
      }, { quoted: m }).catch(() => m.reply(caption.trim()));
    } else {
      await m.reply(caption.trim());
    }

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Gagal mencari aplikasi APK: " + e.message);
  }
};

handler.help = ['apkpure <query>', 'apk <query>'];
handler.tags = ['search'];
handler.command = /^(apkpure|apk)$/i;

handler.limit = 1;
export default handler;
