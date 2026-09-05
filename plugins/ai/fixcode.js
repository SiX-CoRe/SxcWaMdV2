let handler = async (m, { conn, usedPrefix, command, text }) => {
  try {
    const q = m.quoted ? m.quoted : m;
    const codeText = text || q.text;
    if (!codeText) return m.reply(`⚠️ Masukkan atau reply kode yang ingin diperbaiki!\nContoh: ${usedPrefix + command} const a = 1; a = 2;`);
    
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
    
    const response = await fetch(`${global.web}/api/ai/fixcode?apikey=${global.apikey.jereapi}&code=${encodeURIComponent(codeText)}&model=gpt-4o`);
    const json = await response.json();
    
    let resultText = '';
    if (json.status && json.result) {
      resultText = typeof json.result === 'object' ? (json.result.code || json.result.fixed || json.result.response || json.result.result || json.result.message || JSON.stringify(json.result, null, 2)) : json.result;
    } else if (json.status && json.data) {
      resultText = typeof json.data === 'object' ? (json.data.code || json.data.fixed || json.data.response || json.data.result || json.data.message || JSON.stringify(json.data, null, 2)) : json.data;
    } else {
      throw new Error(json.error || json.message || "Gagal memperbaiki kode");
    }
    
    await m.reply(String(resultText).trim());
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Error: " + (e.message || e));
  }
};

handler.help = ["fixcode <kode>"];
handler.tags = ["ai", "tools"];
handler.command = ["fixcode", "perbaikikode"];
handler.limit = true;

export default handler;
