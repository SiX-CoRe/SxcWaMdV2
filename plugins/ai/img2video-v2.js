import axios from 'axios';
import FormData from 'form-data';

let isProcessing = {};
let handler = async (m, { conn, text, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || '';
  if (!/image/.test(mime)) {
    return m.reply(`⚠️ Kirim/reply sebuah gambar dengan caption:\n${usedPrefix + command} <prompt animasi>\n\nContoh:\n${usedPrefix + command} make camera zoom in smoothly --filter cyberpunk`);
  }
  
  const API_KEY = global.apikey?.jereapi;
  if (!API_KEY || API_KEY === "MASUKAN_API_KEY_KAMU_DISINI") {
    return m.reply("❌ API Key JereAPI belum dikonfigurasi di config.js!");
  }
  
  if (isProcessing[m.sender]) {
    return m.reply('⏳ Kamu masih memiliki antrean Img2Video V2 yang sedang diproses. Mohon tunggu!');
  }
  
  try {
    isProcessing[m.sender] = true;
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
    
    let imageBuffer = await q.download();
    if (!imageBuffer) throw new Error("Gagal mengunduh gambar.");
    
    m.reply("🎬 Sedang memproses animasi video dengan AI Wan2.2 & SVD... Mohon tunggu (estimasi 30-90 detik).");
    
    let filter = 'none';
    let promptText = text || 'smooth cinematic motion, high quality';
    if (text && text.includes('--filter')) {
      const parts = text.split('--filter');
      promptText = parts[0].trim();
      filter = parts[1].trim().split(' ')[0] || 'none';
    }
    
    let formData = new FormData();
    formData.append('file', imageBuffer, {
      filename: `image_${Date.now()}.jpg`,
      contentType: 'image/jpeg'
    });
    
    const url = `${global.web}/api/ai/img2video-v2?apikey=${API_KEY}&prompt=${encodeURIComponent(promptText)}&filter=${encodeURIComponent(filter)}`;
    const response = await axios.post(url, formData, {
      headers: formData.getHeaders(),
      timeout: 180000
    });
    
    const data = response.data;
    if (!data.status) {
      throw new Error(data.error || data.detail || data.message || "Gagal memproses video.");
    }
    
    let videoUrl = data.result?.video_url || data.result?.video || data.result?.url || data.data?.video_url || data.data?.video || data.data?.url || data.video_url || data.result || data.data;
    if (typeof videoUrl === 'object' && videoUrl !== null) {
      videoUrl = videoUrl.video_url || videoUrl.url || videoUrl.video || JSON.stringify(videoUrl);
    }
    
    if (typeof videoUrl === 'string' && videoUrl.startsWith('http')) {
      await conn.sendMessage(m.chat, {
        video: { url: videoUrl },
        caption: `🎬 *Img2Video V2 (Wan2.2)*\n\n📝 *Prompt:* ${promptText}\n🎨 *Filter:* ${filter}\n⏱️ *Waktu:* ${data.result?.execution_time || data.data?.execution_time || 'Selesai'}`
      }, { quoted: m }).catch(e => m.reply("Gagal mengirim media, ini linknya: " + videoUrl));
      await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } else {
      throw new Error("Format URL video tidak valid dari server.");
    }
  } catch (e) {
    console.error('Img2Video V2 Error:', e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply(`❌ Error: ${e.response?.data?.error || e.message || "Gagal memproses video."}`);
  } finally {
    delete isProcessing[m.sender];
  }
};

handler.help = ["img2video-v2 <prompt>", "i2v-v2 <prompt>"];
handler.premium = true;
handler.command = ["img2video-v2", "img2videov2", "i2v-v2", "i2vv2"];
handler.tags = ["ai"];
handler.limit = 5;

export default handler;
