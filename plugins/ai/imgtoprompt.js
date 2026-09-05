import FormData from 'form-data';
import axios from 'axios';

let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    const q = m.quoted ? m.quoted : m;
    const mime = q?.msg?.mimetype || q?.mimetype || "";

    if (!/image/.test(mime)) {
      return m.reply(`⚠️ Reply gambar dengan caption ${usedPrefix + command}`);
    }
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
    
    const media = await q.download();
    const formData = new FormData();
    formData.append("file", media, { filename: "image.jpg", contentType: "image/jpeg" });

    const response = await axios.post(`${global.web}/api/ai/imgtoprompt?apikey=${global.apikey.jereapi}`, formData, {
      headers: formData.getHeaders(),
      timeout: 60000
    });
    const json = response.data;
    
    let resultText = '';
    if (json.status && json.result) {
      resultText = typeof json.result === 'object' ? (json.result.prompt || json.result.description || json.result.text || JSON.stringify(json.result, null, 2)) : json.result;
    } else if (json.status && json.data) {
      resultText = typeof json.data === 'object' ? (json.data.prompt || json.data.description || json.data.text || JSON.stringify(json.data, null, 2)) : json.data;
    } else {
      throw new Error(json.error || json.detail || json.message || "Gagal mendapatkan prompt dari gambar");
    }

    await m.reply(`📝 *IMAGE TO PROMPT*\n\n${String(resultText).trim()}`);
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Error: " + (e.response?.data?.error || e.message || "Terjadi kesalahan internal"));
  }
};

handler.help = ["imgtoprompt (reply image)"];
handler.tags = ["ai"];
handler.command = ["imgtoprompt", "imagetoprompt", "describeimage"];
handler.limit = true;

export default handler;
