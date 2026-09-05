import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`⚠️ *Format penggunaan:*\n• Cari HP: *${usedPrefix + command} iPhone 15*\n• Bandingkan: *${usedPrefix + command} iPhone 15 | Samsung S24*`);

  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
  try {
    const apiKey = global.apikey?.jereapi;
    const parts = text.split('|').map(s => s.trim());
    const hp1 = parts[0];
    const hp2 = parts[1] || '';

    let url = `${global.web}/api/search/gsmarena?apikey=${apiKey}&hp1=${encodeURIComponent(hp1)}`;
    if (hp2) url += `&hp2=${encodeURIComponent(hp2)}`;

    const res = await fetch(url);
    const json = await res.json();

    if (!json.status || !json.result) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply(`❌ Data HP tidak ditemukan untuk: "${text}"`);
    }

    if (json.type === 'compare') {
      const h1 = json.result.handphone1?.main || {};
      const h2 = json.result.handphone2?.main || {};
      let txt = `⚖️ *PERBANDINGAN SPESIFIKASI HP (GSMARENA)*\n\n`;
      txt += `📱 *1. ${h1.title || hp1}*\n`;
      txt += `• 📅 *Rilis:* ${h1.release || '-'}\n`;
      txt += `• 💾 *Storage:* ${h1.storage || '-'}\n`;
      txt += `• ⚙️ *OS:* ${h1.os || '-'}\n`;
      txt += `• 📐 *Bodi:* ${h1.thickness || '-'}\n\n`;

      txt += `📱 *2. ${h2.title || hp2}*\n`;
      txt += `• 📅 *Rilis:* ${h2.release || '-'}\n`;
      txt += `• 💾 *Storage:* ${h2.storage || '-'}\n`;
      txt += `• ⚙️ *OS:* ${h2.os || '-'}\n`;
      txt += `• 📐 *Bodi:* ${h2.thickness || '-'}\n\n`;
      txt += `✨ *GSMArena Database*`;

      await m.reply(txt.trim());
    } else if (json.type === 'detail') {
      const d = json.result.main || {};
      let txt = `📱 *SPESIFIKASI: ${d.title || hp1}*\n\n`;
      txt += `• 📅 *Rilis:* ${d.release || '-'}\n`;
      txt += `• ⚙️ *OS:* ${d.os || '-'}\n`;
      txt += `• 💾 *Storage:* ${d.storage || '-'}\n`;
      txt += `• 📐 *Dimensi/Tebal:* ${d.thickness || '-'}\n`;
      txt += `• ⭐ *Popularitas:* ${d.popularity || '-'} (${d.hits || '-'} hits)\n`;
      if (json.result.url) txt += `• 🔗 *Detail:* ${json.result.url}\n`;
      txt += `\n✨ *GSMArena Database*`;

      if (d.image) {
        await conn.sendMessage(m.chat, {
          image: { url: d.image },
          caption: txt.trim()
        }, { quoted: m }).catch(() => m.reply(txt.trim()));
      } else {
        await m.reply(txt.trim());
      }
    } else {
      const list = Array.isArray(json.result) ? json.result.slice(0, 7) : [];
      if (!list.length) return m.reply("❌ Tidak ditemukan daftar perangkat.");

      let txt = `📱 *HASIL PENCARIAN GSMARENA*\n🔍 *Query:* ${hp1}\n\n`;
      list.forEach((item, i) => {
        txt += `*${i + 1}. ${item.name}*\n`;
        txt += `• 🔗 *Link:* ${item.url}\n\n`;
      });
      txt += `💡 *Ketik spesifik nama atau URL untuk melihat spesifikasi detail!*`;

      const firstImage = list.find(x => x.image)?.image;
      if (firstImage) {
        await conn.sendMessage(m.chat, {
          image: { url: firstImage },
          caption: txt.trim()
        }, { quoted: m }).catch(() => m.reply(txt.trim()));
      } else {
        await m.reply(txt.trim());
      }
    }

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Gagal memuat data GSMArena: " + e.message);
  }
};

handler.help = ['gsmarena <hp>', 'spekhp <hp>'];
handler.tags = ['search'];
handler.command = /^(gsmarena|spekhp)$/i;

handler.limit = 1;
export default handler;
