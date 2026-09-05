import uploadImage from '../../lib/uploadImage.js';

const DEFAULT_PROMPT = `Buat saya memakai kostum Qin Shi Huang dari anime Record of Ragnarok, termasuk desain penutup mata dan pakaian yang dikenakan Qin Shi Huang di dalam anime Record of Ragnarok. Buatkan pose khasnya. Characterized by stark cinematic lighting and intense contrast. Highly detailed realistic anime style.`.trim();

let handler = async (m, { conn }) => {
  try {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || "";
    if (!mime.startsWith("image/")) {
      return m.reply("🍂 *Reply gambar yang ingin diedit.*");
    }
    
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
    
    let buffer = await q.download();
    if (!buffer) {
      return m.reply("🍂 *Gagal membaca gambar.*");
    }
    
    let imgUrl = await uploadImage(buffer);
    let res = await fetch(`${global.web}/api/ai/editimage?apikey=${global.apikey.jereapi}&url=${encodeURIComponent(imgUrl)}&prompt=${encodeURIComponent(DEFAULT_PROMPT)}`);
    let result = await res.json();
    
    let finalImg = result?.result?.image || result?.result?.images?.[0] || result?.result?.url || result?.data?.image || result?.data?.url || (Array.isArray(result?.result) ? result?.result[0] : result?.result) || result?.data;
    if (typeof finalImg === 'object' && finalImg !== null) {
      finalImg = finalImg.url || finalImg.image || JSON.stringify(finalImg);
    }
    
    if (!result?.status || !finalImg || typeof finalImg !== 'string' || !finalImg.startsWith('http')) {
      throw new Error(result?.error || result?.message || 'Server tidak mengembalikan hasil edit gambar.');
    }
    
    await conn.sendMessage(m.chat, {
      image: { url: finalImg },
      caption: '👑 *Qin Shi Huang AI Transformation Success!*'
    }, { quoted: m }).catch(e => m.reply("Gagal mengirim media, ini linknya: " + finalImg));
    
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("🍂 *Gagal:* " + (e.message || "Terjadi kesalahan saat memproses gambar."));
  }
};

handler.help = ["toqin"];
handler.tags = ["ai"];
handler.premium = true;
handler.command = /^(toqin)$/i;
handler.limit = 1;

export default handler;
