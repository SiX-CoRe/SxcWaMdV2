let handler = async (m, { conn, usedPrefix, command, text }) => {
  try {
    const q = m.quoted ? m.quoted : m;
    const inputText = text || q.text;
    if (!inputText) return m.reply(`⚠️ Masukkan teks atau reply pesan yang ingin dicek apakah buatan AI atau manusia!\nContoh: ${usedPrefix + command} Artificial Intelligence is the simulation of human intelligence...`);
    
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
    
    const response = await fetch(`${global.web}/api/ai/contentdetect?apikey=${global.apikey.jereapi}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: inputText,
        type: "text"
      })
    });
    const json = await response.json();
    
    if (!json.status || !json.result) {
      throw new Error(json.error || json.message || "Gagal mendeteksi teks");
    }
    
    let res = `🤖 *AI CONTENT DETECTOR*\n\n`;
    res += `*Teks:* ${inputText.substring(0, 120)}${inputText.length > 120 ? '...' : ''}\n`;
    res += `*Persentase AI:* ${json.result.ai_probability ?? json.result.ai_score ?? json.result.ai_percentage ?? 0}%\n`;
    res += `*Persentase Manusia:* ${json.result.human_probability ?? json.result.human_score ?? json.result.human_percentage ?? 0}%\n`;
    res += `*Kesimpulan:* ${json.result.conclusion || json.result.verdict || 'Selesai dianalisis'}\n`;
    
    await m.reply(res.trim());
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Error: " + (e.message || e));
  }
};

handler.help = ["contentdetect <teks>"];
handler.tags = ["ai", "tools"];
handler.command = ["contentdetect", "cekaiteki", "detectai"];
handler.limit = true;

export default handler;
