/**
 * Convert WebP to MP4 or PNG using ezgif API without external heavy DOM dependencies.
 * @param {Buffer|String} source 
 */

export async function webp2mp4(source) {
  const isUrl = typeof source === 'string' && /https?:\/\//.test(source);
  const form = new FormData();
  
  if (isUrl) {
    form.append('new-image-url', source);
  } else {
    const blob = new Blob([source], { type: 'image/webp' });
    form.append('new-image', blob, 'image.webp');
  }

  const res = await fetch('https://ezgif.com/webp-to-mp4', {
    method: 'POST',
    body: form
  });

  const html = await res.text();
  const fileMatch = html.match(/name="file"\s+value="([^"]+)"/i);
  if (!fileMatch) throw new Error('Gagal memproses WebP di server Ezgif.');

  const form2 = new FormData();
  form2.append('file', fileMatch[1]);

  const res2 = await fetch('https://ezgif.com/webp-to-mp4/' + fileMatch[1], {
    method: 'POST',
    body: form2
  });

  const html2 = await res2.text();
  const videoMatch = html2.match(/<source\s+src="([^"]+)"/i) || html2.match(/<video[^>]+src="([^"]+)"/i);
  if (!videoMatch) throw new Error('Gagal mendapatkan URL output MP4.');

  return new URL(videoMatch[1], res2.url).toString();
}

export async function webp2png(source) {
  const isUrl = typeof source === 'string' && /https?:\/\//.test(source);
  const form = new FormData();

  if (isUrl) {
    form.append('new-image-url', source);
  } else {
    const blob = new Blob([source], { type: 'image/webp' });
    form.append('new-image', blob, 'image.webp');
  }

  const res = await fetch('https://ezgif.com/webp-to-png', {
    method: 'POST',
    body: form
  });

  const html = await res.text();
  const fileMatch = html.match(/name="file"\s+value="([^"]+)"/i);
  if (!fileMatch) throw new Error('Gagal memproses WebP di server Ezgif.');

  const form2 = new FormData();
  form2.append('file', fileMatch[1]);

  const res2 = await fetch('https://ezgif.com/webp-to-png/' + fileMatch[1], {
    method: 'POST',
    body: form2
  });

  const html2 = await res2.text();
  const imgMatch = html2.match(/<div id="output"[^>]*>[\s\S]*?<img\s+src="([^"]+)"/i) || html2.match(/<img\s+src="([^"]+)"/i);
  if (!imgMatch) throw new Error('Gagal mendapatkan URL output PNG.');

  return new URL(imgMatch[1], res2.url).toString();
}

export default {
  webp2mp4,
  webp2png
};