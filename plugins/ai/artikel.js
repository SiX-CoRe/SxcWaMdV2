let handler = async (m, { conn, usedPrefix, command, text }) => {
  try {
    if (!text) return m.reply(`⚠️ Masukkan topik artikel yang ingin dibuat!\nContoh: ${usedPrefix + command} Perkembangan Kecerdasan Buatan di Era Modern`);
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
    
    const response = await fetch(`${global.web}/api/ai/artikel?apikey=${global.apikey.jereapi}&query=${encodeURIComponent(text)}&lang=id`);
    const json = await response.json();
    
    let resultText = '';
    if (json.status && json.result) {
      if (typeof json.result === 'object') {
        const title = json.result.title || text;
        const article = json.result.article || json.result.content || json.result.text || JSON.stringify(json.result, null, 2);
        resultText = `📰 *${title}*\n\n${article}`;
      } else {
        resultText = json.result;
      }
    } else if (json.status && json.data) {
      resultText = typeof json.data === 'object' ? (json.data.article || json.data.content || json.data.text || JSON.stringify(json.data, null, 2)) : json.data;
    } else {
      throw new Error(json.error || json.message || json.msg || "Gagal membuat artikel");
    }
    
    await m.reply(String(resultText).trim());
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Error: " + (e.message || e));
  }
};

handler.help = ["artikel <topik>"];
handler.premium = true;
handler.command = ["artikel", "buatartikel"];
handler.tags = ["ai"];
handler.limit = 1;

export default handler;
