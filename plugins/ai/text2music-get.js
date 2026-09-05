import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`⚠️ Masukkan task_id!\n\nContoh: *${usedPrefix + command} <task_id>*`);
  
  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
  m.reply('Sedang mengambil data musik... Mohon tunggu.');
  try {
    let apiKey = global.apikey?.jereapi;
    let url = `${global.web}/api/ai/text2music-get?apikey=${apiKey}`;
    
    let res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_id: text.trim() })
    });
    let json = await res.json();
    
    if (json.status && (json.result || json.data)) {
      let audioUrl = json.result?.audio_url || json.result?.music_url || json.result?.url || json.data?.audio_url || json.data?.url || (typeof json.result === 'string' && json.result.startsWith('http') ? json.result : null);
      if (typeof audioUrl === 'string' && audioUrl.startsWith('http')) {
        await conn.sendMessage(m.chat, {
          audio: { url: audioUrl },
          mimetype: 'audio/mp4'
        }, { quoted: m }).catch(e => m.reply("Gagal mengirim media, ini linknya: " + audioUrl));
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
      } else {
        let statusText = typeof json.result === 'object' ? JSON.stringify(json.result, null, 2) : json.result;
        await m.reply(`📊 *Text2Music Status:*\n` + statusText);
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
      }
    } else {
      throw new Error(json.error || json.message || 'Gagal mengambil musik');
    }
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply('❌ Error: ' + (e.message || 'Terjadi kesalahan pada server.'));
  }
};

handler.help = ['text2music-get <task_id>'];
handler.tags = ['ai'];
handler.command = /^text2musicget|text2music-get$/i;
handler.limit = 1;

export default handler;
