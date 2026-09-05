import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`⚠️ Masukkan prompt musik!\n\nContoh: *${usedPrefix + command} cinematic piano music*`);
  
  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
  m.reply('Sedang memproses pembuatan musik... Mohon tunggu.');
  try {
    let apiKey = global.apikey?.jereapi;
    let url = `${global.web}/api/ai/text2music-create?apikey=${apiKey}`;
    
    let res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: text || '', duration: 30 })
    });
    let json = await res.json();
    
    if (json.status && (json.result || json.data)) {
      let taskId = json.result?.task_id || json.data?.task_id || json.result || json.data;
      await m.reply(`✅ *Text2Music Task Created!*\n🆔 *Task ID:* ${taskId}\n\n_Gunakan ${usedPrefix}text2music-get ${taskId} untuk mengambil audio._`);
      await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } else {
      throw new Error(json.error || json.message || 'Gagal memproses pembuatan musik');
    }
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply('❌ Error: ' + (e.message || 'Terjadi kesalahan pada server.'));
  }
};

handler.help = ['text2music-create <prompt>'];
handler.tags = ['ai'];
handler.command = /^text2musiccreate|text2music-create$/i;
handler.limit = 1;

export default handler;
