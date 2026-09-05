import FormData from 'form-data';
import axios from 'axios';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    const q = m.quoted ? m.quoted : m;
    const mime = q?.msg?.mimetype || q?.mimetype || "";

    if (!/image/.test(mime)) {
      return m.reply(`⚠️ Reply gambar dengan caption ${usedPrefix + command} <prompt>\nContoh: ${usedPrefix + command} jelaskan gambar ini`);
    }
    
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    const media = await q.download();
    const formData = new FormData();
    formData.append("file", media, { filename: "image.jpg", contentType: "image/jpeg" });
    formData.append("prompt", text || "Jelaskan gambar ini secara rinci");

    const response = await axios.post(`${global.web}/api/ai/chatvision-v2?apikey=${global.apikey.jereapi}`, formData, {
      headers: formData.getHeaders(),
      timeout: 60000
    });
    
    const json = response.data;
    let resultText = '';
    if (json.status && json.result) {
      resultText = typeof json.result === 'object' ? (json.result.answer || json.result.response || json.result.reply || json.result.message || JSON.stringify(json.result, null, 2)) : json.result;
    } else if (json.status && json.data) {
      resultText = typeof json.data === 'object' ? (json.data.answer || json.data.response || json.data.reply || json.data.message || JSON.stringify(json.data, null, 2)) : json.data;
    } else if (json.status && json.answer) {
      resultText = typeof json.answer === 'object' ? JSON.stringify(json.answer, null, 2) : json.answer;
    } else {
      throw new Error(json.error || json.detail || json.message || "Gagal menganalisis gambar");
    }

    await m.reply(String(resultText).trim());
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Error: " + (e.response?.data?.error || e.message || "Terjadi kesalahan internal"));
  }
};

handler.help = ["chatvision-v2 <prompt> (reply image)"];
handler.tags = ["ai"];
handler.command = ["chatvision-v2", "chatvisionv2", "visionv2"];
handler.limit = true;

export default handler;
