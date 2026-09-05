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
    
    const response = await fetch(`${global.web}/api/ai/wink?apikey=${global.apikey.jereapi}`, {
      method: 'POST',
      body: formData
    });
    const json = await response.json();
    
    let resultUrl = json.resultUrl || json.result_url || json.result?.image || json.result?.url || json.data?.url || (Array.isArray(json.result) ? json.result[0] : json.result) || json.data;
    if (typeof resultUrl === 'object' && resultUrl !== null) {
      resultUrl = resultUrl.url || resultUrl.resultUrl || JSON.stringify(resultUrl);
    }
    
    if (json.status && typeof resultUrl === 'string' && resultUrl.startsWith('http')) {
      await conn.sendMessage(m.chat, {
        image: { url: resultUrl },
        caption: `✅ *Wink AI Quality Success!*`
      }, { quoted: m }).catch(e => m.reply("Gagal mengirim media, ini linknya: " + resultUrl));
      await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } else {
      throw new Error(json.error || json.detail || json.message || "Gagal mendapatkan respons dari Wink AI");
    }
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Error: " + (e.message || "Terjadi kesalahan internal"));
  }
};

handler.help = ["wink"];
handler.premium = true;
handler.command = ["wink", "winkai"];
handler.tags = ["ai"];
handler.limit = 1;

export default handler;
