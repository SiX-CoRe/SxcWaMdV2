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
  const usernameInput = (text || args.join(' ')).trim();
  if (!usernameInput) {
    return m.reply(`🎮 *ROBLOX STALKER*\n\n*Format:* ${usedPrefix + command} <username/ID>\n*Contoh:* ${usedPrefix + command} builderman`);
  }
  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

  try {
    const cleanUsername = usernameInput.replace(/^https?:\/\/(www\.)?roblox\.com\/(users|player)\/(\d+)\/profile/i, '$3').trim();
    const url = `${global.web}/api/stalker/roblox?apikey=${global.apikey.jereapi}&username=${encodeURIComponent(cleanUsername)}`;
    const response = await fetch(url);
    const json = await response.json();

    if (!json.status || !json.result) {
      throw new Error(json.error || json.message || json.detail || "Pemain Roblox tidak ditemukan");
    }

    const r = json.result.roblox || json.result;
    const rolimons = json.result.rolimons || {};
    const createdDate = formatDate(r.created_date || r.created);

    let card = `╭━━━〔 🎮 *ROBLOX PROFILE* 〕━━━\n`;
    card += `┃ 👤 *Username:* ${r.username}\n`;
    card += `┃ 🏷️ *Display Name:* ${r.display_name || r.displayName || r.username}\n`;
    card += `┃ 🆔 *Player ID:* ${r.id}\n`;
    if (r.description) {
      const bio = r.description.length > 250 ? r.description.slice(0, 250) + '...' : r.description;
      card += `┃ 📝 *Bio:* ${bio}\n`;
    }
    card += `┃ 👥 *Followers:* ${r.social?.followers_count?.toLocaleString?.() ?? (r.social?.followers_count ?? 0)}\n`;
    card += `┃ 🤝 *Friends / Following:* ${r.social?.friends_count?.toLocaleString?.() ?? (r.social?.friends_count ?? 0)}\n`;
    card += `┃ 💎 *Verified:* ${r.has_verified_badge ? '✅ Ya (Verified)' : '❌ Tidak'}\n`;
    card += `┃ 📅 *Joined Date:* ${createdDate}${r.account_age_years ? ` (${r.account_age_years} thn / ${r.account_age_days || 0} hari)` : ''}\n`;
    card += `┃ 🟢 *Presence:* ${r.presence?.status || 'Offline'} (${r.presence?.last_location || 'Offline'})\n`;
    card += `┃ 🚫 *Account Status:* ${r.is_banned ? '⚠️ Ya (Banned)' : '✅ Normal (Active)'}\n`;
    card += `┃ 👥 *Total Groups:* ${r.groups_count ?? (r.groups ? r.groups.length : 0)}\n`;
    card += `┃ 🔗 *Profile Link:* https://www.roblox.com/users/${r.id}/profile\n`;
    if (rolimons.profile_url) card += `┃ 📊 *Rolimons:* ${rolimons.profile_url}\n`;
    card += `╰━━━━━━━━━━━━━━━━━━━━━━━`;

    const avatarImg = r.avatar?.full_render_url || r.avatar?.headshot_url || r.avatarUrl;
    if (avatarImg && avatarImg.startsWith('http')) {
      try {
        await conn.sendMessage(m.chat, {
          image: { url: avatarImg },
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
    console.error('Roblox Stalk Error:', e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply(`❌ *Gagal Stalk Roblox:* ${e.message}`);
  }
};

handler.help = ["robloxstalk <username/id>"];
handler.tags = ["stalker"];
handler.command = ["robloxstalk", "stalkroblox", "roblox"];

handler.limit = 1;
export default handler;
