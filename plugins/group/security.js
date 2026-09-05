if (!global.groupSecurity) global.groupSecurity = {};

const FEATURES = [
    'antilink',
    'antilinkwa',
    'antitagsw',
    'antisw',
    'antikudeta',
    'antiforward',
    'antibot',
    'antidokumen',
    'antifoto',
    'antivideo',
    'antisticker',
    'antivoice',
    'antinsfw',
    'antitoxic'
];

const FEATURE_NAMES = {
    antilink: 'Anti Link Semua Website',
    antilinkwa: 'Anti Link Grup/Saluran WA',
    antitagsw: 'Anti Tag/Mention Status WA (SW)',
    antisw: 'Anti Kirim/Forward Status WA ke Grup',
    antikudeta: 'Anti Kudeta Admin (Demote/Promote Liar)',
    antiforward: 'Anti Pesan Terusan/Forward',
    antibot: 'Anti Bot Luar',
    antidokumen: 'Anti Kirim Dokumen/File',
    antifoto: 'Anti Kirim Foto/Gambar',
    antivideo: 'Anti Kirim Video',
    antisticker: 'Anti Kirim Sticker',
    antivoice: 'Anti Kirim Voice Note/Audio',
    antinsfw: 'Anti Gambar Dewasa (NSFW)',
    antitoxic: 'Anti Kata Kasar/Toxic'
};

let handler = async (m, { conn, text, isAdmin, isBotAdmin, isOwner, usedPrefix, command }) => {
    if (!m.isGroup) return m.reply('❌ Perintah ini hanya bisa digunakan di dalam grup!');
    if (!isAdmin && !isOwner) return m.reply('❌ Hanya admin grup atau owner yang dapat mengatur fitur ini!');
    if (!isBotAdmin) return m.reply('❌ Bot harus menjadi Admin grup terlebih dahulu!');

    const chat = m.chat;
    if (!global.groupSecurity[chat]) global.groupSecurity[chat] = {};
    const s = global.groupSecurity[chat];

    // Sync dari database chat jika ada
    if (global.db?.data?.chats?.[chat]) {
        const dbChat = global.db.data.chats[chat];
        if (!dbChat.groupSecurity) dbChat.groupSecurity = s;
    }

    const args = (text || '').toLowerCase().trim().split(/\s+/);
    let fitur = args[0];
    let action = args[1];

    const cmdLower = command.toLowerCase();

    // Auto-detect jika dipanggil via direct shortcut (.antitagsw, .antisw, .antikudeta, dll)
    if (FEATURES.includes(cmdLower)) {
        fitur = cmdLower;
        action = args[0];
    } else if (cmdLower === 'antilinkall') {
        fitur = 'antilink';
        action = args[0];
    } else if (cmdLower === 'antitagstatus') {
        fitur = 'antitagsw';
        action = args[0];
    } else if (cmdLower === 'antiswgroup' || cmdLower === 'antiswgc' || cmdLower === 'antiswgb') {
        fitur = 'antisw';
        action = args[0];
    } else if (cmdLower === 'antikdt') {
        fitur = 'antikudeta';
        action = args[0];
    }

    if (!fitur || (cmdLower === 'security' && !args[0])) {
        let listStatus = FEATURES.map(f => {
            const st = s[f]?.aktif ? `✅ Aktif (${s[f].mode || 'delete'})` : '❌ Nonaktif';
            return `├─ 🛡️ *${f}:* ${st}`;
        }).join('\n');

        return m.reply(
`╔══════════════════════════╗
║  🛡️ *GROUP SECURITY STATUS* 🛡️  ║
╚══════════════════════════╝

┌───❖ *STATUS FITUR KEAMANAN* ❖───
│
${listStatus}
│
└─────────────────────────

📌 *Penggunaan:*
➤ ${usedPrefix}security <fitur> on / delete (Hapus Pesan)
➤ ${usedPrefix}security <fitur> kick (Tendang Pelaku)
➤ ${usedPrefix}security <fitur> warn (Beri Warning)
➤ ${usedPrefix}security <fitur> off (Matikan Fitur)

💡 *Shortcut Cepat Langsung:*
➤ ${usedPrefix}antitagsw on / kick / warn / off
➤ ${usedPrefix}antisw on / kick / warn / off
➤ ${usedPrefix}antikudeta on / off
➤ ${usedPrefix}antilink on / kick / warn / off
➤ ${usedPrefix}antilinkwa on / kick / warn / off

*Pengecualian:* Nomor Bot, Owner Bot, & Admin Grup 100% Kebal.`
        );
    }

    if (!FEATURES.includes(fitur)) {
        return m.reply(`❌ Fitur *${fitur}* tidak dikenal!\n\n📋 *Daftar Fitur Tersedia:*\n${FEATURES.join(', ')}`);
    }

    if (!action || action === 'status') {
        const status = s[fitur]?.aktif ? `✅ Aktif (Mode: *${s[fitur].mode || 'delete'}*)` : '❌ Nonaktif';
        return m.reply(`📋 *STATUS ${fitur.toUpperCase()}*\n🔹 *Nama Fitur:* ${FEATURE_NAMES[fitur] || fitur}\n🔹 *Status:* ${status}`);
    }

    const setMode = (mode) => {
        s[fitur] = { aktif: true, mode: mode };
        if (global.db?.data?.chats?.[chat]) {
            global.db.data.chats[chat].groupSecurity = s;
            if (fitur === 'antilink') {
                global.db.data.chats[chat].antilink = true;
                global.db.data.chats[chat].antilinkMode = mode;
            } else if (fitur === 'antikudeta') {
                global.db.data.chats[chat].antiKudeta = true;
            }
        }
    };

    if (action === 'on' || action === 'delete' || action === 'hapus' || action === 'enable') {
        setMode(fitur === 'antikudeta' ? 'kick' : 'delete');
        return m.reply(`🗑️ *${fitur.toUpperCase()} BERHASIL DIAKTIFKAN!*\n\n• *Fitur:* ${FEATURE_NAMES[fitur] || fitur}\n• *Mode:* ${fitur === 'antikudeta' ? 'Proteksi Kudeta (Auto Demote & Kick Pelaku)' : 'Hapus Pesan Otomatis'}\n• *Pengecualian:* Nomor Bot, Owner, & Admin Grup aman (kebal).`);
    }

    if (action === 'kick') {
        setMode('kick');
        return m.reply(`⚡ *${fitur.toUpperCase()} MODE KICK DIAKTIFKAN!*\n\n• *Fitur:* ${FEATURE_NAMES[fitur] || fitur}\n• *Mode:* Kick Pelaku Pelanggaran\n• *Pengecualian:* Nomor Bot, Owner, & Admin Grup aman (kebal).`);
    }

    if (action === 'warn') {
        setMode('warn');
        return m.reply(`⚠️ *${fitur.toUpperCase()} MODE WARN DIAKTIFKAN!*\n\n• *Fitur:* ${FEATURE_NAMES[fitur] || fitur}\n• *Mode:* Beri Peringatan (Warn)\n• *Pengecualian:* Nomor Bot, Owner, & Admin Grup aman (kebal).`);
    }

    if (action === 'off' || action === 'mati' || action === 'disable') {
        delete s[fitur];
        if (global.db?.data?.chats?.[chat]) {
            global.db.data.chats[chat].groupSecurity = s;
            if (fitur === 'antilink') {
                global.db.data.chats[chat].antilink = false;
            } else if (fitur === 'antikudeta') {
                global.db.data.chats[chat].antiKudeta = false;
            }
        }
        return m.reply(`❌ *${fitur.toUpperCase()} TELAH DINONAKTIFKAN*`);
    }

    return m.reply(`❓ Aksi tidak dikenal. Gunakan: on / delete / kick / warn / off`);
};

handler.help = [
    'security <fitur> <on/off/kick/delete/warn>',
    'antitagsw <on/off/kick/delete/warn>',
    'antisw <on/off/kick/delete/warn>',
    'antikudeta <on/off>',
    'antilink <on/off/kick/delete/warn>',
    'antilinkwa <on/off/kick/delete/warn>'
];
handler.tags = ['group'];
handler.command = /^(security|antilink|antilinkall|antilinkwa|antitagsw|antitagstatus|antisw|antiswgroup|antiswgc|antiswgb|antikudeta|antikdt|antiforward|antibot|antidokumen|antifoto|antivideo|antisticker|antivoice|antinsfw|antitoxic)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
