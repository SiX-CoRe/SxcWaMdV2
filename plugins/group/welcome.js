let handler = async (m, { conn, command, text, usedPrefix }) => {
    if (!m.isGroup) return m.reply("❌ Perintah ini hanya bisa digunakan di dalam grup!");

    if (!global.db.data.chats) global.db.data.chats = {};
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
    let chat = global.db.data.chats[m.chat];

    let cmd = (command || '').toLowerCase();
    let query = (text || '').trim();

    if (cmd === 'welcome') {
        let sub = (query.split(/\s+/)[0] || '').toLowerCase();
        if (sub === 'on' || sub === 'enable' || sub === '1') {
            chat.welcome = true;
            return m.reply('✅ *Fitur Sambutan (Welcome) berhasil diaktifkan!*');
        } else if (sub === 'off' || sub === 'disable' || sub === '0') {
            chat.welcome = false;
            return m.reply('❌ *Fitur Sambutan (Welcome) berhasil dinonaktifkan!*');
        } else if (sub === 'set') {
            let customMsg = query.slice(3).trim() || (m.quoted?.text ? m.quoted.text.trim() : '');
            if (!customMsg) return m.reply(`⚠️ Masukkan teks welcome!\nContoh: ${usedPrefix}welcome set Selamat datang @user di @subject!`);
            chat.sWelcome = customMsg;
            chat.welcome = true;
            return m.reply('✅ *Pesan kustom welcome berhasil disimpan dan diaktifkan!*');
        } else if (sub === 'del' || sub === 'reset') {
            chat.sWelcome = '';
            return m.reply('🗑️ *Pesan kustom welcome berhasil dihapus (kembali ke default).*');
        } else {
            let status = chat.welcome ? '✅ AKTIF' : '❌ NONAKTIF';
            let custom = chat.sWelcome ? `\n\n📝 *Teks Kustom:*\n${chat.sWelcome}` : '';
            return m.reply(
                `👋 *PENGATURAN WELCOME*\n\n` +
                `🔹 *Status:* ${status}${custom}\n\n` +
                `📌 *Penggunaan:*\n` +
                `➤ ${usedPrefix}welcome on - Aktifkan welcome\n` +
                `➤ ${usedPrefix}welcome off - Matikan welcome\n` +
                `➤ ${usedPrefix}setwelcome <teks> - Atur pesan kustom\n` +
                `➤ ${usedPrefix}delwelcome - Hapus pesan kustom\n\n` +
                `💡 *Tag yang tersedia:* @user, @subject, @desc`
            );
        }
    }

    switch (cmd) {
        case 'swlc':
        case 'setwelcome': {
            const twlc = query || (m.quoted?.text ? m.quoted.text.trim() : '');
            if (!twlc) return m.reply(`⚠️ Masukkan teks atau reply pesan yang ingin dijadikan sambutan welcome!\nContoh: ${usedPrefix + cmd} Selamat datang @user di @subject!`);

            chat.sWelcome = twlc;
            chat.welcome = true;
            m.reply('✅ *Pesan welcome berhasil disimpan dan diaktifkan!*');
            break;
        }

        case 'dwlc':
        case 'delwelcome': {
            chat.sWelcome = '';
            m.reply('🗑️ *Pesan kustom welcome berhasil dihapus.*');
            break;
        }

        case 'owlc':
        case 'offwelcome': {
            chat.welcome = false;
            m.reply('🚫 *Fitur welcome berhasil dinonaktifkan.*');
            break;
        }

        case 'onwlc':
        case 'onwelcome': {
            chat.welcome = true;
            m.reply('✅ *Fitur welcome berhasil diaktifkan.*');
            break;
        }
    }
};

handler.help = ["welcome <on/off>", "setwelcome <teks>", "delwelcome", "onwelcome", "offwelcome"];
handler.command = /^(welcome|swlc|setwelcome|dwlc|delwelcome|owlc|offwelcome|onwlc|onwelcome)$/i;
handler.tags = ["group"];
handler.group = true;
handler.admin = true;

export default handler;