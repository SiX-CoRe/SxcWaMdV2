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
    formData.append("model", "gemini");

    const response = await axios.post(`${global.web}/api/ai/chatvision?apikey=${global.apikey.jereapi}`, formData, {
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
      throw new Error(json.error || json.msg || json.detail || json.message || "Gagal menganalisis gambar");
    }

    await m.reply(String(resultText).trim());
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    let errText = "Gagal memproses gambar dari server AI";
    if (e.response?.data && typeof e.response.data === 'object') {
      errText = e.response.data.msg || e.response.data.error || e.response.data.detail || e.response.data.message || errText;
    } else if (e.message) {
      errText = e.message;
    }
    m.reply("❌ Error: " + errText);
  }
};

handler.help = ["chatvision <prompt> (reply image)"];
handler.tags = ["ai"];
handler.command = ["chatvision", "vision"];
handler.limit = true;

export default handler;
