import axios from "axios";

let handler = async (m, { text, usedPrefix, command, conn }) => {
  try {
    const API_KEY = global.apikey?.jereapi;
    if (!API_KEY || API_KEY === "MASUKAN_API_KEY_KAMU_DISINI") {
      return m.reply("❌ API Key JereAPI belum dikonfigurasi di config.js!");
    }

    if (!text) return m.reply(`⚠️ Mau tanya apa ke Copilot?\n\nContoh:\n${usedPrefix + command} halo copilot, buatkan saya pantun.`);

    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    const apiUrl = `${global.web}/api/ai/copilot?apikey=${global.apikey.jereapi}&query=${encodeURIComponent(text)}`;
    const response = await axios.get(apiUrl, { timeout: 60000 });
    
    const data = response.data;
    if (!data.status || (!data.result && !data.answer && !data.data)) {
      throw new Error(data.error || data.message || "Gagal mendapatkan respon dari Copilot");
    }

    let answer = data.result?.answer || data.result?.response || data.result?.text || data.result || data.answer || data.data;
    if (typeof answer === 'object') answer = JSON.stringify(answer, null, 2);
    
    await m.reply(String(answer).trim());
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply(`❌ Error: ${e.response?.data?.error || e.message || "Gagal memproses permintaan"}`);
  }
};

handler.command = ["copilot", "bingai"];
handler.help = ["copilot <pertanyaan>"];
handler.tags = ["ai"];
handler.limit = true;

export default handler;
