import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`⚠️ *Masukkan kata kunci ilustrasi Pixiv!*\nContoh: ${usedPrefix + command} hatsune miku`);

  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
  try {
    const apiKey = global.apikey?.jereapi;
    const res = await fetch(`${global.web}/api/search/pixiv?apikey=${apiKey}&query=${encodeURIComponent(text)}&type=artworks`);
    const json = await res.json();

    if (!json.status || !json.result) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply(`❌ Ilustrasi tidak ditemukan untuk: "${text}"`);
    }

    const item = Array.isArray(json.result) ? json.result[0] : json.result;
    const imgUrl = (item.Images && item.Images.length > 0) ? item.Images[0] : item.image || item.url;

    let caption = `🎨 *PIXIV ARTWORK SEARCH*\n\n`;
    caption += `📌 *Judul:* ${item.Title || item.title || text}\n`;
    caption += `👤 *Artist:* ${item.Author || item.author || '-'}\n`;
    if (item.Stats) {
      caption += `📊 *Stats:* ❤️ ${item.Stats.Likes || 0} Likes | ⭐ ${item.Stats.Bookmarks || 0} Bookmarks | 👁️ ${item.Stats.Views || 0} Views\n`;
    }
    if (item.Tags) caption += `🏷️ *Tags:* ${item.Tags}\n`;
    if (item.Id || item.id) caption += `🔗 *Link:* https://www.pixiv.net/artworks/${item.Id || item.id}\n`;
    caption += `\n✨ *SxcWaMd Pixiv Engine*`;

    if (imgUrl) {
      await conn.sendMessage(m.chat, {
        image: { url: imgUrl },
        caption: caption.trim()
      }, { quoted: m }).catch(() => m.reply(caption.trim() + `\n\nLink Gambar: ${imgUrl}`));
    } else {
      await m.reply(caption.trim());
    }

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Gagal mencari di Pixiv: " + e.message);
  }
};

handler.help = ['pixiv <query>'];
handler.tags = ['search'];
handler.command = /^(pixiv)$/i;

handler.limit = 1;
export default handler;
