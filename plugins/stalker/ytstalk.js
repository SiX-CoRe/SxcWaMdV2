let handler = async (m, {
  conn,
  usedPrefix,
  command,
  text,
  args
}) => {
  const query = (text || args.join(' ')).trim();
  if (!query) {
    return m.reply(`📺 *YOUTUBE CHANNEL STALKER*\n\n*Format:* ${usedPrefix + command} <nama channel / username>\n*Contoh:* ${usedPrefix + command} MrBeast\n*Contoh 2:* ${usedPrefix + command} @MiawAug`);
  }
  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

  try {
    const cleanQuery = query.replace(/^https?:\/\/(www\.)?youtube\.com\/(@|channel\/|user\/)?/i, '').trim();
    const url = `${global.web}/api/stalker/ytstalk?apikey=${global.apikey.jereapi}&query=${encodeURIComponent(cleanQuery)}`;
    const response = await fetch(url);
    const json = await response.json();

    if (!json.status || !json.result) {
      throw new Error(json.error || json.message || json.detail || "Channel YouTube tidak ditemukan");
    }

    const p = json.result;

    let card = `╭━━━〔 📺 *YOUTUBE CHANNEL STALKER* 〕━━━\n`;
    card += `┃ 🏷️ *Channel Name:* ${p.name || cleanQuery}\n`;
    if (p.id) card += `┃ 🆔 *Channel ID:* ${p.id}\n`;
    card += `┃ 👥 *Subscribers:* ${p.subscribers || p.subscribers_raw?.toLocaleString?.() || '-'}\n`;
    card += `┃ 🎬 *Total Videos / Posts:* ${p.video_count || p.video_count_raw?.toLocaleString?.() || '-'}\n`;
    card += `┃ 💎 *Verified:* ${p.verified ? '✅ Ya (Verified Official Channel)' : '❌ Tidak'}\n`;
    if (p.about) {
      const bio = p.about.length > 250 ? p.about.slice(0, 250) + '...' : p.about;
      card += `┃ 📝 *About / Bio:* ${bio}\n`;
    }
    if (p.url) card += `┃ 🔗 *Channel Link:* ${p.url}\n`;
    card += `╰━━━━━━━━━━━━━━━━━━━━━━━`;

    const thumbUrl = p.thumbnail || p.avatar;
    if (thumbUrl && thumbUrl.startsWith('http')) {
      try {
        await conn.sendMessage(m.chat, {
          image: { url: thumbUrl },
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
    console.error('YouTube Stalk Error:', e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply(`❌ *Gagal Stalk YouTube:* ${e.message}`);
  }
};

handler.help = ["ytstalk <channel>"];
handler.tags = ["stalker"];
handler.command = ["ytstalk", "youtubestalk", "stalkyt"];

handler.limit = 1;
export default handler;
