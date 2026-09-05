import uploadImage from '../../lib/uploadImage.js';

let handler = async (m, { conn, usedPrefix, command, args }) => {
  try {
    const prompt = args.join(' ');
    if (!prompt) return m.reply(`⚠️ Masukkan prompt editan!\nContoh: ${usedPrefix + command} ubah jadi anime cyberpunk`);
    
    const q = m.quoted ? m.quoted : m;
    const mime = q?.msg?.mimetype || q?.mimetype || "";
    if (!/image/.test(mime)) {
      return m.reply(`⚠️ Reply gambar dengan caption ${usedPrefix + command} <prompt>`);
    }
    
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
    
    const media = await q.download();
    let url;
    try {
      url = await uploadImage(media);
    } catch (e) {
      return m.reply('❌ Gagal mengupload gambar ke server temporary. Coba lagi.');
    }

    const apiUrl = `${global.web}/api/ai/editimagev3?apikey=${global.apikey.jereapi}`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: url, prompt: prompt, output_type: 'png' })
    });
    
    if (!response.ok) {
      let errText = "Gagal memproses gambar";
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
        caption: `✅ *Edit Image V3 Success!*\n\n📝 *Prompt:* ${prompt}`
      }, { quoted: m });
    } else {
      const json = await response.json();
      const resUrl = json.result || json.data || json.url;
      if (!resUrl) throw new Error(json.error || "Gagal mendapatkan hasil edit gambar");
      await conn.sendMessage(m.chat, {
        image: { url: resUrl },
        caption: `✅ *Edit Image V3 Success!*\n\n📝 *Prompt:* ${prompt}`
      }, { quoted: m }).catch(e => m.reply("Gagal mengirim media, ini linknya: " + resUrl));
    }
    
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Error: " + (e.message || "Terjadi kesalahan internal"));
  }
};

handler.premium = true;
handler.help = ["editimagev3 <prompt>"];
handler.command = ["editimagev3"];
handler.tags = ["ai"];
handler.limit = 2;

export default handler;
