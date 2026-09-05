import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`⚠️ *Masukkan Link / ID Track Spotify!*\nContoh: ${usedPrefix + command} https://open.spotify.com/track/`);

  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
  try {
    const apiKey = global.apikey?.jereapi;
    const res = await fetch(`${global.web}/api/search/lirikspotify?apikey=${apiKey}&url=${encodeURIComponent(text)}`);
    const json = await res.json();

    if (!json.status || !json.result || !json.result.metadata) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply("❌ Metadata atau lirik Spotify tidak ditemukan.");
    }

    const meta = json.result.metadata;
    const lyr = json.result.lyrics;

    let output = `🎧 *SPOTIFY TRACK & LYRICS*\n\n`;
    output += `🎵 *Judul:* ${meta.title || '-'}\n`;
    output += `👤 *Artis:* ${meta.artists?.join(', ') || '-'}\n`;
    output += `💿 *Album:* ${meta.album?.name || '-'} (${meta.album?.releaseDate || '-'})
`;
    output += `⏱️ *Durasi:* ${meta.duration || '-'}\n`;
    if (meta.spotifyUrl) output += `🔗 *Spotify:* ${meta.spotifyUrl}\n`;
    output += `\n📃 *Lirik Lagu:*\n${lyr?.plain || '_Lirik tidak tersedia untuk lagu ini._'}\n\n`;
    output += `✨ *SxcWaMd Spotify Engine*`;

    if (meta.cover) {
      await conn.sendMessage(m.chat, {
        image: { url: meta.cover },
        caption: output.trim()
      }, { quoted: m }).catch(() => m.reply(output.trim()));
    } else {
      await m.reply(output.trim());
    }

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Gagal memuat lirik Spotify: " + e.message);
  }
};

handler.help = ['lirikspotify <link>', 'spotlyrics <link>'];
handler.tags = ['search'];
handler.command = /^(lirikspotify|spotlyrics|spotifylirik)$/i;

handler.limit = 1;
export default handler;
