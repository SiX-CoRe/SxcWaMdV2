import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
  try {
    const apiKey = global.apikey?.jereapi;
    const res = await fetch(`${global.web}/api/search/wallpaper?apikey=${apiKey}&query=${encodeURIComponent(text || '')}`);
    const json = await res.json();

    if (!json.status || !json.result || json.result.length === 0) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply(`❌ Wallpaper tidak ditemukan${text ? ' untuk query: ' + text : ''}.`);
    }

    const randomWallpaper = json.result[Math.floor(Math.random() * json.result.length)];
    const imgUrl = randomWallpaper.image || randomWallpaper.url;

    if (!imgUrl) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply("❌ URL wallpaper tidak valid.");
    }

    let caption = `🖼️ *HD WALLPAPER SEARCH*\n\n`;
    if (randomWallpaper.title) caption += `📌 *Judul:* ${randomWallpaper.title}\n`;
    if (randomWallpaper.resolution) caption += `📐 *Resolusi:* ${randomWallpaper.resolution}\n`;
    if (randomWallpaper.category) caption += `🏷️ *Kategori:* ${randomWallpaper.category}\n`;
    if (randomWallpaper.source) caption += `🔗 *Sumber:* ${randomWallpaper.source}\n`;
    caption += `\n✨ *Wallhaven High Resolution Wallpapers*`;

    await conn.sendMessage(m.chat, {
      image: { url: imgUrl },
      caption: caption.trim()
    }, { quoted: m }).catch(() => m.reply(`Gagal mengirim media, ini linknya: ${imgUrl}`));

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Gagal mencari wallpaper: " + e.message);
  }
};

handler.help = ['wallpaper [query]'];
handler.tags = ['search'];
handler.command = /^(wallpaper|wallpapers)$/i;

handler.limit = 1;
export default handler;
