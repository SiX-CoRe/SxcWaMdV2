function formatDate(dateStr) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
}

let handler = async (m, {
  conn,
  usedPrefix,
  command,
  text,
  args
}) => {
  const usernameInput = (text || args.join(' ')).replace(/^@/, '').trim();
  if (!usernameInput) {
    return m.reply(`🐙 *GITHUB STALKER*\n\n*Format:* ${usedPrefix + command} <username>\n*Contoh:* ${usedPrefix + command} torvalds`);
  }
  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

  try {
    const cleanUsername = usernameInput.replace(/^https?:\/\/(www\.)?github\.com\//i, '').split('/')[0].trim();
    const url = `${global.web}/api/stalker/stalkgithub?apikey=${global.apikey.jereapi}&username=${encodeURIComponent(cleanUsername)}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    });
    const json = await response.json();

    if (!json.status || !json.result) {
      throw new Error(json.error || json.message || json.detail || "Akun GitHub tidak ditemukan");
    }

    const p = json.result;
    const createdAt = formatDate(p.created_at);
    const updatedAt = formatDate(p.updated_at);

    let card = `╭━━━〔 🐙 *GITHUB PROFILE* 〕━━━\n`;
    card += `┃ 👤 *Username:* @${p.username || cleanUsername}\n`;
    card += `┃ 🏷️ *Name:* ${p.name || '-'}\n`;
    card += `┃ 📝 *Bio:* ${p.bio || '-'}\n`;
    card += `┃ 👥 *Followers:* ${p.followers?.toLocaleString?.() ?? (p.followers || 0)}\n`;
    card += `┃ 👣 *Following:* ${p.following?.toLocaleString?.() ?? (p.following || 0)}\n`;
    card += `┃ 📦 *Public Repos:* ${p.public_repos ?? 0}\n`;
    card += `┃ 📋 *Public Gists:* ${p.public_gists ?? 0}\n`;
    card += `┃ 💎 *Verified:* ${p.email ? '✅ Email Verified' : '✅ Active'}\n`;
    card += `┃ 📅 *Joined Date:* ${createdAt}\n`;
    card += `┃ 🔄 *Last Activity:* ${updatedAt}\n`;
    if (p.company) card += `┃ 🏢 *Company:* ${p.company}\n`;
    if (p.location) card += `┃ 📍 *Location:* ${p.location}\n`;
    if (p.blog) card += `┃ 🌐 *Blog / Web:* ${p.blog}\n`;
    if (p.email) card += `┃ 📧 *Email:* ${p.email}\n`;
    card += `┃ 🔗 *Profile Link:* ${p.url || `https://github.com/${p.username || cleanUsername}`}\n`;
    card += `╰━━━━━━━━━━━━━━━━━━━━━━━`;

    const avatarUrl = p.avatar || p.avatar_url;
    if (avatarUrl && avatarUrl.startsWith('http')) {
      try {
        await conn.sendMessage(m.chat, {
          image: { url: avatarUrl },
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
    console.error('GitHub Stalk Error:', e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply(`❌ *Gagal Stalk GitHub:* ${e.message}`);
  }
};

handler.help = ["githubstalk <username>"];
handler.tags = ["stalker"];
handler.command = ["githubstalk", "stalkgithub", "ghstalk", "github"];

handler.limit = 1;
export default handler;
