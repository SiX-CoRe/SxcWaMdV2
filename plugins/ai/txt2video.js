let handler = async (m, { conn, usedPrefix, command, text }) => {
  try {
    if (!text) return m.reply(`⚠️ Masukkan prompt video!\nContoh: ${usedPrefix + command} sunset over futuristic neo tokyo`);
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
    m.reply("🎬 Sedang memproses Text to Video AI... Mohon tunggu (estimasi 1 - 2 menit).");

    const response = await fetch(`${global.web}/api/ai/txt2video?apikey=${global.apikey.jereapi}&prompt=${encodeURIComponent(text)}&model=Anime`);
    const json = await response.json();
    
    let videoUrl = json.result?.video_url || json.result?.video || json.result?.url || json.data?.video_url || json.data?.video || json.data?.url || json.video_url || json.result || json.data;
    if (typeof videoUrl === 'object' && videoUrl !== null) {
      videoUrl = videoUrl.video_url || videoUrl.url || videoUrl.video || JSON.stringify(videoUrl);
    }

    if (json.status && typeof videoUrl === 'string' && videoUrl.startsWith('http')) {
      await conn.sendMessage(m.chat, {
        video: { url: videoUrl },
        caption: `🎬 *Text to Video AI Success!*\n\n📝 *Prompt:* ${text}`
      }, { quoted: m }).catch(e => m.reply("Gagal mengirim video, ini linknya: " + videoUrl));
      await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } else {
      throw new Error(json.error || json.message || "Gagal menghasilkan video AI dari prompt");
    }
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Error: " + (e.message || e));
  }
};

handler.help = ["txt2video <teks>"];
handler.tags = ["ai"];
handler.command = ["txt2video", "text2video"];
handler.limit = 3;

export default handler;
