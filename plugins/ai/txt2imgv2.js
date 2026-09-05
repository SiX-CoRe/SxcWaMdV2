let handler = async (m, { conn, usedPrefix, command, text }) => {
  try {
    if (!text) return m.reply(`⚠️ Masukkan prompt gambar!\nContoh: ${usedPrefix + command} aesthetic anime landscape --style painted-anime\n\nStyle tersedia: cinematic, painted-anime, digital-painting, concept-art, cyberpunk, 3d-render, casual-photo, traditional-japanese, none`);
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
    
    let style = 'cinematic';
    let promptText = text;
    if (text.includes('--style')) {
      const parts = text.split('--style');
      promptText = parts[0].trim();
      style = parts[1].trim().split(' ')[0] || 'cinematic';
    }

    const response = await fetch(`${global.web}/api/ai/txt2imgv2?apikey=${global.apikey.jereapi}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: promptText, style: style })
    });
    const json = await response.json();
    
    let imgUrl = Array.isArray(json.result) ? json.result[0] : (json.result?.image || json.result?.url || json.result || json.data?.[0] || json.data?.url || json.data);
    if (typeof imgUrl === 'object' && imgUrl !== null) {
      imgUrl = imgUrl.url || imgUrl.image || JSON.stringify(imgUrl);
    }
    
    if (json.status && typeof imgUrl === 'string' && imgUrl.startsWith('http')) {
      await conn.sendMessage(m.chat, {
        image: { url: imgUrl },
        caption: `✅ *Txt2Img V2 Success!*\n📝 *Prompt:* ${promptText}\n🎨 *Style:* ${style}`
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

handler.help = ["txt2imgv2 <prompt>"];
handler.premium = true;
handler.command = ["txt2imgv2"];
handler.tags = ["ai"];
handler.limit = 2;

export default handler;
