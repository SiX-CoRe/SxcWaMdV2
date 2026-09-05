import axios from 'axios';
import FormData from 'form-data';

async function uploadToUguu(buffer) {
  const form = new FormData();
  form.append('files[]', buffer, { filename: 'image.jpg', contentType: 'image/jpeg' });
  const res = await axios.post('https://uguu.se/upload', form, {
    headers: form.getHeaders(),
    timeout: 30000
  });
  if (res.data && res.data.files && res.data.files[0]) {
    return res.data.files[0].url;
  }
  throw new Error('Gagal upload gambar temporary');
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const API_KEY = global.apikey?.jereapi;
  if (!API_KEY || API_KEY === "MASUKAN_API_KEY_KAMU_DISINI") {
    return m.reply("❌ API Key JereAPI belum dikonfigurasi di config.js!");
  }

  let [sourceUrl, targetUrl] = text ? text.split('|').map(v => v.trim()) : ['', ''];

  if (!sourceUrl || !targetUrl) {
    return m.reply(
`🎭 *AI Face Swap Generator*

📌 *Cara Penggunaan:*
${usedPrefix + command} <url_wajah> | <url_target>

📝 *Contoh:*
${usedPrefix + command} https://example.com/face.jpg | https://example.com/target.jpg`
    );
  }

  try {
    await m.react('⏳');
    await m.reply('🎭 *Memproses Face Swap AI...*\n_Mohon tunggu sekitar 30 - 60 detik..._');

    const apiUrl = `${global.web}/api/ai/faceswap?apikey=${API_KEY}&source=${encodeURIComponent(sourceUrl)}&target=${encodeURIComponent(targetUrl)}`;
    const response = await axios.get(apiUrl, { timeout: 120000 });
    const data = response.data;

    if (!data.status) {
      throw new Error(data.error || data.detail || 'Gagal memproses face swap');
    }

    let resultUrl = data.result?.image || data.result?.url || data.result?.image_url || data.data?.image || data.data?.url || (Array.isArray(data.result) ? data.result[0] : data.result) || data.data;
    if (typeof resultUrl === 'object' && resultUrl !== null) {
      resultUrl = resultUrl.url || resultUrl.image || JSON.stringify(resultUrl);
    }

    if (typeof resultUrl === 'string' && resultUrl.startsWith('http')) {
      await conn.sendMessage(m.chat, {
        image: { url: resultUrl },
        caption: `🎭 *AI Face Swap Success!*\n✨ Request by: ${m.pushName || 'User'}`
      }, { quoted: m }).catch(e => m.reply("Gagal mengirim media, ini linknya: " + resultUrl));
      await m.react('✅');
    } else {
      throw new Error("Format URL hasil gambar tidak valid");
    }
  } catch (error) {
    console.error('[FaceSwap Error]', error);
    await m.react('❌');
    let errorMsg = error.response?.data?.error || error.response?.data?.detail || error.message || 'Terjadi kesalahan sistem.';
    m.reply(`❌ *Gagal Face Swap:* ${errorMsg}`);
  }
};

handler.help = ['faceswap <url_wajah>|<url_target>'];
handler.tags = ['ai', 'maker'];
handler.premium = true;
handler.command = ['faceswap', 'faceswapper', 'swapface'];
handler.limit = 1;

export default handler;
