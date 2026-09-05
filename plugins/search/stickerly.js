import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`⚠️ *Masukkan kata kunci pack stiker!*\nContoh: ${usedPrefix + command} pentol`);

  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
  try {
    const apiKey = global.apikey?.jereapi;
    const res = await fetch(`${global.web}/api/search/stickerly?apikey=${apiKey}&q=${encodeURIComponent(text)}`);
    const json = await res.json();

    if (!json.status || !json.stickers || json.stickers.length === 0) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply(`❌ Pack stiker tidak ditemukan untuk: "${text}"`);
    }

    await m.reply(`🎉 Sukses menemukan pack: *${json.pack_name || 'Sticker Pack'}*\n👤 *Author:* ${json.author || 'Sticker.ly'}\n📦 *Total:* ${json.stickers.length} stiker\n\nMengirim stiker pilihan...`);

    for (const sticker of json.stickers.slice(0, 5)) {
      if (!sticker.url) continue;
      try {
        await conn.sendMessage(m.chat, {
          sticker: { url: sticker.url }
        }, { quoted: m });
        await new Promise(resolve => setTimeout(resolve, 600));
      } catch (err) {
        console.error("Gagal mengirim satu stiker:", err.message);
      }
    }

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Gagal mencari stiker di Sticker.ly: " + e.message);
  }
};

handler.help = ['stickerly <query>', 'sly <query>'];
handler.tags = ['search'];
handler.command = /^(stickerly|sly)$/i;

handler.limit = 1;
export default handler;
