let handler = async (m, {
  conn,
  usedPrefix,
  command,
  text,
  args
}) => {
  const input = (text || args.join(' ')).trim();
  const parts = input.split(/[\s|/]+/).filter(Boolean);

  if (parts.length < 2) {
    return m.reply(`🎮 *MOBILE LEGENDS STALKER*\n\n*Format:* ${usedPrefix + command} <User ID> <Zone ID>\n*Contoh:* ${usedPrefix + command} 12345678 0000`);
  }

  const userId = parts[0].replace(/[^0-9]/g, '');
  const zoneId = parts[1].replace(/[^0-9]/g, '');

  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

  try {
    const response = await fetch(`${global.web}/api/mlbb/stalk?apikey=${global.apikey.jereapi}&id=${encodeURIComponent(userId)}&zone=${encodeURIComponent(zoneId)}`);
    const json = await response.json();
    if (!json.status || !json.result) {
      throw new Error(json.error || "Akun Mobile Legends tidak ditemukan");
    }

    const r = json.result;

    let card = `╭━━━〔 🎮 *MLBB USER PROFILE* 〕━━━\n`;
    card += `┃ 👤 *Nickname:* ${r.nickname || '-'}\n`;
    card += `┃ 🆔 *User ID:* ${r.id || userId}\n`;
    card += `┃ 🌐 *Zone / Server:* ${r.zone || zoneId}\n`;
    card += `┃ 🗺️ *Region:* ${r.region || 'Indonesia'}\n`;
    card += `┃ 💎 *Status:* ✅ ${r.account_status || 'Aktif'}\n`;
    card += `╰━━━━━━━━━━━━━━━━━━━━━━━`;

    await m.reply(card);
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error('MLBB Stalk Error:', e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply(`❌ *Gagal Stalk MLBB:* ${e.message}`);
  }
};

handler.help = ["mlbbstalk <id> <zone>"];
handler.tags = ["mlbb", "stalker"];
handler.command = ["mlbbstalk", "stalkml", "mlstalk", "ceknickml"];

handler.limit = 1;
export default handler;
