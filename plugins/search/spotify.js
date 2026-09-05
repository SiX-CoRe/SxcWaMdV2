import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`⚠️ *Masukkan kata kunci lagu atau artis Spotify!*\nContoh: ${usedPrefix + command} Gala Bunga Matahari`);

  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
  try {
    const apiKey = global.apikey?.jereapi;
    const res = await fetch(`${global.web}/api/search/spotify?apikey=${apiKey}&query=${encodeURIComponent(text)}`);
    const json = await res.json();

    const tracks = json.result?.tracks || [];
    if (!json.status || !tracks.length) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply(`❌ Lagu Spotify tidak ditemukan untuk: "${text}"`);
    }

    const topTracks = tracks.slice(0, 5);
    let output = `🎧 *HASIL PENCARIAN SPOTIFY*\n🔍 *Query:* ${text}\n\n`;

    topTracks.forEach((t, i) => {
      const durSec = Math.round((t.duration_ms || 0) / 1000);
      const durStr = `${Math.floor(durSec / 60)}:${String(durSec % 60).padStart(2, '0')}`;
      const artists = (t.artists || []).map(a => a.name).join(', ') || '-';
      
      output += `*${i + 1}. ${t.name}*\n`;
      output += `• 👤 *Artis:* ${artists}\n`;
      output += `• 💿 *Album:* ${t.album?.name || '-'}\n`;
      output += `• ⏱️ *Durasi:* ${durStr}\n`;
      if (t.url) output += `• 🔗 *Link:* ${t.url}\n`;
      output += `\n`;
    });

    output += `✨ *Spotify GraphQL Official Gateway*`;

    const firstCover = topTracks.find(t => t.album?.images?.[0]?.url)?.album?.images?.[0]?.url;
    if (firstCover) {
      await conn.sendMessage(m.chat, {
        image: { url: firstCover },
        caption: output.trim()
      }, { quoted: m }).catch(() => m.reply(output.trim()));
    } else {
      await m.reply(output.trim());
    }

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Gagal mencari lagu di Spotify: " + e.message);
  }
};

handler.help = ['spotify <query>', 'spotsearch <query>'];
handler.tags = ['search'];
handler.command = /^(spotify|spotsearch|carispotify)$/i;

handler.limit = 1;
export default handler;
