import { exec } from "child_process";
import fs from "fs";
import path from "path";

let handler = async (m, { conn }) => {
  try {
    await m.reply("📦 *Menyiapkan backup script bot...*");

    const backupName = `backup-${Date.now()}.tar.gz`;
    const backupPath = path.join(process.cwd(), backupName);

    const cmd = `tar -czf "${backupName}" \
--exclude=sessions \
--exclude=session \
--exclude=node_modules \
--exclude=.git \
--exclude=tmp \
--exclude=temp* \
--exclude=yt-dlp \
--exclude=*.tar.gz \
--exclude=*.zip \
*`;

    exec(cmd, async (err) => {
      if (err) {
        return m.reply("❌ Backup gagal (tar error): " + err.message);
      }

      if (!fs.existsSync(backupPath)) {
        return m.reply("❌ File backup tidak ditemukan!");
      }

      try {
        const stats = fs.statSync(backupPath);
        const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);

        await conn.sendMessage(
          m.chat,
          {
            document: fs.readFileSync(backupPath),
            fileName: backupName,
            mimetype: "application/gzip",
            caption: `📦 *BACKUP SOURCE CODE BOT*\n\n📁 *File:* \`${backupName}\`\n📊 *Ukuran:* ${sizeMb} MB\n⏰ *Waktu:* ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB\n\n_🔒 Simpan file backup ini di tempat aman._`
          },
          { quoted: m }
        );
      } catch (sendErr) {
        m.reply("❌ Gagal mengirim file backup: " + sendErr.message);
      } finally {
        try { if (fs.existsSync(backupPath)) fs.unlinkSync(backupPath); } catch (_) {}
      }
    });

  } catch (e) {
    m.reply("❌ Error: " + e.message);
  }
};

handler.command = ["backup", "backupsc", "bc"];
handler.owner = true;
handler.tags = ["owner"];
handler.help = ["backup"];

export default handler;