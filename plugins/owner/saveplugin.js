import fs from 'fs';
import path from 'path';

let sp = async (m, { text, usedPrefix, command }) => {
  try {
    if (!text) return m.reply(`⚠️ Contoh: *${usedPrefix + command} downloader/play.js* (reply pesan berisi kode plugin)`);
    if (!m.quoted || !m.quoted.text) return m.reply('⚠️ Harus reply ke pesan yang berisi kode plugin!');

    const filePath = text.trim().replace(/^(\.\/|\/)/, '');
    const fileContent = m.quoted.text;

    if (!filePath.endsWith('.js') && !filePath.endsWith('.cjs') && !filePath.endsWith('.mjs'))
      return m.reply('⚠️ Nama file harus diakhiri dengan .js, .cjs, atau .mjs');

    const fullPath = path.join('./plugins', filePath);
    const dir = path.dirname(fullPath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fullPath, fileContent, 'utf-8');

    await m.reply(`✅ Plugin *${filePath}* berhasil disimpan!\n\n📁 Lokasi: ${fullPath}`);
    console.log(`✅ Plugin saved: ${fullPath}`);

  } catch (e) {
    console.log('Error Save Plugin:', e);
    m.reply('❌ Gagal menyimpan plugin! Pastikan format benar dan reply ke pesan yang berisi kode.');
  }
};

sp.command = /^(sp|saveplugin|savep|sf)$/i;
sp.help = ["sp <folder/file.js>", "saveplugin <folder/file.js>"];
sp.tags = ["owner"];
sp.owner = true;

export default sp;