import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`⚠️ *Masukkan nama kota di Indonesia!*\nContoh: ${usedPrefix + command} Jakarta`);

  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
  try {
    const apiKey = global.apikey?.jereapi;
    const res = await fetch(`${global.web}/api/search/jadwalsholat?apikey=${apiKey}&kota=${encodeURIComponent(text)}`);
    const json = await res.json();

    if (!json.status || !json.result) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply(`❌ Jadwal sholat tidak ditemukan untuk kota: "${text}"`);
    }

    const r = json.result;
    const j = r.jadwal || {};
    let output = `🕌 *JADWAL SHOLAT HARIAN*\n\n`;
    output += `📍 *Lokasi:* ${r.lokasi || text} (${r.daerah || 'Indonesia'})\n`;
    output += `📅 *Tanggal:* ${j.tanggal || j.date || '-'}\n\n`;
    output += `• ⏰ *Imsak:* ${j.imsak || '-'}\n`;
    output += `• 🌅 *Subuh:* ${j.subuh || '-'}\n`;
    output += `• ☀️ *Terbit:* ${j.terbit || '-'}\n`;
    output += `• 🌤️ *Dhuha:* ${j.dhuha || '-'}\n`;
    output += `• ☀️ *Dzuhur:* ${j.dzuhur || '-'}\n`;
    output += `• ⛅ *Ashar:* ${j.ashar || '-'}\n`;
    output += `• 🌇 *Maghrib:* ${j.maghrib || '-'}\n`;
    output += `• 🌙 *Isya:* ${j.isya || '-'}\n\n`;
    output += `✨ *Sxcwamd Jadwal Sholat Kemenag RI*`;

    await m.reply(output.trim());
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Gagal memuat jadwal sholat: " + e.message);
  }
};

handler.help = ['jadwalsholat <kota>', 'sholat <kota>'];
handler.tags = ['search'];
handler.command = /^(jadwalsholat|sholat|waktusholat)$/i;

handler.limit = 1;
export default handler;
