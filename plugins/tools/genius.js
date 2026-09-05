import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`⚠️ *Masukkan judul lagu atau lirik Genius!*\nContoh: ${usedPrefix + command} Bohemian Rhapsody`);

  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
  try {
    const apiKey = global.apikey?.jereapi;
    const res = await fetch(`${global.web}/api/tools/genius?apikey=${apiKey}&query=${encodeURIComponent(text)}`);
    const json = await res.json();

    const songs = json.result || [];
    if (!json.status || !songs.length) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply(`❌ Lagu tidak ditemukan di Genius untuk: "${text}"`);
    }

    const list = songs.slice(0, 5);
    let output = `🎵 *GENIUS MUSIC SEARCH*\n🔍 *Query:* ${text}\n\n`;

    list.forEach((s, i) => {
      output += `*${i + 1}. ${s.title || '-' }*\n`;
      if (s.artist) output += `• 👤 *Artis:* ${s.artist}\n`;
      if (s.url) output += `• 🔗 *Lirik Lengkap:* ${s.url}\n`;
      output += `\n`;
    });

    output += `✨ *Genius Lyrics Knowledge Gateway*`;

    const firstHeader = list.find(s => s.header_image_url)?.header_image_url;
    if (firstHeader) {
      await conn.sendMessage(m.chat, {
        image: { url: firstHeader },
        caption: output.trim()
      }, { quoted: m }).catch(() => m.reply(output.trim()));
    } else {
      await m.reply(output.trim());
    }

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Gagal mencari di Genius: " + e.message);
  }
};

handler.help = ['genius <query>'];
handler.tags = ['tools', 'search'];
handler.command = /^(genius|geniuslyrics)$/i;

handler.limit = 1;
export default handler;
