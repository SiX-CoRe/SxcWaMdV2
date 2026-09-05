import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`⚠️ *Masukkan kata kunci pencarian Wikimedia!*\nContoh: ${usedPrefix + command} Monas Jakarta`);

  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
  try {
    const apiKey = global.apikey?.jereapi;
    const res = await fetch(`${global.web}/api/search/wikimedia?apikey=${apiKey}&query=${encodeURIComponent(text)}`);
    const json = await res.json();

    if (!json.status || !json.result || json.result.length === 0) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply(`❌ Gambar tidak ditemukan di Wikimedia untuk: "${text}"`);
    }

    const randomImg = json.result[Math.floor(Math.random() * json.result.length)];
    const imgUrl = randomImg.image || randomImg.url;

    let caption = `🖼️ *WIKIMEDIA COMMONS SEARCH*\n\n`;
    caption += `📌 *Judul:* ${randomImg.title || text}\n`;
    if (randomImg.author) caption += `👤 *Author:* ${randomImg.author}\n`;
    if (randomImg.source) caption += `🔗 *Sumber:* ${randomImg.source}\n`;
    caption += `\n✨ *Wikimedia Commons Open Media*`;

    await conn.sendMessage(m.chat, {
      image: { url: imgUrl },
      caption: caption.trim()
    }, { quoted: m }).catch(() => m.reply(`Gagal mengirim media, ini linknya: ${imgUrl}`));

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Gagal mencari di Wikimedia: " + e.message);
  }
};

handler.help = ['wikimedia <query>'];
handler.tags = ['search'];
handler.command = /^(wikimedia)$/i;

handler.limit = 1;
export default handler;
