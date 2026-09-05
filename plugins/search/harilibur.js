import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
  try {
    const apiKey = global.apikey?.jereapi;
    const tahun = (text || new Date().getFullYear().toString()).trim();
    const res = await fetch(`${global.web}/api/search/harilibur?apikey=${apiKey}&tahun=${encodeURIComponent(tahun)}`);
    const json = await res.json();

    if (!json.status || !json.result || json.result.length === 0) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply(`❌ Data hari libur nasional untuk tahun ${tahun} tidak ditemukan.`);
    }

    let output = `🗓️ *DAFTAR HARI LIBUR NASIONAL ${json.tahun || tahun}*\n`;
    output += `📊 *Total Libur:* ${json.total || json.result.length} Hari\n\n`;

    json.result.forEach((h, i) => {
      output += `*${i + 1}. ${h.nama || h.deskripsi || '-' }*\n`;
      output += `• 📅 *Tanggal:* ${h.tanggal || '-'}\n`;
      if (h.deskripsi && h.deskripsi !== h.nama) output += `• 📝 *Keterangan:* ${h.deskripsi}\n`;
      output += `\n`;
    });

    output += `✨ *Kalender Resmi Republik Indonesia*`;

    await m.reply(output.trim());
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Gagal memuat hari libur: " + e.message);
  }
};

handler.help = ['harilibur [tahun]', 'liburnasional [tahun]'];
handler.tags = ['search'];
handler.command = /^(harilibur|liburnasional)$/i;

handler.limit = 1;
export default handler;
