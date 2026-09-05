let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    const q = m.quoted ? m.quoted : m;
    const mime = q?.msg?.mimetype || q?.mimetype || "";
    if (!/image/.test(mime)) {
      return m.reply(`⚠️ Reply gambar dengan caption ${usedPrefix + command}`);
    }
    
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
    const media = await q.download();
    const formData = new FormData();
    formData.append("file", new Blob([media], { type: "image/jpeg" }), "image.jpg");
    
    const response = await fetch(`${global.web}/api/ai/beautyplus?apikey=${global.apikey.jereapi}`, {
      method: 'POST',
      body: formData
    });
    const json = await response.json();
    
    let resultUrl = json.data?.image_url || json.data?.url || json.result?.image_url || json.result?.url || json.image_url || json.result || json.data;
    if (typeof resultUrl === 'object' && resultUrl !== null) {
      resultUrl = resultUrl.url || resultUrl.image_url || JSON.stringify(resultUrl);
    }
    
    if (json.status && typeof resultUrl === 'string' && resultUrl.startsWith('http')) {
      await conn.sendMessage(m.chat, {
        image: { url: resultUrl },
        caption: `✅ *BeautyPlus Filter Success!*`
      }, { quoted: m }).catch(e => m.reply("Gagal mengirim media, ini linknya: " + resultUrl));
      await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } else {
      throw new Error(json.error || json.detail || json.message || "Gagal mempercantik gambar");
    }
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Error: " + (e.message || "Terjadi kesalahan internal"));
  }
};

handler.help = ["beautyplus"];
handler.premium = true;
handler.command = ["beautyplus", "filterbeauty"];
handler.tags = ["ai"];
handler.limit = 1;

export default handler;
