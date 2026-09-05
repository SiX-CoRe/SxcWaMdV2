import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`⚠️ *Masukkan kata kunci meme Lahelu!*\nContoh: ${usedPrefix + command} kucing`);

  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
  try {
    const apiKey = global.apikey?.jereapi;
    const res = await fetch(`${global.web}/api/search/lahelu?apikey=${apiKey}&query=${encodeURIComponent(text)}`);
    const json = await res.json();

    if (!json.status || !json.result || json.result.length === 0) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply(`❌ Meme tidak ditemukan untuk kata kunci: "${text}"`);
    }

    const randomPost = json.result[Math.floor(Math.random() * json.result.length)];
    let caption = `🤣 *LAHELU MEME INDONESIA*\n\n`;
    caption += `📌 *Judul:* ${randomPost.title || '-'}\n`;
    caption += `👤 *Author:* ${randomPost.userUsername || randomPost.user?.username || '-'}\n`;
    caption += `🔺 *Upvotes:* ${randomPost.totalUpvotes || 0} | 💬 *Komentar:* ${randomPost.totalComments || 0}\n`;
    if (randomPost.post_url) caption += `🔗 *Link:* ${randomPost.post_url}\n`;
    caption += `\n✨ *Lahelu.com*`;

    const mediaUrl = randomPost.media;
    if (mediaUrl) {
      if (randomPost.mediaType === 1 || mediaUrl.endsWith('.mp4')) {
        await conn.sendMessage(m.chat, {
          video: { url: mediaUrl },
          caption: caption.trim()
        }, { quoted: m }).catch(() => m.reply(caption.trim() + `\n\nLink Media: ${mediaUrl}`));
      } else {
        await conn.sendMessage(m.chat, {
          image: { url: mediaUrl },
          caption: caption.trim()
        }, { quoted: m }).catch(() => m.reply(caption.trim() + `\n\nLink Media: ${mediaUrl}`));
      }
    } else {
      await m.reply(caption.trim());
    }

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Gagal mencari meme Lahelu: " + e.message);
  }
};

handler.help = ['lahelu <query>', 'meme <query>'];
handler.tags = ['search'];
handler.command = /^(lahelu|meme)$/i;

handler.limit = 1;
export default handler;
