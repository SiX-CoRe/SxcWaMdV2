import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`⚠️ *Masukkan kata kunci gambar!*\nContoh: ${usedPrefix + command} anime pemandangan`);
  
  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
  try {
    const apiKey = global.apikey?.jereapi;
    const res = await fetch(`${global.web}/api/search/bingimage?apikey=${apiKey}&q=${encodeURIComponent(text)}&limit=10`);
    const json = await res.json();

    if (!json.status || !json.data || json.data.length === 0) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply(`❌ Tidak ditemukan gambar untuk: "${text}"`);
    }

    const randomImg = json.data[Math.floor(Math.random() * json.data.length)];
    const imgUrl = randomImg.mediaurl || randomImg.url || randomImg.link;

    if (!imgUrl) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply("❌ URL gambar tidak valid.");
    }

    let caption = `🖼️ *BING IMAGE SEARCH*\n\n`;
    caption += `📌 *Judul:* ${randomImg.title || text}\n`;
    if (randomImg.link) caption += `🔗 *Sumber:* ${randomImg.link}\n`;
    caption += `\n✨ *SxcWaMd Bing Search*`;

    await conn.sendMessage(m.chat, {
      image: { url: imgUrl },
      caption: caption.trim()
    }, { quoted: m }).catch(() => m.reply(`Gagal mengirim media, ini linknya: ${imgUrl}`));

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Gagal mencari gambar di Bing: " + e.message);
  }
};

handler.help = ['bingimage <query>', 'bingimg <query>'];
handler.tags = ['search'];
handler.command = /^(bingimage|bingimg)$/i;

handler.limit = 1;
export default handler;
