import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`⚠️ *Masukkan tipe/merk HP yang ingin dicari!*\nContoh: ${usedPrefix + command} iPhone 15 Pro`);

  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
  try {
    const apiKey = global.apikey?.jereapi;
    const res = await fetch(`${global.web}/api/search/phonespec?apikey=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text })
    });
    const json = await res.json();

    if (!json.status || !json.title) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply(`❌ Spesifikasi HP tidak ditemukan untuk: "${text}"`);
    }

    let output = `📱 *SPESIFIKASI LENGKAP: ${json.title}*\n\n`;
    if (json.release) output += `• 📅 *Rilis:* ${json.release}\n`;
    if (json.network) output += `• 📶 *Jaringan:* ${json.network}\n`;

    if (json.display) {
      output += `• 🖥️ *Layar:* ${json.display.size || '-'} (${json.display.type || '-'}), ${json.display.resolution || '-'}\n`;
    }
    if (json.performance) {
      output += `• ⚙️ *Chipset:* ${json.performance.chipset || '-'}\n`;
      output += `• 🧠 *CPU/GPU:* ${json.performance.cpu || '-'} / ${json.performance.gpu || '-'}\n`;
      output += `• 💾 *RAM/Internal:* ${json.performance.ram || '-'} / ${json.performance.storage || '-'}\n`;
    }
    if (json.camera) {
      output += `• 📸 *Kamera:* ${json.camera.configuration || '-'} (${json.camera.total || '-'} Lensa)\n`;
    }
    if (json.battery) {
      output += `• 🔋 *Baterai:* ${json.battery.capacity || '-'} (${json.battery.charging || '-'})
`;
    }
    if (json.system) {
      output += `• 🤖 *Sistem OS:* ${json.system.os || '-'}\n`;
    }
    if (json.body) {
      output += `• 📐 *Bodi & Berat:* ${json.body.dimensions || '-'} (${json.body.weight || '-'})
`;
    }

    output += `\n✨ *Carisinyal Smartphone Specs Database*`;

    if (json.image) {
      await conn.sendMessage(m.chat, {
        image: { url: json.image },
        caption: output.trim()
      }, { quoted: m }).catch(() => m.reply(output.trim()));
    } else {
      await m.reply(output.trim());
    }

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Gagal mencari spesifikasi HP: " + e.message);
  }
};

handler.help = ['phonespec <hp>', 'spesifikasihp <hp>'];
handler.tags = ['search'];
handler.command = /^(phonespec|spesifikasihp|carisinyal)$/i;

handler.limit = 1;
export default handler;
