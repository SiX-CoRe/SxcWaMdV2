import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`⚠️ *Format penggunaan:*\n• Cari Siswa (Nama): *${usedPrefix + command} Budi Santoso*\n• Validasi NISN (10 Digit): *${usedPrefix + command} 0051234567*\n• Rekap Sekolah (8 Digit NPSN): *${usedPrefix + command} 20231652*`);

  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
  try {
    const apiKey = global.apikey?.jereapi;
    const res = await fetch(`${global.web}/api/search/murid?apikey=${apiKey}&q=${encodeURIComponent(text)}`);
    const json = await res.json();

    if (!json.status || !json.result) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply(`❌ Data murid/sekolah tidak ditemukan untuk: "${text}"`);
    }

    if (json.mode === 'agregasi_murid_sekolah') {
      const s = json.result.identitas_sekolah || {};
      const r = json.result.rekapitulasi_murid || {};
      let output = `🏫 *DATA AGREGASI MURID SEKOLAH (DAPODIK)*\n\n`;
      output += `📌 *Nama Sekolah:* ${s.nama_sekolah || '-'}\n`;
      output += `• 🆔 *NPSN:* ${s.npsn || '-'}\n`;
      output += `• 📚 *Jenjang / Status:* ${s.jenjang || '-'} (${s.status || '-'})
`;
      output += `• 📍 *Alamat:* ${s.alamat || '-'}\n\n`;

      output += `📊 *Rekapitulasi Siswa:*\n`;
      output += `• 👥 *Total Murid Aktif:* ${r.total_murid_aktif || 0} Siswa\n`;
      output += `• 👦 *Laki-Laki:* ${r.laki_laki || 0} Siswa\n`;
      output += `• 👧 *Perempuan:* ${r.perempuan || 0} Siswa\n`;
      output += `• ⚖️ *Rasio Gender:* ${r.rasio_gender || '-'}\n`;
      output += `• 🚪 *Total Rombel:* ${r.total_rombongan_belajar || 0} Kelas\n`;
      output += `• 📏 *Rata-Rata/Rombel:* ${r.rata_rata_murid_per_rombel || '-'}\n\n`;
      output += `✨ *Data Pokok Pendidikan Kemendikdasmen RI*`;

      await m.reply(output.trim());
    } else {
      const p = json.result;
      const v = p.validasi_nisn || {};
      const a = p.profil_akademik || {};
      let output = `👨‍🎓 *PROFIL & VALIDASI DATA SISWA*\n\n`;
      output += `👤 *Nama:* ${p.nama_lengkap || '-'}\n`;
      output += `🆔 *NISN:* ${p.nisn || '-'}\n`;
      output += `• 📋 *Validasi:* ${v.keterangan || '-'}\n`;
      output += `• 🎂 *Perkiraan Lahir:* ${v.perkiraan_tahun_lahir || '-'}\n\n`;

      output += `📚 *Status Akademik:*\n`;
      output += `• 🟢 *Status:* ${a.status_siswa || '-'}\n`;
      output += `• 🎒 *Jenjang/Kelas:* ${a.jenjang_pendidikan || '-'} (${a.perkiraan_kelas || '-'})
`;
      output += `• 📍 *Wilayah:* ${a.asal_wilayah || '-'}\n`;
      output += `• 💳 *Status PIP:* ${a.penerima_pip || '-'}\n`;
      output += `• 🛡️ *Dukcapil:* ${a.verifikasi_dukcapil || '-'}\n\n`;
      output += `✨ *Verifikasi Validasi NISN Kemendikdasmen*`;

      await m.reply(output.trim());
    }

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Gagal memuat data murid: " + e.message);
  }
};

handler.help = ['murid <nama/nisn/npsn>', 'nisn <10digit>'];
handler.tags = ['search'];
handler.command = /^(murid|nisn|datamurid)$/i;

handler.limit = 1;
export default handler;
