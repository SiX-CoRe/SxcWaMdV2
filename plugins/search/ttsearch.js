import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`⚠️ *Format penggunaan:*\n• Cari Video: *${usedPrefix + command} jedag jedug*\n• Cari Photo Slide: *${usedPrefix}ttphoto wallpaper*`);

  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
  try {
    const apiKey = global.apikey?.jereapi;
    const res = await fetch(`${global.web}/api/search/tiktok?apikey=${apiKey}&query=${encodeURIComponent(text)}`);
    const json = await res.json();

    if (!json.status || !json.result || json.result.length === 0) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply(`❌ Video TikTok tidak ditemukan untuk: "${text}"`);
    }

    const video = json.result[0];
    let caption = `🎬 *TIKTOK SEARCH*\n\n`;
    caption += `📌 *Judul:* ${video.title || text}\n`;
    if (video.author?.nickname || video.author?.username) {
      caption += `👤 *Author:* ${video.author.nickname || video.author.username}\n`;
    }
    if (video.stats) {
      caption += `📊 *Stats:* ❤️ ${video.stats.likes || 0} | 💬 ${video.stats.comments || 0} | 🔄 ${video.stats.shares || 0}\n`;
    }
    caption += `\n✨ *SxcWaMd TikTok Engine*`;

    const videoUrl = video.video_url || video.nowm || video.play;
    if (videoUrl) {
      await conn.sendMessage(m.chat, {
        video: { url: videoUrl },
        caption: caption.trim()
      }, { quoted: m }).catch(() => m.reply(caption.trim() + `\n\nLink Video: ${videoUrl}`));
    } else {
      await m.reply(caption.trim());
    }

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Gagal mencari di TikTok: " + e.message);
  }
};

handler.help = ['ttsearch <query>'];
handler.tags = ['search'];
handler.command = /^(ttsearch|tiktoksearch)$/i;

handler.limit = 1;
export default handler;
