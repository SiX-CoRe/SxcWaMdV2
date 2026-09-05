import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`⚠️ *Format penggunaan:*\n• Cari Sekolah: *${usedPrefix + command} SMAN 1 Jakarta*\n• Detail NPSN: *${usedPrefix + command} 20101234*`);

  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
  try {
    const apiKey = global.apikey?.jereapi;
    const res = await fetch(`${global.web}/api/search/sekolah?apikey=${apiKey}&q=${encodeURIComponent(text)}`);
    const json = await res.json();

    if (!json.status || !json.result) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply(`❌ Data sekolah tidak ditemukan untuk: "${text}"`);
    }

    if (json.mode === 'detail_sekolah') {
      const s = Array.isArray(json.result) ? json.result[0] : json.result;
      let output = `🏫 *DETAIL LENGKAP SEKOLAH (DAPODIK)*\n\n`;
      output += `📌 *Nama:* ${s.sekolah || s.nama || '-'}\n`;
      output += `• 🆔 *NPSN:* ${s.npsn || '-'}\n`;
      output += `• 📚 *Bentuk / Status:* ${s.bentuk || s.bentuk_pendidikan || '-'} (${s.status || s.status_sekolah || '-'})
`;
      output += `• 📍 *Alamat:* ${s.alamat_jalan || s.alamat || '-'}\n`;
      output += `• 🗺️ *Wilayah:* ${s.kecamatan || '-'}, ${s.kabupaten_kota || s.kabupaten || '-'}, ${s.propinsi || s.provinsi || '-'}\n`;
      if (s.akreditasi) output += `• 🎖️ *Akreditasi:* ${s.akreditasi}\n`;
      if (s.email) output += `• ✉️ *Email:* ${s.email}\n`;
      if (s.website) output += `• 🌐 *Website:* ${s.website}\n`;
      output += `\n✨ *Data Pokok Pendidikan Kemendikdasmen RI*`;

      await m.reply(output.trim());
    } else {
      const list = Array.isArray(json.result) ? json.result.slice(0, 7) : [];
      let output = `🏫 *HASIL PENCARIAN SEKOLAH (DAPODIK)*\n🔍 *Query:* ${text}\n\n`;

      list.forEach((s, i) => {
        output += `*${i + 1}. ${s.sekolah || s.nama || '-' }*\n`;
        output += `• 🆔 *NPSN:* ${s.npsn || '-'}\n`;
        output += `• 📚 *Bentuk / Status:* ${s.bentuk || '-'} (${s.status || '-'})
`;
        output += `• 📍 *Wilayah:* ${s.kecamatan || '-'}, ${s.kabupaten_kota || s.kabupaten || '-'}\n\n`;
      });

      output += `💡 *Ketik NPSN untuk melihat informasi detail fasilitas & data sekolah!*`;
      await m.reply(output.trim());
    }

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Gagal mencari data sekolah: " + e.message);
  }
};

handler.help = ['sekolah <nama/npsn>', 'npsn <kode>'];
handler.tags = ['search'];
handler.command = /^(sekolah|npsn|datasekolah)$/i;

handler.limit = 1;
export default handler;
