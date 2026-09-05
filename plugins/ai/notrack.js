import axios from 'axios';

let handler = async (m, { text, usedPrefix, command, conn }) => {
  try {
    const API_KEY = global.apikey?.jereapi;
    if (!API_KEY || API_KEY === "MASUKAN_API_KEY_KAMU_DISINI") {
      return m.reply("❌ API Key JereAPI belum dikonfigurasi di config.js!");
    }

    if (!text) {
      return m.reply(`⚠️ *Teks dibutuhkan!*\n\nContoh:\n*${usedPrefix + command} Halo, ceritakan tentang planet Mars.*`);
    }

    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    const apiUrl = `${global.web}/api/ai/notrack?apikey=${API_KEY}`;
    const response = await axios.post(apiUrl, {
      prompt: text,
      sessionId: m.sender.split('@')[0],
      chatId: m.chat.split('@')[0]
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 60000
    });

    const resData = response.data;
    if (!resData || !resData.status) {
      throw new Error(resData?.error || resData?.message || 'Gagal memproses AI');
    }

    let resultText = resData.data?.response || resData.data?.reply || resData.data?.message || resData.data?.answer || resData.data?.text || resData.data || resData.result;
    if (typeof resultText === 'object') resultText = JSON.stringify(resultText, null, 2);

    await m.reply(String(resultText).trim());
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (err) {
    console.error('[NoTrack Error]', err);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply(`❌ *Error:* ${err.response?.data?.error || err.message || 'Terjadi kesalahan sistem'}`);
  }
};

handler.help = ["notrack <teks>"];
handler.tags = ["ai"];
handler.command = ["notrack"];
handler.limit = true;

export default handler;
