import fs from 'fs';
import path from 'path';

let dp = async (m, { text, usedPrefix, command }) => {
  try {
    if (!text) return m.reply(`⚠️ Contoh:\n• *${usedPrefix + command} downloader/play.js*\n• *${usedPrefix + command} downloader --on* (hapus folder)`);

    const args = text.trim().split(/\s+/);
    const targetPath = args[0].replace(/^(\.\/|\/)/, '');
    const isFolderDelete = args.includes('--on');

    const fullPath = path.join('./plugins', targetPath);

    // Mode hapus folder (pakai --on)
    if (isFolderDelete) {
      if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isDirectory()) {
        return m.reply(`❌ Folder *${targetPath}* tidak ditemukan atau bukan folder!`);
      }

      const files = fs.readdirSync(fullPath);
      if (files.length === 0) {
        fs.rmdirSync(fullPath);
        await m.reply(`📁 Folder *${targetPath}* kosong, sudah dihapus.`);
      } else {
        for (const f of files) {
          const fileToDelete = path.join(fullPath, f);
          fs.unlinkSync(fileToDelete);
        }
        fs.rmdirSync(fullPath);
        await m.reply(`🗑️ Folder *${targetPath}* dan semua plugin di dalamnya berhasil dihapus!`);
      }
      return;
    }

    // Mode hapus file plugin
    if (!fs.existsSync(fullPath)) return m.reply('❌ File plugin tidak ditemukan!');
    if (!fs.statSync(fullPath).isFile()) return m.reply('⚠️ Path tersebut bukan file plugin! Gunakan *--on* jika ingin menghapus folder.');

    fs.unlinkSync(fullPath);
    await m.reply(`✅ Plugin *${targetPath}* berhasil dihapus!`);

  } catch (e) {
    console.error('Error Delete Plugin:', e);
    m.reply('❌ Gagal menghapus plugin! Pastikan path benar.');
  }
};

dp.command = /^(dp|deleteplugin|delplugin|df)$/i;
dp.help = ["dp <nama_folder/nama_file.js>", "dp <folder> --on", "deleteplugin"];
dp.tags = ["owner"];
dp.owner = true;

export default dp;