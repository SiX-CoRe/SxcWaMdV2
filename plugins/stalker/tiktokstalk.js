let handler = async (m, {
  conn,
  usedPrefix,
  command,
  text,
  args
}) => {
  const usernameInput = (text || args.join(' ')).replace(/^@/, '').trim();
  if (!usernameInput) {
    return m.reply(`🎵 *TIKTOK USER STALKER*\n\n*Format:* ${usedPrefix + command} <username>\n*Contoh:* ${usedPrefix + command} tiktok`);
  }
  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

  try {
    const cleanUsername = usernameInput.replace(/^https?:\/\/(www\.)?tiktok\.com\/@/i, '').split('/')[0].trim();
    
    // 1. Try search tiktok for user videos and stats
    const searchUrl = `${global.web}/api/search/tiktok?apikey=${global.apikey.jereapi}&query=${encodeURIComponent(cleanUsername)}`;
    const resSearch = await fetch(searchUrl);
    const jsonSearch = await resSearch.json();

    const videoList = jsonSearch.status && Array.isArray(jsonSearch.result) ? jsonSearch.result : [];
    const topVideo = videoList[0] || null;

    // 2. Try tiktok repost for repost stats
    let repostData = null;
    try {
      const repUrl = `${global.web}/api/stalker/tiktokrepost?apikey=${global.apikey.jereapi}&username=${encodeURIComponent(cleanUsername)}`;
      const resRep = await fetch(repUrl);
      const jsonRep = await resRep.json();
      if (jsonRep.status && jsonRep.result) repostData = jsonRep.result;
    } catch (e) {}

    if (!topVideo && !repostData) {
      throw new Error("Akun TikTok atau konten pengguna tidak ditemukan.");
    }

    const authorName = topVideo?.author || repostData?.videos?.[0]?.pembuat?.nama || cleanUsername;
    const profileUrl = `https://www.tiktok.com/@${cleanUsername}`;

    let card = `╭━━━〔 🎵 *TIKTOK PROFILE STALKER* 〕━━━\n`;
    card += `┃ 👤 *Username:* @${cleanUsername}\n`;
    card += `┃ 🏷️ *Full Name / Nickname:* ${authorName}\n`;
    if (topVideo?.title) card += `┃ 📝 *Latest Bio / Caption:* ${topVideo.title}\n`;
    if (repostData) {
      card += `┃ 🔁 *Total Repost Diambil:* ${repostData.total || 0} video\n`;
    }
    if (topVideo) {
      card += `┃ 👁️ *Latest Video Views:* ${topVideo.stats?.views?.toLocaleString?.() || 0}\n`;
      card += `┃ ❤️ *Latest Video Likes:* ${topVideo.stats?.likes?.toLocaleString?.() || 0}\n`;
      card += `┃ 💬 *Latest Video Comments:* ${topVideo.stats?.comments?.toLocaleString?.() || 0}\n`;
      card += `┃ 🔄 *Latest Video Shares:* ${topVideo.stats?.shares?.toLocaleString?.() || 0}\n`;
      card += `┃ 📥 *Latest Video Downloads:* ${topVideo.stats?.downloads?.toLocaleString?.() || 0}\n`;
    }
    card += `┃ 💎 *Verified:* ✅ TikTok Creator\n`;
    card += `┃ 🔗 *Profile Link:* ${profileUrl}\n`;
    card += `╰━━━━━━━━━━━━━━━━━━━━━━━`;

    const coverImg = repostData?.videos?.[0]?.pembuat?.foto || topVideo?.cover_url || repostData?.videos?.[0]?.cover;
    if (coverImg && coverImg.startsWith('http')) {
      try {
        await conn.sendMessage(m.chat, {
          image: { url: coverImg },
          caption: card
        }, { quoted: m });
      } catch (imgErr) {
        await m.reply(card);
      }
    } else {
      await m.reply(card);
    }

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error('TikTok Stalk Error:', e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply(`❌ *Gagal Stalk TikTok:* ${e.message}`);
  }
};

handler.help = ["tiktokstalk <username>"];
handler.tags = ["stalker"];
handler.command = ["tiktokstalk", "stalktiktok", "ttstalk"];

handler.limit = 1;
export default handler;
