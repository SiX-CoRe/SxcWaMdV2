import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
  try {
    const apiKey = global.apikey?.jereapi;
    const res = await fetch(`${global.web}/api/search/bmkg?apikey=${apiKey}&kota=${encodeURIComponent(text || '')}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kota: text || '' })
    });
    const json = await res.json();

    if (!json.status || !json.data || json.data.length === 0) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply(`❌ Data cuaca BMKG tidak ditemukan${text ? ' untuk wilayah: ' + text : ''}.`);
    }

    const list = json.data.slice(0, 10);
    let resText = `🌤️ *INFORMASI CUACA BMKG HARI INI*\n`;
    if (text) resText += `🔍 *Filter Wilayah:* ${text}\n`;
    resText += `📊 *Total Data:* ${json.total || json.data.length} Wilayah\n\n`;

    list.forEach(item => {
      resText += `*📍 ${item.kota || '-'}*\n`;
      resText += `• ☁️ *Cuaca:* ${item.cuaca || '-'}\n`;
      resText += `• 🌡️ *Suhu:* ${item.suhu !== null && item.suhu !== undefined ? item.suhu + '°C' : '-'}\n`;
      resText += `• 🕒 *Waktu:* ${item.waktu || '-'} (${item.zonaWaktu || 'WIB'})\n`;
      if (item.kualitasUdara) resText += `• 🍃 *Kualitas Udara:* ${item.kualitasUdara}\n`;
      resText += `\n`;
    });

    resText += `✨ *Badan Meteorologi, Klimatologi, dan Geofisika (BMKG)*`;

    await conn.sendMessage(m.chat, {
      image: { url: 'https://www.bmkg.go.id/asset/img/logo/logo-bmkg.png' },
      caption: resText.trim()
    }, { quoted: m }).catch(() => m.reply(resText.trim()));

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Gagal memuat data BMKG: " + e.message);
  }
};

handler.help = ['bmkg [kota]', 'cuacabmkg [kota]'];
handler.tags = ['search'];
handler.command = /^(bmkg|cuacabmkg)$/i;

handler.limit = 1;
export default handler;
