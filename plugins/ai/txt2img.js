let handler = async (m, { conn, usedPrefix, command, text }) => {
  try {
    if (!text) return m.reply(`⚠️ Masukkan prompt gambar!\nContoh: ${usedPrefix + command} futuristic cat wearing space suit`);
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
    
    const response = await fetch(`${global.web}/api/ai/txt2img?apikey=${global.apikey.jereapi}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: text })
    });
    const json = await response.json();
    
    let imgUrl = json.result?.image || json.result?.url || json.result?.images?.[0] || (Array.isArray(json.result) ? json.result[0] : json.result) || json.data?.image || json.data?.url || json.data;
    if (typeof imgUrl === 'object' && imgUrl !== null) {
      imgUrl = imgUrl.url || imgUrl.image || JSON.stringify(imgUrl);
    }
    
    if (json.status && typeof imgUrl === 'string' && imgUrl.startsWith('http')) {
      await conn.sendMessage(m.chat, {
        image: { url: imgUrl },
        caption: `✅ *AI Text to Image Success!*\n📝 *Prompt:* ${text}`
      }, { quoted: m }).catch(e => m.reply("Gagal mengirim media, ini linknya: " + imgUrl));
      await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } else {
      throw new Error(json.error || json.message || "Gagal menghasilkan gambar dari teks");
    }
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Error: " + (e.message || e));
  }
};

handler.help = ["txt2img <prompt>", "dalle <prompt>", "midjourney <prompt>", "stablediffusion <prompt>"];
handler.tags = ["ai"];
handler.command = ["txt2img", "text2img", "dalle", "midjourney", "stablediffusion"];
handler.limit = 2;

export default handler;
