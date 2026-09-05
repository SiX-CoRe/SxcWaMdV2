import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`⚠️ *Format penggunaan:*\n• Cari Film: *${usedPrefix + command} avengers*\n• Terbaru: *${usedPrefix + command} latest*`);

  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
  try {
    const apiKey = global.apikey?.jereapi;
    const isLatest = text.toLowerCase() === 'latest' || text.toLowerCase() === 'terbaru';
    const action = isLatest ? 'latest' : 'search';

    const res = await fetch(`${global.web}/api/search/lk21?apikey=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        query: isLatest ? '' : text,
        page: 1
      })
    });
    const json = await res.json();

    if (!json.status || !json.result || json.result.length === 0) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply(`❌ Film tidak ditemukan untuk: "${text}"`);
    }

    const movies = json.result.slice(0, 5);
    let output = `🎬 *KATALOG FILM LK21 & NONTONDRAMA*\n`;
    output += isLatest ? `🔥 *Koleksi Film Terbaru*\n\n` : `🔍 *Pencarian:* ${text}\n\n`;

    movies.forEach((mv, i) => {
      output += `*${i + 1}. ${mv.title || '-' }*\n`;
      if (mv.rating) output += `• ⭐ *Rating:* ${mv.rating}\n`;
      if (mv.quality) output += `• 🎦 *Kualitas:* ${mv.quality}\n`;
      if (mv.year) output += `• 📅 *Tahun:* ${mv.year}\n`;
      if (mv.duration) output += `• ⏱️ *Durasi:* ${mv.duration}\n`;
      if (mv.href) output += `• 🔗 *Link:* ${mv.href}\n`;
      output += `\n`;
    });

    output += `✨ *SxcWaMd LK21 Movie Stream*`;

    const firstPoster = movies.find(m => m.poster)?.poster;
    if (firstPoster) {
      await conn.sendMessage(m.chat, {
        image: { url: firstPoster },
        caption: output.trim()
      }, { quoted: m }).catch(() => m.reply(output.trim()));
    } else {
      await m.reply(output.trim());
    }

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Gagal memuat data LK21: " + e.message);
  }
};

handler.help = ['lk21 <judul/latest>', 'layarkaca21 <judul>'];
handler.tags = ['search'];
handler.command = /^(lk21|layarkaca21)$/i;

handler.limit = 1;
export default handler;
