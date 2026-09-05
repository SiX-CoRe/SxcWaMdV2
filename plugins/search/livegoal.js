import fetch from 'node-fetch';

let handler = async (m, { conn, usedPrefix, command }) => {
  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
  try {
    const apiKey = global.apikey?.jereapi;
    const res = await fetch(`${global.web}/api/search/livegoal?apikey=${apiKey}&edition=id`);
    const json = await res.json();

    if (!json.status || !json.result || json.result.length === 0) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply("❌ Tidak ada data live score sepak bola saat ini.");
    }

    let output = `⚽ *LIVE SCORE SEPAK BOLA HARI INI*\n\n`;
    const comps = json.result.slice(0, 5);

    comps.forEach(comp => {
      output += `🏆 *Kompetisi:* ${comp.kompetisi} (${comp.area})\n`;
      (comp.pertandingan || []).slice(0, 5).forEach(match => {
        const scoreA = match.skorTuanRumah !== null ? match.skorTuanRumah : '-';
        const scoreB = match.skorTandang !== null ? match.skorTandang : '-';
        output += `• ${match.tuanRumah} [ ${scoreA} : ${scoreB} ] ${match.tandang}\n`;
        output += `  Status: *${match.status}*\n`;
      });
      output += `\n`;
    });

    output += `✨ *Goal.com Real-Time Score Engine*`;

    await m.reply(output.trim());
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Gagal memuat live score: " + e.message);
  }
};

handler.help = ['livegoal', 'livescore', 'skorbola'];
handler.tags = ['search'];
handler.command = /^(livegoal|livescore|skorbola)$/i;

handler.limit = 1;
export default handler;
