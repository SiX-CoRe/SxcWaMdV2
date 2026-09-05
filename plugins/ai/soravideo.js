let handler = async (m, { conn, usedPrefix, command, text }) => {
  try {
    if (!text) return m.reply(`⚠️ Masukkan prompt video Sora!\nContoh: ${usedPrefix + command} drone flyover ancient forest`);
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
    m.reply("🎬 Sedang memproses Sora AI Video... Mohon tunggu (estimasi 1 - 2 menit).");

    const response = await fetch(`${global.web}/api/ai/sora2-video?apikey=${global.apikey.jereapi}&prompt=${encodeURIComponent(text)}`);
    const json = await response.json();
    
    let videoUrl = json.result?.video_url || json.result?.video || json.result?.url || json.data?.video_url || json.data?.video || json.data?.url || json.video_url || json.result || json.data;
    if (typeof videoUrl === 'object' && videoUrl !== null) {
      videoUrl = videoUrl.video_url || videoUrl.url || videoUrl.video || JSON.stringify(videoUrl);
    }

    if (json.status && typeof videoUrl === 'string' && videoUrl.startsWith('http')) {
      await conn.sendMessage(m.chat, {
        video: { url: videoUrl },
        caption: `🎬 *Sora AI Video Success!*\n\n📝 *Prompt:* ${text}`
      }, { quoted: m }).catch(e => m.reply("Gagal mengirim video, ini linknya: " + videoUrl));
      await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } else {
      throw new Error(json.error || json.message || "Gagal menghasilkan video");
    }
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Error: " + (e.message || e));
  }
};

handler.help = ['soravideo <prompt>'];
handler.tags = ['ai'];
handler.premium = true;
handler.command = /^(soravideo|aisora|text2video2)$/i;
handler.limit = 3;

export default handler;
