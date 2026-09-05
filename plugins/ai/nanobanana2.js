import uploadImage from '../../lib/uploadImage.js';

let handler = async (m, { conn, usedPrefix, command, text }) => {
  try {
    const q = m.quoted ? m.quoted : m;
    const mime = q?.msg?.mimetype || q?.mimetype || "";
    let imgUrl = "";
    let prompt = text ? text.trim() : "";
    
    if (/image/.test(mime)) {
      await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
      const media = await q.download();
      imgUrl = await uploadImage(media);
    }
    
    if (!prompt) return m.reply(`⚠️ Masukkan prompt editan Nano Banana 2!\nContoh: ${usedPrefix + command} futuristic cyberpunk girl`);
    
    if (!m.quoted || !/image/.test(mime)) {
      await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
    }
    
    const apiUrl = `${global.web}/api/ai/nanobanana2?apikey=${global.apikey.jereapi}&url=${encodeURIComponent(imgUrl)}&prompt=${encodeURIComponent(prompt)}`;
    const response = await fetch(apiUrl);
    const json = await response.json();
    
    let resultUrl = json.data?.image || json.data?.url || json.data?.image_url || json.result?.image || json.result?.url || json.data || json.result;
    if (Array.isArray(resultUrl)) resultUrl = resultUrl[0];
    if (typeof resultUrl === 'object' && resultUrl !== null) {
      resultUrl = resultUrl.url || resultUrl.image || JSON.stringify(resultUrl);
    }
    
    if (json.status && typeof resultUrl === 'string' && resultUrl.startsWith('http')) {
      await conn.sendMessage(m.chat, {
        image: { url: resultUrl },
        caption: `✅ *Nano Banana 2 Success!*\n📝 *Prompt:* ${prompt}`
      }, { quoted: m }).catch(e => m.reply("Gagal mengirim media, ini linknya: " + resultUrl));
      await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } else {
      throw new Error(json.error || json.message || "Gagal memproses gambar");
    }
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Error: " + (e.message || e));
  }
};

handler.help = ["nanobanana2 <prompt/reply image>"];
handler.premium = true;
handler.command = ["nanobanana2"];
handler.tags = ["ai"];
handler.limit = 1;

export default handler;
