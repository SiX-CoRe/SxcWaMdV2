let handler = async (m, {
  conn,
  usedPrefix,
  command,
  text,
  args
}) => {
  const points = (text || args.join(' ')).replace(/[^0-9]/g, '').trim();
  if (!points) {
    return m.reply(`👑 *KALKULATOR PRIME POINTS FREE FIRE*\n\n*Format:* ${usedPrefix + command} <Jumlah Prime Points>\n*Contoh:* ${usedPrefix + command} 100000\n*Contoh 2:* ${usedPrefix + command} 1500000`);
  }

  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

  try {
    const response = await fetch(`${global.web}/api/freefire/cekprime?apikey=${global.apikey.jereapi}&points=${encodeURIComponent(points)}`);
    const json = await response.json();
    if (!json.status || !json.result) {
      throw new Error(json.error || "Gagal menghitung Prime Points");
    }

    const r = json.result;
    const fin = r.financial_estimation || {};
    const nxt = r.next_tier || {};

    let card = `╭━━━〔 👑 *FF PRIME POINTS CALCULATOR* 〕━━━\n`;
    card += `┃ 🌟 *Prime Points:* ${r.prime_points_formatted} Poin\n`;
    card += `┃ 🏆 *Tier Sultan:* ${r.tier_name} (${r.tier_title})\n`;
    card += `┃ 💎 *Setara Diamond:* ${fin.diamonds_formatted || '0 Diamond'}\n`;
    card += `┃ 💵 *Estimasi Uang Top Up:* ${fin.total_spent_formatted || 'Rp 0'}\n`;
    card += `┃\n`;

    if (nxt.target_tier) {
      card += `┃ 🚀 *Tier Berikutnya:* ${nxt.target_tier} (Lv.${nxt.target_level})\n`;
      card += `┃ 📉 *Kekurangan Poin:* ${nxt.shortage_points.toLocaleString('id-ID')} Poin lagi\n`;
      card += `┃ 💰 *Biaya Tambahan:* ${nxt.shortage_cost_formatted || 'Rp 0'}\n`;
      card += `┃\n`;
    }

    card += `┃ 📌 *Catatan:* Dihitung berdasarkan nilai konversi top-up resmi Free Fire (~Rp 140/point).\n`;
    card += `╰━━━━━━━━━━━━━━━━━━━━━━━`;

    await m.reply(card);
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error('Cek Prime Error:', e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply(`❌ *Gagal Cek Prime Points:* ${e.message}`);
  }
};

handler.help = ["cekprime <points>"];
handler.tags = ["freefire"];
handler.command = ["cekprime", "ffprime", "primeff", "sultanff"];

handler.limit = 1;
export default handler;
