let handler = async (m, { conn, usedPrefix, command, args }) => {
  try {
    const prompt = args.join(' ');
    if (!prompt) return m.reply(`⚠️ Masukkan prompt editan!\nContoh: ${usedPrefix + command} ubah jadi rambut merah`);
    
    const q = m.quoted ? m.quoted : m;
    const mime = q?.msg?.mimetype || q?.mimetype || "";
    if (!/image/.test(mime)) {
      return m.reply(`⚠️ Reply gambar dengan caption ${usedPrefix + command} <prompt>`);
    }
    
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    const media = await q.download();
    const formData = new FormData();
    formData.append("file", new Blob([media], { type: "image/jpeg" }), "image.jpg");
    formData.append("prompt", prompt);

    const response = await fetch(`${global.web}/api/ai/editimagegpt?apikey=${global.apikey.jereapi}`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      let errText = "Gagal memproses gambar";
      try {
        const errJson = await response.json();
        errText = errJson.error || errJson.message || errText;
      } catch (e) {}
      throw new Error(errText);
    }
    
    const contentType = response.headers.get('content-type') || "";
    if (contentType.includes('image')) {
      const buffer = Buffer.from(await response.arrayBuffer());
      await conn.sendMessage(m.chat, {
        image: buffer,
        caption: `✅ *Edit Image GPT Success!*\n\n📝 *Prompt:* ${prompt}`
      }, { quoted: m });
    } else {
      const json = await response.json();
      const url = json.data || json.result || json.url;
      if (!url) throw new Error(json.error || "Gagal mendapatkan hasil edit gambar");
      await conn.sendMessage(m.chat, {
        image: { url },
        caption: `✅ *Edit Image GPT Success!*\n\n📝 *Prompt:* ${prompt}`
      }, { quoted: m }).catch(e => m.reply("Gagal mengirim media, ini linknya: " + url));
    }
    
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Error: " + (e.message || "Terjadi kesalahan internal"));
  }
};

handler.premium = true;
handler.help = ["editimagegpt <prompt>"];
handler.command = ["editimagegpt", "gptedit"];
handler.tags = ["ai"];
handler.limit = 2;

export default handler;
