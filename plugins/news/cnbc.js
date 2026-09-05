import fetch from 'node-fetch';

let handler = async (m, { conn, usedPrefix, command }) => {
  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
  try {
    const apiKey = global.apikey?.jereapi;
    const res = await fetch(`${global.web}/api/news/cnbc?apikey=${apiKey}`);
    const json = await res.json();

    if (!json.status || !json.data || json.data.length === 0) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply("❌ Tidak ada berita CNBC yang ditemukan saat ini.");
    }

    const newsList = json.data.slice(0, 7);
    let text = `📰 *BERITA TERBARU CNBC INDONESIA*\n\n`;
    
    newsList.forEach((item, i) => {
      text += `*${i + 1}. ${item.title || '-' }*\n`;
      if (item.category) text += `• 🏷️ *Kategori:* ${item.category}\n`;
      if (item.date || item.time) text += `• 📅 *Waktu:* ${item.date || item.time}\n`;
      if (item.link) text += `• 🔗 *Baca:* ${item.link}\n`;
      text += `\n`;
    });

    text += `✨ *SxcWaMd News Gateway*`;

    const firstImage = newsList.find(n => n.image)?.image;
    if (firstImage) {
      await conn.sendMessage(m.chat, {
        image: { url: firstImage },
        caption: text.trim()
      }, { quoted: m }).catch(() => m.reply(text.trim()));
    } else {
      await m.reply(text.trim());
    }

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Gagal memuat berita CNBC: " + e.message);
  }
};

handler.help = ['cnbc', 'cnbcnews'];
handler.tags = ['news'];
handler.command = /^(cnbc|cnbcnews)$/i;

handler.limit = 1;
export default handler;
