let handler = async (m, {
  conn,
  usedPrefix,
  command,
  text,
  args
}) => {
  const uid = (text || args.join(' ')).replace(/[^0-9]/g, '').trim();
  if (!uid) {
    return m.reply(`🎮 *FREE FIRE USER STALKER*\n\n*Format:* ${usedPrefix + command} <User ID/UID>\n*Contoh:* ${usedPrefix + command} 12345678`);
  }
  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

  try {
    const response = await fetch(`${global.web}/api/freefire/stalk?apikey=${global.apikey.jereapi}&id=${encodeURIComponent(uid)}`);
    const json = await response.json();
    if (!json.status || !json.result) {
      throw new Error(json.error || json.detail || json.message || "Akun Free Fire tidak ditemukan");
    }

    const p = json.result;
    const acc = p.account || {};
    const rnk = p.ranked || {};
    const gld = p.guild || {};
    const pet = p.pet || {};
    const soc = p.social || {};
    const eqp = p.equipped || {};

    let card = `╭━━━〔 🎮 *FREE FIRE PROFILE* 〕━━━\n`;
    card += `┃ 👤 *Nickname:* ${p.nickname || acc.nickname || '-'}\n`;
    card += `┃ 🆔 *UID:* ${p.id || uid}\n`;
    card += `┃ 🎖️ *Level:* ${acc.level || '-'} (EXP: ${acc.exp || '0'})\n`;
    card += `┃ 🗺️ *Region:* ${acc.region || '-'}\n`;
    card += `┃ ❤️ *Likes:* ${acc.likes || '0'}\n`;
    card += `┃ 👑 *Prime:* ${acc.prime_tier || 'Non-Prime'}\n`;
    card += `┃ 🛡️ *Credit Score:* ${acc.credit_score || '100/100'}\n`;
    card += `┃ 🎭 *Karakter:* ${acc.active_character || '-'}\n`;
    card += `┃ 🎟️ *Elite Pass:* ${acc.has_elite_pass || '-'}\n`;
    card += `┃ 🏅 *Badges:* ${acc.badge_count || '0 Badges'}\n`;
    card += `┃\n`;
    card += `┃ 🏆 *Rank BR:* ${rnk.br_rank || '-'} (${rnk.br_points || '0 Poin'})\n`;
    card += `┃ 📈 *Max Rank BR:* ${rnk.br_max_rank || '-'}\n`;
    card += `┃ ⚔️ *Rank CS:* ${rnk.cs_rank || '-'} (${rnk.cs_points || '0 Poin'})\n`;
    card += `┃ 📈 *Max Rank CS:* ${rnk.cs_max_rank || '-'}\n`;
    card += `┃\n`;

    if (gld && gld.guild_name) {
      card += `┃ 🛡️ *Guild:* ${gld.guild_name} (${gld.guild_level || 'Lv.1'} • ${gld.members || '0'})\n`;
      if (gld.captain?.nickname) {
        card += `┃ 👑 *Ketua:* ${gld.captain.nickname} (${gld.captain.uid})\n`;
      }
      card += `┃\n`;
    }

    if (pet && pet.pet_name) {
      card += `┃ 🐾 *Pet:* ${pet.pet_name} (${pet.level || 'Lv.1'})\n`;
      card += `┃\n`;
    }

    if (soc.signature && soc.signature !== '(Tidak ada bio)') {
      card += `┃ 📝 *Bio:* ${soc.signature}\n`;
    }
    if (soc.battle_tags && soc.battle_tags.length > 0 && soc.battle_tags[0] !== 'Belum ada battle tag') {
      card += `┃ 🏷️ *Tags:* ${soc.battle_tags.join(', ')}\n`;
    }

    card += `┃ 📅 *Dibuat:* ${acc.created_at || '-'}\n`;
    card += `┃ 🕒 *Login Terakhir:* ${acc.last_login || '-'}\n`;
    card += `╰━━━━━━━━━━━━━━━━━━━━━━━`;

    const bannerUrl = eqp.banner_url || 'https://raw.githubusercontent.com/jerexd6677/assets/main/freefire.jpg';
    try {
      await conn.sendMessage(m.chat, {
        image: { url: bannerUrl },
        caption: card
      }, { quoted: m });
    } catch (imgErr) {
      await m.reply(card);
    }

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error('Free Fire Stalk Error:', e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply(`❌ *Gagal Stalk Free Fire:* ${e.message}`);
  }
};

handler.help = ["ffstalk <id>"];
handler.tags = ["freefire", "stalker"];
handler.command = ["ffstalk", "stalkff", "epep", "freefirestalk"];
handler.premium = true
handler.limit = 1;
export default handler;
