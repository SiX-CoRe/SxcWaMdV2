import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`⚠️ *Format penggunaan:*\n• Web Search: *${usedPrefix + command} query*\n• Image Search: *${usedPrefix + command} query | image*`);

  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
  try {
    const apiKey = global.apikey?.jereapi;
    const parts = text.split('|').map(s => s.trim());
    const query = parts[0];
    const type = (parts[1] || 'web').toLowerCase();

    const res = await fetch(`${global.web}/api/tools/google?apikey=${apiKey}&query=${encodeURIComponent(query)}&type=${encodeURIComponent(type)}`);
    const json = await res.json();

    if (!json.status || !json.result) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply(`❌ Hasil Google tidak ditemukan untuk: "${query}"`);
    }

    if (type === 'image' || type === 'img') {
      const imgList = Array.isArray(json.result) ? json.result : [];
      if (!imgList.length) return m.reply("❌ Tidak ditemukan gambar.");
      const randomImg = imgList[Math.floor(Math.random() * imgList.length)];
      const imgUrl = randomImg.url || randomImg.image;

      let caption = `🖼️ *GOOGLE IMAGE SEARCH*\n\n📌 *Query:* ${query}\n`;
      if (randomImg.title) caption += `• *Judul:* ${randomImg.title}\n`;
      if (randomImg.domain) caption += `• 🌐 *Domain:* ${randomImg.domain}\n`;
      caption += `\n✨ *Google Search Engine*`;

      await conn.sendMessage(m.chat, {
        image: { url: imgUrl },
        caption: caption.trim()
      }, { quoted: m }).catch(() => m.reply(caption.trim() + `\n\nLink: ${imgUrl}`));
    } else {
      const r = json.result;
      const webResults = r.results || r.web_results || [];

      let output = `🔎 *GOOGLE SEARCH RESULTS*\n🔍 *Query:* ${query}\n\n`;

      if (r.summary) {
        output += `💡 *AI Overview / Ringkasan:*\n${r.summary}\n\n`;
      }

      if (webResults.length > 0) {
        output += `🌐 *Hasil Pencarian Teratas:*\n`;
        webResults.slice(0, 5).forEach((item, i) => {
          output += `*${i + 1}. ${item.title || '-' }*\n`;
          if (item.description) output += `• 📝 ${item.description}\n`;
          if (item.url) output += `• 🔗 ${item.url}\n`;
          output += `\n`;
        });
      }

      output += `✨ *Google Search via JereAPI*`;
      await m.reply(output.trim());
    }

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Gagal melakukan pencarian Google: " + e.message);
  }
};

handler.help = ['google <query>', 'google <query> | image'];
handler.tags = ['tools', 'search'];
handler.command = /^(google|googlesearch)$/i;

handler.limit = 1;
export default handler;
