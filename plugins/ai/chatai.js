import axios from 'axios';
import FormData from 'form-data';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || '';
    const isImage = /image/.test(mime);

    if (!text && !isImage) {
      return m.reply(`⚠️ Masukkan pertanyaan atau kirim/reply gambar dengan caption!\n\nContoh:\n${usedPrefix + command} siapa presiden pertama indonesia?\n(Reply Gambar) ${usedPrefix + command} jelaskan gambar ini`);
    }

    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    if (isImage) {
      const imgBuffer = await q.download();
      const form = new FormData();
      form.append('file', imgBuffer, {
        filename: 'image.jpg',
        contentType: 'image/jpeg'
      });
      form.append('prompt', text || 'Jelaskan gambar ini secara mendalam');
      form.append('model', 'gpt-4o');

      const response = await axios.post(`${global.web}/api/ai/chatvision?apikey=${global.apikey.jereapi}`, form, {
        headers: form.getHeaders(),
        timeout: 60000
      });

      const data = response.data;
      if (!data.status) throw new Error(data.error || data.message || "Gagal menganalisis gambar");
      
      let answer = data.result?.answer || data.result?.response || data.result?.text || data.result || data.answer || data.data;
      if (typeof answer === 'object') answer = JSON.stringify(answer, null, 2);
      
      await m.reply(String(answer).trim());
      await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } else {
      const apiUrl = `${global.web}/api/ai/chatai?apikey=${global.apikey.jereapi}&prompt=${encodeURIComponent(text)}`;
      const response = await axios.get(apiUrl, { timeout: 60000 });
      const data = response.data;
      
      if (!data.status) throw new Error(data.error || data.message || "Gagal mendapatkan respon AI");
      
      let answer = data.result?.answer || data.result?.response || data.result?.text || data.result || data.answer || data.data;
      if (typeof answer === 'object') answer = JSON.stringify(answer, null, 2);
      
      await m.reply(String(answer).trim());
      await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    }
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply(`❌ Error: ${e.response?.data?.error || e.message || "Terjadi kesalahan internal"}`);
  }
};

handler.help = ["chatai <teks/gambar>"];
handler.tags = ["ai"];
handler.command = ["chatai", "ai2", "simi2"];
handler.limit = true;

export default handler;
