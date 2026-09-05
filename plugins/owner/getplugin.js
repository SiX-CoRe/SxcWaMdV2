import fs from 'fs';
import path from 'path';

let gp = async (m, { text, usedPrefix, command }) => {
  try {
    if (!text) return m.reply(`⚠️ Contoh: *${usedPrefix + command} downloader/play.js*`);
    
    let cleanText = text.trim().replace(/^(\.\/|\/)/, '');
    if (!cleanText.endsWith('.js') && !cleanText.endsWith('.cjs') && !cleanText.endsWith('.mjs')) 
      return m.reply('⚠️ Format nama file harus berakhiran .js atau .cjs!');

    const filePath = path.join('./plugins', cleanText);
    if (!fs.existsSync(filePath)) 
      return m.reply('⚠️ File plugin tidak ditemukan!');

    const file = fs.readFileSync(filePath, 'utf-8');
    await m.reply(file);

  } catch (e) {
    m.reply('❌ Gagal mengambil file plugin: ' + e.message);
    console.log('Error Get Plugin:', e);
  }
};

gp.command = /^(gp|getplugin|gf|getfile)$/i;
gp.help = ["gp <folder/file.js>", "getplugin <folder/file.js>"];
gp.tags = ["owner"];
gp.owner = true;

export default gp;