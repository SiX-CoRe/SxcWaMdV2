import FormData from 'form-data';

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const API_KEY = global.apikey?.jereapi;
  if (!API_KEY || API_KEY === "MASUKAN_API_KEY_KAMU_DISINI") {
    return m.reply("❌ API Key JereAPI belum dikonfigurasi di config.js!");
  }

  let action = args[0]?.toLowerCase();

  // 1. LIST TTS VOICES
  if (action === 'list') {
    try {
      await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
      let url = `${global.web}/api/ai/voiceclone?apikey=${API_KEY}&action=list`;
      let res = await fetch(url);
      let json = await res.json();
      if (json.status && json.result) {
        let text = '*DAFTAR VOICE TTS AI*\n\n';
        let voices = Array.isArray(json.result) ? json.result : (json.result.data || []);
        voices.slice(0, 35).forEach((v, i) => {
          text += `*${i + 1}.* ${v.name || v.voice_id || v}\n   ID: \`${v.voice_id || v.id || v}\`\n`;
        });
        text += `\n_Gunakan voice ID di atas untuk text to speech!_`;
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
        return m.reply(text);
      } else {
        throw new Error(json.error || 'Gagal mengambil daftar voice.');
      }
    } catch (e) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply('Terjadi kesalahan saat mengambil list voice: ' + e.message);
    }
  }

  // 2. LIST CLONE VOICES
  if (action === 'listclone') {
    try {
      await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
      let url = `${global.web}/api/ai/voiceclone?apikey=${API_KEY}&action=list_clone`;
      let res = await fetch(url);
      let json = await res.json();
      if (json.status && json.result) {
        let text = '*DAFTAR VOICE CLONE ANDA*\n\n';
        let clones = Array.isArray(json.result) ? json.result : (json.result.data || []);
        if (clones.length === 0) {
          text += '_Belum ada voice clone yang terdaftar._';
        } else {
          clones.forEach((v, i) => {
            text += `*${i + 1}.* ${v.voice_name || v.name || 'Voice ' + (i + 1)}\n   ID: \`${v.voice_id || v.id}\`\n`;
          });
        }
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
        return m.reply(text);
      } else {
        throw new Error(json.error || 'Gagal mengambil daftar voice clone.');
      }
    } catch (e) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply('Terjadi kesalahan saat mengambil list voice clone: ' + e.message);
    }
  }

  let q = m.quoted ? m.quoted : m;
  let mime = q?.msg?.mimetype || q?.mimetype || "";
  let isAudio = /audio/.test(mime);

  if (!isAudio && args.length < 2) {
    return m.reply(`*FORMAT PENGGUNAAN VOICE CLONE AI:*\n\n*${usedPrefix + command} list* (Lihat list voice TTS)\n*${usedPrefix + command} listclone* (Lihat list clone)\n*${usedPrefix + command} voice_id | teks* (Untuk TTS)\n*Reply Audio dengan ${usedPrefix + command} voice_id* (Untuk Kloning Suara)`);
  }

  let voiceId = args[0].trim();
  
  if (isAudio) {
    // 3. CLONE VOICE DARI AUDIO
    m.reply('Sedang melakukan kloning suara AI... Proses ini memakan waktu cukup lama. Mohon tunggu.');
    try {
      await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
      const media = await q.download();
      const formData = new FormData();
      formData.append("file", media, { filename: 'audio.mp3', contentType: 'audio/mpeg' });
      formData.append("action", "clone");
      formData.append("voice_id", voiceId);
      
      let url = `${global.web}/api/ai/voiceclone?apikey=${API_KEY}`;
      let res = await fetch(url, {
        method: 'POST',
        body: formData
      });
      let json = await res.json();
      
      if (json.status && (json.result || json.data)) {
        let resultData = json.result || json.data;
        let audioUrl = resultData.video_url || resultData.url || (typeof resultData === 'string' ? resultData : null);
        if (resultData.status_ai === 'PROCESSING') {
          return m.reply(`Proses kloning sedang berlangsung. Silakan cek hasil secara manual nanti dengan task_id: ${resultData.task_id}`);
        }
        
        if (typeof audioUrl === 'string' && audioUrl.startsWith('http')) {
          await conn.sendMessage(m.chat, {
            audio: { url: audioUrl },
            mimetype: 'audio/mp4',
            ptt: true
          }, { quoted: m }).catch(e => m.reply("Gagal mengirim media, ini linknya: " + audioUrl));
          await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
        } else {
          await m.reply(`✅ *Voice Kloning Berhasil Didaftarkan!*\nVoice ID: \`${voiceId}\`\n\nGunakan voice ID ini untuk Text to Speech!`);
          await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
        }
      } else {
        throw new Error(json.error || json.message || "Gagal kloning suara");
      }
    } catch (e) {
      console.error(e);
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      m.reply('Terjadi kesalahan pada server AI: ' + e.message);
    }
  } else {
    // 4. TEXT TO SPEECH CLONE
    let prompt = args.slice(1).join(' ').replace(/^\|\s*/, '').trim();
    m.reply('Sedang generate Text to Speech AI... Mohon tunggu.');
    try {
      await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
      let url = `${global.web}/api/ai/voiceclone?apikey=${API_KEY}`;
      
      let res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'tts',
          voice_id: voiceId,
          text: prompt
        })
      });
      let json = await res.json();
      
      if (json.status && (json.result || json.data)) {
        let resultData = json.result || json.data;
        let audioUrl = resultData.data?.url || resultData.url || (typeof resultData === 'string' ? resultData : null);
        
        if (typeof audioUrl === 'string' && audioUrl.startsWith('http')) {
          await conn.sendMessage(m.chat, {
            audio: { url: audioUrl },
            mimetype: 'audio/mp4',
            ptt: true
          }, { quoted: m }).catch(e => m.reply("Gagal mengirim media, ini linknya: " + audioUrl));
          await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
        } else {
          throw new Error("Gagal mendapat url audio dari response");
        }
      } else {
        throw new Error(json.error || json.message || 'Gagal men-generate voice.');
      }
    } catch (e) {
      console.error(e);
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      m.reply('Terjadi kesalahan pada server AI: ' + e.message);
    }
  }
};

handler.help = ['voiceclone <list / listclone / voice_id | text>', 'voiceai <voice_id | text>'];
handler.tags = ['ai'];
handler.command = /^(voiceclone|aivoice|clonevoice|voice|voiceai)$/i;
handler.premium = true;
handler.limit = 5;

export default handler;
