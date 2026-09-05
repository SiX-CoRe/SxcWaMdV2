import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`⚠️ Masukkan deskripsi lagu yang ingin dibuat!\n\nContoh:\n*${usedPrefix + command} lagu pop ceria tentang kopi pagi*`);
  }

  m.reply('Sedang memproses permintaan musik... Proses ini butuh waktu sekitar 1-2 menit. Mohon tunggu.');
  try {
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
    let createUrl = `${global.web}/api/ai/suno-create?apikey=${global.apikey.jereapi}&prompt=${encodeURIComponent(text)}&title=Suno%20Song&style=Pop&instrument=false`;
    let res = await fetch(createUrl);
    let json = await res.json();
    
    if (json.status && (json.result || json.data)) {
      let taskId = json.result?.task_id || json.data?.task_id || json.result || json.data;
      if (!taskId) return m.reply('Gagal mendapatkan Task ID dari server.');
      
      let audioUrl = null;
      for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 6000));
        let checkUrl = `${global.web}/api/ai/suno-get?apikey=${global.apikey.jereapi}&id=${encodeURIComponent(taskId)}`;
        let checkRes = await fetch(checkUrl);
        let checkJson = await checkRes.json();
        
        if (checkJson.status && checkJson.result) {
          let audios = checkJson.result.data || checkJson.result.audios || (Array.isArray(checkJson.result) ? checkJson.result : []);
          if (audios[0]?.audio_url || checkJson.result.audio_url) {
            audioUrl = audios[0]?.audio_url || checkJson.result.audio_url;
            break;
          }
        }
      }
      
      if (audioUrl) {
        await conn.sendMessage(m.chat, {
          audio: { url: audioUrl },
          mimetype: 'audio/mp4'
        }, { quoted: m }).catch(e => m.reply("Gagal mengirim media, ini linknya: " + audioUrl));
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
      } else {
        m.reply('⏱️ Waktu tunggu habis. API sedang sibuk, silakan coba cek nanti dengan task_id: ' + taskId);
      }
    } else {
      throw new Error(json.error || json.message || "Server menolak permintaan pembuatan lagu");
    }
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply('Terjadi kesalahan pada server AI Musik: ' + e.message);
  }
};

handler.help = ['sunomusic <prompt>'];
handler.tags = ['ai'];
handler.premium = true;
handler.command = /^(sunomusic|aimusic|buatlagu)$/i;
handler.limit = 5;

export default handler;
