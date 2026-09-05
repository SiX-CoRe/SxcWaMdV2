import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`⚠️ *Masukkan nama masakan / resep!*\nContoh: ${usedPrefix + command} nasi goreng kambing`);

  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
  try {
    const apiKey = global.apikey?.jereapi;
    const res = await fetch(`${global.web}/api/search/cookpad?apikey=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'search',
        query: text,
        page: 1,
        limit: 5
      })
    });
    const json = await res.json();

    if (!json.status || !json.result || json.result.length === 0) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply(`❌ Resep tidak ditemukan untuk: "${text}"`);
    }

    const recipes = json.result.slice(0, 5);
    let caption = `🍳 *PENCARIAN RESEP COOKPAD*\n🔍 *Query:* ${text}\n\n`;

    recipes.forEach((r, i) => {
      caption += `*${i + 1}. ${r.title || '-' }*\n`;
      if (r.author?.name) caption += `• 👤 *Oleh:* ${r.author.name}\n`;
      if (r.cookTime || r.prepTime) caption += `• ⏱️ *Waktu:* ${r.cookTime || r.prepTime}\n`;
      if (r.recipeYield) caption += `• 🍽️ *Porsi:* ${r.recipeYield}\n`;
      if (r.url) caption += `• 🔗 *Resep:* ${r.url}\n`;
      caption += `\n`;
    });

    caption += `✨ *SxcWaMd Recipe Search*`;

    const firstImage = recipes.find(r => r.image)?.image;
    if (firstImage) {
      await conn.sendMessage(m.chat, {
        image: { url: firstImage },
        caption: caption.trim()
      }, { quoted: m }).catch(() => m.reply(caption.trim()));
    } else {
      await m.reply(caption.trim());
    }

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Gagal mencari resep Cookpad: " + e.message);
  }
};

handler.help = ['cookpad <makanan>', 'resep <makanan>'];
handler.tags = ['search'];
handler.command = /^(cookpad|resep)$/i;

handler.limit = 1;
export default handler;
