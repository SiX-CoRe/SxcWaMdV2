import axios from 'axios';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    const API_KEY = global.apikey?.jereapi;
    if (!API_KEY || API_KEY === "MASUKAN_API_KEY_KAMU_DISINI") {
      return m.reply("❌ API Key JereAPI belum dikonfigurasi di config.js!");
    }
    let [teks, voice] = text.split('|');
    if (!teks) {
      return m.reply(`🤖 *Text To Speech*\n\nContoh penggunaan:\n${usedPrefix + command} Halo namaku bot|en-US-JennyNeural\n\n*Note:* Jika voice tidak diisi, otomatis pakai default (id-ID-ArdiNeural).`);
    }
    if (!voice) {
      voice = 'id-ID-ArdiNeural';
    }
    await m.react('⏳');
    const apiUrl = `${global.web}/api/ai/text2speech?apikey=${API_KEY}&text=${encodeURIComponent(teks.trim())}&voice=${encodeURIComponent(voice.trim())}`;
    const response = await axios.get(apiUrl, { timeout: 60000 });
    const data = response.data;
    
    let audioUrl = data.result?.audio_url || data.result?.url || data.data?.audio_url || data.data?.url || data.audio_url || data.result || data.data;
    if (typeof audioUrl === 'object' && audioUrl !== null) {
      audioUrl = audioUrl.audio_url || audioUrl.url || JSON.stringify(audioUrl);
    }
    
    if (!data.status || !audioUrl || typeof audioUrl !== 'string' || !audioUrl.startsWith('http')) {
      throw new Error(data.message || data.error || 'Gagal generate audio TTS');
    }
    
    await conn.sendMessage(m.chat, {
      audio: { url: audioUrl },
      mimetype: 'audio/mpeg',
      ptt: true
    }, { quoted: m }).catch(e => m.reply("Gagal mengirim media, ini linknya: " + audioUrl));
    await m.react('✅');
  } catch (e) {
    console.error('TTS Error:', e);
    await m.react('❌');
    m.reply(`❌ Gagal: ${e.response?.data?.error || e.message || 'Terjadi kesalahan sistem'}`);
  }
};

handler.help = ['tts <teks>|<voice>'];
handler.tags = ['ai'];
handler.premium = true;
handler.command = /^(aitts|text2speech|tts)$/i;
handler.limit = 1;

export default handler;
