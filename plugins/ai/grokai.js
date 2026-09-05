let handler = async (m, { conn, usedPrefix, command, text }) => {
  try {
    if (!text) return m.reply(`⚠️ Masukkan pertanyaan untuk Grok AI!\nContoh: ${usedPrefix + command} jelaskan tentang quantum computing`);
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    const response = await fetch(`${global.web}/api/ai/grokai?apikey=${global.apikey.jereapi}&text=${encodeURIComponent(text)}`);
    const json = await response.json();
    
    let resultText = '';
    if (json.status && json.data) {
      resultText = typeof json.data === 'object' ? (json.data.response || json.data.reply || json.data.message || json.data.answer || JSON.stringify(json.data, null, 2)) : json.data;
    } else if (json.status && json.result) {
      resultText = typeof json.result === 'object' ? (json.result.response || json.result.reply || json.result.message || json.result.answer || JSON.stringify(json.result, null, 2)) : json.result;
    } else if (json.status && json.answer) {
      resultText = typeof json.answer === 'object' ? JSON.stringify(json.answer, null, 2) : json.answer;
    } else {
      throw new Error(json.error || json.message || "Gagal mendapatkan respons dari Grok AI");
    }

    await m.reply(String(resultText).trim());
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Error: " + (e.message || e));
  }
};

handler.help = ["grok <teks>"];
handler.tags = ["ai"];
handler.command = ["grok", "grokai"];
handler.limit = true;

export default handler;
