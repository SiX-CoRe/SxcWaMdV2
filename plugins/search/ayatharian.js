import fetch from 'node-fetch';

let handler = async (m, { conn, usedPrefix, command }) => {
  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
  try {
    const apiKey = global.apikey?.jereapi;
    const res = await fetch(`${global.web}/api/search/ayatharian?apikey=${apiKey}`);
    const json = await res.json();

    if (!json.status || !json.result) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply("❌ Gagal mengambil ayat alkitab harian.");
    }

    const r = json.result;
    let text = `📖 *AYAT ALKITAB HARIAN*\n\n`;
    text += `📌 *Ayat:* ${r.ayat || '-'}\n`;
    text += `📜 *Kitab:* ${r.buku || '-'} (Pasal ${r.pasal || '-'})\n`;
    text += `🕊️ *Perjanjian:* ${r.perjanjian || '-'}\n\n`;
    text += `📝 *Firman:*\n"${r.isi || '-'}"\n\n`;
    if (r.audio?.mp3_chapter) {
      text += `🔊 *Audio Pasal MP3:*\n${r.audio.mp3_chapter}\n\n`;
    }
    text += `✨ *Bible Gateway*`;

    await m.reply(text.trim());

    if (r.audio?.mp3_chapter) {
      try {
        await conn.sendMessage(m.chat, {
          audio: { url: r.audio.mp3_chapter },
          mimetype: 'audio/mp4',
          ptt: false
        }, { quoted: m });
      } catch (errAudio) {
        console.log("Gagal kirim audio Alkitab:", errAudio.message);
      }
    }

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Gagal memuat ayat harian: " + e.message);
  }
};

handler.help = ['ayatharian', 'alkitabharian'];
handler.tags = ['search'];
handler.command = /^(ayatharian|alkitabharian)$/i;

handler.limit = 1;
export default handler;
