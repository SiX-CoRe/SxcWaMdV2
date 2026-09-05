import uploadImage from '../../lib/uploadImage.js';

let handler = async (m, { conn, usedPrefix, command, text }) => {
  try {
    const q = m.quoted ? m.quoted : m;
    const mime = q?.msg?.mimetype || q?.mimetype || "";
    let imgUrl = text ? text.trim() : "";

    if (/image/.test(mime)) {
      await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
      const media = await q.download();
      imgUrl = await uploadImage(media);
    }

    if (!imgUrl) {
      return m.reply(`⚠️ Kirim/reply gambar atau berikan URL gambar!\nContoh: ${usedPrefix + command} https://example.com/image.jpg`);
    }

    if (!m.quoted || !/image/.test(mime)) {
      await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
    }

    const response = await fetch(`${global.web}/api/ai/pixa-removebg?apikey=${global.apikey.jereapi}&url=${encodeURIComponent(imgUrl)}`);
    
    if (!response.ok) {
      let errText = "Gagal memproses gambar";
      try {
        const errJson = await response.json();
        errText = errJson.error || errJson.message || errText;
      } catch (e) {}
      throw new Error(errText);
    }

    const resultBuffer = Buffer.from(await response.arrayBuffer());

    await conn.sendMessage(m.chat, {
      image: resultBuffer,
      caption: `✅ *Pixa RemoveBG Success!*`
    }, { quoted: m });
    
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Error: " + (e.message || "Terjadi kesalahan internal"));
  }
};

handler.help = ["pixa-removebg <url/reply image>", "pixaremovebg <url/reply image>"];
handler.premium = true;
handler.command = ["pixa-removebg", "pixaremovebg"];
handler.tags = ["ai"];
handler.limit = 1;

export default handler;
