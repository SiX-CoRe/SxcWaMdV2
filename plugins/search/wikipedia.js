import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`⚠️ *Masukkan kata kunci pencarian Wikipedia!*\nContoh: ${usedPrefix + command} Indonesia`);

  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
  try {
    const apiKey = global.apikey?.jereapi;
    const res = await fetch(`${global.web}/api/search/wikipedia?apikey=${apiKey}&query=${encodeURIComponent(text)}&lang=id`);
    const json = await res.json();

    if (!json.status || !json.result) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply(`❌ Artikel Wikipedia tidak ditemukan untuk: "${text}"`);
    }

    const r = json.result;
    let output = `📚 *WIKIPEDIA INDONESIA*\n\n`;
    output += `📌 *Judul:* ${r.title || text}\n`;
    if (r.url) output += `🔗 *Link:* ${r.url}\n\n`;
    output += `📖 *Ringkasan:*\n${r.desc || '_Tidak ada ringkasan teks._'}\n\n`;
    output += `✨ *Wikipedia Ensiklopedia Bebas*`;

    const imgUrl = r.image || 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/1200px-Wikipedia-logo-v2.svg.png';
    await conn.sendMessage(m.chat, {
      image: { url: imgUrl },
      caption: output.trim()
    }, { quoted: m }).catch(() => m.reply(output.trim()));

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Gagal memuat Wikipedia: " + e.message);
  }
};

handler.help = ['wikipedia <query>', 'wiki <query>'];
handler.tags = ['search'];
handler.command = /^(wikipedia|wiki)$/i;

handler.limit = 1;
export default handler;
