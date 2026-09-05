let handler = async (m, {
  conn,
  text,
  usedPrefix,
  command
}) => {
  const usernameInput = (text || '').replace(/^@/, '').trim();
  if (!usernameInput) {
    return m.reply(`📸 *INSTAGRAM STALKER*\n\n*Format:* ${usedPrefix + command} <username>\n*Contoh:* ${usedPrefix + command} instagram`);
  }
  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

  try {
    let cleanUsername = usernameInput.replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').split('/')[0].replace(/^@/, '').trim();
    let data = null;

    // Try primary stalker endpoint first
    try {
      const res = await fetch(`${global.web}/api/stalker/igstalk?apikey=${global.apikey.jereapi}&username=${encodeURIComponent(cleanUsername)}`);
      const json = await res.json();
      if (json && json.status) {
        data = json;
      }
    } catch (e) {}

    // Fallback to tools/instagram-stalker if primary failed or empty
    if (!data || !data.status) {
      try {
        const resFb = await fetch(`${global.web}/api/tools/instagram-stalker?apikey=${global.apikey.jereapi}&username=${encodeURIComponent(cleanUsername)}`);
        const jsonFb = await resFb.json();
        if (jsonFb && jsonFb.status && jsonFb.result) {
          const r = jsonFb.result;
          data = {
            status: true,
            username: r.username || cleanUsername,
            metadata: {
              posts: r.posts || '0',
              followers: r.followers || '0',
              following: r.following || '0',
              avatar: r.profilePic || ''
            },
            stories: {
              data: {
                user: {
                  full_name: r.name || '-',
                  biography: r.bio || '-',
                  profile_pic_url: r.profilePic || '',
                  is_private: false,
                  is_verified: false
                }
              }
            }
          };
        }
      } catch (e) {}
    }

    if (!data || !data.status) {
      throw new Error(data?.error || data?.message || "Akun Instagram tidak ditemukan atau profil bersifat private");
    }

    const uname = data.username || cleanUsername;
    const meta = data.metadata || {};
    const u = data.stories?.data?.user || {};

    const fullName = u.full_name || meta.fullName || '-';
    const bio = u.biography || meta.bio || '-';
    const posts = meta.posts || u.edge_owner_to_timeline_media?.count || '0';
    const followers = meta.followers || u.edge_followed_by?.count || '0';
    const following = meta.following || u.edge_follow?.count || '0';
    const isPrivate = typeof u.is_private === 'boolean' ? (u.is_private ? '🔒 Ya (Private)' : '🔓 Tidak (Public)') : '🔓 Public';
    const isVerified = typeof u.is_verified === 'boolean' ? (u.is_verified ? '💎 Ya (Verified)' : '❌ Tidak') : '❌ Tidak';
    const avatar = meta.avatar || u.profile_pic_url || u.profile_pic_url_hd || '';
    const profileUrl = `https://www.instagram.com/${uname}`;

    let card = `╭━━━〔 📸 *INSTAGRAM PROFILE* 〕━━━\n`;
    card += `┃ 👤 *Username:* @${uname}\n`;
    card += `┃ 🏷️ *Full Name:* ${fullName}\n`;
    card += `┃ 📝 *Bio:* ${bio}\n`;
    card += `┃ 👥 *Followers:* ${followers}\n`;
    card += `┃ 👣 *Following:* ${following}\n`;
    card += `┃ 📮 *Total Posts:* ${posts}\n`;
    card += `┃ 💎 *Verified:* ${isVerified}\n`;
    card += `┃ 🔒 *Account Type:* ${isPrivate}\n`;
    card += `┃ 🔗 *Profile Link:* ${profileUrl}\n`;
    card += `╰━━━━━━━━━━━━━━━━━━━━━━━`;

    if (avatar && avatar.startsWith('http')) {
      try {
        await conn.sendMessage(m.chat, {
          image: { url: avatar },
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
    console.error('IG Stalk Error:', e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply(`❌ *Gagal Stalk Instagram:* ${e.message}`);
  }
};

handler.help = ["igstalk <username>"];
handler.tags = ["stalker"];
handler.command = ["igstalk", "stalkig", "instagramstalk"];

handler.limit = 1;
export default handler;
