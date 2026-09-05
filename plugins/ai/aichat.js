let handler = async (m, { conn, usedPrefix, command, text }) => {
  try {
    if (!text) return m.reply(`⚠️ Masukkan pertanyaan/prompt!\nContoh: *${usedPrefix + command} halo, siapa kamu?*\n\n💡 *Tips Model Khusus:* Gunakan flag seperti *--deepseek*, *--claude*, *--gemini*, *--gpt5*\nContoh: *${usedPrefix + command} --deepseek jelaskan teori relativitas*`);
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
    
    let model = 'openai/gpt-4o';
    let cleanPrompt = text;

    let flagMatch = text.match(/^--([a-zA-Z0-9.-]+)\s+([\s\S]+)/);
    if (flagMatch) {
      model = flagMatch[1].trim();
      cleanPrompt = flagMatch[2].trim();
    }

    const response = await fetch(`${global.web}/api/ai/aichat?apikey=${global.apikey?.jereapi || ''}&prompt=${encodeURIComponent(cleanPrompt)}&model=${encodeURIComponent(model)}&session_id=${encodeURIComponent(m.sender)}`);
    const json = await response.json();
    
    let resultText = '';
    if (json.status && json.result) {
      resultText = typeof json.result === 'object' ? (json.result.answer || json.result.response || json.result.reply || json.result.message || json.result.text || JSON.stringify(json.result, null, 2)) : json.result;
    } else if (json.status && json.data) {
      resultText = typeof json.data === 'object' ? (json.data.answer || json.data.response || json.data.reply || json.data.message || json.data.text || JSON.stringify(json.data, null, 2)) : json.data;
    } else if (json.status && json.answer) {
      resultText = typeof json.answer === 'object' ? JSON.stringify(json.answer, null, 2) : json.answer;
    } else {
      throw new Error(json.error || json.message || json.msg || "Gagal mendapatkan respons dari AI");
    }
    
    await m.reply(String(resultText).trim());
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Error: " + (e.message || e));
  }
};

handler.help = ["aichat <teks>", "ai <teks>"];
handler.tags = ["ai"];
handler.command = ["aichat", "ai", "chatgpt", "gpt"];
handler.limit = true;

export default handler;
