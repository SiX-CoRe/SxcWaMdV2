import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`⚠️ *Masukkan kata kunci pencarian YouTube!*\nContoh: ${usedPrefix + command} Alan Walker Faded`);

  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
  try {
    const apiKey = global.apikey?.jereapi;
    const res = await fetch(`${global.web}/api/search/youtube?apikey=${apiKey}&q=${encodeURIComponent(text)}`);
    const json = await res.json();

    const videos = json.result || json.data || [];
    if (!videos.length) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply(`❌ Video YouTube tidak ditemukan untuk: "${text}"`);
    }

    const list = videos.slice(0, 7);
    let output = `🎬 *YOUTUBE SEARCH RESULTS*\n🔍 *Query:* ${text}\n\n`;

    list.forEach((v, i) => {
      output += `*${i + 1}. ${v.title || '-' }*\n`;
      if (v.channel || v.author) output += `• 👤 *Channel:* ${v.channel || v.author}\n`;
      if (v.duration) output += `• ⏱️ *Durasi:* ${v.duration}\n`;
      if (v.link || v.url) output += `• 🔗 *Link:* ${v.link || v.url}\n`;
      output += `\n`;
    });

    output += `✨ *Ketik .ytmp3 <link> atau .ytmp4 <link> untuk mendownload!*`;

    const firstThumb = list.find(v => v.imageUrl || v.thumbnail)?.imageUrl || list.find(v => v.thumbnail)?.thumbnail;
    if (firstThumb) {
      await conn.sendMessage(m.chat, {
        image: { url: firstThumb },
        caption: output.trim()
      }, { quoted: m }).catch(() => m.reply(output.trim()));
    } else {
      await m.reply(output.trim());
    }

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Gagal mencari video YouTube: " + e.message);
  }
};

handler.help = ['yts <query>'];
handler.tags = ['search'];
handler.command = /^(yts)$/i;

handler.limit = 1;
export default handler;
