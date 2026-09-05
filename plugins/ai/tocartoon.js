let handler = async (m, { conn, usedPrefix, command, args }) => {
  try {
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    const q = m.quoted ? m.quoted : m;
    const mime = q?.msg?.mimetype || q?.mimetype || "";

    if (!/image/.test(mime)) {
      return m.reply(`⚠️ Reply gambar dengan caption ${usedPrefix + command} [prompt/style]\nContoh: ${usedPrefix + command} 3D Disney Pixar`);
    }

    const media = await q.download();
    const prompt = args.join(' ') || 'Cartoon';
    
    const formData = new FormData();
    formData.append("file", new Blob([media], { type: "image/jpeg" }), "image.jpg");
    formData.append("prompt", prompt);

    const response = await fetch(`${global.web}/api/ai/tocartoon?apikey=${global.apikey.jereapi}`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      let errText = "Gagal mengubah gambar ke kartun";
      try {
        const errJson = await response.json();
        errText = errJson.error || errJson.message || errText;
      } catch (e) {}
      throw new Error(errText);
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("image")) {
      const buffer = Buffer.from(await response.arrayBuffer());
      await conn.sendMessage(m.chat, {
        image: buffer,
        caption: `✅ *To Cartoon Success!*\n🎨 *Prompt:* ${prompt}`
      }, { quoted: m });
    } else {
      const json = await response.json();
      const url = json.data || json.result || json.url;
      if (!url) throw new Error(json.error || "Gagal mendapatkan gambar hasil kartun");
      await conn.sendMessage(m.chat, {
        image: { url },
        caption: `✅ *To Cartoon Success!*\n🎨 *Prompt:* ${prompt}`
      }, { quoted: m }).catch(e => m.reply("Gagal mengirim media, ini linknya: " + url));
    }

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Error: " + e.message);
  }
};

handler.help = ["tocartoon <prompt>", "kartunai <prompt>", "jadikartun <prompt>"];
handler.premium = true;
handler.command = ["tocartoon", "kartunai", "jadikartun"];
handler.tags = ["ai"];
handler.limit = 1;

export default handler;
