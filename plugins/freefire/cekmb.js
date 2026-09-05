let handler = async (m, {
  conn,
  usedPrefix,
  command,
  text,
  args
}) => {
  const weeklyDays = parseInt(args[0]) || 7;
  const monthlyDays = parseInt(args[1]) || 30;

  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

  try {
    const response = await fetch(`${global.web}/api/freefire/cekmb?apikey=${global.apikey.jereapi}&weekly=${weeklyDays}&monthly=${monthlyDays}`);
    const json = await response.json();
    if (!json.status || !json.result) {
      throw new Error(json.error || "Gagal menghitung diamond membership");
    }

    const r = json.result;
    const bk = r.breakdown || {};
    const tot = r.total_estimation || {};

    let card = `╭━━━〔 💎 *FF MEMBERSHIP CALCULATOR* 〕━━━\n`;
    card += `┃ 📅 *Mingguan:* ${bk.weekly?.days || 0} Hari (${bk.weekly?.formatted || '0 DM'})\n`;
    card += `┃ 🗓️ *Bulanan:* ${bk.monthly?.days || 0} Hari (${bk.monthly?.formatted || '0 DM'})\n`;
    if (bk.super_vip_perk?.active) {
      card += `┃ ⭐ *Super VIP Bonus:* +${bk.super_vip_perk.total_bonus_diamonds} Diamond (${bk.super_vip_perk.shared_days} Hari)\n`;
    }
    card += `┃\n`;
    card += `┃ 💎 *Total Diamond Dasar:* ${tot.base_diamonds_formatted || '0 Diamond'}\n`;
    card += `┃ 👑 *Total Diamond + VIP:* ${tot.total_diamonds_formatted || '0 Diamond'}\n`;
    card += `┃ 💵 *Estimasi Nilai:* ${tot.estimated_value_formatted || 'Rp 0'}\n`;
    card += `┃\n`;
    card += `┃ 📌 *Catatan:* Dihitung dari klaim harian 50 DM/hari + Super VIP Privilege 15 DM/hari.\n`;
    card += `╰━━━━━━━━━━━━━━━━━━━━━━━`;

    await m.reply(card);
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error('Cek MB Error:', e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply(`❌ *Gagal Cek Membership:* ${e.message}`);
  }
};

handler.help = ["cekmb [hari_mingguan] [hari_bulanan]"];
handler.tags = ["freefire"];
handler.command = ["cekmb", "ffmb", "membershipff", "cekmembership"];

handler.limit = 1;
export default handler;
