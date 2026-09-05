let handler = async (m, { conn, text, usedPrefix, command, isOwner, isAdmin }) => {
    if (!m.isGroup) return m.reply('❌ *Perintah ini hanya bisa digunakan di dalam grup!*');

    if (!isOwner && !isAdmin) {
        return m.reply('❌ *Perintah ini hanya untuk Admin grup atau Owner bot!*');
    }

    if (!global.db.data.chats) global.db.data.chats = {};
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
    let chat = global.db.data.chats[m.chat];

    const args = (text || '').trim().split(/\s+/);
    let action = args[0]?.toLowerCase();
    let duration = args[1] || null;

    if (!action || !['--on', '--off', '--list', '--status', '--temp', 'on', 'off', 'status', 'list', 'temp'].includes(action)) {
        return m.reply(
            `⚠️ *Penggunaan Command Mute / Banchat*\n\n` +
            `📌 *Format:*\n` +
            `➤ ${usedPrefix + command} --on : Mute bot di grup ini\n` +
            `➤ ${usedPrefix + command} --off : Unmute bot di grup ini\n` +
            `➤ ${usedPrefix + command} --status : Cek status mute grup ini\n` +
            `➤ ${usedPrefix + command} --list : Lihat daftar semua grup di-mute\n` +
            `➤ ${usedPrefix + command} --temp <durasi> : Mute sementara\n\n` +
            `⏱️ *Contoh Durasi Temp:*\n` +
            `• 30m = 30 Menit\n` +
            `• 1h = 1 Jam\n` +
            `• 2h = 2 Jam\n` +
            `• 24h = 24 Jam`
        );
    }

    if (action === '--list' || action === 'list') {
        let mutedChats = [];
        for (let chatId in global.db.data.chats) {
            if (global.db.data.chats[chatId]?.mute === true) {
                let name = chatId;
                try {
                    const meta = await conn.groupMetadata(chatId).catch(() => null);
                    if (meta?.subject) name = meta.subject;
                } catch {}
                mutedChats.push(`• ${name} (\`${chatId}\`)`);
            }
        }

        if (mutedChats.length === 0) {
            return m.reply('✅ *Tidak ada grup yang sedang di-mute saat ini.*');
        }

        return m.reply(`📊 *DAFTAR GRUP DI-MUTE*\n\n${mutedChats.join('\n')}\n\n*Total:* ${mutedChats.length} grup`);
    }

    if (action === '--status' || action === 'status') {
        const isMuted = chat.mute || false;
        const status = isMuted ? '🔒 *MUTED*' : '🔓 *UNMUTED*';
        const statusEmoji = isMuted ? '🔒' : '🔓';
        
        let mutedUntil = chat.mutedUntil || null;
        let timeLeft = '';
        if (mutedUntil && mutedUntil > Date.now()) {
            const remaining = mutedUntil - Date.now();
            const hours = Math.floor(remaining / (1000 * 60 * 60));
            const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            timeLeft = `\n⏱️ *Sisa Waktu:* ${hours} jam ${minutes} menit`;
        } else if (isMuted) {
            timeLeft = '\n⏱️ *Durasi:* Permanen';
        }

        let groupName = 'Unknown';
        try {
            groupName = await conn.getName(m.chat) || 'Grup WhatsApp';
        } catch {}

        return m.reply(
`╔══════════════════════════╗
║  ${statusEmoji} *STATUS MUTE GRUP* ${statusEmoji}  ║
╚══════════════════════════╝

┌───❖ *DETAIL STATUS* ❖───
│
├─📊 *Status:* ${status}
├─📝 *Grup:* ${groupName}${timeLeft}
│
└─────────────────────────

💡 *Perintah:* ${usedPrefix + command} --on / ${usedPrefix + command} --off`);
    }

    if (action === '--temp' || action === 'temp') {
        if (!duration) {
            return m.reply(
                `⚠️ *Masukkan durasi mute sementara!*\n\n` +
                `📌 *Contoh:* ${usedPrefix + command} --temp 30m / 1h / 2h`
            );
        }

        let durationMs = 0;
        const match = duration.match(/^(\d+)([mh])$/i);
        if (!match) {
            return m.reply('❌ *Format durasi salah!* Gunakan: 30m, 1h, 2h, 24h');
        }

        const value = parseInt(match[1]);
        const unit = match[2].toLowerCase();

        if (unit === 'm') durationMs = value * 60 * 1000;
        else if (unit === 'h') durationMs = value * 60 * 60 * 1000;

        if (durationMs > 7 * 24 * 60 * 60 * 1000) {
            return m.reply('❌ *Durasi maksimal adalah 7 hari!*');
        }

        chat.mute = true;
        chat.mutedUntil = Date.now() + durationMs;

        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        const durationText = hours > 0 ? `${hours} jam ${minutes > 0 ? minutes + ' menit' : ''}` : `${minutes} menit`;

        setTimeout(async () => {
            if (global.db.data.chats[m.chat]?.mute === true) {
                global.db.data.chats[m.chat].mute = false;
                global.db.data.chats[m.chat].mutedUntil = null;
                await conn.sendMessage(m.chat, {
                    text: `🔓 *Mute Otomatis Berakhir!*\n\nBot di grup ini telah di-unmute secara otomatis.`
                });
            }
        }, durationMs);

        return m.reply(
`╔══════════════════════════╗
║  🔒 *MUTE SEMENTARA* 🔒  ║
╚══════════════════════════╝

┌───❖ *DETAIL MUTE* ❖───
│
├─📊 *Status:* 🔒 MUTED
├─⏱️ *Durasi:* ${durationText}
├─🕒 *Berakhir:* ${new Date(Date.now() + durationMs).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB
│
└─────────────────────────

⚠️ *Bot tidak akan merespon perintah hingga durasi berakhir.*`);
    }

    if (action === '--on' || action === 'on') {
        if (chat.mute === true) {
            return m.reply('🔒 *Grup ini sudah dalam keadaan MUTE!*');
        }

        chat.mute = true;
        chat.mutedUntil = null;

        let groupName = 'Grup';
        try { groupName = await conn.getName(m.chat); } catch {}

        return m.reply(
`╔══════════════════════════╗
║  🔒 *BOT DI-MUTE DI GRUP* 🔒  ║
╚══════════════════════════╝

┌───❖ *DETAIL* ❖───
│
├─📊 *Status:* 🔒 MUTED
├─📝 *Grup:* ${groupName}
├─👤 *Oleh:* ${m.pushName || 'Admin'}
│
└─────────────────────────

⚠️ *Bot dinonaktifkan sementara di grup ini.*
💡 Ketik *${usedPrefix + command} --off* untuk mengaktifkan kembali.`);
    }

    if (action === '--off' || action === 'off') {
        if (chat.mute === false || !chat.mute) {
            return m.reply('🔓 *Grup ini tidak sedang dalam keadaan MUTE!*');
        }

        chat.mute = false;
        chat.mutedUntil = null;

        let groupName = 'Grup';
        try { groupName = await conn.getName(m.chat); } catch {}

        return m.reply(
`╔══════════════════════════╗
║  🔓 *BOT DI-UNMUTE DI GRUP* 🔓  ║
╚══════════════════════════╝

┌───❖ *DETAIL* ❖───
│
├─📊 *Status:* 🔓 UNMUTED
├─📝 *Grup:* ${groupName}
├─👤 *Oleh:* ${m.pushName || 'Admin'}
│
└─────────────────────────

✅ *Bot kembali aktif dan siap melayani anggota grup!*`);
    }
};

setInterval(async () => {
    try {
        const now = Date.now();
        for (let chatId in global.db?.data?.chats) {
            const chat = global.db.data.chats[chatId];
            if (chat?.mute === true && chat?.mutedUntil && chat.mutedUntil <= now) {
                chat.mute = false;
                chat.mutedUntil = null;
            }
        }
    } catch (e) {
        console.error('Error auto unmute:', e);
    }
}, 60000);

handler.help = ['mute <--on/--off/--status/--list/--temp>'];
handler.tags = ['group'];
handler.command = /^(mute|banchat)$/i;
handler.group = true;
handler.admin = true;

export default handler;