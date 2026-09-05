let handler = async (m, {
  conn,
  usedPrefix,
  command,
  text,
  args
}) => {
  if (!args[0]) {
    return m.reply(`🔫 *KALKULATOR EVO GUN MAX*\n\n*Format:* ${usedPrefix + command} <Target Level 2-8> [Token Saat Ini]\n*Contoh:* ${usedPrefix + command} 7 150\n*Contoh 2:* ${usedPrefix + command} 8 0`);
  }

  const targetLevel = parseInt(args[0]) || 7;
  const currentToken = parseInt(args[1]) || 0;

  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

  try {
    const response = await fetch(`${global.web}/api/freefire/cekevo?apikey=${global.apikey.jereapi}&level=${targetLevel}&token=${currentToken}`);
    const json = await response.json();
    if (!json.status || !json.result) {
      throw new Error(json.error || "Gagal menghitung token Evo Gun");
    }

    const r = json.result;
    const cost = r.cost_estimation || {};

    let card = `╭━━━〔 🔫 *EVO GUN MAX CHECKER* 〕━━━\n`;
    card += `┃ 🎯 *Target Level:* Level ${r.target_level}\n`;
    card += `┃ 📦 *Token Dimiliki:* ${r.current_tokens.toLocaleString('id-ID')} Token\n`;
    card += `┃ 🎯 *Total Dibutuhkan:* ${r.total_tokens_required.toLocaleString('id-ID')} Token\n`;
    card += `┃ 📉 *Kekurangan Token:* ${r.shortage_tokens.toLocaleString('id-ID')} Token\n`;
    card += `┃ 📊 *Progress:* ${r.progress_percentage}\n`;
    card += `┃\n`;
    card += `┃ 💎 *Estimasi Diamond:* ${cost.diamonds_formatted || '0 Diamond'}\n`;
    card += `┃ 💵 *Estimasi Uang:* ${cost.price_idr_formatted || 'Rp 0'}\n`;
    card += `┃\n`;
    card += `┃ 💬 *Status:* ${r.status_message}\n`;
    card += `╰━━━━━━━━━━━━━━━━━━━━━━━`;

    await m.reply(card);
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error('Cek Evo Error:', e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply(`❌ *Gagal Cek Evo Gun:* ${e.message}`);
  }
};

handler.help = ["cekevo <level> [token]"];
handler.tags = ["freefire"];
handler.command = ["cekevo", "evogun", "cekevogun", "evomax"];

handler.limit = 1;
export default handler;
