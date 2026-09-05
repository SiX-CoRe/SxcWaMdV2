import uploadImage from '../../lib/uploadImage.js';

let handler = async (m, { conn, usedPrefix, command, args }) => {
  try {
    let text = args.join(' ');
    if (!text) return m.reply(`⚠️ Format salah!\nContoh: ${usedPrefix + command} asli | ganti`);
    let [original, replace] = text.split('|').map(v => v.trim());
    if (!original || !replace) return m.reply(`⚠️ Format harus lengkap: teks asli | teks pengganti\nContoh: ${usedPrefix + command} Diskon 50% | Diskon 90%`);
    
    const q = m.quoted ? m.quoted : m;
    const mime = q?.msg?.mimetype || q?.mimetype || "";
    if (!/image/.test(mime)) {
      return m.reply(`⚠️ Reply gambar dengan caption ${usedPrefix + command} <asli> | <ganti>`);
    }
    
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
    
    const media = await q.download();
    const url = await uploadImage(media);
    
    const apiUrl = `${global.web}/api/ai/textreplace?apikey=${global.apikey.jereapi}&url=${encodeURIComponent(url)}&original=${encodeURIComponent(original)}&replace=${encodeURIComponent(replace)}`;
    const response = await fetch(apiUrl);
    const json = await response.json();
    
    let resultUrl = json.result?.image || json.result?.url || json.result?.image_url || json.data?.image || json.data?.url || (Array.isArray(json.result) ? json.result[0] : json.result) || json.data;
    if (typeof resultUrl === 'object' && resultUrl !== null) {
      resultUrl = resultUrl.url || resultUrl.image || JSON.stringify(resultUrl);
    }
    
    if (json.status && typeof resultUrl === 'string' && resultUrl.startsWith('http')) {
      await conn.sendMessage(m.chat, {
        image: { url: resultUrl },
        caption: `✅ *AI Text Replace Success!*\n\n📝 *Original:* ${original}\n🔄 *Replaced with:* ${replace}`
      }, { quoted: m }).catch(e => m.reply("Gagal mengirim media, ini linknya: " + resultUrl));
      await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } else {
      throw new Error(json.error || json.message || "Gagal mengganti teks pada gambar");
    }
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Error: " + (e.message || "Terjadi kesalahan internal"));
  }
};

handler.help = ["textreplace <asli>|<ganti>", "gantiteks <asli>|<ganti>"];
handler.premium = true;
handler.command = ["textreplace", "gantiteks"];
handler.tags = ["ai"];
handler.limit = 1;

export default handler;
