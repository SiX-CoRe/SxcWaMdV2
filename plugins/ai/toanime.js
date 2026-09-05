let handler = async (m, { conn, usedPrefix, command, args }) => {
  try {
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    const q = m.quoted ? m.quoted : m;
    const mime = q?.msg?.mimetype || q?.mimetype || "";

    if (!/image/.test(mime)) {
      return m.reply(`⚠️ Reply gambar dengan caption ${usedPrefix + command} [style]\nContoh: ${usedPrefix + command} Japanese Anime\nStyle tersedia: Japanese Anime, Disney, Pixar, Retro Comic, dll.`);
    }

    const media = await q.download();
    const style = args.join(' ') || 'Japanese Anime';
    
    const formData = new FormData();
    formData.append("file", new Blob([media], { type: "image/jpeg" }), "image.jpg");
    formData.append("style", style);

    const response = await fetch(`${global.web}/api/ai/tocartoon?apikey=${global.apikey.jereapi}`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      let errText = "Gagal mengubah ke anime";
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
        caption: `✅ *To Anime Success!*\n🎨 *Style:* ${style}`
      }, { quoted: m });
    } else {
      const json = await response.json();
      const url = json.data || json.result || json.url;
      if (!url) throw new Error(json.error || "Gagal mendapatkan gambar hasil anime");
      await conn.sendMessage(m.chat, {
        image: { url },
        caption: `✅ *To Anime Success!*\n🎨 *Style:* ${style}`
      }, { quoted: m }).catch(e => m.reply("Gagal mengirim media, ini linknya: " + url));
    }

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Error: " + e.message);
  }
};

handler.help = ["toanime [style]", "animeai [style]", "jadianime [style]"];
handler.premium = true;
handler.command = ["toanime", "animeai", "jadianime"];
handler.tags = ["ai"];
handler.limit = 1;

export default handler;
