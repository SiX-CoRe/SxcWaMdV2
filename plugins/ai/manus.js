let handler = async (m, { conn, usedPrefix, command, text }) => {
  try {
    if (!text) return m.reply(`⚠️ Masukkan pertanyaan untuk Manus AI!\nContoh: ${usedPrefix + command} halo, siapa kamu?`);
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
    
    const response = await fetch(`${global.web}/api/ai/manus?apikey=${global.apikey.jereapi}&prompt=${encodeURIComponent(text)}`);
    const json = await response.json();
    
    let resultText = '';
    if (json.status && json.result) {
      resultText = typeof json.result === 'object' ? (json.result.answer || json.result.response || json.result.message || json.result.result || json.result.text || JSON.stringify(json.result, null, 2)) : json.result;
    } else if (json.status && json.answer) {
      resultText = typeof json.answer === 'object' ? JSON.stringify(json.answer, null, 2) : json.answer;
    } else if (json.status && json.data) {
      resultText = typeof json.data === 'object' ? (json.data.answer || json.data.response || json.data.message || json.data.result || json.data.text || JSON.stringify(json.data, null, 2)) : json.data;
    } else {
      throw new Error(json.error || json.message || "Gagal mendapatkan respons dari Manus AI");
    }
    
    await m.reply(String(resultText).trim());
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Error: " + (e.message || e));
  }
};

handler.help = ["manus <teks>"];
handler.tags = ["ai"];
handler.command = ["manus", "manusai"];
handler.limit = true;

export default handler;
