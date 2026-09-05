import uploadImage from '../../lib/uploadImage.js';

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
    let url;
    try {
      url = await uploadImage(media);
    } catch (e) {
      return m.reply('❌ Gagal mengupload gambar ke server temporary. Coba lagi.');
    }
    
    const apiUrl = `${global.web}/api/ai/editimage?apikey=${global.apikey.jereapi}&prompt=${encodeURIComponent(prompt)}&url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl);
    const json = await response.json();
    
    if (!json.status) {
      throw new Error(json.error || json.message || json.detail || "Gagal mengedit gambar");
    }
    
    let resultUrl = json.result?.image || json.result?.url || json.result?.images?.[0] || json.data?.image || json.data?.url || (Array.isArray(json.result) ? json.result[0] : json.result) || json.data;
    if (typeof resultUrl === 'object' && resultUrl !== null) {
      resultUrl = resultUrl.url || resultUrl.image || JSON.stringify(resultUrl);
    }
    
    if (typeof resultUrl === 'string' && resultUrl.startsWith('http')) {
      await conn.sendMessage(m.chat, {
        image: { url: resultUrl },
        caption: `✅ *AI Edit Success!*\n📝 *Prompt:* ${prompt}`
      }, { quoted: m }).catch(e => m.reply("Gagal mengirim media, ini linknya: " + resultUrl));
      await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } else {
      throw new Error("Format URL hasil gambar tidak valid");
    }
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Error: " + (e.message || e));
  }
};

handler.help = ["aiedit <prompt>"];
handler.premium = true;
handler.command = ["aiedit", "editgambar"];
handler.tags = ["ai"];
handler.limit = 1;

export default handler;
