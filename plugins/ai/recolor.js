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
    
    if (!imgUrl) return m.reply(`⚠️ Kirim/reply gambar atau berikan URL gambar!\nContoh: ${usedPrefix + command} https://example.com/image.jpg`);
    
    if (!m.quoted || !/image/.test(mime)) {
      await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
    }
    
    const response = await fetch(`${global.web}/api/ai/recolor?apikey=${global.apikey.jereapi}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: imgUrl })
    });
    const json = await response.json();
    
    let resultUrl = json.result?.image || json.result?.url || json.result?.image_url || json.data?.image || json.data?.url || (Array.isArray(json.result) ? json.result[0] : json.result) || json.data;
    if (typeof resultUrl === 'object' && resultUrl !== null) {
      resultUrl = resultUrl.url || resultUrl.image || JSON.stringify(resultUrl);
    }
    
    if (json.status && typeof resultUrl === 'string' && resultUrl.startsWith('http')) {
      await conn.sendMessage(m.chat, {
        image: { url: resultUrl },
        caption: `✅ *Recolor Image Success!*`
      }, { quoted: m }).catch(e => m.reply("Gagal mengirim media, ini linknya: " + resultUrl));
      await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } else {
      throw new Error(json.error || json.message || "Gagal mewarnai ulang gambar");
    }
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Error: " + (e.message || e));
  }
};

handler.help = ["recolor <url/reply gambar>"];
handler.premium = true;
handler.command = ["recolor"];
handler.tags = ["ai"];
handler.limit = 1;

export default handler;
