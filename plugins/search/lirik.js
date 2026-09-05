import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`⚠️ *Masukkan judul lagu / artis!*\nContoh: ${usedPrefix + command} Daniel Caesar - Best Part`);

  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
  try {
    const apiKey = global.apikey?.jereapi;
    const res = await fetch(`${global.web}/api/search/lirik?apikey=${apiKey}&q=${encodeURIComponent(text)}`);
    const json = await res.json();

    if (!json.status || !json.data) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply(`❌ Lirik lagu tidak ditemukan untuk: "${text}"`);
    }

    const p = json.data;
    let caption = `🎵 *PENCARIAN LIRIK LAGU*\n\n`;
    caption += `📌 *Judul:* ${p.title || '-'}\n`;
    caption += `👤 *Artis:* ${p.artist || '-'}\n`;
    caption += `💿 *Album:* ${p.album || '-'}\n`;
    caption += `📅 *Rilis:* ${p.release_date || '-'}\n\n`;
    caption += `📃 *Lirik:*\n${p.lyrics || '_Lirik tidak tersedia._'}\n\n`;
    caption += `✨ *SxcWaMd Song Lyrics*`;

    if (p.cover) {
      await conn.sendMessage(m.chat, {
        image: { url: p.cover },
        caption: caption.trim()
      }, { quoted: m }).catch(() => m.reply(caption.trim()));
    } else {
      await m.reply(caption.trim());
    }

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Gagal mencari lirik: " + e.message);
  }
};

handler.help = ['lirik <judul>', 'lyrics <judul>'];
handler.tags = ['search'];
handler.command = /^(lirik|lyrics)$/i;

handler.limit = 1;
export default handler;
