import fs from 'fs';
import path from 'path';

let handler = async (m, { conn, usedPrefix, command }) => {
    try {
        await m.reply("📦 *Menyiapkan backup database.json...*");

        if (global.db && typeof global.db.write === 'function') {
            await global.db.write();
        }

        const dbPath = path.join(process.cwd(), 'database.json');
        if (!fs.existsSync(dbPath)) {
            return m.reply("❌ File `database.json` tidak ditemukan di server!");
        }

        const dbBuffer = fs.readFileSync(dbPath);
        const stats = fs.statSync(dbPath);
        const sizeKb = (stats.size / 1024).toFixed(2);
        const totalUsers = Object.keys(global.db?.data?.users || {}).length;
        const totalChats = Object.keys(global.db?.data?.chats || {}).length;

        const now = new Date();
        const dateStr = new Intl.DateTimeFormat('id-ID', {
            timeZone: 'Asia/Jakarta',
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        }).format(now);

        const caption = 
`📦 *BACKUP DATABASE BOT* 💾

┌───❖ *INFORMASI DATABASE* ❖───
│
├─📁 *File:* \`database.json\`
├─📊 *Ukuran:* ${sizeKb} KB
├─👥 *Total User:* ${totalUsers.toLocaleString('id-ID')} pengguna
├─💬 *Total Chat:* ${totalChats.toLocaleString('id-ID')} grup/room
├─⏰ *Waktu Backup:* ${dateStr} WIB
├─🤖 *Bot:* ${global.botname || 'WhatsApp Bot'}
│
└──────────────────────────────

_🔒 Simpan file backup ini dengan aman untuk restore database jika diperlukan._`;

        await conn.sendMessage(m.chat, {
            document: dbBuffer,
            fileName: `database-${Date.now()}.json`,
            mimetype: 'application/json',
            caption: caption.trim()
        }, { quoted: m });

    } catch (e) {
        console.error(e);
        m.reply("❌ Gagal membuat backup database: " + e.message);
    }
};

handler.help = ['backupdb', 'bcdb'];
handler.tags = ['owner'];
handler.command = /^(backupdb|bcdb|backupdatabase)$/i;
handler.owner = true;

export default handler;
