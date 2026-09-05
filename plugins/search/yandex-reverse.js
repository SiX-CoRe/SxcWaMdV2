import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || '';
  let imageUrl = text;

  if (!imageUrl && !mime.startsWith('image/')) {
    return m.reply(`⚠️ *Format penggunaan:*\n• Balas/kirim foto dengan caption *${usedPrefix + command}*\n• Atau kirim tautan gambar: *${usedPrefix + command} https://example.com/image.jpg*`);
  }

  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
  try {
    const apiKey = global.apikey?.jereapi;
    let json;

    if (mime.startsWith('image/')) {
      const media = await q.download?.();
      if (media) {
        const FormData = (await import('form-data')).default;
        const form = new FormData();
        form.append('file', media, { filename: 'search.jpg', contentType: mime });

        const res = await fetch(`${global.web}/api/search/yandex-reverse?apikey=${apiKey}`, {
          method: 'POST',
          body: form,
          headers: form.getHeaders()
        });
        json = await res.json();
      }
    } else {
      const res = await fetch(`${global.web}/api/search/yandex-reverse?apikey=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: imageUrl })
      });
      json = await res.json();
    }

    if (!json || !json.status || !json.result) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply("❌ Gagal menemukan hasil pencarian visual Yandex.");
    }

    const r = json.result;
    let output = `🔍 *YANDEX REVERSE IMAGE SEARCH*\n\n`;

    if (r.tags && r.tags.length > 0) {
      output += `🏷️ *Tag / Label Terkait:*\n${r.tags.slice(0, 6).map(t => '• ' + t).join('\n')}\n\n`;
    }

    if (r.sites && r.sites.length > 0) {
      output += `🌐 *Situs Serupa Ditemukan:*\n`;
      r.sites.slice(0, 4).forEach((s, i) => {
        output += `*${i + 1}. ${s.title || 'Web Page'}*\n`;
        if (s.domain) output += `• 🌐 *Domain:* ${s.domain}\n`;
        if (s.url) output += `• 🔗 *Link:* ${s.url}\n`;
        output += `\n`;
      });
    }

    if (r.similar_images && r.similar_images.length > 0) {
      output += `🖼️ *Gambar Serupa:*\n`;
      r.similar_images.slice(0, 3).forEach((img, i) => {
        output += `• [Gambar ${i + 1}](${img.image_url}) (${img.width}x${img.height})\n`;
      });
      output += `\n`;
    }

    output += `✨ *Yandex Vision Visual Search*`;

    await m.reply(output.trim());
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("❌ Gagal melakukan reverse search: " + e.message);
  }
};

handler.help = ['yandexreverse <url/foto>', 'reverseimage <url/foto>'];
handler.tags = ['search'];
handler.command = /^(yandexreverse|yandex-reverse|reverseimage)$/i;

handler.limit = 1;
export default handler;
