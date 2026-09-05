let handler = async (m, { conn, args, usedPrefix, command }) => {
    let mode = (args[0] || '').toLowerCase();
    let isClose = {
        'open': 'not_announcement',
        'buka': 'not_announcement',
        'close': 'announcement',
        'tutup': 'announcement',
    }[mode];

    if (isClose === undefined) {
        return m.reply(
            `⚙️ *PENGATURAN GRUP*\n\n` +
            `📌 *Penggunaan:*\n` +
            `➤ ${usedPrefix + command} buka / open\n` +
            `➤ ${usedPrefix + command} tutup / close\n\n` +
            `👉 *Contoh:* ${usedPrefix + command} buka`
        );
    }

    try {
        await conn.groupSettingUpdate(m.chat, isClose);
        const isOpen = isClose === 'not_announcement';
        const msg = isOpen 
            ? `🔓 *GRUP DIBUKA*\n\n✅ Berhasil membuka grup. Sekarang semua anggota dapat mengirim pesan!`
            : `🔒 *GRUP DITUTUP*\n\n✅ Berhasil menutup grup. Sekarang hanya admin yang dapat mengirim pesan!`;

        await m.reply(msg);
    } catch (err) {
        console.error('GroupSettingUpdate Error:', err);
        m.reply(`❌ *Gagal mengubah pengaturan grup:* ${err.message || err}`);
    }
};

handler.help = ['settings <buka/tutup>', 'setgc <open/close>'];
handler.tags = ['group'];
handler.command = /^(settings|setgc|settingsgc|group)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
