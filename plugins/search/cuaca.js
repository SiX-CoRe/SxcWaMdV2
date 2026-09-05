import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`⚠️ *Masukkan nama kota/kabupaten!*\nContoh: ${usedPrefix + command} Bandung`);

  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
  try {
    const apiKey = global.apikey?.jereapi;
    const res = await fetch(`${global.web}/api/search/cuaca?apikey=${apiKey}&kota=${encodeURIComponent(text)}`);
    const json = await res.json();

    if (!json.status || !json.result) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply(`❌ Data cuaca tidak ditemukan untuk kota: "${text}"`);
    }

    const r = json.result;
    let output = `🌤️ *INFORMASI CUACA TERKINI*\n\n`;
    output += `📍 *Wilayah:* ${r.lokasi?.kota || '-'}, ${r.lokasi?.provinsi_wilayah || '-'} (${r.lokasi?.negara || 'Indonesia'})\n`;
    output += `🕒 *Waktu:* ${r.cuaca_saat_ini?.waktu_pengamatan || '-'} (${r.cuaca_saat_ini?.waktu_hari || 'Hari'})\n\n`;
    output += `🌡️ *Suhu:* ${r.cuaca_saat_ini?.suhu || '-'}\n`;
    output += `☁️ *Kondisi:* ${r.cuaca_saat_ini?.kondisi || '-'}\n`;
    output += `💧 *Kelembaban:* ${r.cuaca_saat_ini?.kelembaban || '-'}\n`;
    output += `💨 *Kecepatan Angin:* ${r.cuaca_saat_ini?.kecepatan_angin || '-'} (Arah ${r.cuaca_saat_ini?.arah_angin || '-'})
\n`;

    if (r.prakiraan_cuaca_7_hari && r.prakiraan_cuaca_7_hari.length > 0) {
      output += `📅 *Prakiraan Cuaca Mendatang:*\n`;
      r.prakiraan_cuaca_7_hari.slice(0, 5).forEach(f => {
        output += `• *📅 ${f.tanggal}:* ${f.cuaca} (${f.suhu_minimum} s/d ${f.suhu_maksimum})\n`;
      });
      output += `\n`;
    }

    output += `✨ *SxcWaMd Weather Service*`;

    await m.reply(output.trim());
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Gagal memuat data cuaca: " + e.message);
  }
};

handler.help = ['cuaca <kota>'];
handler.tags = ['search'];
handler.command = /^(cuaca|weather)$/i;

handler.limit = 1;
export default handler;
