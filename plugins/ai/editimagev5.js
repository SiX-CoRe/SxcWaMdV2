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

    const apiUrl = `${global.web}/api/ai/editimagev5?apikey=${global.apikey.jereapi}`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url, prompt: prompt })
    });
    const json = await response.json();
    
    if (!json.status) {
      throw new Error(json.error || json.detail || json.message || "Gagal mendapatkan respons");
    }
    
    let resultUrl = json.data?.result_url || json.data?.url || json.result?.result_url || json.result?.url || json.data || json.result;
    if (Array.isArray(resultUrl)) resultUrl = resultUrl[0];
    if (typeof resultUrl === 'object' && resultUrl !== null) {
      resultUrl = resultUrl.url || resultUrl.result_url || JSON.stringify(resultUrl);
    }
    
    if (typeof resultUrl === 'string' && resultUrl.startsWith('http')) {
      await conn.sendMessage(m.chat, {
        image: { url: resultUrl },
        caption: `✅ *Edit Image V5 Success!*\n📝 *Prompt:* ${prompt}`
      }, { quoted: m }).catch(e => m.reply("Gagal mengirim media, ini linknya: " + resultUrl));
      await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } else {
      throw new Error("Format URL hasil gambar tidak valid");
    }
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Error: " + (e.message || "Terjadi kesalahan internal"));
  }
};

handler.premium = true;
handler.help = ["editimagev5 <prompt>"];
handler.command = ["editimagev5"];
handler.tags = ["ai"];
handler.limit = 2;

export default handler;
