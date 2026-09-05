let handler = async (m, { conn, usedPrefix, command, text }) => {
  try {
    const q = m.quoted ? m.quoted : m;
    const mime = q?.msg?.mimetype || q?.mimetype || "";
    let vidUrl = text ? text.trim() : "";
    
    if (/video/.test(mime)) {
      await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
      m.reply("⏳ Mengunggah berkas video ke server... Mohon tunggu.");
      const media = await q.download();
      vidUrl = await (await import('../../lib/uploader.js')).uploader(media);
    }
    
    if (!vidUrl) return m.reply(`⚠️ Kirim/reply video atau berikan URL video!\nContoh: ${usedPrefix + command} https://example.com/video.mp4`);
    
    if (!m.quoted || !/video/.test(mime)) {
      await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
    }
    
    m.reply("🎬 Sedang meningkatkan kualitas video dengan AI... Mohon tunggu (proses ini butuh waktu beberapa saat).");
    
    const response = await fetch(`${global.web}/api/ai/videoenhancer?apikey=${global.apikey.jereapi}&url=${encodeURIComponent(vidUrl)}&resolution=1080`);
    const json = await response.json();
    
    let resultUrl = json.result?.video_url || json.result?.url || json.result?.output_url || json.data?.video_url || json.data?.url || (Array.isArray(json.result) ? json.result[0] : json.result) || json.data;
    if (typeof resultUrl === 'object' && resultUrl !== null) {
      resultUrl = resultUrl.video_url || resultUrl.output_url || resultUrl.url || JSON.stringify(resultUrl);
    }
    
    if (json.status && typeof resultUrl === 'string' && resultUrl.startsWith('http')) {
      await conn.sendMessage(m.chat, {
        video: { url: resultUrl },
        caption: `✅ *Video Enhancer AI Success!*\n✨ Resolution: 1080p`
      }, { quoted: m }).catch(e => m.reply("Gagal mengirim video, ini linknya: " + resultUrl));
      await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    } else {
      throw new Error(json.error || json.message || "Gagal meningkatkan kualitas video");
    }
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Error: " + (e.message || e));
  }
};

handler.help = ["videoenhancer <url/reply video>"];
handler.premium = true;
handler.command = ["videoenhancer", "hdvideo"];
handler.tags = ["ai"];
handler.limit = 2;

export default handler;
